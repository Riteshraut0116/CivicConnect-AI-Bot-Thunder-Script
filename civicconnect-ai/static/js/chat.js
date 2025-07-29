document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input'); // Now a textarea
    const typingIndicator = document.querySelector('.typing-indicator');
    const attachBtn = document.getElementById('attach-btn');
    const fileInput = document.getElementById('file-input');

    // --- Event Listeners ---
    chatForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent page reload on form submission
        sendMessage();
    });

    userInput.addEventListener('keydown', (event) => {
        // Send message on Enter, but allow new line with Shift+Enter
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    userInput.addEventListener('input', () => {
        // Auto-resize textarea
        userInput.style.height = 'auto';
        userInput.style.height = `${userInput.scrollHeight}px`;
    });

    attachBtn.addEventListener('click', () => {
        fileInput.click(); // Trigger hidden file input
    });

    fileInput.addEventListener('change', () => {
        const files = fileInput.files;
        if (files.length > 0) {
            handleFileAttachment(files);
        }
    });
    /**
     * Adds a new message to the chat window and scrolls to the bottom.
     * @param {string} text The message content.
     * @param {string} sender The sender, either 'user' or 'bot'.
     */
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        const p = document.createElement('p');
        p.textContent = text;
        messageDiv.appendChild(p);

        // Add the new message before the typing indicator
        chatMessages.insertBefore(messageDiv, typingIndicator);

        // Scroll to the bottom of the chat window
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Handles the logic of sending a message from the user.
     */
    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return; // Don't send empty messages

        addMessage(message, 'user');
        userInput.value = ''; // Clear textarea
        // Reset textarea height after sending
        userInput.style.height = 'auto';
        userInput.focus();

        // Show typing indicator and get bot response
        typingIndicator.style.display = 'flex';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Simulate bot thinking time
        setTimeout(() => {
            const botReply = getBotResponse(message);
            typingIndicator.style.display = 'none';
            addMessage(botReply, 'bot');
        }, 1200); // 1.2 second delay
    }

    /**
     * Handles file attachments by displaying a message in the chat.
     * @param {FileList} files The list of files attached by the user.
     */
    function handleFileAttachment(files) {
        let fileNames = [];
        for (const file of files) {
            fileNames.push(file.name);
        }
        const fileMessage = `Attached file(s): ${fileNames.join(', ')}`;
        addMessage(fileMessage, 'user');
        // In a real application, you would now upload the files to a server.
        fileInput.value = ''; // Reset file input
    }

    /**
     * The "brain" of the bot. It returns a response based on a structured set of keywords and responses.
     * @param {string} userMessage The user's input message.
     * @returns {string} The bot's response.
     */
    function getBotResponse(userMessage) {
        const lowerCaseMessage = userMessage.toLowerCase();
        
        // A more scalable way to handle responses
        const responseRules = [
            { keywords: ['hello', 'hi', 'hey'], response: "Hello there! How can I assist you with city services today?" },
            { keywords: ['pothole', 'road damage'], response: "I can help with that. To report a pothole, please provide the street address or nearest intersection. You can also file a report online at city-services.com/potholes." },
            { keywords: ['garbage', 'trash', 'recycling', 'waste'], response: "For garbage collection, please tell me your address. You can check the collection schedule at city-services.com/waste. If you have a specific issue like a missed pickup or a broken bin, please provide details." },
            { keywords: ['water leak', 'pipe burst'], response: "A water leak is a priority. Please provide the location immediately so I can forward it to the water department. For emergencies, please call 911." },
            { keywords: ['streetlight', 'street light'], response: "To report a streetlight outage, please provide the pole number (if visible) and the nearest address or intersection. This will help us dispatch a crew quickly." },
            { keywords: ['parking', 'meter'], response: "For parking inquiries, are you looking for information on tickets, permits, or meter issues? For meter issues, please provide the meter number and location." },
            { keywords: ['noise', 'loud'], response: "For noise complaints, please specify the location and time of the disturbance. Note that for ongoing issues, it's best to contact the non-emergency police line." },
            { keywords: ['tax', 'property tax'], response: "You can view and pay your property taxes online at city-services.com/taxes. Do you have a specific question about your bill?" },
            { keywords: ['thank you', 'thanks', 'appreciate it'], response: "You're welcome! Is there anything else I can help you with?" }
        ];

        for (const rule of responseRules) {
            // Check if any of the keywords for a rule are present in the user's message
            if (rule.keywords.some(keyword => lowerCaseMessage.includes(keyword))) {
                return rule.response;
            }
        }

        // Default fallback response
        return "I'm sorry, I don't have information on that yet. You can ask me about common issues like 'potholes', 'garbage collection', 'parking', or 'streetlights'.";
    }
});
