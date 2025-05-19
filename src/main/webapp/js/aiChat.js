/**
 * aiChat.js
 * Handles the AI chatbox functionality, LLM API interaction, and diagram modification.
 */

var AIChat = {
    chatboxContainer: null,
    messagesContainer: null,
    inputElement: null,
    sendButton: null,
    editorUi: null, // Will be set by the main application

    init: function(editorUiInstance) {
        this.editorUi = editorUiInstance;
        this.chatboxContainer = document.getElementById('aiChatboxContainer');
        this.messagesContainer = document.getElementById('aiChatboxMessages');
        this.inputElement = document.getElementById('aiChatInput');
        this.sendButton = document.getElementById('aiChatSendButton');

        if (!this.chatboxContainer || !this.inputElement || !this.sendButton) {
            console.error('AI Chatbox UI elements not found!');
            return;
        }

        this.sendButton.addEventListener('click', this.sendMessage.bind(this));
        this.inputElement.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        }.bind(this));

        this.addMessage('AI', 'Hello! How can I help you modify the diagram?');
        console.log('AI Chat initialized.');
    },

    addMessage: function(sender, text) {
        if (!this.messagesContainer) return;
        const messageElement = document.createElement('div');
        messageElement.style.marginBottom = '5px';
        messageElement.innerHTML = `<strong>${sender}:</strong> ${text}`;
        this.messagesContainer.appendChild(messageElement);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight; // Scroll to bottom
    },

    sendMessage: function() {
        const messageText = this.inputElement.value.trim();
        if (messageText === '') {
            return;
        }

        this.addMessage('User', messageText);
        this.inputElement.value = '';

        // Placeholder for sending message to LLM API
        this.sendToLLM(messageText)
            .then(response => {
                this.addMessage('AI', response.aiText);
                this.processLLMResponse(response.diagramActions);
            })
            .catch(error => {
                this.addMessage('AI', 'Sorry, I encountered an error: ' + error.message);
                console.error('LLM API Error:', error);
            });
    },

    sendToLLM: async function(text) {
        // This is a placeholder. Replace with actual API call.
        console.log('Sending to LLM:', text);
        // Example:
        // const response = await fetch('/api/llm', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ prompt: text, currentDiagram: this.editorUi.editor.getGraphXml() })
        // });
        // if (!response.ok) {
        //     throw new Error('LLM API request failed');
        // }
        // return await response.json(); // Expects { aiText: "...", diagramActions: [...] }

        // Mock response
        return new Promise(resolve => setTimeout(() => {
            resolve({
                aiText: `I received: "${text}". I'll try to process that.`,
                diagramActions: [{ action: 'addShape', type: 'rectangle', x: 100, y: 100, width: 80, height: 40, label: 'New Shape' }]
            });
        }, 500));
    },

    processLLMResponse: function(actions) {
        if (!actions || !this.editorUi) return;

        const graph = this.editorUi.editor.graph;
        graph.getModel().beginUpdate();
        try {
            actions.forEach(action => {
                if (action.action === 'addShape' && action.type === 'rectangle') {
                    const parent = graph.getDefaultParent();
                    graph.insertVertex(parent, null, action.label || '', action.x, action.y, action.width, action.height);
                }
                // Add more action handlers here (e.g., addConnection, modifyShape, deleteShape)
            });
        } finally {
            graph.getModel().endUpdate();
        }
        this.addMessage('System', 'Diagram updated based on AI instructions.');
    }
};