document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const newChatBtn = document.querySelector('.new-chat-btn');

    // Gemini API
    const API_KEY = "AIzaSyBZdDngL6phB3pQCE8wCL0CgKdjrVVCwak"; // Use your actual key
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    // Auto-resize textarea
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = `${userInput.scrollHeight}px`;
    });

    // Send message on button click or Enter
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // New Chat
    newChatBtn.addEventListener('click', () => {
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <h2>How can I help you today?</h2>
                <p>Ask me anything, from creative ideas to technical explanations.</p>
            </div>
        `;
    });

    // Function to send message
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage('user', message); // Add user message
        userInput.value = '';
        userInput.style.height = 'auto';

        showTypingIndicator();

        const requestBody = {
            contents: [{
                parts: [{ text: message }]
            }]
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            removeTypingIndicator();

            const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (aiText) {
                addMessage('ai', aiText); // Add AI response
            } else {
                addMessage('ai', "Sorry, I couldn't understand. Please try again.");
            }
        } catch (error) {
            removeTypingIndicator();
            addMessage('ai', "Something went wrong. Please try again later.");
            console.error('API Error:', error);
        }
    }

    // Function to add a message in chat
    function addMessage(sender, text) {
        const welcomeMessage = document.querySelector('.welcome-message');
        if (welcomeMessage && sender === 'user') welcomeMessage.remove();

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`; // Add dynamic class based on sender

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? 'U' : 'AI';

        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = formatMessageText(text);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        chatMessages.appendChild(messageDiv);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Format message text (with line breaks and code)
    function formatMessageText(text) {
        return text
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            .replace(/\n/g, '<br>');
    }

    // Show typing dots while bot replies
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message';
        typingDiv.id = 'typing-indicator';

        typingDiv.innerHTML = `
            <div class="message-avatar">AI</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Remove typing dots
    function removeTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) typingDiv.remove();
    }
});
