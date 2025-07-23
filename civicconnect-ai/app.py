import os
import json
from flask import Flask, render_template, request, jsonify
from google.cloud import dialogflow_v2 as dialogflow
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)

# --- Configuration ---
# IMPORTANT: Replace 'YOUR_DIALOGFLOW_PROJECT_ID' with your actual Google Cloud Project ID
# where your Dialogflow agent is hosted.
# Ensure the GOOGLE_APPLICATION_CREDENTIALS environment variable is set
# to the path of your Dialogflow service account JSON key file.
# Example: export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service_account.json"
PROJECT_ID = os.environ.get('DIALOGFLOW_PROJECT_ID', 'YOUR_DIALOGFLOW_PROJECT_ID')
SESSION_ID = "civicconnect-session" # A generic session ID for MVP, can be dynamic per user
LANGUAGE_CODE = "en-US" # Default language, can be dynamic based on user preference

# Path to store grievances (for MVP demonstration)
GRIEVANCES_FILE = os.path.join(app.root_path, 'data', 'grievances.json')

# Ensure the data directory exists
os.makedirs(os.path.dirname(GRIEVANCES_FILE), exist_ok=True)

# --- Dialogflow Client Setup ---
session_client = dialogflow.SessionsClient()

# --- Helper Functions ---

def detect_intent_texts(project_id, session_id, text, language_code):
    """Returns the result of detect intent with texts as input."""
    session = session_client.session_path(project_id, session_id)
    text_input = dialogflow.TextInput(text=text, language_code=language_code)
    query_input = dialogflow.QueryInput(text=text_input)

    try:
        response = session_client.detect_intent(
            request={"session": session, "query_input": query_input}
        )
        return response.query_result
    except Exception as e:
        print(f"Error detecting intent: {e}")
        return None

def load_grievances():
    """Loads grievances from the JSON file."""
    if not os.path.exists(GRIEVANCES_FILE) or os.path.getsize(GRIEVANCES_FILE) == 0:
        return []
    try:
        with open(GRIEVANCES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError:
        print(f"Error decoding JSON from {GRIEVANCES_FILE}. Starting with empty list.")
        return []
    except Exception as e:
        print(f"Error loading grievances: {e}")
        return []

def save_grievance(grievance_data):
    """Saves a new grievance to the JSON file."""
    grievances = load_grievances()
    grievances.append(grievance_data)
    try:
        with open(GRIEVANCES_FILE, 'w', encoding='utf-8') as f:
            json.dump(grievances, f, indent=4, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving grievance: {e}")
        return False

# --- Routes ---

@app.route('/')
def index():
    """Renders the main chatbot HTML page."""
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    """Handles incoming chat messages, processes with Dialogflow, and returns bot response."""
    user_message = request.json.get('message')
    if not user_message:
        return jsonify({"response": "Please provide a message."}), 400

    print(f"User message: {user_message}")

    # Detect intent using Dialogflow
    query_result = detect_intent_texts(PROJECT_ID, SESSION_ID, user_message, LANGUAGE_CODE)

    bot_response_text = "I'm sorry, I didn't understand that. Can you please rephrase?"
    intent_display_name = "Default Fallback Intent"
    parameters = {}

    if query_result:
        intent_display_name = query_result.intent.display_name if query_result.intent else "No Intent Matched"
        bot_response_text = query_result.fulfillment_text
        parameters = {key: str(value) for key, value in query_result.parameters.items()} # Convert to string for JSON

        print(f"Dialogflow Intent: {intent_display_name}")
        print(f"Dialogflow Parameters: {parameters}")

        # --- Custom Logic based on Intent ---
        if intent_display_name == "Report_Grievance":
            # Extract parameters for grievance
            issue_type = parameters.get('issue_type')
            location = parameters.get('location')
            description = user_message # Use the raw message as description for MVP

            # Generate a simple unique ID for the grievance
            grievance_id = f"G-{datetime.now().strftime('%Y%m%d%H%M%S')}-{os.urandom(2).hex()}"

            grievance_data = {
                "id": grievance_id,
                "user_message": user_message,
                "issue_type": issue_type if issue_type else "unspecified",
                "location": location if location else "unspecified",
                "description": description,
                "timestamp": datetime.now().isoformat(),
                "status": "Received"
            }

            if save_grievance(grievance_data):
                bot_response_text = (
                    f"Thank you for reporting the issue. "
                    f"Your grievance (ID: {grievance_id}) regarding '{issue_type if issue_type else 'an issue'}' "
                    f"at '{location if location else 'unspecified location'}' has been logged. "
                    f"We will look into it shortly."
                )
            else:
                bot_response_text = "I encountered an error while trying to log your grievance. Please try again later."

        elif intent_display_name.startswith("FAQ_"):
            # Dialogflow's fulfillment text is usually sufficient for FAQs
            pass # No special handling needed, fulfillment_text is already set

        elif intent_display_name == "Default Welcome Intent":
            pass # Use Dialogflow's default welcome response

        # If Dialogflow's fulfillment text is empty for some reason, provide a fallback
        if not bot_response_text:
            bot_response_text = "I received your message, but I don't have a specific response for that right now."

    else:
        # Fallback if Dialogflow call fails
        bot_response_text = "I'm having trouble connecting to my brain right now. Please try again in a moment."

    return jsonify({"response": bot_response_text})

# --- Run the App ---
if __name__ == '__main__':
    # For development, run in debug mode.
    # In production, use a production-ready WSGI server like Gunicorn or uWSGI.
    app.run(debug=True)
