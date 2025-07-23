document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Function to add a message to the chat window
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        const p = document.createElement('p');
        p.textContent = text;
        messageDiv.appendChild(p);
        chatWindow.appendChild(messageDiv);
        // Scroll to the bottom of the chat window
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // Function to send user message to the backend
    async function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') {
            return; // Don't send empty messages
        }

        addMessage(message, 'user'); // Display user's message immediately
        userInput.value = ''; // Clear input field

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message }),
            });

            if (!response.ok) {
                // Handle HTTP errors
                const errorData = await response.json();
                addMessage(`Error: ${errorData.response || 'Something went wrong on the server.'}`, 'bot');
                return;
            }

            const data = await response.json();
            addMessage(data.response, 'bot'); // Display bot's response

        } catch (error) {
            console.error('Error sending message:', error);
            addMessage('I am having trouble connecting. Please try again later.', 'bot');
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    // Initial focus on the input field
    userInput.focus();
});
