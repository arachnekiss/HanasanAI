// Messenger JavaScript for SMS-style chat interface
class MessengerChat {
    constructor() {
        this.sessionId = null;
        this.socket = io();
        this.isTyping = false;
        this.typingTimeout = null;
        this.conversationContext = [];
        this.notificationsEnabled = false;
        this.proactiveMessageTimer = null;
        this.lastActivity = Date.now();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.connectSocket();
        this.showConnectionStatus('Connected', 'success');
        this.checkForContinuedSession();
    }

    checkForContinuedSession() {
        // Check if user came from main page with an active session
        const sessionId = localStorage.getItem('currentSessionId');
        if (sessionId) {
            this.sessionId = sessionId;
            this.loadSessionHistory(sessionId);
            localStorage.removeItem('currentSessionId'); // Clean up
        }
    }

    async loadSessionHistory(sessionId) {
        try {
            const response = await fetch(`/api/session/${sessionId}/history`);
            const data = await response.json();
            
            if (data.messages) {
                // Clear existing messages
                const messagesContainer = document.getElementById('messagesContainer');
                messagesContainer.innerHTML = '';
                
                // Add historical messages
                data.messages.forEach(msg => {
                    this.addMessage(msg.content, msg.role, new Date(msg.timestamp));
                });
                
                this.scrollToBottom();
                
                // Show continuation indicator
                this.showConnectionStatus('Conversation continued from main chat', 'info');
            }
        } catch (error) {
            console.error('Failed to load session history:', error);
        }
    }

    setupEventListeners() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const voiceBtn = document.getElementById('voiceBtn');
        const attachBtn = document.getElementById('attachBtn');

        // Message sending
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Voice input
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.toggleVoiceInput());
        }

        // Attachment
        if (attachBtn) {
            attachBtn.addEventListener('click', () => this.handleAttachment());
        }

        // Notification permissions
        this.setupNotificationPermission();

        // Typing indicators
        messageInput.addEventListener('input', () => {
            this.handleTyping();
        });

        messageInput.addEventListener('focus', () => {
            this.startTyping();
        });

        messageInput.addEventListener('blur', () => {
            this.stopTyping();
        });
    }

    connectSocket() {
        this.socket.on('connect', () => {
            console.log('Connected to messenger server');
            this.showConnectionStatus('Connected', 'success');
            
            if (this.sessionId) {
                this.socket.emit('join_session', { session_id: this.sessionId });
            }
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from messenger server');
            this.showConnectionStatus('Disconnected', 'danger');
        });

        this.socket.on('reconnect', () => {
            console.log('Reconnected to messenger server');
            this.showConnectionStatus('Reconnected', 'success');
        });

        this.socket.on('message_response', (data) => {
            this.handleIncomingMessage(data);
        });

        this.socket.on('proactive_message', (data) => {
            this.handleProactiveMessage(data);
        });

        this.socket.on('user_typing', (data) => {
            this.showTypingIndicator(data.typing);
        });

        this.socket.on('error', (error) => {
            console.error('Messenger socket error:', error);
            showError(error.message || 'Connection error');
        });
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message) return;

        // Clear input
        messageInput.value = '';
        this.stopTyping();

        // Add user message to chat
        this.addMessage(message, 'user', new Date());

        // Send via socket
        this.socket.emit('messenger_chat', {
            message: message,
            session_id: this.sessionId
        });

        // Show AI is typing
        this.showTypingIndicator(true, 'AI is typing...');
    }

    handleIncomingMessage(data) {
        // Hide typing indicator
        this.showTypingIndicator(false);
        
        // Update session ID
        this.sessionId = data.session_id;
        
        // Add AI message to chat
        this.addMessage(data.message, 'ai', new Date(data.timestamp));
    }

    handleProactiveMessage(data) {
        // Add proactive message with special styling
        this.addMessage(data.message, 'ai', new Date(data.timestamp), true);
        
        // Show notification if page is not visible
        if (document.hidden) {
            this.showNotification('New message from AI', data.message);
        }
    }

    addMessage(content, role, timestamp, isProactive = false) {
        const messagesContainer = document.getElementById('messagesContainer');
        
        const message = document.createElement('div');
        message.className = `message ${role === 'user' ? 'sent' : 'received'}${isProactive ? ' proactive' : ''}`;
        
        const messageBubble = document.createElement('div');
        messageBubble.className = 'message-bubble';
        
        const messageText = document.createElement('p');
        messageText.textContent = content;
        messageBubble.appendChild(messageText);
        
        const messageTime = document.createElement('span');
        messageTime.className = 'message-time';
        messageTime.textContent = this.formatTime(timestamp);
        messageBubble.appendChild(messageTime);
        
        message.appendChild(messageBubble);
        messagesContainer.appendChild(message);
        
        // Update conversation context for proactive messaging
        this.conversationContext.push({
            role: role,
            content: content,
            timestamp: timestamp
        });
        
        // Keep context manageable
        if (this.conversationContext.length > 10) {
            this.conversationContext = this.conversationContext.slice(-10);
        }
        
        this.scrollToBottom();
        this.updateLastActivity();
        
        // Schedule next proactive message if this was user input
        if (role === 'user') {
            this.scheduleProactiveMessage();
        }
    }

    handleTyping() {
        if (!this.isTyping) {
            this.startTyping();
        }
        
        // Reset typing timeout
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.stopTyping();
        }, 1000);
    }

    startTyping() {
        if (!this.isTyping) {
            this.isTyping = true;
            this.socket.emit('typing_start', { session_id: this.sessionId });
        }
    }

    stopTyping() {
        if (this.isTyping) {
            this.isTyping = false;
            clearTimeout(this.typingTimeout);
            this.socket.emit('typing_stop', { session_id: this.sessionId });
        }
    }

    showTypingIndicator(show, customText = null) {
        const typingIndicator = document.getElementById('typingIndicator');
        
        if (show) {
            typingIndicator.textContent = customText || 'AI is typing...';
            typingIndicator.classList.add('typing');
        } else {
            typingIndicator.textContent = 'Online';
            typingIndicator.classList.remove('typing');
        }
    }

    showConnectionStatus(status, type) {
        const connectionStatus = document.getElementById('connectionStatus');
        const contactStatus = document.getElementById('contactStatus');
        
        if (connectionStatus) {
            connectionStatus.textContent = status;
            connectionStatus.style.display = type === 'success' ? 'none' : 'block';
        }
        
        if (contactStatus) {
            if (type === 'success') {
                contactStatus.textContent = 'Active now';
                contactStatus.style.color = '#34c759';
            } else {
                contactStatus.textContent = 'Connecting...';
                contactStatus.style.color = '#ff9500';
            }
        }
    }

    showNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '/static/icons/robot.png', // You can add this icon
                badge: '/static/icons/robot.png'
            });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, { body: body });
                }
            });
        }
    }

    // Enhanced proactive messaging system
    scheduleProactiveMessage() {
        // Clear existing timer
        if (this.proactiveMessageTimer) {
            clearTimeout(this.proactiveMessageTimer);
        }
        
        // Calculate dynamic interval based on conversation activity
        const timeSinceLastActivity = Date.now() - this.lastActivity;
        let interval = Math.random() * 30000 + 45000; // 45-75 seconds base
        
        // Adjust interval based on conversation flow
        if (this.conversationContext.length > 5) {
            interval = Math.random() * 20000 + 30000; // More active conversation
        }
        
        this.proactiveMessageTimer = setTimeout(() => {
            this.generateProactiveMessage();
        }, interval);
    }
    
    generateProactiveMessage() {
        if (this.conversationContext.length === 0) return;
        
        // Analyze conversation context for relevant proactive message
        const recentMessages = this.conversationContext.slice(-3);
        const contextSummary = recentMessages.map(msg => msg.content).join(' ');
        
        // Send request for proactive message generation
        this.socket.emit('generate_proactive_message', {
            session_id: this.sessionId,
            context: contextSummary,
            conversation_length: this.conversationContext.length
        });
    }
    
    updateLastActivity() {
        this.lastActivity = Date.now();
    }
    
    setupNotificationPermission() {
        const notificationRequest = document.getElementById('notificationRequest');
        const allowBtn = document.getElementById('notificationAllow');
        const cancelBtn = document.getElementById('notificationCancel');
        
        // Check if notifications are supported and not already granted
        if ('Notification' in window && Notification.permission === 'default') {
            setTimeout(() => {
                notificationRequest.style.display = 'block';
            }, 5000); // Show after 5 seconds
        }
        
        if (allowBtn) {
            allowBtn.addEventListener('click', () => {
                Notification.requestPermission().then(permission => {
                    this.notificationsEnabled = permission === 'granted';
                    notificationRequest.style.display = 'none';
                });
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                notificationRequest.style.display = 'none';
            });
        }
    }
    
    toggleVoiceInput() {
        // Placeholder for voice input functionality
        console.log('Voice input toggle - would integrate with speech recognition');
    }
    
    handleAttachment() {
        // Placeholder for attachment handling
        console.log('Attachment handling - would open file picker');
    }

    formatTime(date) {
        const now = new Date();
        const messageDate = new Date(date);
        const diffMs = now - messageDate;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) {
            return 'now';
        } else if (diffMins < 60) {
            return `${diffMins}m`;
        } else {
            return messageDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    clearChat() {
        const messagesContainer = document.getElementById('messagesContainer');
        const messages = messagesContainer.querySelectorAll('.message');
        messages.forEach(msg => {
            if (!msg.id || msg.id !== 'welcomeMessage') {
                msg.remove();
            }
        });
        
        // Reset session and context
        this.sessionId = null;
        this.conversationContext = [];
        
        // Clear any proactive message timers
        if (this.proactiveMessageTimer) {
            clearTimeout(this.proactiveMessageTimer);
        }
    }
}

// Global function for clear chat button
function clearChat() {
    if (window.messengerChat) {
        window.messengerChat.clearChat();
    }
}

// Initialize messenger when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.messengerChat = new MessengerChat();
    
    // Set current date
    const currentDateElement = document.getElementById('currentDate');
    if (currentDateElement) {
        currentDateElement.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Set welcome message time
    const welcomeTimeElement = document.getElementById('welcomeTime');
    if (welcomeTimeElement) {
        welcomeTimeElement.textContent = new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
});

// Handle page visibility for notifications
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.messengerChat) {
        // Clear any pending notifications when user returns to page
        // This is a placeholder for notification management
        console.log('User returned to messenger page');
    }
});

// Clean initialization - no inline styles needed
