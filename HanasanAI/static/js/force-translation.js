// Force translation for main page and sidebar elements
function forceTranslateMainPage() {
    const currentLang = localStorage.getItem('language') || 'en';
    
    // Translation mappings
    const translations = {
        'en': {
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
            'Search': 'Search',
            'Chat History': 'Chat History',
            'No saved chats': 'No saved chats',
            'Guest': 'Guest',
            'Login': 'Login',
            'Free': 'Free'
        },
        'ko': {
            'message_placeholder': 'HanasanAI에게 메시지...',
            'attach_image': '이미지 첨부',
            'messenger_mode': '메신저 모드',
            'voice_input': '음성 입력',
            'video_call_mode': '화상 통화 모드',
            'create_image': '이미지 생성',
            'summarize_text': '텍스트 요약',
            'analyze_data': '데이터 분석',
            'brainstorm': '아이디어 브레인스토밍',
            'type_directly': '직접 입력',
            'Search': '검색',
            'Chat History': '채팅 기록',
            'No saved chats': '저장된 채팅이 없습니다',
            'Guest': '게스트',
            'Login': '로그인하기',
            'Free': '무료'
        },
        'ja': {
            'message_placeholder': 'HanasanAIにメッセージ...',
            'attach_image': '画像を添付',
            'messenger_mode': 'メッセンジャーモード',
            'voice_input': '音声入力',
            'video_call_mode': 'ビデオ通話モード',
            'create_image': '画像を作成',
            'summarize_text': 'テキストを要約',
            'analyze_data': 'データを分析',
            'brainstorm': 'アイデアをブレインストーミング',
            'type_directly': '直接入力',
            'Search': '検索',
            'Chat History': 'チャット履歴',
            'No saved chats': '保存されたチャットがありません',
            'Guest': 'ゲスト',
            'Login': 'ログイン',
            'Free': '無料'
        }
    };
    
    const currentTranslations = translations[currentLang] || translations['en'];
    
    // Force translate input placeholder
    const messageInput = document.getElementById('messageInput');
    if (messageInput && currentTranslations['message_placeholder']) {
        messageInput.placeholder = currentTranslations['message_placeholder'];
    }
    
    // Force translate button titles
    const attachBtn = document.getElementById('attachBtn');
    if (attachBtn && currentTranslations['attach_image']) {
        attachBtn.title = currentTranslations['attach_image'];
    }
    
    const messengerBtn = document.getElementById('messengerBtn');
    if (messengerBtn && currentTranslations['messenger_mode']) {
        messengerBtn.title = currentTranslations['messenger_mode'];
    }
    
    const voiceBtn = document.getElementById('voiceInputBtn');
    if (voiceBtn && currentTranslations['voice_input']) {
        voiceBtn.title = currentTranslations['voice_input'];
    }
    
    const videoBtn = document.getElementById('videoCallBtn');
    if (videoBtn && currentTranslations['video_call_mode']) {
        videoBtn.title = currentTranslations['video_call_mode'];
    }
    
    // Force translate suggestion text
    const suggestions = [
        { selector: '[data-prompt="Create an image"] span', key: 'create_image' },
        { selector: '[data-prompt="Summarize text"] span', key: 'summarize_text' },
        { selector: '[data-prompt="Analyze data"] span', key: 'analyze_data' },
        { selector: '[data-prompt="Brainstorm ideas"] span', key: 'brainstorm' },
        { selector: '[data-prompt="Type directly"] span', key: 'type_directly' }
    ];
    
    suggestions.forEach(item => {
        const element = document.querySelector(item.selector);
        if (element && currentTranslations[item.key]) {
            element.textContent = currentTranslations[item.key];
        }
    });
    
    // Force translate sidebar elements
    const sidebarSearch = document.getElementById('sidebarSearch');
    if (sidebarSearch && currentTranslations['Search']) {
        sidebarSearch.placeholder = currentTranslations['Search'];
    }
    
    // Force translate sidebar text elements
    const sidebarElements = [
        { selector: '.sidebar-section-title', mapping: { 'Chat History': 'Chat History', 'Search': 'Search' }},
        { selector: '.empty-state', mapping: { 'No saved chats': 'No saved chats' }},
        { selector: '.user-plan', mapping: { 'Free': 'Free', 'Guest': 'Guest' }},
        { selector: '.btn-login', mapping: { 'Login': 'Login' }}
    ];
    
    sidebarElements.forEach(item => {
        document.querySelectorAll(item.selector).forEach(element => {
            const text = element.textContent.trim();
            Object.keys(item.mapping).forEach(key => {
                if (text === key && currentTranslations[key]) {
                    element.textContent = currentTranslations[key];
                }
            });
        });
    });
    
    // Translate all text nodes that match known translations
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
    
    // Create reverse mapping for all languages
    const reverseMap = {};
    Object.keys(translations).forEach(lang => {
        Object.keys(translations[lang]).forEach(key => {
            const value = translations[lang][key];
            reverseMap[value] = key;
        });
    });
    
    textNodes.forEach(textNode => {
        const text = textNode.textContent.trim();
        const key = reverseMap[text];
        if (key && currentTranslations[key]) {
            try {
                textNode.textContent = currentTranslations[key];
            } catch (e) {
                console.debug('Force translation skipped:', e);
            }
        }
    });
}

// Auto-run force translation
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            forceTranslateMainPage();
            setTimeout(forceTranslateMainPage, 100);
            setTimeout(forceTranslateMainPage, 500);
        });
    } else {
        // DOM already loaded
        forceTranslateMainPage();
        setTimeout(forceTranslateMainPage, 100);
        setTimeout(forceTranslateMainPage, 500);
    }
    
    // Make globally available
    window.forceTranslateMainPage = forceTranslateMainPage;
    
    // Listen for language changes and re-translate
    window.addEventListener('storage', function(e) {
        if (e.key === 'language') {
            setTimeout(forceTranslateMainPage, 50);
        }
    });
}