// Main JavaScript for Character Chat Interface
class CharacterChat {
    constructor() {
        this.sessionId = null;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.socket = null;
        this.character = null;
        this.suggestions = [
            "Tell me a fun fact",
            "Help me brainstorm ideas", 
            "Explain something complex"
        ];
        
        // Available wallpapers
        this.wallpapers = [
            '/public/wallpaper/20250531_1449_Serene Sakura Avenue_simple_compose_01jwje3xjpeczrqfa3sdeze619.png',
            '/public/wallpaper/20250531_1449_Nostalgic Classroom Sunset_simple_compose_01jwje44psfbq8wba10s65n0a3.png',
            '/public/wallpaper/20250531_1449_Cyberpunk Tokyo Nightscape_simple_compose_01jwje41ybfyc82a55fnke3pqm.png',
            '/public/wallpaper/20250531_1450_Seaside Anime Adventure_simple_compose_01jwje4bn0excv6mkwjt6z0fb0.png',
            '/public/wallpaper/20250531_1452_Mystical Bamboo Forest_simple_compose_01jwjea7jffwwryz2jg4v4z05k.png',
            '/public/wallpaper/20250531_1454_Twilight Rooftop Oasis_simple_compose_01jwjedbj0fn2sw1p2a1hx99ej.png',
            '/public/wallpaper/20250531_1457_Sunflower Field Bliss_simple_compose_01jwjejg65fd1b70m3wkwhqeyv.png'
        ];
        this.currentWallpaper = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCharacter();
        this.connectSocket();
        this.loadSuggestions();
    }

    setupEventListeners() {
        // Message input and send
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        messageInput.addEventListener('focus', () => {
            this.hideSuggestions();
        });

        messageInput.addEventListener('blur', () => {
            setTimeout(() => {
                if (!messageInput.value.trim()) {
                    this.showSuggestions();
                }
            }, 100);
        });

        sendBtn.addEventListener('click', () => this.sendMessage());

        // Voice recording
        const voiceBtn = document.getElementById('voiceBtn');
        voiceBtn.addEventListener('click', () => this.toggleVoiceRecording());

        // Image upload
        const imageBtn = document.getElementById('imageBtn');
        const imageInput = document.getElementById('imageInput');
        
        imageBtn.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', (e) => this.handleImageUpload(e));

        // Suggestions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-pill') || e.target.closest('.suggestion-pill')) {
                const pill = e.target.classList.contains('suggestion-pill') ? e.target : e.target.closest('.suggestion-pill');
                const prompt = pill.dataset.prompt;
                messageInput.value = prompt;
                this.sendMessage();
                // Hide initial state after first message
                const initialState = document.getElementById('initialState');
                if (initialState) {
                    initialState.style.display = 'none';
                }
            }
        });

        // Background changer
        const bgBtn = document.getElementById('bgBtn');
        if (bgBtn) {
            bgBtn.addEventListener('click', () => this.changeBackground());
        }

        // Sidebar functionality
        const menuBtn = document.getElementById('menuBtn');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const newChatBtn = document.getElementById('newChatBtn');
        
        if (menuBtn && sidebar && sidebarOverlay) {
            menuBtn.addEventListener('click', () => this.toggleSidebar());
            sidebarOverlay.addEventListener('click', () => this.closeSidebar());
            
            if (newChatBtn) {
                newChatBtn.addEventListener('click', () => this.startNewChat());
            }
        }

        // Voice mode functionality
        const voiceModeBtn = document.getElementById('voiceModeBtn');
        const voiceOverlay = document.getElementById('voiceOverlay');
        const voiceCloseBtn = document.getElementById('voiceCloseBtn');
        const voiceSettingsBtn = document.getElementById('voiceSettingsBtn');
        const voiceSelectionModal = document.getElementById('voiceSelectionModal');
        
        if (voiceModeBtn && voiceOverlay) {
            voiceModeBtn.addEventListener('click', () => this.toggleVoiceMode());
            
            if (voiceCloseBtn) {
                voiceCloseBtn.addEventListener('click', () => this.closeVoiceMode());
            }
            
            if (voiceSettingsBtn && voiceSelectionModal) {
                voiceSettingsBtn.addEventListener('click', () => this.showVoiceSelection());
            }
        }

        // Video call mode functionality
        const videoModeBtn = document.getElementById('videoModeBtn');
        const videoCallOverlay = document.getElementById('videoCallOverlay');
        const videoCloseBtn = document.getElementById('videoCloseBtn');
        const videoEndBtn = document.getElementById('videoEndBtn');
        const videoMuteBtn = document.getElementById('videoMuteBtn');
        const videoCameraBtn = document.getElementById('videoCameraBtn');
        
        if (videoModeBtn && videoCallOverlay) {
            videoModeBtn.addEventListener('click', () => this.startVideoCall());
            
            if (videoCloseBtn) {
                videoCloseBtn.addEventListener('click', () => this.endVideoCall());
            }
            
            if (videoEndBtn) {
                videoEndBtn.addEventListener('click', () => this.endVideoCall());
            }
            
            if (videoMuteBtn) {
                videoMuteBtn.addEventListener('click', () => this.toggleVideoMute());
            }
            
            if (videoCameraBtn) {
                videoCameraBtn.addEventListener('click', () => this.toggleVideoCamera());
            }
        }

        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                window.location.href = '/settings';
            });
        }

        // Image analysis modal
        const analyzeBtn = document.getElementById('analyzeBtn');
        const imageQuestion = document.getElementById('imageQuestion');
        
        analyzeBtn.addEventListener('click', () => this.analyzeImage());
        imageQuestion.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.analyzeImage();
            }
        });
    }

    initializeCharacter() {
        try {
            this.character = new VRMCharacter('characterCanvas');
            this.character.init().then(() => {
                console.log('VRM Character initialized');
                this.updateCharacterStatus('Ready to chat', 'neutral');
            }).catch(error => {
                console.error('Character initialization failed:', error);
                // Fallback to text-based character status
                this.updateCharacterStatus('Ready to chat', 'neutral');
            });
        } catch (error) {
            console.error('Character creation failed:', error);
        }
    }

    connectSocket() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            showError('Connection error occurred');
        });
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();
        
        if (!message) return;

        // Clear input and hide suggestions
        messageInput.value = '';
        this.hideSuggestions();

        // Add user message to chat
        this.addMessage(message, 'user');

        // Show loading state
        this.updateCharacterStatus('Thinking...', 'thinking');
        showLoading();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    session_id: this.sessionId,
                    type: 'text',
                    custom_instructions: {
                        aboutYou: localStorage.getItem('customInstructions_aboutYou') || '',
                        responseStyle: localStorage.getItem('customInstructions_responseStyle') || ''
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            // Update session ID
            this.sessionId = data.session_id;

            // Add AI response to chat
            this.addMessage(data.response, 'ai');

            // Show browser notification if enabled
            this.showNotificationIfEnabled(data.response);

            // Update character with emotion
            if (data.emotion) {
                this.updateCharacterEmotion(data.emotion);
            }

            // Update suggestions
            if (data.suggestions) {
                this.updateSuggestions(data.suggestions);
            }

        } catch (error) {
            console.error('Chat error:', error);
            showError(error.message);
            this.addMessage('Sorry, I encountered an error. Please try again.', 'ai');
        } finally {
            hideLoading();
            this.updateCharacterStatus('Ready to chat', 'neutral');
        }
    }

    async toggleVoiceRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                this.processRecording();
            };

            this.mediaRecorder.start();
            this.isRecording = true;

            // Update UI
            document.getElementById('voiceBtn').classList.add('recording');
            const voiceIndicator = document.getElementById('voiceIndicator');
            if (voiceIndicator) {
                voiceIndicator.style.display = 'flex';
            }
            
            this.updateCharacterStatus('Listening...', 'listening');

        } catch (error) {
            console.error('Voice recording error:', error);
            showError('Could not access microphone');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;

            // Stop all tracks
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());

            // Update UI
            document.getElementById('voiceBtn').classList.remove('recording');
            document.getElementById('voiceIndicator').style.display = 'none';
        }
    }

    async processRecording() {
        showLoading();
        this.updateCharacterStatus('Processing voice...', 'thinking');

        try {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.wav');

            const response = await fetch('/api/voice-transcribe', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Transcription failed');
            }

            // Set transcribed text in input and send
            const messageInput = document.getElementById('messageInput');
            messageInput.value = data.transcription;
            this.sendMessage();

        } catch (error) {
            console.error('Voice processing error:', error);
            showError(error.message);
        } finally {
            hideLoading();
            this.updateCharacterStatus('Ready to chat', 'neutral');
        }
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showError('Please select an image file');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showError('Image size must be less than 10MB');
            return;
        }

        // Show preview modal
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('previewImage').src = e.target.result;
            const modal = new bootstrap.Modal(document.getElementById('imagePreviewModal'));
            modal.show();
        };
        reader.readAsDataURL(file);
    }

    async analyzeImage() {
        const imageElement = document.getElementById('previewImage');
        const question = document.getElementById('imageQuestion').value.trim();
        
        if (!imageElement.src) return;

        // Convert image to base64
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = async () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('imagePreviewModal'));
            modal.hide();

            // Add user message
            const displayMessage = question || 'Analyze this image';
            this.addMessage(displayMessage, 'user');
            
            showLoading();
            this.updateCharacterStatus('Analyzing image...', 'thinking');

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: question || 'What do you see in this image?',
                        image: base64,
                        session_id: this.sessionId,
                        type: 'image'
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Image analysis failed');
                }

                this.sessionId = data.session_id;
                this.addMessage(data.response, 'ai');

                if (data.emotion) {
                    this.updateCharacterEmotion(data.emotion);
                }

            } catch (error) {
                console.error('Image analysis error:', error);
                showError(error.message);
                this.addMessage('Sorry, I could not analyze the image. Please try again.', 'ai');
            } finally {
                hideLoading();
                this.updateCharacterStatus('Ready to chat', 'neutral');
                // Clear the question input
                document.getElementById('imageQuestion').value = '';
            }
        };
        
        img.src = imageElement.src;
    }

    addMessage(content, role) {
        const messagesArea = document.getElementById('chatMessages');
        
        // Hide initial state on first message
        const initialState = document.getElementById('initialState');
        if (initialState && initialState.style.display !== 'none') {
            initialState.style.display = 'none';
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = role === 'assistant' ? 'AI' : 'You';
        
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.innerHTML = this.formatMessage(content);
        
        messageContent.appendChild(avatar);
        messageContent.appendChild(messageText);
        messageDiv.appendChild(messageContent);
        
        messagesArea.appendChild(messageDiv);
        messagesArea.scrollTop = messagesArea.scrollHeight;
        
        if (role === 'ai') {
            const formattedContent = this.formatMessage(content);
            messageContent.innerHTML = formattedContent;
        } else {
            messageContent.textContent = content;
        }
        
        messageElement.appendChild(avatar);
        messageElement.appendChild(messageContent);
        messagesContainer.appendChild(messageElement);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Animate message appearance
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            messageElement.style.transition = 'all 0.3s ease';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        });
    }

    formatMessage(content) {
        // Simple markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }

    updateCharacterEmotion(emotionData) {
        // Update character animation
        if (this.character) {
            this.character.setEmotion(emotionData);
        }

        // Update emotion indicator
        const emotions = {
            happy: '😊 Happy',
            sad: '😢 Sad',
            excited: '🤩 Excited',
            neutral: '😐 Neutral',
            confused: '🤔 Confused',
            angry: '😤 Angry',
            surprised: '😲 Surprised'
        };

        const emotionText = emotions[emotionData.emotion] || '😐 Neutral';
        document.getElementById('characterEmotion').textContent = emotionText;
    }

    updateCharacterStatus(status, emotion = 'neutral') {
        const statusElement = document.getElementById('characterStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    showNotificationIfEnabled(response) {
        // Check if notifications are enabled
        const notificationsEnabled = localStorage.getItem('notificationsReplies') === 'true';
        
        if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            // Don't show notification if page is visible
            if (!document.hidden) {
                return;
            }
            
            // Truncate response for notification
            const notificationText = response.length > 100 
                ? response.substring(0, 100) + '...' 
                : response;
            
            new Notification('HanasanAI', {
                body: notificationText,
                icon: '/static/favicon.ico',
                badge: '/static/favicon.ico'
            });
        }
    }

    loadSuggestions() {
        this.updateSuggestionsUI(this.suggestions);
    }

    updateSuggestions(suggestions) {
        this.suggestions = suggestions;
        this.updateSuggestionsUI(suggestions);
    }

    updateSuggestionsUI(suggestions) {
        const suggestionsContainer = document.querySelector('.suggestions-list');
        if (suggestionsContainer) {
            suggestionsContainer.innerHTML = '';
            
            suggestions.forEach(suggestion => {
                const button = document.createElement('button');
                button.className = 'suggestion-btn';
                button.dataset.suggestion = suggestion;
                button.textContent = suggestion;
                suggestionsContainer.appendChild(button);
            });
        }
    }

    showSuggestions() {
        const suggestions = document.getElementById('suggestions');
        if (suggestions) {
            suggestions.style.display = 'block';
        }
    }

    hideSuggestions() {
        const suggestions = document.getElementById('suggestions');
        if (suggestions) {
            suggestions.style.display = 'none';
        }
    }

    changeBackground() {
        this.currentWallpaper = (this.currentWallpaper + 1) % this.wallpapers.length;
        const characterDisplay = document.querySelector('.character-display');
        if (characterDisplay) {
            characterDisplay.style.backgroundImage = `url('${this.wallpapers[this.currentWallpaper]}')`;
        }
    }

    // Sidebar functionality
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            this.loadChatHistory();
        }
    }

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
    }

    startNewChat() {
        // Clear current conversation
        const messagesArea = document.getElementById('chatMessages');
        const initialState = document.getElementById('initialState');
        
        if (messagesArea) {
            messagesArea.innerHTML = '';
            if (initialState) {
                messagesArea.appendChild(initialState.cloneNode(true));
                initialState.style.display = 'block';
            }
        }
        
        // Reset session
        this.sessionId = null;
        
        // Close sidebar
        this.closeSidebar();
        
        // Reset character
        this.updateCharacterStatus('Ready to chat', 'neutral');
    }

    loadChatHistory() {
        // Load chat history from server
        // For now, add some sample conversations
        const todayChats = document.getElementById('todayChats');
        const yesterdayChats = document.getElementById('yesterdayChats');
        
        if (todayChats && yesterdayChats) {
            todayChats.innerHTML = this.createChatHistoryItem('Help with coding project', '2 hours ago');
            yesterdayChats.innerHTML = this.createChatHistoryItem('Recipe suggestions', 'Yesterday');
        }
    }

    createChatHistoryItem(title, time) {
        return `
            <div class="chat-item">
                <div class="chat-icon">
                    <i class="fas fa-message"></i>
                </div>
                <div class="chat-info">
                    <div class="chat-title">${title}</div>
                    <div class="chat-time">${time}</div>
                </div>
            </div>
        `;
    }

    // Voice mode functionality
    toggleVoiceMode() {
        const voiceOverlay = document.getElementById('voiceOverlay');
        
        if (voiceOverlay) {
            voiceOverlay.style.display = 'flex';
            this.isVoiceModeActive = true;
            this.startVoiceConversation();
        }
    }

    closeVoiceMode() {
        const voiceOverlay = document.getElementById('voiceOverlay');
        
        if (voiceOverlay) {
            voiceOverlay.style.display = 'none';
            this.isVoiceModeActive = false;
            this.stopVoiceConversation();
        }
    }

    showVoiceSelection() {
        const voiceModal = document.getElementById('voiceSelectionModal');
        
        if (voiceModal) {
            voiceModal.style.display = 'flex';
            
            // Add event listeners for voice options
            const voiceOptions = voiceModal.querySelectorAll('.voice-option');
            voiceOptions.forEach(option => {
                option.addEventListener('click', () => {
                    this.selectVoice(option.dataset.voice);
                });
            });
            
            // Close modal
            const closeBtn = voiceModal.querySelector('.voice-modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    voiceModal.style.display = 'none';
                });
            }
        }
    }

    selectVoice(voiceId) {
        console.log('Selected voice:', voiceId);
        this.selectedVoice = voiceId;
        
        // Update UI to show selected voice
        const voiceOptions = document.querySelectorAll('.voice-option');
        voiceOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.voice === voiceId) {
                option.classList.add('selected');
            }
        });
        
        // Close modal
        const voiceModal = document.getElementById('voiceSelectionModal');
        if (voiceModal) {
            voiceModal.style.display = 'none';
        }
    }

    startVoiceConversation() {
        console.log('Starting voice conversation');
        this.updateVoiceStatus('Listening...');
        
        // Start continuous voice recognition
        if (this.voiceHandler) {
            this.voiceHandler.startRecording();
        }
    }

    stopVoiceConversation() {
        console.log('Stopping voice conversation');
        
        if (this.voiceHandler) {
            this.voiceHandler.stopRecording();
        }
    }

    updateVoiceStatus(status) {
        const statusText = document.getElementById('voiceStatusText');
        if (statusText) {
            statusText.textContent = status;
        }
    }

    // Video call functionality
    startVideoCall() {
        const videoOverlay = document.getElementById('videoCallOverlay');
        
        if (videoOverlay) {
            videoOverlay.style.display = 'flex';
            this.isVideoCallActive = true;
            this.initializeVideoCharacter();
            this.updateVideoStatus('Connecting...');
            
            // Start video call session
            setTimeout(() => {
                this.updateVideoStatus('Call connected');
                this.startVideoConversation();
            }, 2000);
        }
    }

    endVideoCall() {
        const videoOverlay = document.getElementById('videoCallOverlay');
        
        if (videoOverlay) {
            videoOverlay.style.display = 'none';
            this.isVideoCallActive = false;
            this.stopVideoConversation();
        }
    }

    toggleVideoMute() {
        this.isVideoMuted = !this.isVideoMuted;
        const muteBtn = document.getElementById('videoMuteBtn');
        
        if (muteBtn) {
            const icon = muteBtn.querySelector('i');
            const text = muteBtn.querySelector('span');
            
            if (this.isVideoMuted) {
                icon.className = 'fas fa-microphone-slash';
                text.textContent = 'Unmute';
                muteBtn.style.background = 'rgba(239, 68, 68, 0.8)';
            } else {
                icon.className = 'fas fa-microphone';
                text.textContent = 'Mute';
                muteBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            }
        }
    }

    toggleVideoCamera() {
        this.isVideoCameraOn = !this.isVideoCameraOn;
        const cameraBtn = document.getElementById('videoCameraBtn');
        
        if (cameraBtn) {
            const icon = cameraBtn.querySelector('i');
            const text = cameraBtn.querySelector('span');
            
            if (!this.isVideoCameraOn) {
                icon.className = 'fas fa-video-slash';
                text.textContent = 'Camera On';
                cameraBtn.style.background = 'rgba(239, 68, 68, 0.8)';
            } else {
                icon.className = 'fas fa-video';
                text.textContent = 'Camera';
                cameraBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            }
        }
    }

    initializeVideoCharacter() {
        const videoCanvas = document.getElementById('videoCharacterCanvas');
        
        if (videoCanvas && this.character) {
            // Clone character for video call
            this.videoCharacter = this.character;
            // Enhanced character animations for video call
            this.startVideoCharacterAnimations();
        }
    }

    startVideoCharacterAnimations() {
        // Enhanced character movements and expressions for video calls
        if (this.videoCharacter) {
            this.videoCharacter.setEmotion({ emotion: 'happy', intensity: 0.8 });
        }
    }

    startVideoConversation() {
        console.log('Starting video conversation with AI assistant');
        this.updateVideoStatus('Ready to talk');
        
        // Start continuous audio processing for video calls
        if (this.voiceHandler) {
            this.voiceHandler.startRecording();
        }
    }

    stopVideoConversation() {
        console.log('Stopping video conversation');
        
        if (this.voiceHandler) {
            this.voiceHandler.stopRecording();
        }
    }

    updateVideoStatus(status) {
        const statusElement = document.getElementById('videoStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    addVideoTranscript(text, speaker) {
        const transcript = document.getElementById('videoTranscript');
        if (transcript) {
            const transcriptLine = document.createElement('div');
            transcriptLine.innerHTML = `<strong>${speaker}:</strong> ${text}`;
            transcript.appendChild(transcriptLine);
            transcript.scrollTop = transcript.scrollHeight;
        }
    }

    // Enhanced character interaction system
    updateCharacterEmotionFromMessage(message, role) {
        if (!this.character) return;

        // Analyze message sentiment for appropriate character reaction
        const emotions = this.analyzeMessageEmotion(message, role);
        
        if (emotions) {
            this.character.setEmotion(emotions);
            this.updateCharacterStatus(emotions.status, emotions.emotion);
        }
    }

    analyzeMessageEmotion(message, role) {
        // Basic emotion analysis for character reactions
        const emotionKeywords = {
            happy: ['happy', 'great', 'awesome', 'wonderful', 'good', 'excellent', 'amazing'],
            sad: ['sad', 'sorry', 'disappointed', 'unfortunate', 'bad', 'terrible'],
            excited: ['excited', 'wow', 'incredible', 'fantastic', 'brilliant'],
            thinking: ['think', 'consider', 'analyze', 'understand', 'explain'],
            neutral: ['hello', 'hi', 'okay', 'yes', 'no']
        };

        const lowerMessage = message.toLowerCase();
        
        for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                return {
                    emotion: emotion,
                    intensity: 0.7,
                    status: role === 'user' ? 'Listening' : 'Responding'
                };
            }
        }

        return {
            emotion: 'neutral',
            intensity: 0.5,
            status: role === 'user' ? 'Processing' : 'Thinking'
        };
    }

    // Enhanced typing indicator
    showTypingIndicator() {
        const messagesArea = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'message assistant typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="message-avatar">AI</div>
                <div class="message-text">
                    <span>ChatGPT is typing</span>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        
        messagesArea.appendChild(typingDiv);
        messagesArea.scrollTop = messagesArea.scrollHeight;
        
        // Update character status
        this.updateCharacterStatus('Thinking...', 'thinking');
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

// Initialize the chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.characterChat = new CharacterChat();
});

// Handle page visibility for character animations
document.addEventListener('visibilitychange', () => {
    if (window.characterChat && window.characterChat.character) {
        if (document.hidden) {
            window.characterChat.character.pause();
        } else {
            window.characterChat.character.resume();
        }
    }
});
