// Global Translation System for HanasanAI
class GlobalTranslator {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {
            'en': {
                // Header and Navigation
                'HanasanAI': 'HanasanAI',
                'Menu': 'Menu',
                'Online': 'Online',
                'Offline': 'Offline',
                
                // Chat Interface
                'Message HanasanAI...': 'Message HanasanAI...',
                'Send': 'Send',
                'New chat': 'New chat',
                'Today': 'Today',
                'Yesterday': 'Yesterday',
                'Previous 7 days': 'Previous 7 days',
                'Previous 30 days': 'Previous 30 days',
                
                // Sidebar Menu Items
                'Settings': 'Settings',
                'Personalization': 'Personalization',
                'Data controls': 'Data controls',
                'Voice settings': 'Voice settings',
                'Notifications': 'Notifications',
                'Subscription': 'Subscription',
                'About': 'About',
                'Logout': 'Logout',
                'Login': 'Login',
                
                // Settings Pages
                'Custom instructions': 'Custom instructions',
                'What would you like HanasanAI to know about you?': 'What would you like HanasanAI to know about you?',
                'Tell HanasanAI about your preferences and context...': 'Tell HanasanAI about your preferences and context...',
                'Appearance': 'Appearance',
                'Language': 'Language',
                'Interface language for the app': 'Interface language for the app',
                'English': 'English',
                'Save': 'Save',
                'Cancel': 'Cancel',
                
                // Modal Content
                'What would you like ChatGPT to know about you to provide better responses?': 'What would you like ChatGPT to know about you to provide better responses?',
                'How would you like ChatGPT to respond?': 'How would you like ChatGPT to respond?',
                'characters': 'characters',
                'Close': 'Close',
                
                // Right Sidebar
                'Model': 'Model',
                'Suggestions': 'Suggestions',
                'Voice Control': 'Voice Control',
                'Start Recording': 'Start Recording',
                'Stop Recording': 'Stop Recording',
                'Upload Image': 'Upload Image',
                'Clear Chat': 'Clear Chat'
            },
            'ja': {
                // Header and Navigation
                'HanasanAI': 'HanasanAI',
                'Menu': 'メニュー',
                'Online': 'オンライン',
                'Offline': 'オフライン',
                
                // Chat Interface
                'Message HanasanAI...': 'HanasanAIにメッセージ...',
                'Send': '送信',
                'New chat': '新しいチャット',
                'Today': '今日',
                'Yesterday': '昨日',
                'Previous 7 days': '過去7日間',
                'Previous 30 days': '過去30日間',
                
                // Sidebar Menu Items
                'Settings': '設定',
                'Personalization': 'パーソナライゼーション',
                'Data controls': 'データ管理',
                'Voice settings': '音声設定',
                'Notifications': '通知',
                'Subscription': 'サブスクリプション',
                'About': '概要',
                'Logout': 'ログアウト',
                'Login': 'ログイン',
                
                // Settings Pages
                'Custom instructions': 'カスタム指示',
                'What would you like HanasanAI to know about you?': 'HanasanAIに何を知ってもらいたいですか？',
                'Tell HanasanAI about your preferences and context...': 'HanasanAIにあなたの好みや状況を教えてください...',
                'Appearance': '外観',
                'Language': '言語',
                'Interface language for the app': 'アプリのインターフェース言語',
                'English': '英語',
                'Save': '保存',
                'Cancel': 'キャンセル',
                
                // Modal Content
                'What would you like ChatGPT to know about you to provide better responses?': 'より良い回答を提供するために、ChatGPTにあなたについて何を知ってもらいたいですか？',
                'How would you like ChatGPT to respond?': 'ChatGPTにどのように応答してもらいたいですか？',
                'characters': '文字',
                'Close': '閉じる',
                
                // Right Sidebar
                'Model': 'モデル',
                'Suggestions': '提案',
                'Voice Control': '音声操作',
                'Start Recording': '録音開始',
                'Stop Recording': '録音停止',
                'Upload Image': '画像アップロード',
                'Clear Chat': 'チャットクリア'
            },
            'ko': {
                // Header and Navigation
                'HanasanAI': 'HanasanAI',
                'Menu': '메뉴',
                'Online': '온라인',
                'Offline': '오프라인',
                
                // Chat Interface
                'Message HanasanAI...': 'HanasanAI에게 메시지...',
                'Send': '전송',
                'New chat': '새 채팅',
                'Today': '오늘',
                'Yesterday': '어제',
                'Previous 7 days': '지난 7일',
                'Previous 30 days': '지난 30일',
                
                // Sidebar Menu Items
                'Settings': '설정',
                'Personalization': '개인화',
                'Data controls': '데이터 관리',
                'Voice settings': '음성 설정',
                'Notifications': '알림',
                'Subscription': '구독',
                'About': '정보',
                'Logout': '로그아웃',
                'Login': '로그인',
                
                // Settings Pages
                'Custom instructions': '사용자 지정 지침',
                'What would you like HanasanAI to know about you?': 'HanasanAI가 당신에 대해 무엇을 알기를 원하시나요?',
                'Tell HanasanAI about your preferences and context...': 'HanasanAI에게 당신의 선호도와 상황을 알려주세요...',
                'Appearance': '외관',
                'Language': '언어',
                'Interface language for the app': '앱의 인터페이스 언어',
                'English': '영어',
                'Save': '저장',
                'Cancel': '취소',
                
                // Modal Content
                'What would you like ChatGPT to know about you to provide better responses?': '더 나은 응답을 제공하기 위해 ChatGPT가 당신에 대해 무엇을 알기를 원하시나요?',
                'How would you like ChatGPT to respond?': 'ChatGPT가 어떻게 응답하기를 원하시나요?',
                'characters': '글자',
                'Close': '닫기',
                '日本語': '일본어',
                '한국어': '한국어',
                
                // Right Sidebar
                'Model': '모델',
                'Suggestions': '제안',
                'Voice Control': '음성 제어',
                'Start Recording': '녹음 시작',
                'Stop Recording': '녹음 중지',
                'Upload Image': '이미지 업로드',
                'Clear Chat': '채팅 지우기'
            }
        };
    }

    setLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem('language', language);
        this.translatePage();
    }

    translatePage() {
        const currentTranslations = this.translations[this.currentLanguage] || this.translations['en'];
        
        // Wait for DOM to be ready
        setTimeout(() => {
            // Translate specific sidebar elements
            this.translateSidebarElements(currentTranslations);
            
            // Translate all elements with text content
            document.querySelectorAll('*').forEach(element => {
                // Skip script and style elements
                if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') return;
                
                // Translate direct text content (no child elements)
                if (element.children.length === 0) {
                    const text = element.textContent.trim();
                    if (text && currentTranslations[text]) {
                        element.textContent = currentTranslations[text];
                    }
                }
                
                // Translate placeholders
                if (element.placeholder && currentTranslations[element.placeholder]) {
                    element.placeholder = currentTranslations[element.placeholder];
                }
                
                // Translate titles and tooltips
                if (element.title && currentTranslations[element.title]) {
                    element.title = currentTranslations[element.title];
                }
                
                // Translate alt text
                if (element.alt && currentTranslations[element.alt]) {
                    element.alt = currentTranslations[element.alt];
                }
                
                // Translate value attributes
                if (element.value && currentTranslations[element.value]) {
                    element.value = currentTranslations[element.value];
                }
            });
            
            // Translate data attributes
            document.querySelectorAll('[data-translate]').forEach(element => {
                const key = element.getAttribute('data-translate');
                if (currentTranslations[key]) {
                    element.textContent = currentTranslations[key];
                }
            });
        }, 100);
    }

    translateSidebarElements(translations) {
        // Translate left sidebar menu items
        const sidebarSelectors = [
            '.sidebar-menu a',
            '.settings-menu a', 
            '.nav-item',
            '.menu-item',
            '.sidebar-item',
            '.settings-item .settings-label',
            '.settings-item .settings-title'
        ];
        
        sidebarSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                const text = element.textContent.trim();
                if (text && translations[text]) {
                    element.textContent = translations[text];
                }
            });
        });
        
        // Translate right sidebar elements
        const rightSidebarSelectors = [
            '.model-selector',
            '.suggestions-panel',
            '.voice-control-panel',
            '.right-sidebar'
        ];
        
        rightSidebarSelectors.forEach(selector => {
            const panel = document.querySelector(selector);
            if (panel) {
                panel.querySelectorAll('*').forEach(element => {
                    if (element.children.length === 0) {
                        const text = element.textContent.trim();
                        if (text && translations[text]) {
                            element.textContent = translations[text];
                        }
                    }
                });
            }
        });
    }

    translate(key) {
        const currentTranslations = this.translations[this.currentLanguage] || this.translations['en'];
        return currentTranslations[key] || key;
    }
}

// Initialize global translator
window.globalTranslator = new GlobalTranslator();

// Apply translations when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.globalTranslator.translatePage();
});

// Re-translate when new content is added dynamically
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            setTimeout(() => {
                window.globalTranslator.translatePage();
            }, 100);
        }
    });
});

// Start observing when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
});