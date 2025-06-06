// Simplified HanasanAI Plus Application - Main Interface
class SimpleChatGPT {
    constructor() {
        this.sessionId = null;
        this.conversationHistory = [];
        this.character = null;
        this.voiceHandler = null;
        this.isVideoCallActive = false;
        this.isVideoMuted = false;
        this.isVideoCameraOn = true;
        this.hasResponse = false;
        this.keyboardActive = false;
        this.chatSessions = [];
        this.currentSessionId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCharacter();
        this.loadSuggestions();
        this.setupKeyboardHandling();
        this.initializeModals();
        this.setupResponseActions(); // 응답 액션 버튼 초기화
        this.loadSavedSessions(); // 저장된 세션 로드
        console.log('HanasanAI Plus initialized successfully');
    }

    setupKeyboardHandling() {
        const messageInput = document.getElementById('messageInput');
        this.isShiftPressed = false;
        
        if (messageInput) {
            messageInput.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.keyboardActive = true;
                this.showKeyboardView();
            });
            
            messageInput.addEventListener('focus', (e) => {
                e.preventDefault();
                messageInput.blur(); // Prevent native keyboard
                this.keyboardActive = true;
                this.showKeyboardView();
            });

            // Watch for input changes to toggle send button
            messageInput.addEventListener('input', () => {
                this.updateSendButton();
            });
        }

        // Setup virtual keyboard
        this.setupVirtualKeyboard();

        // Hide keyboard when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.input-interface') && !e.target.closest('.content-interface')) {
                this.keyboardActive = false;
                if (this.hasResponse) {
                    this.showResponseView();
                } else {
                    this.showSuggestionsView();
                }
            }
        });
    }

    setupVirtualKeyboard() {
        const virtualKeyboard = document.querySelector('.virtual-keyboard');
        if (virtualKeyboard) {
            virtualKeyboard.addEventListener('click', (e) => {
                if (e.target.classList.contains('key')) {
                    const key = e.target.getAttribute('data-key');
                    this.handleVirtualKeyPress(key);
                }
            });
        }
    }

    handleVirtualKeyPress(key) {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) return;

        switch (key) {
            case 'backspace':
                const currentValue = messageInput.value;
                messageInput.value = currentValue.slice(0, -1);
                this.updateSendButton();
                break;
            case 'enter':
                this.sendMessage();
                break;
            case 'shift':
                this.isShiftPressed = !this.isShiftPressed;
                this.updateKeyboardCase();
                break;
            case '123':
                this.toggleNumberKeyboard();
                break;
            case ' ':
                messageInput.value += ' ';
                this.updateSendButton();
                break;
            default:
                if (key.length === 1) {
                    const char = this.isShiftPressed ? key.toUpperCase() : key.toLowerCase();
                    messageInput.value += char;
                    this.updateSendButton();
                    if (this.isShiftPressed) {
                        this.isShiftPressed = false;
                        this.updateKeyboardCase();
                    }
                }
                break;
        }
    }

    updateSendButton() {
        const messageInput = document.getElementById('messageInput');
        const videoCallBtn = document.getElementById('videoCallBtn');
        
        if (!messageInput || !videoCallBtn) return;

        const hasText = messageInput.value.trim().length > 0;
        
        if (hasText) {
            // Change to send button appearance
            videoCallBtn.title = '메시지 전송';
            videoCallBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
            `;
        } else {
            // Change back to video call button appearance
            videoCallBtn.title = '영상 통화 모드';
            videoCallBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
            `;
        }
    }

    updateKeyboardCase() {
        const keys = document.querySelectorAll('.key:not(.shift-key):not(.backspace-key):not(.enter-key):not(.number-key):not(.space-key)');
        keys.forEach(key => {
            const keyValue = key.getAttribute('data-key');
            if (keyValue && keyValue.length === 1) {
                key.textContent = this.isShiftPressed ? keyValue.toUpperCase() : keyValue.toLowerCase();
            }
        });

        const shiftKey = document.querySelector('.shift-key');
        if (shiftKey) {
            shiftKey.style.background = this.isShiftPressed ? '#10a37f' : '#ffffff';
            shiftKey.style.color = this.isShiftPressed ? 'white' : '#374151';
        }
    }

    toggleNumberKeyboard() {
        // Future enhancement: switch between letters and numbers
        console.log('Number keyboard toggle - feature ready for implementation');
    }

    showSuggestionsView() {
        this.switchContentView('suggestionsView');
    }

    showKeyboardView() {
        this.switchContentView('keyboardView');
    }

    triggerVirtualKeyboard() {
        // Focus on the message input to trigger virtual keyboard
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            this.keyboardActive = true;
            this.showKeyboardView();
            
            // Focus the input to show keyboard
            messageInput.focus();
            
            // For mobile devices, try to trigger virtual keyboard
            if (window.navigator && window.navigator.virtualKeyboard) {
                window.navigator.virtualKeyboard.show();
            }
            
            console.log('Virtual keyboard triggered');
        }
    }

    showResponseView() {
        this.switchContentView('responseView');
        this.hasResponse = true;
        
        // Create response view if it doesn't exist
        const responseView = document.getElementById('responseView');
        if (!responseView) {
            this.createResponseView();
        }
    }
    
    createResponseView() {
        // HTML에 이미 responseView가 존재하므로 추가 생성하지 않음
        const responseView = document.getElementById('responseView');
        if (responseView) {
            // AI 답변 표시 준비
            const aiResponseText = document.getElementById('aiResponseText');
            if (aiResponseText) {
                aiResponseText.innerHTML = '';
            }
        }
    }
    
    setupResponseActions() {
        // 액션 버튼들이 제거되었으므로 빈 함수로 유지
    }
    
    addMessageToResponse(content, role) {
        // 사용자 메시지는 무시하고 AI 답변만 표시
        if (role !== 'assistant') return;
        
        const aiResponseText = document.getElementById('aiResponseText');
        if (!aiResponseText) return;
        
        // AI 답변을 타이핑 애니메이션으로 표시
        this.typewriterEffect(aiResponseText, content);
    }
    
    typewriterEffect(element, text, speed = 30) {
        element.textContent = '';
        let i = 0;
        const container = element.closest('.ai-response-container');
        
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                
                // Auto-scroll to bottom as text is typed
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            } else {
                clearInterval(typeInterval);
            }
        }, speed);
    }
    
    smoothScrollToBottom() {
        const container = document.getElementById('chatMessagesContainer');
        const chatMessages = document.getElementById('chatMessages');
        
        if (container && chatMessages) {
            const shouldScroll = container.scrollTop + container.clientHeight >= container.scrollHeight - 100;
            
            if (shouldScroll) {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    }

    switchContentView(viewId) {
        // Hide all views
        const views = ['suggestionsView', 'keyboardView', 'responseView'];
        views.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.remove('active');
            }
        });

        // Show target view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
        }
    }

    setupEventListeners() {
        // Input button handlers
        this.setupInputButtons();
        
        // Message input
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Voice and image buttons
        const voiceBtn = document.getElementById('voiceBtn');
        const imageBtn = document.getElementById('imageBtn');
        
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.toggleVoiceRecording());
        }
        
        if (imageBtn) {
            imageBtn.addEventListener('click', () => this.handleImageUpload());
        }

        // Header buttons
        const menuBtn = document.getElementById('menuBtn');
        const voiceModeBtn = document.getElementById('voiceModeBtn');
        const videoModeBtn = document.getElementById('videoModeBtn');
        
        if (menuBtn) {
            menuBtn.addEventListener('click', () => this.toggleSidebar());
        }
        
        if (voiceModeBtn) {
            voiceModeBtn.addEventListener('click', () => this.toggleVoiceMode());
        }
        
        if (videoModeBtn) {
            videoModeBtn.addEventListener('click', () => this.startVideoCall());
        }

        // Background change
        const bgBtn = document.getElementById('bgBtn');
        if (bgBtn) {
            bgBtn.addEventListener('click', () => this.changeBackground());
        }

        // Suggestion pills
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-pill')) {
                const prompt = e.target.dataset.prompt || e.target.textContent.trim();
                
                // Special handling for "Type directly" button
                if (prompt === 'Type directly' || e.target.dataset.prompt === 'Type directly') {
                    this.triggerVirtualKeyboard();
                } else {
                    // Auto-complete the input field with suggestion
                    this.autoCompleteSuggestion(prompt);
                }
            }
        });
    }

    setupInputButtons() {
        // Image attach button
        const attachBtn = document.getElementById('attachBtn');
        if (attachBtn) {
            attachBtn.addEventListener('click', () => this.handleImageAttach());
        }
        
        // Messenger mode button
        const messengerBtn = document.getElementById('messengerBtn');
        if (messengerBtn) {
            messengerBtn.addEventListener('click', () => this.switchToMessengerMode());
        }
        
        // Voice input button
        const voiceInputBtn = document.getElementById('voiceInputBtn');
        if (voiceInputBtn) {
            voiceInputBtn.addEventListener('click', () => this.toggleVoiceInput());
        }
        
        // Video call button - initial setup as video call mode
        const videoCallBtn = document.getElementById('videoCallBtn');
        if (videoCallBtn) {
            videoCallBtn.addEventListener('click', () => {
                const messageInput = document.getElementById('messageInput');
                if (messageInput && messageInput.value.trim().length > 0) {
                    this.sendMessage();
                } else {
                    this.toggleVideoCall();
                }
            });
        }
    }

    initializeCharacter() {
        // Wait for ChatVRM system to load
        const waitForChatVRM = () => {
            // Check for ChatVRM integration system first
            if (window.chatVRMIntegration && window.chatVRMIntegration.isInitialized) {
                console.log('ChatVRM Integration System connected with facial animations');
                
                this.character = {
                    setEmotion: (emotion) => {
                        const emotionName = emotion.emotion || emotion || 'neutral';
                        
                        // Use ChatVRM integration system with auto-blinking and expressions
                        window.chatVRMIntegration.setEmotion(emotionName.toLowerCase());
                        console.log('Character emotion set with ChatVRM system:', emotionName);
                    }
                };
                
                // Initialize character with random VRM if available
                const vrmFile = window.SELECTED_VRM || window.vrm_file;
                if (vrmFile) {
                    window.chatVRMIntegration.loadCharacter(vrmFile).then(() => {
                        this.updateCharacterStatus('Ready with facial animations', 'neutral');
                        console.log('ChatVRM character loaded with blinking and expressions');
                    });
                } else {
                    this.updateCharacterStatus('Ready', 'neutral');
                }
                
            } else if (window.vrmAnimationSystem && window.vrmAnimationSystem.vrm) {
                console.log('VRM Animation System connected');
                
                this.character = {
                    setEmotion: (emotion) => {
                        const emotionName = emotion.emotion || emotion || 'Neutral';
                        const mappedEmotion = this.mapEmotionToFacial(emotionName);
                        window.vrmAnimationSystem.setEmotion(mappedEmotion);
                        console.log('Character emotion set:', emotionName);
                    }
                };
                this.updateCharacterStatus('Ready', 'neutral');
                
            } else if (window.currentVRM && window.setExpression) {
                console.log('Legacy VRM Character system connected');
                
                this.character = {
                    setEmotion: (emotion) => {
                        const emotionName = emotion.emotion || emotion || 'Neutral';
                        window.setExpression(emotionName);
                        console.log('Character emotion set:', emotionName);
                    }
                };
                this.updateCharacterStatus('Ready', 'neutral');
                
            } else {
                // Initialize ChatVRM integration if not ready
                if (window.chatVRMIntegration && !window.chatVRMIntegration.isInitialized) {
                    window.chatVRMIntegration.initialize().then(() => {
                        console.log('ChatVRM integration initialized');
                    });
                }
                setTimeout(waitForChatVRM, 200);
            }
        };
        waitForChatVRM();
    }

    mapEmotionToFacial(emotionName) {
        const emotionMap = {
            'Happy': 'happy',
            'Sad': 'sad', 
            'Angry': 'angry',
            'Excited': 'happy',
            'Surprised': 'surprised',
            'Neutral': 'neutral',
            'Joy': 'happy',
            'Sorrow': 'sad'
        };
        return emotionMap[emotionName] || 'neutral';
    }

    updateCharacterStatus(status, emotion = 'neutral') {
        const statusElement = document.getElementById('characterStatus');
        const emotionElement = document.getElementById('characterEmotion');
        
        if (statusElement) {
            statusElement.textContent = status;
        }
        
        if (emotionElement) {
            const emotionEmojis = {
                happy: '😊',
                sad: '😢',
                excited: '🤩',
                thinking: '🤔',
                neutral: '😐'
            };
            emotionElement.textContent = emotionEmojis[emotion] || '😊';
        }
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message) return;
        
        // Clear input and update send button
        messageInput.value = '';
        this.updateSendButton();
        
        // Show response view and add user message
        this.showResponseView();
        this.addMessageToResponse(message, 'user');
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Update character
        this.updateCharacterStatus('Thinking', 'thinking');
        
        try {
            // Call chat API
            console.log('Sending chat request:', message);
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    session_id: this.sessionId
                })
            });
            
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            if (data.response) {
                // Add AI response
                this.addMessageToResponse(data.response, 'assistant');
                
                // Update character emotion and trigger animations
                this.updateCharacterEmotionFromMessage(data.response, 'assistant');
                
                // React with VRM facial animations
                if (window.vrmAnimationSystem) {
                    window.vrmAnimationSystem.reactToMessage(data.response, false);
                }
                
                // Use facial animations if available
                if (this.facialAnimations) {
                    this.facialAnimations.reactToMessage(data.response, false);
                }
                
                this.updateCharacterStatus('Ready', 'neutral');
                
                // Update conversation history
                this.conversationHistory.push(
                    { role: 'user', content: message },
                    { role: 'assistant', content: data.response }
                );
                
                // Store session ID for messenger continuity
                if (data.session_id) {
                    this.sessionId = data.session_id;
                    localStorage.setItem('currentSessionId', this.sessionId);
                }
                
                // Add to sidebar history if this is a new conversation
                if (!this.currentSessionId && this.conversationHistory.length === 2) {
                    const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
                    const preview = data.response.length > 80 ? data.response.substring(0, 80) + '...' : data.response;
                    this.currentSessionId = this.addToSidebarHistory(title, preview, this.sessionId);
                } else if (this.currentSessionId) {
                    // Update existing session with latest response
                    this.updateSessionResponse(this.sessionId, data.response);
                }
            }
            
        } catch (error) {
            console.error('Chat error:', error);
            this.hideTypingIndicator();
            this.addMessageToResponse('Sorry, I encountered an error. Please try again.', 'assistant');
            this.updateCharacterStatus('Ready', 'neutral');
        }
    }

    showResponse(responseText) {
        const responseTextElement = document.getElementById('responseText');
        
        if (responseTextElement) {
            responseTextElement.textContent = responseText;
            
            // Show response view
            this.showResponseView();
            
            // Setup action buttons
            this.setupResponseActions();
        }
        
        this.updateCharacterStatus('Responded', 'happy');
    }

    setupResponseActions() {
        const viewConversationBtn = document.getElementById('viewConversationBtn');
        const continueInMessengerBtn = document.getElementById('continueInMessengerBtn');
        
        if (viewConversationBtn) {
            viewConversationBtn.onclick = () => {
                window.location.href = '/messenger';
            };
        }
        
        if (continueInMessengerBtn) {
            continueInMessengerBtn.onclick = () => {
                // Store current session and redirect to messenger
                if (this.sessionId) {
                    localStorage.setItem('currentSessionId', this.sessionId);
                }
                window.location.href = '/messenger';
            };
        }
    }

    hideSuggestions() {
        const suggestionsInterface = document.getElementById('suggestionsInterface');
        if (suggestionsInterface) {
            suggestionsInterface.style.display = 'none';
        }
    }

    addMessage(content, role) {
        const messagesArea = document.getElementById('chatMessages');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = role === 'user' ? 'You' : 'AI';
        
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = content;
        
        messageContent.appendChild(avatar);
        messageContent.appendChild(textDiv);
        messageDiv.appendChild(messageContent);
        
        messagesArea.appendChild(messageDiv);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    hideInitialState() {
        const initialState = document.getElementById('initialState');
        if (initialState) {
            initialState.style.display = 'none';
        }
    }

    showTypingIndicator() {
        this.hideTypingIndicator(); // Remove existing
        
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'message assistant typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar">AI</div>
                <div class="message-text">
                    <span>HanasanAI is typing</span>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Also scroll the container
        const container = document.getElementById('chatMessagesContainer');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    updateCharacterEmotionFromMessage(message, role) {
        if (!this.character) return;

        const emotionKeywords = {
            happy: ['happy', 'great', 'awesome', 'wonderful', 'good', 'excellent'],
            sad: ['sad', 'sorry', 'disappointed', 'unfortunate', 'bad'],
            excited: ['excited', 'wow', 'incredible', 'fantastic', 'amazing'],
            thinking: ['think', 'consider', 'analyze', 'understand', 'explain'],
            neutral: ['hello', 'hi', 'okay', 'yes', 'no']
        };

        const lowerMessage = message.toLowerCase();
        
        for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                this.character.setEmotion({ emotion: emotion, intensity: 0.7 });
                return;
            }
        }

        this.character.setEmotion({ emotion: 'neutral', intensity: 0.5 });
    }

    handleSuggestionClick(prompt) {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.value = prompt;
            this.sendMessage();
        }
    }

    autoCompleteSuggestion(prompt) {
        // Clean up the prompt text (remove icon text)
        let cleanPrompt = prompt;
        if (prompt.includes('Code review')) cleanPrompt = 'Help me review my code';
        else if (prompt.includes('Summarize text')) cleanPrompt = 'Help me summarize some text';
        else if (prompt.includes('Analyze data')) cleanPrompt = 'I need help analyzing data';
        else if (prompt.includes('Brainstorm ideas')) cleanPrompt = 'Help me brainstorm ideas';
        
        // Auto-complete the input field
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.value = cleanPrompt;
            messageInput.focus();
            this.updateSendButton();
            this.showKeyboardView();
        }
    }

    async sendMessageWithText(messageText) {
        if (!messageText) return;
        
        try {
            // Call chat API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageText,
                    conversation_history: this.conversationHistory
                })
            });
            
            const data = await response.json();
            
            if (data.response) {
                // Show AI response in response view
                this.showResponse(data.response);
                
                // Update character emotion
                this.updateCharacterEmotionFromMessage(data.response, 'assistant');
                
                // Update conversation history
                this.conversationHistory.push(
                    { role: 'user', content: messageText },
                    { role: 'assistant', content: data.response }
                );
                
                // Store session ID for messenger continuity
                if (data.session_id) {
                    this.sessionId = data.session_id;
                    localStorage.setItem('currentSessionId', this.sessionId);
                }
                
                // Add to sidebar history if this is a new conversation
                if (!this.currentSessionId && this.conversationHistory.length === 2) {
                    const title = messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText;
                    const preview = data.response.length > 80 ? data.response.substring(0, 80) + '...' : data.response;
                    this.currentSessionId = this.addToSidebarHistory(title, preview, this.sessionId);
                }
            }
            
        } catch (error) {
            console.error('Chat error:', error);
            this.showResponse('Sorry, I encountered an error. Please try again.');
        }
    }

    toggleVoiceRecording() {
        console.log('Voice recording toggle - feature ready for implementation');
    }

    handleImageUpload() {
        console.log('Image upload - feature ready for implementation');
    }

    toggleSidebar() {
        const sidebarDrawer = document.getElementById('sidebarDrawer');
        if (sidebarDrawer) {
            const isActive = sidebarDrawer.classList.contains('active');
            if (isActive) {
                sidebarDrawer.classList.remove('active');
            } else {
                sidebarDrawer.classList.add('active');
                this.loadChatHistory();
            }
        }
    }
    
    loadChatHistory() {
        // Load existing chat sessions from local storage or server
        const existingSessions = this.chatSessions;
        const chatHistoryList = document.getElementById('chatHistoryList');
        const emptyState = document.getElementById('emptyState');
        
        if (existingSessions && existingSessions.length > 0) {
            if (emptyState) emptyState.style.display = 'none';
            if (chatHistoryList) {
                chatHistoryList.style.display = 'block';
                chatHistoryList.innerHTML = '';
                
                existingSessions.forEach(session => {
                    const chatItem = document.createElement('div');
                    chatItem.className = 'chat-history-item';
                    chatItem.dataset.sessionId = session.id;
                    
                    chatItem.innerHTML = `
                        <div class="chat-content">
                            <div class="chat-title">${session.title}</div>
                        </div>
                        <div class="chat-actions">
                            <button class="chat-action-btn rename-btn" title="Rename">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                </svg>
                            </button>
                            <button class="chat-action-btn delete-btn" title="Delete">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                </svg>
                            </button>
                        </div>
                    `;
                    
                    chatItem.addEventListener('click', (e) => {
                        if (!e.target.closest('.chat-action-btn')) {
                            this.loadChatSession(session.id);
                            this.toggleSidebar(); // Close sidebar after selection
                        }
                    });
                    
                    // Add rename functionality
                    const renameBtn = chatItem.querySelector('.rename-btn');
                    renameBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.renameChatSession(session.id, session.title);
                    });
                    
                    // Add delete functionality
                    const deleteBtn = chatItem.querySelector('.delete-btn');
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.deleteChatSession(session.id);
                    });
                    
                    chatHistoryList.appendChild(chatItem);
                });
            }
        } else {
            if (emptyState) emptyState.style.display = 'block';
            if (chatHistoryList) chatHistoryList.style.display = 'none';
        }
    }

    toggleVoiceMode() {
        console.log('Voice mode toggle - feature ready for implementation');
    }

    startVideoCall() {
        const videoOverlay = document.getElementById('videoCallOverlay');
        if (videoOverlay) {
            videoOverlay.style.display = 'flex';
            this.isVideoCallActive = true;
            this.updateVideoStatus('Connecting...');
            
            setTimeout(() => {
                this.updateVideoStatus('Call connected');
            }, 2000);
        }
    }

    updateVideoStatus(status) {
        const statusElement = document.getElementById('videoStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    changeBackground() {
        console.log('Background change - feature ready for implementation');
    }

    addToSidebarHistory(title, preview, sessionId) {
        const chatHistoryList = document.getElementById('chatHistoryList');
        const emptyState = document.getElementById('emptyState');
        
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        if (chatHistoryList) {
            chatHistoryList.style.display = 'block';
            
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-history-item';
            chatItem.dataset.sessionId = sessionId;
            
            // Truncate title to 10 characters
            const truncatedTitle = title.length > 10 ? title.substring(0, 10) + '...' : title;
            
            chatItem.innerHTML = `
                <div class="chat-content">
                    <div class="chat-title">${truncatedTitle}</div>
                </div>
                <div class="chat-actions">
                    <button class="chat-action-btn rename-btn" title="Rename">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                    </button>
                    <button class="chat-action-btn delete-btn" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                    </button>
                </div>
            `;
            
            // Add click handlers
            chatItem.addEventListener('click', (e) => {
                if (!e.target.closest('.chat-action-btn')) {
                    this.loadChatSession(sessionId);
                }
            });
            
            // Add rename functionality
            const renameBtn = chatItem.querySelector('.rename-btn');
            renameBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.renameChatSession(sessionId, title);
            });
            
            // Add delete functionality
            const deleteBtn = chatItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteChatSession(sessionId);
            });
            
            chatHistoryList.insertBefore(chatItem, chatHistoryList.firstChild);
            
            // Store in chat sessions array with current environment
            this.chatSessions.unshift({
                id: sessionId,
                title: title,
                preview: preview,
                timestamp: new Date(),
                vrm: window.characterModel,
                wallpaper: window.backgroundImage,
                lastResponse: preview
            });
            
            // Save session to localStorage
            this.saveSessionToStorage(sessionId);
            
            return sessionId;
        }
        
        return null;
    }
    
    loadChatSession(sessionId) {
        // Set current session
        this.sessionId = sessionId;
        this.currentSessionId = sessionId;
        
        // Store for messenger continuity
        localStorage.setItem('currentSessionId', sessionId);
        
        // Find session in local storage
        const session = this.chatSessions.find(s => s.id === sessionId);
        if (session) {
            // Restore environment (캐릭터, 배경)
            if (session.vrm && session.vrm !== window.characterModel) {
                window.characterModel = session.vrm;
                this.loadVRMCharacter(session.vrm);
            }
            
            if (session.wallpaper && session.wallpaper !== window.backgroundImage) {
                window.backgroundImage = session.wallpaper;
                this.loadBackground(session.wallpaper);
            }
            
            // Show last AI response
            if (session.lastResponse) {
                this.showResponseView();
                const aiResponseText = document.getElementById('aiResponseText');
                if (aiResponseText) {
                    aiResponseText.textContent = session.lastResponse;
                }
            }
        }
        
        // Load conversation history from server
        fetch(`/api/session/${sessionId}/history`)
            .then(response => response.json())
            .then(data => {
                if (data.messages) {
                    // Clear current conversation
                    this.conversationHistory = [];
                    
                    // Add messages to conversation history
                    data.messages.forEach(msg => {
                        this.conversationHistory.push({
                            role: msg.role,
                            content: msg.content
                        });
                    });
                }
            })
            .catch(error => {
                console.error('Failed to load chat session:', error);
            });
    }
    
    saveSessionToStorage(sessionId) {
        const session = this.chatSessions.find(s => s.id === sessionId);
        if (session) {
            const savedSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
            const existingIndex = savedSessions.findIndex(s => s.id === sessionId);
            
            if (existingIndex >= 0) {
                savedSessions[existingIndex] = session;
            } else {
                savedSessions.unshift(session);
            }
            
            localStorage.setItem('chatSessions', JSON.stringify(savedSessions));
        }
    }
    
    loadVRMCharacter(vrmFile) {
        // VRM 캐릭터 로드 함수 (기존 로직 활용)
        if (window.vrmCharacterSystem && window.vrmCharacterSystem.loadCharacter) {
            window.vrmCharacterSystem.loadCharacter(vrmFile);
        }
    }
    
    loadBackground(wallpaperFile) {
        // 배경 이미지 변경
        const avatarContainer = document.getElementById('avatarContainer');
        if (avatarContainer) {
            avatarContainer.style.background = `url('/static/wallpaper/${wallpaperFile}') center center/cover no-repeat`;
        }
    }
    
    renameChatSession(sessionId, currentTitle) {
        const newTitle = prompt('Enter new title:', currentTitle);
        if (newTitle && newTitle.trim() !== '' && newTitle !== currentTitle) {
            // Update in sessions array
            const sessionIndex = this.chatSessions.findIndex(s => s.id === sessionId);
            if (sessionIndex !== -1) {
                this.chatSessions[sessionIndex].title = newTitle.trim();
            }
            
            // Update DOM element with truncation
            const chatItem = document.querySelector(`[data-session-id="${sessionId}"]`);
            if (chatItem) {
                const titleElement = chatItem.querySelector('.chat-title');
                if (titleElement) {
                    const truncatedTitle = newTitle.trim().length > 10 ? newTitle.trim().substring(0, 10) + '...' : newTitle.trim();
                    titleElement.textContent = truncatedTitle;
                }
            }
            
            // TODO: Save to server if needed
            console.log(`Chat renamed to: ${newTitle.trim()}`);
        }
    }
    
    deleteChatSession(sessionId) {
        if (confirm('Do you want to delete this chat?')) {
            // Remove from sessions array
            this.chatSessions = this.chatSessions.filter(s => s.id !== sessionId);
            
            // Remove DOM element
            const chatItem = document.querySelector(`[data-session-id="${sessionId}"]`);
            if (chatItem) {
                chatItem.remove();
            }
            
            // Show empty state if no sessions left
            if (this.chatSessions.length === 0) {
                const emptyState = document.getElementById('emptyState');
                const chatHistoryList = document.getElementById('chatHistoryList');
                if (emptyState) emptyState.style.display = 'block';
                if (chatHistoryList) chatHistoryList.style.display = 'none';
            }
            
            // If current session was deleted, start new chat
            if (this.sessionId === sessionId) {
                this.startNewChat();
            }
            
            // TODO: Delete from server if needed
            console.log(`Chat deleted: ${sessionId}`);
        }
    }
    
    startNewChat() {
        // Reset current session
        this.sessionId = null;
        this.currentSessionId = null;
        this.conversationHistory = [];
        
        // Clear local storage
        localStorage.removeItem('currentSessionId');
        
        // Reset to suggestions view
        this.switchContentView('suggestionsView');
        
        // Clear input
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.value = '';
        }
        
        // Update character status
        this.updateCharacterStatus('Ready', 'neutral');
        
        console.log('Started new chat');
    }
    
    updateSessionResponse(sessionId, response) {
        // Update session in memory
        const sessionIndex = this.chatSessions.findIndex(s => s.id === sessionId);
        if (sessionIndex !== -1) {
            this.chatSessions[sessionIndex].lastResponse = response;
            this.chatSessions[sessionIndex].preview = response.length > 80 ? response.substring(0, 80) + '...' : response;
            this.saveSessionToStorage(sessionId);
        }
    }
    
    loadSavedSessions() {
        // Load sessions from localStorage
        const savedSessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
        if (savedSessions.length > 0) {
            this.chatSessions = savedSessions;
            this.populateSidebarHistory();
        }
    }
    
    populateSidebarHistory() {
        const chatHistoryList = document.getElementById('chatHistoryList');
        const emptyState = document.getElementById('emptyState');
        
        if (this.chatSessions.length > 0) {
            if (emptyState) emptyState.style.display = 'none';
            if (chatHistoryList) {
                chatHistoryList.style.display = 'block';
                chatHistoryList.innerHTML = '';
                
                this.chatSessions.forEach(session => {
                    const chatItem = document.createElement('div');
                    chatItem.className = 'chat-history-item';
                    chatItem.dataset.sessionId = session.id;
                    
                    chatItem.innerHTML = `
                        <div class="chat-content">
                            <div class="chat-title">${session.title}</div>
                        </div>
                        <div class="chat-actions">
                            <button class="chat-action-btn rename-btn" title="Rename">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                </svg>
                            </button>
                            <button class="chat-action-btn delete-btn" title="Delete">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                </svg>
                            </button>
                        </div>
                    `;
                    
                    chatItem.addEventListener('click', (e) => {
                        if (!e.target.closest('.chat-action-btn')) {
                            this.loadChatSession(session.id);
                            this.toggleSidebar(); // Close sidebar after selection
                        }
                    });
                    
                    // Add rename functionality
                    const renameBtn = chatItem.querySelector('.rename-btn');
                    renameBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.renameChatSession(session.id, session.title);
                    });
                    
                    // Add delete functionality
                    const deleteBtn = chatItem.querySelector('.delete-btn');
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.deleteChatSession(session.id);
                    });
                    
                    chatHistoryList.appendChild(chatItem);
                });
            }
        }
    }

    // Image attachment functionality
    handleImageAttach() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.processImageFile(file);
            }
        };
        input.click();
    }

    processImageFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            this.addImageToChat(base64, file.name);
        };
        reader.readAsDataURL(file);
    }

    addImageToChat(base64, filename) {
        const chatContainer = document.querySelector('.chat-container');
        if (!chatContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar">U</div>
                <div class="message-text">
                    <img src="${base64}" alt="${filename}" style="max-width: 300px; border-radius: 8px; margin-bottom: 8px;">
                    <p>Image uploaded: ${filename}</p>
                </div>
            </div>
        `;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Messenger mode functionality
    switchToMessengerMode() {
        window.location.href = '/messenger';
    }

    // Voice input functionality
    toggleVoiceInput() {
        if (!this.voiceHandler) {
            this.initVoiceHandler();
        }
        
        if (this.voiceHandler.isRecording) {
            this.voiceHandler.stopRecording();
        } else {
            this.voiceHandler.startRecording();
        }
    }

    initVoiceHandler() {
        this.voiceHandler = {
            isRecording: false,
            mediaRecorder: null,
            audioChunks: [],
            
            startRecording: async () => {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    this.voiceHandler.mediaRecorder = new MediaRecorder(stream);
                    this.voiceHandler.audioChunks = [];
                    
                    this.voiceHandler.mediaRecorder.ondataavailable = (event) => {
                        this.voiceHandler.audioChunks.push(event.data);
                    };
                    
                    this.voiceHandler.mediaRecorder.onstop = () => {
                        const audioBlob = new Blob(this.voiceHandler.audioChunks, { type: 'audio/wav' });
                        this.processVoiceInput(audioBlob);
                    };
                    
                    this.voiceHandler.mediaRecorder.start();
                    this.voiceHandler.isRecording = true;
                    this.updateVoiceButton(true);
                    
                } catch (error) {
                    console.error('Voice recording error:', error);
                    alert('마이크 접근 권한이 필요합니다.');
                }
            },
            
            stopRecording: () => {
                if (this.voiceHandler.mediaRecorder && this.voiceHandler.isRecording) {
                    this.voiceHandler.mediaRecorder.stop();
                    this.voiceHandler.isRecording = false;
                    this.updateVoiceButton(false);
                }
            }
        };
    }

    updateVoiceButton(isRecording) {
        const voiceBtn = document.getElementById('voiceInputBtn');
        if (voiceBtn) {
            if (isRecording) {
                voiceBtn.classList.add('recording');
                voiceBtn.title = '녹음 중지';
            } else {
                voiceBtn.classList.remove('recording');
                voiceBtn.title = '음성 입력';
            }
        }
    }

    processVoiceInput(audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice.wav');
        
        fetch('/transcribe_voice', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const messageInput = document.getElementById('messageInput');
                if (messageInput) {
                    messageInput.value = data.text;
                    this.updateSendButton();
                }
            } else {
                console.error('Voice transcription failed:', data.error);
            }
        })
        .catch(error => {
            console.error('Voice processing error:', error);
        });
    }

    // Video call functionality
    toggleVideoCall() {
        window.location.href = '/video_call';
    }

    async startVideoCall() {
        window.location.href = '/video_call';
    }

    // Remove unused video call methods that were causing permission prompts

    loadSuggestions() {
        console.log('Suggestions loaded successfully');
    }

    initializeModals() {
        this.currentModel = 'gpt-4o';
        this.setupModelSelector();
        this.setupSidebar();
    }

    setupModelSelector() {
        const moreBtn = document.getElementById('menuDotsBtn');
        const modelModal = document.getElementById('modelSelectorModal');
        const modelItems = document.querySelectorAll('.model-item');
        const renameBtn = document.getElementById('renameModelBtn');
        const deleteBtn = document.getElementById('deleteModelBtn');

        if (moreBtn && modelModal) {
            moreBtn.addEventListener('click', () => {
                modelModal.classList.add('show');
            });

            // Close modal when clicking outside
            modelModal.addEventListener('click', (e) => {
                if (e.target === modelModal) {
                    modelModal.classList.remove('show');
                }
            });

            // Handle model selection
            modelItems.forEach(item => {
                item.addEventListener('click', () => {
                    const modelId = item.dataset.model;
                    this.selectModel(modelId);
                    modelModal.classList.remove('show');
                });
            });

            // Handle info button
            const infoBtn = document.querySelector('.info-btn');
            if (infoBtn) {
                infoBtn.addEventListener('click', () => {
                    this.showModelInfo();
                });
            }

            // Handle rename button
            if (renameBtn) {
                renameBtn.addEventListener('click', () => {
                    this.renameCurrentModel();
                });
            }

            // Handle delete button
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    this.deleteCurrentModel();
                });
            }
        }

        // Setup model info modal
        this.setupModelInfoModal();
        
        // Setup dialog event listeners
        this.setupDialogs();
    }

    setupModelInfoModal() {
        const modelInfoModal = document.getElementById('modelInfoModal');
        const closeBtn = document.getElementById('closeModelInfoBtn');
        const docsBtn = document.getElementById('docsLinkBtn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modelInfoModal.classList.remove('show');
            });
        }

        if (modelInfoModal) {
            modelInfoModal.addEventListener('click', (e) => {
                if (e.target === modelInfoModal) {
                    modelInfoModal.classList.remove('show');
                }
            });
        }

        if (docsBtn) {
            docsBtn.addEventListener('click', () => {
                const docsUrl = this.getModelDocsUrl(this.currentModel);
                window.open(docsUrl, '_blank');
            });
        }
    }

    showModelInfo() {
        const modelInfoModal = document.getElementById('modelInfoModal');
        const modelData = this.getModelData(this.currentModel);
        
        // Update modal content with translations
        const nameElement = document.getElementById('infoModelName');
        const taglineElement = document.getElementById('infoModelTagline');
        
        if (nameElement) {
            nameElement.textContent = modelData.title;
        }
        
        if (taglineElement) {
            taglineElement.textContent = this.translateText(modelData.tagline);
            taglineElement.setAttribute('data-translate', modelData.tagline);
        }
        
        const featuresContainer = document.getElementById('infoModelFeatures');
        if (featuresContainer) {
            featuresContainer.innerHTML = '';
            modelData.features.forEach(feature => {
                const featureItem = document.createElement('div');
                featureItem.className = 'feature-item';
                featureItem.setAttribute('data-translate', feature);
                featureItem.textContent = `• ${this.translateText(feature)}`;
                featuresContainer.appendChild(featureItem);
            });
        }
        
        // Close model selector and show info modal
        document.getElementById('modelSelectorModal').classList.remove('show');
        modelInfoModal.classList.add('show');
        
        // Apply translations to the modal
        this.applyTranslations();
    }
    
    translateText(text) {
        // Use the global comprehensive translator if available
        if (window.comprehensiveTranslator && window.comprehensiveTranslator.translate) {
            return window.comprehensiveTranslator.translate(text);
        }
        return text;
    }
    
    applyTranslations() {
        // Apply translations to all elements with data-translate attributes
        if (window.comprehensiveTranslator && window.comprehensiveTranslator.translatePage) {
            window.comprehensiveTranslator.translatePage();
        }
    }

    getModelData(modelId) {
        const modelDataMap = {
            'gpt-4o': {
                title: 'GPT-4o',
                tagline: 'Great for most tasks',
                features: [
                    'Context length: 128k tokens',
                    'Strengths: reasoning, multilingual, visual understanding',
                    'Speed tier: priority'
                ]
            },
            'gpt-4o-mini': {
                title: 'GPT-4o mini',
                tagline: 'Fastest and most efficient',
                features: [
                    'Context length: 128k tokens',
                    'Strengths: fast response, efficiency',
                    'Speed tier: fastest'
                ]
            },
            'o4-mini': {
                title: 'o4-mini',
                tagline: 'Fast reasoning model',
                features: [
                    'Context length: 128k tokens',
                    'Strengths: fast reasoning, efficiency, problem solving',
                    'Speed tier: priority'
                ]
            },
            'o3': {
                title: 'o3',
                tagline: 'Uses advanced reasoning',
                features: [
                    'Context length: 200k tokens',
                    'Strengths: complex reasoning, mathematical problems',
                    'Speed tier: deep processing'
                ]
            }
        };
        
        return modelDataMap[modelId] || modelDataMap['gpt-4o'];
    }

    getModelDocsUrl(modelId) {
        const docsUrls = {
            'gpt-4o': 'https://platform.openai.com/docs/models/gpt-4o',
            'gpt-4o-mini': 'https://platform.openai.com/docs/models/gpt-4o-mini',
            'o4-mini': 'https://platform.openai.com/docs/models',
            'o3': 'https://platform.openai.com/docs/models'
        };
        
        return docsUrls[modelId] || 'https://platform.openai.com/docs/models';
    }

    renameCurrentModel() {
        const currentSessionName = this.getCurrentSessionName();
        this.showRenameDialog(currentSessionName);
        document.getElementById('modelSelectorModal').classList.remove('show');
    }

    deleteCurrentModel() {
        this.showDeleteDialog();
        document.getElementById('modelSelectorModal').classList.remove('show');
    }

    showRenameDialog(currentName) {
        const dialog = document.getElementById('renameDialog');
        const input = document.getElementById('renameInput');
        
        input.value = currentName;
        dialog.classList.add('show');
        
        // Focus and select text
        setTimeout(() => {
            input.focus();
            input.select();
        }, 100);
    }

    showDeleteDialog() {
        const dialog = document.getElementById('deleteDialog');
        dialog.classList.add('show');
    }

    hideRenameDialog() {
        document.getElementById('renameDialog').classList.remove('show');
    }

    hideDeleteDialog() {
        document.getElementById('deleteDialog').classList.remove('show');
    }

    setupDialogs() {
        // Rename dialog events
        const renameDialog = document.getElementById('renameDialog');
        const renameInput = document.getElementById('renameInput');
        const renameCancelBtn = document.getElementById('renameCancelBtn');
        const renameConfirmBtn = document.getElementById('renameConfirmBtn');

        // Delete dialog events
        const deleteDialog = document.getElementById('deleteDialog');
        const deleteCancelBtn = document.getElementById('deleteCancelBtn');
        const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');

        // Rename dialog
        if (renameCancelBtn) {
            renameCancelBtn.addEventListener('click', () => {
                this.hideRenameDialog();
            });
        }

        if (renameConfirmBtn) {
            renameConfirmBtn.addEventListener('click', () => {
                const newName = renameInput.value.trim();
                if (newName) {
                    this.updateSessionName(newName);
                    this.showToast(`대화명이 "${newName}"으로 변경되었습니다`);
                    this.hideRenameDialog();
                }
            });
        }

        // Enter key support for rename input
        if (renameInput) {
            renameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    renameConfirmBtn.click();
                } else if (e.key === 'Escape') {
                    this.hideRenameDialog();
                }
            });
        }

        // Delete dialog
        if (deleteCancelBtn) {
            deleteCancelBtn.addEventListener('click', () => {
                this.hideDeleteDialog();
            });
        }

        if (deleteConfirmBtn) {
            deleteConfirmBtn.addEventListener('click', () => {
                this.deleteCurrentSession();
                this.showToast('대화가 삭제되었습니다');
                this.hideDeleteDialog();
            });
        }

        // Close dialogs when clicking outside
        if (renameDialog) {
            renameDialog.addEventListener('click', (e) => {
                if (e.target === renameDialog) {
                    this.hideRenameDialog();
                }
            });
        }

        if (deleteDialog) {
            deleteDialog.addEventListener('click', (e) => {
                if (e.target === deleteDialog) {
                    this.hideDeleteDialog();
                }
            });
        }
    }

    getCurrentSessionName() {
        // 현재 세션 이름 가져오기 (기본값: 오늘 날짜)
        const today = new Date();
        return `대화 ${today.getMonth() + 1}/${today.getDate()}`;
    }

    updateSessionName(newName) {
        // 세션 이름 업데이트 로직
        console.log('세션 이름 업데이트:', newName);
        // 실제 구현에서는 서버에 이름 변경 요청을 보내거나 로컬 스토리지 업데이트
    }

    deleteCurrentSession() {
        // 현재 세션 삭제 로직
        console.log('현재 세션 삭제');
        // 실제 구현에서는 서버에 삭제 요청을 보내거나 새 세션 시작
        this.startNewChat();
    }

    selectModel(modelId) {
        // Update current model
        this.currentModel = modelId;
        
        // Update UI
        const modelName = document.querySelector('.model-name');
        const modelItems = document.querySelectorAll('.model-item');
        
        // Update model selector button text
        const modelTitles = {
            'gpt-4o': 'GPT-4o',
            'gpt-4.5': 'GPT-4.5',
            'o3': 'o3',
            'gpt-4o-mini': 'GPT-4o mini'
        };
        
        if (modelName) {
            modelName.textContent = modelTitles[modelId] || 'GPT-4o';
        }
        
        // Update selection indicators
        modelItems.forEach(item => {
            if (item.dataset.model === modelId) {
                item.classList.add('selected');
                // Add check mark if it doesn't exist
                if (!item.querySelector('.model-check')) {
                    const checkMark = document.createElement('div');
                    checkMark.className = 'model-check';
                    checkMark.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                    `;
                    item.appendChild(checkMark);
                }
            } else {
                item.classList.remove('selected');
                // Remove check mark
                const checkMark = item.querySelector('.model-check');
                if (checkMark) {
                    checkMark.remove();
                }
            }
        });
        
        // Show toast notification
        this.showToast(`모델이 ${modelTitles[modelId] || 'GPT-4o'}로 전환되었습니다`);
    }

    setupSidebar() {
        const menuBtn = document.getElementById('menuBtn');
        const sidebarOverlay = document.getElementById('sidebarDrawer');
        const newChatBtn = document.getElementById('newChatBtn');
        const searchInput = document.getElementById('sidebarSearch');


        const sidebarBrand = document.querySelector('.sidebar-brand');

        if (menuBtn && sidebarOverlay) {
            menuBtn.addEventListener('click', () => {
                sidebarOverlay.classList.add('show');
            });

            // Close sidebar when clicking outside
            sidebarOverlay.addEventListener('click', (e) => {
                if (e.target === sidebarOverlay) {
                    sidebarOverlay.classList.remove('show');
                }
            });

            // New chat functionality
            if (newChatBtn) {
                newChatBtn.addEventListener('click', () => {
                    this.startNewChat();
                    sidebarOverlay.classList.remove('show');
                });
            }

            // Brand click functionality
            if (sidebarBrand) {
                sidebarBrand.addEventListener('click', () => {
                    this.startNewChat();
                    sidebarOverlay.classList.remove('show');
                });
            }



            // Search functionality
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.filterSidebarContent(e.target.value);
                });
            }
        }
    }

    startNewChat() {
        // Clear current conversation
        this.conversationHistory = [];
        this.sessionId = null;
        this.hasResponse = false;
        this.currentSessionId = null;
        
        // Clear UI
        const responseContent = document.getElementById('responseContent');
        const messageInput = document.getElementById('messageInput');
        
        if (responseContent) {
            responseContent.innerHTML = '';
        }
        
        if (messageInput) {
            messageInput.value = '';
        }
        
        // Update send button
        this.updateSendButton();
        
        // Update chat history display
        this.updateChatHistoryDisplay();
        
        // Update model selector buttons visibility
        this.updateModelSelectorButtons();
        
        console.log('New chat started');
    }

    updateModelSelectorButtons() {
        const renameBtn = document.getElementById('renameModelBtn');
        const deleteBtn = document.getElementById('deleteModelBtn');
        const modelList = document.querySelector('.model-list');
        const modelSheet = document.querySelector('.model-sheet');
        
        if (this.conversationHistory.length > 0 && this.currentSessionId) {
            // Show rename and delete buttons when conversation exists
            if (renameBtn) renameBtn.style.display = 'flex';
            if (deleteBtn) deleteBtn.style.display = 'flex';
            
            // Add spacing to model list
            if (modelList) modelList.classList.add('with-spacing');
            
            // Increase modal height for expanded content
            if (modelSheet) {
                modelSheet.style.height = 'auto';
                modelSheet.style.minHeight = '60vh';
            }
        } else {
            // Hide rename and delete buttons for new chats
            if (renameBtn) renameBtn.style.display = 'none';
            if (deleteBtn) deleteBtn.style.display = 'none';
            
            // Remove spacing from model list
            if (modelList) modelList.classList.remove('with-spacing');
            
            // Compact modal height for minimal content
            if (modelSheet) {
                modelSheet.style.height = 'auto';
                modelSheet.style.minHeight = '50vh';
            }
        }
    }

    addToSidebarHistory(title, preview, sessionId) {
        const newSession = {
            id: sessionId || this.generateSessionId(),
            title: title,
            preview: preview,
            timestamp: new Date(),
            active: true
        };
        
        // Mark current session as inactive
        this.chatSessions.forEach(session => session.active = false);
        
        // Add new session to beginning of array
        this.chatSessions.unshift(newSession);
        this.currentSessionId = newSession.id;
        
        // Update display
        this.updateChatHistoryDisplay();
        
        // Update model selector buttons
        this.updateModelSelectorButtons();
        
        return newSession.id;
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    updateChatHistoryDisplay() {
        const emptyState = document.getElementById('emptyState');
        const chatHistoryList = document.getElementById('chatHistoryList');
        
        if (this.chatSessions.length === 0) {
            emptyState.style.display = 'block';
            chatHistoryList.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            chatHistoryList.style.display = 'block';
            this.renderChatHistory();
        }
    }

    renderChatHistory() {
        const chatHistoryList = document.getElementById('chatHistoryList');
        if (!chatHistoryList) return;
        
        chatHistoryList.innerHTML = '';
        
        this.chatSessions.forEach(session => {
            const historyItem = document.createElement('div');
            historyItem.className = `chat-history-item ${session.active ? 'active' : ''}`;
            historyItem.dataset.sessionId = session.id;
            
            const timeAgo = this.getTimeAgo(session.timestamp);
            
            historyItem.innerHTML = `
                <div class="chat-history-text">
                    <div class="chat-history-title">${session.title}</div>
                    <div class="chat-history-preview">${session.preview}</div>
                </div>
                <div class="chat-history-time">${timeAgo}</div>
            `;
            
            historyItem.addEventListener('click', () => {
                this.switchToChatSession(session.id);
            });
            
            chatHistoryList.appendChild(historyItem);
        });
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        return `${days}일 전`;
    }

    switchToChatSession(sessionId) {
        const session = this.chatSessions.find(s => s.id === sessionId);
        if (!session) return;
        
        // Mark all sessions as inactive
        this.chatSessions.forEach(s => s.active = false);
        
        // Mark selected session as active
        session.active = true;
        this.currentSessionId = sessionId;
        
        // Update display
        this.updateChatHistoryDisplay();
        
        // Close sidebar
        const sidebarOverlay = document.getElementById('sidebarDrawer');
        if (sidebarOverlay) {
            sidebarOverlay.classList.remove('show');
        }
        
        console.log('Switched to chat session:', sessionId);
    }

    filterSidebarContent(query) {
        const chatItems = document.querySelectorAll('.chat-item');
        const searchQuery = query.toLowerCase();
        
        chatItems.forEach(item => {
            const title = item.querySelector('.chat-title').textContent.toLowerCase();
            if (title.includes(searchQuery)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    showToast(message) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        // Add to page
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatGPT = new SimpleChatGPT();
});