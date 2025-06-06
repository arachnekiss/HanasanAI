// Direct Sidebar Translation Implementation
class SidebarTranslator {
    constructor() {
        this.translations = {
            'en': {
                // Left Sidebar Menu Items
                'Settings': 'Settings',
                'Personalization': 'Personalization', 
                'Data controls': 'Data controls',
                'Voice settings': 'Voice settings',
                'Notifications': 'Notifications',
                'Subscription': 'Subscription',
                'About': 'About',
                'Logout': 'Logout',
                'Login': 'Login',
                'Email': 'Email',
                'HanasanAI Pro': 'HanasanAI Pro',
                'Free': 'Free',
                
                // Right Sidebar Elements
                'Model': 'Model',
                'Suggestions': 'Suggestions',
                'Voice Control': 'Voice Control',
                'Start Recording': 'Start Recording',
                'Stop Recording': 'Stop Recording',
                'Upload Image': 'Upload Image',
                'Clear Chat': 'Clear Chat',
                'GPT-4o': 'GPT-4o',
                'GPT-3.5 Turbo': 'GPT-3.5 Turbo',
                
                // Interface Elements
                'Message HanasanAI...': 'Message HanasanAI...',
                'Send': 'Send',
                'New chat': 'New chat',
                'Today': 'Today',
                'Yesterday': 'Yesterday',
                'Previous 7 days': 'Previous 7 days',
                'Previous 30 days': 'Previous 30 days',
                'Online': 'Online',
                'Offline': 'Offline',
                'HanasanAI': 'HanasanAI',
                'Menu': 'Menu'
            },
            'ja': {
                // Left Sidebar Menu Items
                'Settings': '設定',
                'Personalization': 'パーソナライゼーション',
                'Data controls': 'データ管理',
                'Voice settings': '音声設定',
                'Notifications': '通知',
                'Subscription': 'サブスクリプション',
                'About': '概要',
                'Logout': 'ログアウト',
                'Login': 'ログイン',
                'Email': 'メール',
                'HanasanAI Pro': 'HanasanAI Pro',
                'Free': '無料',
                
                // Right Sidebar Elements
                'Model': 'モデル',
                'Suggestions': '提案',
                'Voice Control': '音声操作',
                'Start Recording': '録音開始',
                'Stop Recording': '録音停止',
                'Upload Image': '画像アップロード',
                'Clear Chat': 'チャットクリア',
                'GPT-4o': 'GPT-4o',
                'GPT-3.5 Turbo': 'GPT-3.5 Turbo',
                
                // Interface Elements
                'Message HanasanAI...': 'HanasanAIにメッセージ...',
                'Send': '送信',
                'New chat': '新しいチャット',
                'Today': '今日',
                'Yesterday': '昨日',
                'Previous 7 days': '過去7日間',
                'Previous 30 days': '過去30日間',
                'Online': 'オンライン',
                'Offline': 'オフライン',
                'HanasanAI': 'HanasanAI',
                'Menu': 'メニュー'
            },
            'ko': {
                // Left Sidebar Menu Items
                'Settings': '설정',
                'Personalization': '개인화',
                'Data controls': '데이터 관리', 
                'Voice settings': '음성 설정',
                'Notifications': '알림',
                'Subscription': '구독',
                'About': '정보',
                'Logout': '로그아웃',
                'Login': '로그인',
                'Email': '이메일',
                'HanasanAI Pro': 'HanasanAI Pro',
                'Free': '무료',
                
                // Right Sidebar Elements
                'Model': '모델',
                'Suggestions': '제안',
                'Voice Control': '음성 제어',
                'Start Recording': '녹음 시작',
                'Stop Recording': '녹음 중지',
                'Upload Image': '이미지 업로드',
                'Clear Chat': '채팅 지우기',
                'GPT-4o': 'GPT-4o',
                'GPT-3.5 Turbo': 'GPT-3.5 Turbo',
                
                // Interface Elements
                'Message HanasanAI...': 'HanasanAI에게 메시지...',
                'Send': '전송',
                'New chat': '새 채팅',
                'Today': '오늘',
                'Yesterday': '어제',
                'Previous 7 days': '지난 7일',
                'Previous 30 days': '지난 30일',
                'Online': '온라인',
                'Offline': '오프라인',
                'HanasanAI': 'HanasanAI',
                'Menu': '메뉴'
            }
        };
    }
    
    translateSidebars(language) {
        const translations = this.translations[language] || this.translations['en'];
        
        // Force immediate translation
        this.forceTranslateNow(translations);
        
        // Repeat multiple times to catch dynamic content
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.forceTranslateNow(translations);
            }, i * 300);
        }
    }
    
    forceTranslateNow(translations) {
        // Force translate specific known sidebar elements
        const knownElements = {
            'Settings': ['설정', 'Settings', '設定'],
            'Personalization': ['개인화', 'Personalization', 'パーソナライゼーション'],
            'Data controls': ['데이터 관리', 'Data controls', 'データ管理'],
            'Voice settings': ['음성 설정', 'Voice settings', '音声設定'],
            'Notifications': ['알림', 'Notifications', '通知'],
            'Subscription': ['구독', 'Subscription', 'サブスクリプション'],
            'About': ['정보', 'About', '概要'],
            'Logout': ['로그아웃', 'Logout', 'ログアウト'],
            'Login': ['로그인', 'Login', 'ログイン']
        };
        
        // Find and translate all text elements
        document.querySelectorAll('*').forEach(element => {
            if (element.children.length === 0) {
                const currentText = element.textContent.trim();
                
                // Check if current text matches any known element
                Object.keys(knownElements).forEach(key => {
                    const variants = knownElements[key];
                    if (variants.includes(currentText) && translations[key]) {
                        element.textContent = translations[key];
                    }
                });
                
                // Direct translation lookup
                if (translations[currentText]) {
                    element.textContent = translations[currentText];
                }
            }
        });
        
        // Force translate by CSS selectors
        this.translateAllElements(translations);
    }
    
    translateAllElements(translations) {
        // Target all possible text elements
        const selectors = [
            '.settings-label',
            '.settings-title', 
            '.settings-value',
            '.nav-item',
            '.menu-item',
            '.sidebar-item',
            'a',
            'button',
            'span',
            'div',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p',
            '.app-title',
            '#characterStatus',
            '#messageInput',
            '.status-text'
        ];
        
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                // Only translate leaf text nodes
                if (element.children.length === 0) {
                    const text = element.textContent.trim();
                    if (text && translations[text]) {
                        element.textContent = translations[text];
                    }
                }
                
                // Translate placeholders
                if (element.placeholder && translations[element.placeholder]) {
                    element.placeholder = translations[element.placeholder];
                }
                
                // Translate titles
                if (element.title && translations[element.title]) {
                    element.title = translations[element.title];
                }
            });
        });
        
        // Force translate specific sidebar elements by class/id
        this.forceTranslateElements(translations);
    }
    
    forceTranslateElements(translations) {
        // Specific element targeting
        const specificElements = [
            { selector: '[data-i18n="settings"]', key: 'Settings' },
            { selector: '[data-i18n="personalization"]', key: 'Personalization' },
            { selector: '[data-i18n="subscription"]', key: 'Subscription' },
            { selector: '[data-i18n="notifications"]', key: 'Notifications' },
            { selector: '[data-i18n="about"]', key: 'About' },
            { selector: '[data-i18n="logout"]', key: 'Logout' },
            { selector: '[data-i18n="login"]', key: 'Login' }
        ];
        
        specificElements.forEach(item => {
            const elements = document.querySelectorAll(item.selector);
            elements.forEach(element => {
                if (translations[item.key]) {
                    element.textContent = translations[item.key];
                }
            });
        });
    }
}

// Initialize sidebar translator
window.sidebarTranslator = new SidebarTranslator();

// Function to translate sidebars (called from personalization settings)
function translateSidebars(language) {
    if (window.sidebarTranslator) {
        window.sidebarTranslator.translateSidebars(language);
    }
}