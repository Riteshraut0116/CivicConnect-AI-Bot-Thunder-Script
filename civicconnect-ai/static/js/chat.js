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
     * The "brain" of the bot. It returns a response based on keywords.
     * @param {string} userMessage The user's input message.
     * @returns {string} The bot's response.
     */
    function getBotResponse(userMessage) {
        const lowerCaseMessage = userMessage.toLowerCase();

        if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
            return "Hello there! How can I assist you with city services today?";
        }
        if (lowerCaseMessage.includes('pothole')) {
            return "I can help with that. To report a pothole, please provide the street address or nearest intersection.";
        }
        if (lowerCaseMessage.includes('garbage') || lowerCaseMessage.includes('trash')) {
            return "For garbage collection issues, please tell me your address and the nature of the problem (e.g., missed pickup, broken bin).";
        }
        if (lowerCaseMessage.includes('water leak')) {
            return "A water leak is a priority. Please provide the location immediately so I can forward it to the water department.";
        }
        if (lowerCaseMessage.includes('thank you') || lowerCaseMessage.includes('thanks')) {
            return "You're welcome! Is there anything else I can help you with?";
        }

        // Default fallback response
        return "I'm sorry, I'm a simple bot and don't understand that yet. Try asking about a 'pothole', 'garbage', or 'water leak'.";
    }
});
