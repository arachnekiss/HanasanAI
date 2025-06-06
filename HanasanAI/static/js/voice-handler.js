// Voice Handler for Audio Recording and Processing
class VoiceHandler {
    constructor() {
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.stream = null;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.animationId = null;
        
        // Audio constraints
        this.constraints = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 44100
            }
        };
        
        this.callbacks = {
            onStart: null,
            onStop: null,
            onData: null,
            onError: null,
            onPermissionDenied: null
        };
        
        this.init();
    }

    async init() {
        try {
            // Check for browser support
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Media devices not supported in this browser');
            }

            // Check for MediaRecorder support
            if (!window.MediaRecorder) {
                throw new Error('MediaRecorder not supported in this browser');
            }

            console.log('Voice handler initialized successfully');
        } catch (error) {
            console.error('Voice handler initialization failed:', error);
            this.handleError(error);
        }
    }

    async requestPermission() {
        try {
            // Request microphone permission
            const stream = await navigator.mediaDevices.getUserMedia(this.constraints);
            
            // Stop the stream immediately as we just wanted to check permission
            stream.getTracks().forEach(track => track.stop());
            
            return true;
        } catch (error) {
            console.error('Microphone permission denied:', error);
            if (this.callbacks.onPermissionDenied) {
                this.callbacks.onPermissionDenied(error);
            }
            return false;
        }
    }

    async startRecording() {
        try {
            if (this.isRecording) {
                console.warn('Already recording');
                return false;
            }

            // Get media stream
            this.stream = await navigator.mediaDevices.getUserMedia(this.constraints);
            
            // Setup audio context for visualization
            this.setupAudioVisualization();
            
            // Setup MediaRecorder
            const options = this.getRecorderOptions();
            this.mediaRecorder = new MediaRecorder(this.stream, options);
            
            // Reset audio chunks
            this.audioChunks = [];
            
            // Setup event handlers
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                    
                    if (this.callbacks.onData) {
                        this.callbacks.onData(event.data);
                    }
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.handleRecordingStop();
            };
            
            this.mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event.error);
                this.handleError(event.error);
            };
            
            // Start recording
            this.mediaRecorder.start(100); // Collect data every 100ms
            this.isRecording = true;
            
            // Start audio visualization
            this.startAudioVisualization();
            
            if (this.callbacks.onStart) {
                this.callbacks.onStart();
            }
            
            console.log('Recording started');
            return true;
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.handleError(error);
            return false;
        }
    }

    stopRecording() {
        try {
            if (!this.isRecording || !this.mediaRecorder) {
                console.warn('Not currently recording');
                return null;
            }
            
            // Stop the MediaRecorder
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Stop audio visualization
            this.stopAudioVisualization();
            
            // Stop all tracks
            if (this.stream) {
                this.stream.getTracks().forEach(track => {
                    track.stop();
                });
                this.stream = null;
            }
            
            console.log('Recording stopped');
            return true;
            
        } catch (error) {
            console.error('Failed to stop recording:', error);
            this.handleError(error);
            return false;
        }
    }

    handleRecordingStop() {
        try {
            if (this.audioChunks.length === 0) {
                console.warn('No audio data recorded');
                return;
            }
            
            // Create audio blob
            const audioBlob = this.createAudioBlob();
            
            if (this.callbacks.onStop) {
                this.callbacks.onStop(audioBlob);
            }
            
        } catch (error) {
            console.error('Error handling recording stop:', error);
            this.handleError(error);
        }
    }

    createAudioBlob() {
        // Determine the best MIME type
        const mimeType = this.getSupportedMimeType();
        
        // Create blob from chunks
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        
        console.log(`Created audio blob: ${audioBlob.size} bytes, type: ${mimeType}`);
        return audioBlob;
    }

    getRecorderOptions() {
        // Try different MIME types in order of preference
        const mimeTypes = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/ogg',
            'audio/wav',
            'audio/mp4',
            'audio/mpeg'
        ];
        
        for (const mimeType of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mimeType)) {
                console.log(`Using MIME type: ${mimeType}`);
                return { mimeType };
            }
        }
        
        console.warn('No preferred MIME type supported, using default');
        return {};
    }

    getSupportedMimeType() {
        const mimeTypes = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/ogg',
            'audio/wav'
        ];
        
        for (const mimeType of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mimeType)) {
                return mimeType;
            }
        }
        
        return 'audio/webm'; // Default fallback
    }

    setupAudioVisualization() {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Create analyser
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            
            // Connect stream to analyser
            const source = this.audioContext.createMediaStreamSource(this.stream);
            source.connect(this.analyser);
            
            // Create data array for frequency data
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
        } catch (error) {
            console.error('Audio visualization setup failed:', error);
        }
    }

    startAudioVisualization() {
        if (!this.analyser || !this.dataArray) return;
        
        const visualize = () => {
            if (!this.isRecording) return;
            
            // Get frequency data
            this.analyser.getByteFrequencyData(this.dataArray);
            
            // Calculate average volume
            const average = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length;
            const volume = average / 255;
            
            // Trigger volume visualization callback
            if (this.callbacks.onVolumeChange) {
                this.callbacks.onVolumeChange(volume);
            }
            
            // Update recording indicator based on volume
            this.updateVolumeIndicator(volume);
            
            this.animationId = requestAnimationFrame(visualize);
        };
        
        visualize();
    }

    stopAudioVisualization() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
            this.audioContext = null;
        }
    }

    updateVolumeIndicator(volume) {
        // Update visual indicators based on volume level
        const indicator = document.querySelector('.recording-animation');
        if (indicator) {
            const intensity = Math.max(0.3, volume * 2); // Minimum 30% intensity
            indicator.style.opacity = intensity;
            indicator.style.transform = `scale(${0.8 + (intensity * 0.4)})`;
        }
        
        // Update voice button color based on volume
        const voiceBtn = document.getElementById('voiceBtn');
        if (voiceBtn && this.isRecording) {
            const intensity = Math.floor(volume * 255);
            const color = `rgb(220, ${53 + intensity}, ${53 + intensity})`;
            voiceBtn.style.backgroundColor = color;
        }
    }

    // Utility methods for audio processing
    async convertBlobToWav(blob) {
        try {
            const arrayBuffer = await blob.arrayBuffer();
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // Convert to WAV format
            const wavBlob = this.audioBufferToWav(audioBuffer);
            
            await audioContext.close();
            return wavBlob;
            
        } catch (error) {
            console.error('Audio conversion failed:', error);
            return blob; // Return original blob if conversion fails
        }
    }

    audioBufferToWav(audioBuffer) {
        const numChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;
        
        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;
        
        const buffer = audioBuffer.getChannelData(0);
        const length = buffer.length;
        const arrayBuffer = new ArrayBuffer(44 + length * bytesPerSample);
        const view = new DataView(arrayBuffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * bytesPerSample, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        writeString(36, 'data');
        view.setUint32(40, length * bytesPerSample, true);
        
        // Convert float samples to 16-bit PCM
        let offset = 44;
        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, buffer[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
        }
        
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    // Event callback setters
    onStart(callback) {
        this.callbacks.onStart = callback;
    }

    onStop(callback) {
        this.callbacks.onStop = callback;
    }

    onData(callback) {
        this.callbacks.onData = callback;
    }

    onError(callback) {
        this.callbacks.onError = callback;
    }

    onPermissionDenied(callback) {
        this.callbacks.onPermissionDenied = callback;
    }

    onVolumeChange(callback) {
        this.callbacks.onVolumeChange = callback;
    }

    handleError(error) {
        console.error('Voice handler error:', error);
        
        // Clean up on error
        this.cleanup();
        
        if (this.callbacks.onError) {
            this.callbacks.onError(error);
        }
    }

    cleanup() {
        this.stopRecording();
        this.stopAudioVisualization();
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
    }

    // Static utility methods
    static async checkMicrophoneSupport() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                return { supported: false, reason: 'Media devices not supported' };
            }
            
            if (!window.MediaRecorder) {
                return { supported: false, reason: 'MediaRecorder not supported' };
            }
            
            // Check for HTTPS or localhost
            if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
                return { supported: false, reason: 'HTTPS required for microphone access' };
            }
            
            return { supported: true };
            
        } catch (error) {
            return { supported: false, reason: error.message };
        }
    }

    static getSupportedMimeTypes() {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/ogg',
            'audio/wav',
            'audio/mp4',
            'audio/mpeg'
        ];
        
        return types.filter(type => MediaRecorder.isTypeSupported(type));
    }
}

// Export for global use
window.VoiceHandler = VoiceHandler;

// Auto-initialize for backward compatibility
document.addEventListener('DOMContentLoaded', () => {
    window.voiceHandler = new VoiceHandler();
});
