from flask import Flask, render_template, request, jsonify

# Initialize the Flask application
app = Flask(__name__)

@app.route('/')
def index():
    """
    Serves the main chat page from the templates folder.
    """
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    """
    Handles chat messages sent from the frontend.
    This is a placeholder for future backend AI/ML model integration.
    """
    user_message = request.json.get('message')

    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    # In the future, this function would call a real chatbot model.
    bot_response = get_backend_bot_response(user_message)
    
    return jsonify({'reply': bot_response})

def get_backend_bot_response(message):
    """
    A placeholder for more complex backend bot logic.
    For now, it just echoes the message back.
    """
    # Example of future logic:
    # response = call_my_ai_model(message)
    # return response
    return f"Backend received your message: '{message}'. This feature is under development."

if __name__ == '__main__':
    # Runs the Flask app in debug mode for development
    app.run(debug=True)