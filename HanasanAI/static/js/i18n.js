// Internationalization (i18n) for HanasanAI
const translations = {
    en: {
        // Main interface
        'new_chat': 'New Chat',
        'messenger': 'Messenger',
        'settings': 'Settings',
        'logout': 'Log out',
        'login': 'Log in',
        'message_placeholder': 'Message HanasanAI...',
        'voice_input': 'Voice input',
        'send_message': 'Send message',
        'typing': 'HanasanAI is typing...',
        
        // Settings menu
        'personalization': 'Personalization',
        'data_controls': 'Data controls',
        'notifications': 'Notifications',
        'voice': 'Voice',
        'subscription': 'Subscription',
        'about': 'About',
        
        // Personalization
        'custom_instructions': 'Custom Instructions',
        'custom_instructions_desc': 'Tell HanasanAI about your preferences and context...',
        'color_scheme': 'Color Scheme',
        'language': 'Language',
        'interface_language': 'Interface language for the app',
        'appearance': 'Appearance',
        'dark_mode': 'Dark Mode',
        'light_mode': 'Light Mode',
        'auto_mode': 'Auto',
        
        // Custom Instructions Modal
        'about_you_label': 'What would you like HanasanAI to know about you to provide better responses?',
        'about_you_placeholder': 'Tell me about your background, interests, goals, or any other relevant information...',
        'response_style_label': 'How would you like HanasanAI to respond?',
        'response_style_placeholder': 'Specify the tone, style, format, or any other preferences for responses...',
        'save': 'Save',
        'cancel': 'Cancel',
        
        // Data Controls
        'data_usage': 'Data Usage',
        'chat_history_save': 'Save Chat History',
        'chat_history_save_desc': 'Save conversation history locally to continue previous conversations.',
        'chat_history': 'Chat History',
        'delete_all_chats': 'Delete All Chat History',
        
        // Notifications
        'browser_notifications': 'Browser Notifications',
        'new_response_notifications': 'New Response Notifications',
        'new_response_notifications_desc': 'Show browser notifications when AI responses are completed.',
        'notifications_enabled': 'Notifications enabled successfully!',
        'notifications_not_supported': 'Your browser does not support notifications.',
        
        // Voice
        'voice_input_section': 'Voice Input',
        'input_language': 'Input Language',
        'input_language_desc': 'Set your preferred language for voice input recognition.',
        'select_input_language': 'Select Input Language',
        
        // Subscription
        'subscription_title': 'Subscription',
        'current_plan': 'Current Plan',
        'free_plan': 'Free',
        'premium_plan': 'HanasanAI Premium',
        'premium_price': '$20/month',
        'upgrade_to_premium': 'Upgrade to Premium',
        'manage_subscription': 'Manage Subscription',
        'premium_features': [
            'Access to GPT-4o and all models',
            'Unlimited messages',
            'Priority support',
            'Advanced features'
        ],
        'free_features': [
            'GPT-4o mini access',
            'Limited messages per month',
            'Basic features'
        ],
        
        // About
        'version': 'Version',
        'privacy_policy': 'Privacy Policy',
        'terms_of_service': 'Terms of Service',
        'contact_support': 'Contact Support',
        
        // Interface buttons and actions
        'attach_image': 'Attach Image',
        'messenger_mode': 'Messenger Mode', 
        'voice_input': 'Voice Input',
        'video_call_mode': 'Video Call Mode',
        'message_placeholder': 'Message HanasanAI...',
        'type_message': 'Type a message...',
        
        // Suggestions
        'code_review': 'Code review',
        'summarize_text': 'Summarize text', 
        'analyze_data': 'Analyze data',
        'brainstorm': 'Brainstorm ideas',
        'type_directly': 'Type directly',
        
        // Messenger
        'messenger_title': 'HanasanAI Messenger',
        'messenger_description': 'Start a natural conversation.<br>AI may send proactive messages at appropriate times.',
        
        // Dialog elements
        'rename_chat': 'Rename Chat',
        'delete_chat': 'Delete Chat',
        'enter_chat_title': 'Enter chat title',
        'delete_chat_confirm': 'Are you sure you want to delete this chat?',
        'delete_chat_warning': 'Deleted chats cannot be recovered.',
        'rename': 'Rename',
        'delete': 'Delete',
        
        // Settings pages
        'settings_title': 'Settings - HanasanAI',
        'email': 'Email'
    },
    ja: {
        // Main interface
        'new_chat': '新しいチャット',
        'messenger': 'メッセンジャー',
        'settings': '設定',
        'logout': 'ログアウト',
        'login': 'ログイン',
        'message_placeholder': 'HanasanAIにメッセージを送信...',
        'voice_input': '音声入力',
        'send_message': 'メッセージを送信',
        'typing': 'HanasanAIが入力中...',
        
        // Settings menu
        'personalization': 'パーソナライゼーション',
        'data_controls': 'データ制御',
        'notifications': '通知',
        'voice_speech': '音声・発話',
        'subscription': 'サブスクリプション',
        'about': 'について',
        
        // Personalization
        'custom_instructions': 'カスタム指示',
        'custom_instructions_desc': 'あなたの好みや背景をHanasanAIに教えてください...',
        'color_scheme': 'カラースキーム',
        'language': '言語',
        'interface_language': 'アプリのインターフェース言語',
        'appearance': '外観',
        'dark_mode': 'ダークモード',
        'light_mode': 'ライトモード',
        'auto_mode': '自動',
        
        // Custom Instructions Modal
        'about_you_label': 'より良い回答を提供するために、HanasanAIにあなたについて何を知ってもらいたいですか？',
        'about_you_placeholder': 'あなたの背景、興味、目標、その他の関連情報について教えてください...',
        'response_style_label': 'HanasanAIにどのように回答してもらいたいですか？',
        'response_style_placeholder': 'トーン、スタイル、形式、その他の回答に対する好みを指定してください...',
        'save': '保存',
        'cancel': 'キャンセル',
        
        // Data Controls
        'data_usage': 'データ使用',
        'chat_history_save': 'チャット履歴の保存',
        'chat_history_save_desc': '以前の会話を続けるために、会話履歴をローカルに保存します。',
        'chat_history': 'チャット履歴',
        'delete_all_chats': 'すべてのチャット履歴を削除',
        
        // Notifications
        'browser_notifications': 'ブラウザ通知',
        'new_response_notifications': '新しい応答の通知',
        'new_response_notifications_desc': 'AI応答が完了したときにブラウザ通知を表示します。',
        'notifications_enabled': '通知が正常に有効になりました！',
        'notifications_not_supported': 'お使いのブラウザは通知をサポートしていません。',
        
        // Voice
        'voice': '音声',
        'voice_input_section': '音声入力',
        'input_language': '入力言語',
        'input_language_desc': '音声入力認識の優先言語を設定します。',
        'select_input_language': '入力言語を選択',
        
        // Subscription
        'subscription_title': 'サブスクリプション',
        'current_plan': '現在のプラン',
        'free_plan': '無料',
        'premium_plan': 'HanasanAI Premium',
        'premium_price': '月額$20',
        'upgrade_to_premium': 'Premiumにアップグレード',
        'manage_subscription': 'サブスクリプション管理',
        'premium_features': [
            'GPT-4oとすべてのモデルへのアクセス',
            '無制限メッセージ',
            '優先サポート',
            '高度な機能'
        ],
        'free_features': [
            'GPT-4o miniアクセス',
            '月間限定メッセージ',
            '基本機能'
        ],
        
        // About
        'version': 'バージョン',
        'privacy_policy': 'プライバシーポリシー',
        'terms_of_service': '利用規約',
        'contact_support': 'サポートに連絡',
        
        // Interface buttons and actions
        'attach_image': '画像を添付',
        'messenger_mode': 'メッセンジャーモード', 
        'voice_input': '音声入力',
        'video_call_mode': 'ビデオ通話モード',
        'message_placeholder': 'HanasanAIにメッセージを送信...',
        'type_message': 'メッセージを入力...',
        
        // Suggestions
        'code_review': 'コードレビュー',
        'summarize_text': 'テキストを要約', 
        'analyze_data': 'データを分析',
        'brainstorm': 'ブレインストーミング',
        'type_directly': '直接入力',
        
        // Messenger
        'messenger_title': 'HanasanAI メッセンジャー',
        'messenger_description': '自然な会話を始めましょう。<br>AIが適切なタイミングでプロアクティブなメッセージを送信する場合があります。',
        
        // Dialog elements
        'rename_chat': 'チャット名を変更',
        'delete_chat': 'チャットを削除',
        'enter_chat_title': 'チャットタイトルを入力',
        'delete_chat_confirm': 'このチャットを削除してもよろしいですか？',
        'delete_chat_warning': '削除されたチャットは復元できません。',
        'rename': '変更',
        'delete': '削除'
    },
    ko: {
        // Main interface
        'new_chat': '새 채팅',
        'messenger': '메신저',
        'settings': '설정',
        'logout': '로그아웃',
        'login': '로그인',
        'message_placeholder': 'HanasanAI에게 메시지 보내기...',
        'voice_input': '음성 입력',
        'send_message': '메시지 전송',
        'typing': 'HanasanAI가 입력 중...',
        
        // Settings menu
        'personalization': '개인 맞춤 설정',
        'data_controls': '데이터 제어',
        'notifications': '알림',
        'voice': '음성',
        'subscription': '구독',
        'about': '정보',
        
        // Personalization
        'custom_instructions': '맞춤형 지침',
        'custom_instructions_desc': 'HanasanAI에게 당신의 선호사항과 상황을 알려주세요...',
        'color_scheme': '색 구성표',
        'language': '언어',
        'interface_language': '앱의 인터페이스 언어',
        'appearance': '외관',
        'dark_mode': '다크 모드',
        'light_mode': '라이트 모드',
        'auto_mode': '자동',
        
        // Custom Instructions Modal
        'about_you_label': '더 나은 응답을 제공하기 위해 HanasanAI가 당신에 대해 알았으면 하는 것은 무엇인가요?',
        'about_you_placeholder': '당신의 배경, 관심사, 목표 또는 기타 관련 정보에 대해 알려주세요...',
        'response_style_label': 'HanasanAI가 어떻게 응답하길 원하시나요?',
        'response_style_placeholder': '어조, 스타일, 형식 또는 응답에 대한 기타 선호사항을 지정해주세요...',
        'save': '저장',
        'cancel': '취소',
        
        // Data Controls
        'data_usage': '데이터 사용',
        'chat_history_save': '채팅 기록 저장',
        'chat_history_save_desc': '이전 대화를 이어가기 위해 대화 기록을 로컬에 저장합니다.',
        'chat_history': '채팅 기록',
        'delete_all_chats': '모든 채팅 기록 삭제',
        
        // Notifications
        'browser_notifications': '브라우저 알림',
        'new_response_notifications': '새 응답 알림',
        'new_response_notifications_desc': 'AI 응답이 완료되면 브라우저 알림을 표시합니다.',
        'notifications_enabled': '알림이 성공적으로 활성화되었습니다!',
        'notifications_not_supported': '브라우저가 알림을 지원하지 않습니다.',
        
        // Voice
        'voice_input_section': '음성 입력',
        'input_language': '입력 언어',
        'input_language_desc': '음성 입력 인식을 위한 선호 언어를 설정합니다.',
        'select_input_language': '입력 언어 선택',
        
        // Subscription
        'subscription_title': '구독',
        'current_plan': '현재 플랜',
        'free_plan': '무료',
        'premium_plan': 'HanasanAI Premium',
        'premium_price': '월 $20',
        'upgrade_to_premium': 'Premium으로 업그레이드',
        'manage_subscription': '구독 관리',
        'premium_features': [
            'GPT-4o 및 모든 모델 접근',
            '무제한 메시지',
            '우선 지원',
            '고급 기능'
        ],
        'free_features': [
            'GPT-4o mini 접근',
            '월간 제한된 메시지',
            '기본 기능'
        ],
        
        // About
        'version': '버전',
        'privacy_policy': '개인정보처리방침',
        'terms_of_service': '서비스 약관',
        'contact_support': '지원팀 문의',
        
        // Interface buttons and actions
        'attach_image': '이미지 첨부',
        'messenger_mode': '메신저 모드', 
        'voice_input': '음성 입력',
        'video_call_mode': '영상 통화 모드',
        'message_placeholder': 'HanasanAI에게 메시지를 보내세요...',
        'type_message': '메시지를 입력하세요...',
        
        // Suggestions
        'code_review': '코드 리뷰',
        'summarize_text': '텍스트 요약', 
        'analyze_data': '데이터 분석',
        'brainstorm': '브레인스토밍',
        'type_directly': '직접 입력',
        
        // Messenger
        'messenger_title': 'HanasanAI 메신저',
        'messenger_description': '자연스러운 대화를 시작해보세요.<br>AI가 적절한 시점에 먼저 메시지를 보낼 수도 있어요.',
        
        // Dialog elements
        'rename_chat': '채팅 이름 변경',
        'delete_chat': '채팅 삭제',
        'enter_chat_title': '채팅 제목 입력',
        'delete_chat_confirm': 'Do you really want to delete this chat?',
        'delete_chat_warning': '삭제된 채팅은 복구할 수 없습니다.',
        'rename': '변경',
        'delete': '삭제'
    }
};

// Get current language from localStorage or default to English
function getCurrentLanguage() {
    return localStorage.getItem('language') || 'en';
}

// Translate text based on current language
function t(key) {
    const lang = getCurrentLanguage();
    return translations[lang] && translations[lang][key] 
        ? translations[lang][key] 
        : translations['en'][key] || key;
}

// Update all translatable elements on the page
function updatePageTranslations() {
    const lang = getCurrentLanguage();
    
    // Update elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = translations[lang] && translations[lang][key] 
            ? translations[lang][key] 
            : translations['en'][key];
        
        if (translation) {
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        }
    });
    
    // Update placeholder translations
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = translations[lang] && translations[lang][key] 
            ? translations[lang][key] 
            : translations['en'][key];
        
        if (translation) {
            element.placeholder = translation;
        }
    });
    
    // Update title translations
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        const translation = translations[lang] && translations[lang][key] 
            ? translations[lang][key] 
            : translations['en'][key];
        
        if (translation) {
            element.title = translation;
        }
    });
    
    // Update prompt translations for suggestion buttons
    document.querySelectorAll('[data-i18n-prompt]').forEach(element => {
        const key = element.getAttribute('data-i18n-prompt');
        const translation = translations[lang] && translations[lang][key] 
            ? translations[lang][key] 
            : translations['en'][key];
        
        if (translation) {
            element.setAttribute('data-prompt', translation);
        }
    });
    
    // Update document language attribute
    document.documentElement.lang = lang === 'ko' ? 'ko' : lang === 'ja' ? 'ja' : 'en';
}

// Initialize i18n when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updatePageTranslations();
});

// Export for use in other scripts
window.t = t;
window.getCurrentLanguage = getCurrentLanguage;
window.updatePageTranslations = updatePageTranslations;