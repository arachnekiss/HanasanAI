// Universal Translation System for all pages and components
class UniversalTranslator {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {
            'en': {
                // Main page
                'Message HanasanAI...': 'Message HanasanAI...',
                'message_placeholder': 'Message HanasanAI...',
                'attach_image': 'Attach Image',
                'messenger_mode': 'Messenger Mode',
                'voice_input': 'Voice Input',
                'video_call_mode': 'Video Call Mode',
                'create_image': 'Create an image',
                'summarize_text': 'Summarize text',
                'analyze_data': 'Analyze data',
                'brainstorm': 'Brainstorm ideas',
                'type_directly': 'Type directly',
                
                // Sidebar
                'Search': 'Search',
                'Chat History': 'Chat History',
                'No saved chats': 'No saved chats',
                'Guest': 'Guest',
                'Login': 'Login',
                'Free': 'Free',
                'Settings': 'Settings',
                'Personalization': 'Personalization',
                'Data controls': 'Data controls',
                'Voice settings': 'Voice settings',
                'Notifications': 'Notifications',
                'Subscription': 'Subscription',
                'About': 'About',
                'Logout': 'Logout',
                
                // Model selector and details
                'Model': 'Model',
                'Choose a model': 'Choose a model',
                'View details': 'View details',
                'Rename': 'Rename',
                'Delete': 'Delete',
                'Great for most tasks': 'Great for most tasks',
                'Fastest and most efficient': 'Fastest and most efficient',
                'Fast reasoning model': 'Fast reasoning model',
                'Faster reasoning for coding, math, and science': 'Faster reasoning for coding, math, and science',
                'Reasoning': 'Reasoning',
                'Latest': 'Latest',
                'Model Information': 'Model Information',
                'Context length: 128k tokens': 'Context length: 128k tokens',
                'Strengths: Reasoning, multilingual, visual understanding': 'Strengths: Reasoning, multilingual, visual understanding',
                'Speed rating: Priority': 'Speed rating: Priority',
                'View documentation': 'View documentation',
                'Context length:': 'Context length:',
                '128k tokens': '128k tokens',
                'Strengths:': 'Strengths:',
                'Reasoning, multilingual, visual understanding': 'Reasoning, multilingual, visual understanding',
                'Speed rating:': 'Speed rating:',
                'Priority': 'Priority',
                'Fast responses, efficient processing': 'Fast responses, efficient processing',
                'Fastest': 'Fastest',
                'Advanced writing, creative ideation': 'Advanced writing, creative ideation',
                'Standard': 'Standard',
                'Complex reasoning, research tasks': 'Complex reasoning, research tasks',
                'Slower but thorough': 'Slower but thorough',
                'General purpose AI assistant': 'General purpose AI assistant',
                'Uses advanced reasoning': 'Uses advanced reasoning',
                'reasoning, multilingual, visual understanding': 'reasoning, multilingual, visual understanding',
                'Speed tier': 'Speed tier',
                'priority': 'priority',
                
                // Settings pages
                'Custom Instructions': 'Custom Instructions',
                'Tell HanasanAI about your preferences and context...': 'Tell HanasanAI about your preferences and context...',
                'Language': 'Language',
                'Interface language for the app': 'Interface language for the app',
                'English': 'English',
                'Korean': 'Korean',
                'Japanese': 'Japanese',
                'Save': 'Save',
                'Cancel': 'Cancel',
                'Theme': 'Theme',
                'Dark': 'Dark',
                'Light': 'Light',
                'Auto': 'Auto',
                
                // Voice settings
                'Voice': 'Voice',
                'Input Language': 'Input Language',
                'Auto-detect': 'Auto-detect',
                
                // Data controls
                'Data Controls': 'Data Controls',
                'Save Chat History': 'Save Chat History',
                'Chat history will be saved to your account': 'Chat history will be saved to your account',
                
                // Subscription
                'Choose your plan': 'Choose your plan',
                'Premium': 'Premium',
                '$20/month': '$20/month',
                'Access to all AI models': 'Access to all AI models',
                'Unlimited conversations': 'Unlimited conversations',
                'Voice recognition and response': 'Voice recognition and response',
                'Image analysis features': 'Image analysis features',
                'Priority response speed': 'Priority response speed',
                'Basic chat functionality': 'Basic chat functionality',
                'Limited AI model access': 'Limited AI model access',
                'Cannot save conversation history': 'Cannot save conversation history',
                'No access to advanced features': 'No access to advanced features',
                
                // Common UI
                'Close': 'Close',
                'Back': 'Back',
                'Next': 'Next',
                'Continue': 'Continue',
                'Yes': 'Yes',
                'No': 'No',
                'OK': 'OK'
            },
            'ko': {
                // Main page
                'Message HanasanAI...': 'HanasanAI에게 메시지...',
                'message_placeholder': 'HanasanAI에게 메시지...',
                'attach_image': '이미지 첨부',
                'messenger_mode': '메신저 모드',
                'voice_input': '음성 입력',
                'video_call_mode': '화상 통화 모드',
                'create_image': '이미지 생성',
                'summarize_text': '텍스트 요약',
                'analyze_data': '데이터 분석',
                'brainstorm': '아이디어 도출',
                'type_directly': '직접 입력',
                
                // Sidebar
                'Search': '검색',
                'Chat History': '채팅 기록',
                'No saved chats': '저장된 채팅이 없습니다',
                'Guest': '게스트',
                'Login': '로그인하기',
                'Free': '무료',
                'Settings': '설정',
                'Personalization': '개인화',
                'Data controls': '데이터 관리',
                'Voice settings': '음성 설정',
                'Notifications': '알림',
                'Subscription': '구독',
                'About': '정보',
                'Logout': '로그아웃',
                
                // Model selector and details
                'Model': '모델',
                'Choose a model': '모델 선택',
                'View details': '세부 정보 보기',
                'Rename': '이름 변경',
                'Delete': '삭제',
                'Great for most tasks': '대부분의 작업에 탁월',
                'Fastest and most efficient': '가장 빠르고 효율적',
                'Optimized for writing and ideation': '글쓰기와 아이디어 도출에 최적화',
                'Research Preview': '연구 미리보기',
                'Model Information': '모델 정보',
                'Context length: 128k tokens': '컨텍스트 길이: 128k 토큰',
                'Strengths: Reasoning, multilingual, visual understanding': '강점: 추론, 다국어, 시각적 이해',
                'Speed rating: Priority': '속도 등급: 우선순위',
                'View documentation': '문서 보기',
                'Context length:': '컨텍스트 길이:',
                '128k tokens': '128k 토큰',
                'Strengths:': '강점:',
                'Reasoning, multilingual, visual understanding': '추론, 다국어, 시각적 이해',
                'Speed rating:': '속도 등급:',
                'Priority': '우선순위',
                'Fast responses, efficient processing': '빠른 응답, 효율적 처리',
                'Fastest': '가장 빠름',
                'Advanced writing, creative ideation': '고급 글쓰기, 창의적 아이디어',
                'Standard': '표준',
                'Complex reasoning, research tasks': '복잡한 추론, 연구 작업',
                'Slower but thorough': '느리지만 철저함',
                'General purpose AI assistant': '범용 AI 어시스턴트',
                'Uses advanced reasoning': '고급 추론 사용',
                'reasoning, multilingual, visual understanding': '추론, 다국어, 시각적 이해',
                'Speed tier': '속도 등급',
                'priority': '우선순위',
                'Faster reasoning for coding, math, and science': '코딩, 수학, 과학을 위한 빠른 추론',
                'Reasoning': '추론',
                
                // Settings pages
                'Custom Instructions': '맞춤형 지침',
                'Tell HanasanAI about your preferences and context...': 'HanasanAI에게 선호사항과 상황을 알려주세요...',
                'Language': '언어',
                'Interface language for the app': '앱 인터페이스 언어',
                'English': '영어',
                'Korean': '한국어',
                'Japanese': '일본어',
                'Save': '저장',
                'Cancel': '취소',
                'Theme': '테마',
                'Dark': '다크',
                'Light': '라이트',
                'Auto': '자동',
                
                // Voice settings
                'Voice': '음성',
                'Input Language': '입력 언어',
                'Auto-detect': '자동 감지',
                
                // Data controls
                'Data Controls': '데이터 관리',
                'Save Chat History': '채팅 기록 저장',
                'Chat history will be saved to your account': '채팅 기록이 계정에 저장됩니다',
                
                // Subscription
                'Choose your plan': '요금제 선택',
                'Premium': '프리미엄',
                '$20/month': '$20/월',
                'Access to all AI models': '모든 AI 모델 액세스',
                'Unlimited conversations': '무제한 대화',
                'Voice recognition and response': '음성 인식 및 응답',
                'Image analysis features': '이미지 분석 기능',
                'Priority response speed': '우선 응답 속도',
                'Basic chat functionality': '기본 채팅 기능',
                'Limited AI model access': '제한된 AI 모델 액세스',
                'Cannot save conversation history': '대화 기록을 저장할 수 없습니다',
                'No access to advanced features': '고급 기능에 액세스할 수 없습니다',
                
                // Right sidebar
                'Today': '오늘',
                'Yesterday': '어제',
                'Previous 7 days': '지난 7일',
                'Previous 30 days': '지난 30일',
                'New chat': '새 채팅',
                
                // Common UI
                'Close': '닫기',
                'Back': '뒤로',
                'Next': '다음',
                'Continue': '계속',
                'Yes': '예',
                'No': '아니오',
                'OK': '확인'
            },
            'ja': {
                // Main page
                'Message HanasanAI...': 'HanasanAIにメッセージ...',
                'message_placeholder': 'HanasanAIにメッセージ...',
                'attach_image': '画像を添付',
                'messenger_mode': 'メッセンジャーモード',
                'voice_input': '音声入力',
                'video_call_mode': 'ビデオ通話モード',
                'create_image': '画像を作成',
                'summarize_text': 'テキストを要約',
                'analyze_data': 'データを分析',
                'brainstorm': 'アイデア創出',
                'type_directly': '直接入力',
                
                // Sidebar
                'Search': '検索',
                'Chat History': 'チャット履歴',
                'No saved chats': '保存されたチャットがありません',
                'Guest': 'ゲスト',
                'Login': 'ログイン',
                'Free': '無料',
                'Settings': '設定',
                'Personalization': 'パーソナライゼーション',
                'Data controls': 'データ管理',
                'Voice settings': '音声設定',
                'Notifications': '通知',
                'Subscription': 'サブスクリプション',
                'About': '概要',
                'Logout': 'ログアウト',
                
                // Model selector and details
                'Model': 'モデル',
                'Choose a model': 'モデルを選択',
                'View details': '詳細を表示',
                'Rename': '名前を変更',
                'Delete': '削除',
                'Great for most tasks': 'ほとんどのタスクに最適',
                'Fastest and most efficient': '最速で最も効率的',
                'Optimized for writing and ideation': '執筆とアイデア創出に最適化',
                'Research Preview': 'リサーチプレビュー',
                'Model Information': 'モデル情報',
                'Context length: 128k tokens': 'コンテキスト長: 128kトークン',
                'Strengths: Reasoning, multilingual, visual understanding': '強み: 推論、多言語、視覚的理解',
                'Speed rating: Priority': 'スピード評価: 優先',
                'View documentation': 'ドキュメントを表示',
                'Context length:': 'コンテキスト長:',
                '128k tokens': '128kトークン',
                'Strengths:': '強み:',
                'Reasoning, multilingual, visual understanding': '推論、多言語、視覚的理解',
                'Speed rating:': 'スピード評価:',
                'Priority': '優先',
                'Fast responses, efficient processing': '高速応答、効率的処理',
                'Fastest': '最速',
                'Advanced writing, creative ideation': '高度な執筆、創造的発想',
                'Standard': '標準',
                'Complex reasoning, research tasks': '複雑な推論、研究タスク',
                'Slower but thorough': '遅いが徹底的',
                'General purpose AI assistant': '汎用AIアシスタント',
                'Uses advanced reasoning': '高度な推論を使用',
                'reasoning, multilingual, visual understanding': '推論、多言語、視覚的理解',
                'Speed tier': 'スピード階層',
                'priority': '優先',
                'Faster reasoning for coding, math, and science': 'コーディング、数学、科学のための高速推論',
                'Reasoning': '推論',
                
                // Settings pages
                'Custom Instructions': 'カスタム指示',
                'Tell HanasanAI about your preferences and context...': 'HanasanAIにあなたの好みと文脈を教えてください...',
                'Language': '言語',
                'Interface language for the app': 'アプリのインターフェース言語',
                'English': '英語',
                'Korean': '韓国語',
                'Japanese': '日本語',
                'Save': '保存',
                'Cancel': 'キャンセル',
                'Theme': 'テーマ',
                'Dark': 'ダーク',
                'Light': 'ライト',
                'Auto': '自動',
                
                // Voice settings
                'Voice': '音声',
                'Input Language': '入力言語',
                'Auto-detect': '自動検出',
                
                // Data controls
                'Data Controls': 'データ管理',
                'Save Chat History': 'チャット履歴を保存',
                'Chat history will be saved to your account': 'チャット履歴がアカウントに保存されます',
                
                // Subscription
                'Choose your plan': 'プランを選択',
                'Premium': 'プレミアム',
                '$20/month': '$20/月',
                'Access to all AI models': 'すべてのAIモデルへのアクセス',
                'Unlimited conversations': '無制限の会話',
                'Voice recognition and response': '音声認識と応答',
                'Image analysis features': '画像解析機能',
                'Priority response speed': '優先応答速度',
                'Basic chat functionality': '基本チャット機能',
                'Limited AI model access': '限定AIモデルアクセス',
                'Cannot save conversation history': '会話履歴を保存できません',
                'No access to advanced features': '高度な機能にアクセスできません',
                
                // Right sidebar
                'Today': '今日',
                'Yesterday': '昨日',
                'Previous 7 days': '過去7日間',
                'Previous 30 days': '過去30日間',
                'New chat': '新しいチャット',
                
                // Common UI
                'Close': '閉じる',
                'Back': '戻る',
                'Next': '次へ',
                'Continue': '続行',
                'Yes': 'はい',
                'No': 'いいえ',
                'OK': 'OK'
            }
        };
        
        this.initialize();
    }
    
    initialize() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        
        // Immediate translation
        this.translateAll();
        
        // Multiple passes for dynamic content
        setTimeout(() => this.translateAll(), 100);
        setTimeout(() => this.translateAll(), 300);
        setTimeout(() => this.translateAll(), 500);
        setTimeout(() => this.translateAll(), 1000);
        
        // Make globally available
        window.universalTranslator = this;
        window.translateToLanguage = (lang) => this.setLanguageAndTranslate(lang);
        
        // Update language display
        this.updateLanguageDisplay();
    }
    
    setLanguageAndTranslate(language) {
        this.currentLanguage = language;
        localStorage.setItem('language', language);
        
        // Immediate translation
        this.translateAll();
        this.updateLanguageDisplay();
        
        // Multiple passes for dynamic content
        for (let i = 1; i <= 5; i++) {
            setTimeout(() => {
                this.translateAll();
                this.updateLanguageDisplay();
            }, i * 200);
        }
    }
    
    translateAll() {
        try {
            const currentTranslations = this.translations[this.currentLanguage] || this.translations['en'];
            
            // 1. Translate by data attributes
            this.translateByDataAttributes(currentTranslations);
            
            // 2. Translate by text content matching
            this.translateByTextContent(currentTranslations);
            
            // 3. Translate specific elements
            this.translateSpecificElements(currentTranslations);
            
            // 4. Update language display
            this.updateLanguageDisplay();
            
        } catch (error) {
            console.debug('Translation error:', error);
        }
    }
    
    translateByDataAttributes(translations) {
        // data-i18n attributes
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                try {
                    if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
                        element.placeholder = translations[key];
                    } else if (element.title !== undefined && element.tagName === 'BUTTON') {
                        element.title = translations[key];
                    } else {
                        element.textContent = translations[key];
                    }
                } catch (e) {}
            }
        });
        
        // Special handling for language display
        const languageDisplay = document.getElementById('languageDisplay');
        if (languageDisplay) {
            const languageNames = {
                'en': 'English',
                'ko': '한국어',
                'ja': '日本語'
            };
            const displayName = languageNames[this.currentLanguage] || 'English';
            try {
                languageDisplay.textContent = displayName;
            } catch (e) {}
        }
        
        const currentLangElement = document.getElementById('currentLanguage');
        if (currentLangElement) {
            const languageNames = {
                'en': 'English',
                'ko': '한국어',
                'ja': '日本語'
            };
            const displayName = languageNames[this.currentLanguage] || 'English';
            try {
                currentLangElement.textContent = displayName;
            } catch (e) {}
        }
        
        // data-translate attributes
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[key]) {
                try {
                    element.textContent = translations[key];
                } catch (e) {}
            }
        });
    }
    
    translateByTextContent(translations) {
        // Create reverse mapping
        const reverseMap = {};
        Object.keys(this.translations).forEach(lang => {
            Object.keys(this.translations[lang]).forEach(key => {
                const value = this.translations[lang][key];
                reverseMap[value] = key;
            });
        });
        
        // Walk through all text nodes
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    return node.parentElement && 
                           node.parentElement.tagName !== 'SCRIPT' && 
                           node.parentElement.tagName !== 'STYLE' &&
                           node.textContent.trim() ? 
                           NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                }
            },
            false
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        textNodes.forEach(textNode => {
            const text = textNode.textContent.trim();
            const key = reverseMap[text];
            if (key && translations[key]) {
                try {
                    textNode.textContent = translations[key];
                } catch (e) {}
            }
        });
    }
    
    translateSpecificElements(translations) {
        // Input placeholders
        const messageInput = document.getElementById('messageInput');
        if (messageInput && translations['message_placeholder']) {
            try {
                messageInput.placeholder = translations['message_placeholder'];
            } catch (e) {}
        }
        
        const sidebarSearch = document.getElementById('sidebarSearch');
        if (sidebarSearch && translations['Search']) {
            try {
                sidebarSearch.placeholder = translations['Search'];
            } catch (e) {}
        }
        
        // Button titles
        const buttons = {
            'attachBtn': 'attach_image',
            'messengerBtn': 'messenger_mode',
            'voiceInputBtn': 'voice_input',
            'videoCallBtn': 'video_call_mode'
        };
        
        Object.entries(buttons).forEach(([id, key]) => {
            const button = document.getElementById(id);
            if (button && translations[key]) {
                try {
                    button.title = translations[key];
                } catch (e) {}
            }
        });
        
        // Suggestion buttons
        const suggestions = [
            { selector: '[data-prompt="Create an image"] span', key: 'create_image' },
            { selector: '[data-prompt="Summarize text"] span', key: 'summarize_text' },
            { selector: '[data-prompt="Analyze data"] span', key: 'analyze_data' },
            { selector: '[data-prompt="Brainstorm ideas"] span', key: 'brainstorm' },
            { selector: '[data-prompt="Type directly"] span', key: 'type_directly' }
        ];
        
        suggestions.forEach(item => {
            const element = document.querySelector(item.selector);
            if (element && translations[item.key]) {
                try {
                    element.textContent = translations[item.key];
                } catch (e) {}
            }
        });
        
        // Translate right sidebar elements
        const rightSidebarElements = [
            'Today', 'Yesterday', 'Previous 7 days', 'Previous 30 days', 'New chat'
        ];
        
        rightSidebarElements.forEach(text => {
            document.querySelectorAll('*').forEach(element => {
                if (element.children.length === 0 && element.textContent.trim() === text && translations[text]) {
                    try {
                        element.textContent = translations[text];
                    } catch (e) {}
                }
            });
        });
        
        // Translate model info modal
        const modalElements = [
            { text: 'View details', key: 'View details' },
            { text: 'Model Information', key: 'Model Information' },
            { text: 'Context length: 128k tokens', key: 'Context length: 128k tokens' },
            { text: 'Strengths: Reasoning, multilingual, visual understanding', key: 'Strengths: Reasoning, multilingual, visual understanding' },
            { text: 'Speed rating: Priority', key: 'Speed rating: Priority' },
            { text: 'View documentation', key: 'View documentation' },
            { text: 'Uses advanced reasoning', key: 'Uses advanced reasoning' }
        ];
        
        modalElements.forEach(item => {
            document.querySelectorAll('*').forEach(element => {
                if (element.children.length === 0 && element.textContent.trim() === item.text && translations[item.key]) {
                    try {
                        element.textContent = translations[item.key];
                    } catch (e) {}
                }
            });
        });
    }
    
    updateLanguageDisplay() {
        const languageNames = {
            'en': 'English',
            'ko': '한국어', 
            'ja': '日本語'
        };
        
        const displayName = languageNames[this.currentLanguage] || 'English';
        
        // Update language display element
        const languageDisplay = document.getElementById('languageDisplay');
        if (languageDisplay) {
            try {
                languageDisplay.textContent = displayName;
            } catch (e) {}
        }
        
        // Update current language element  
        const currentLangElement = document.getElementById('currentLanguage');
        if (currentLangElement) {
            try {
                currentLangElement.textContent = displayName;
                currentLangElement.setAttribute('data-current-lang', this.currentLanguage);
            } catch (e) {}
        }
        
        // Update radio buttons
        const radioButtons = document.querySelectorAll('.radio-button');
        radioButtons.forEach(btn => {
            const lang = btn.getAttribute('data-lang');
            if (lang === this.currentLanguage) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    translate(key) {
        const translations = this.translations[this.currentLanguage] || this.translations['en'];
        return translations[key] || key;
    }
}

// Initialize universal translator
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new UniversalTranslator();
        });
    } else {
        new UniversalTranslator();
    }
}