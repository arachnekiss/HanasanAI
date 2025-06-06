// Prevent duplicate class declaration
if (typeof ComprehensiveTranslator === 'undefined') {
class ComprehensiveTranslator {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {
            'en': {
                // Sidebar elements
                'Search': 'Search',
                'Chat History': 'Chat History',
                'No saved chats': 'No saved chats',
                'Guest': 'Guest',
                'Login': 'Login',
                'Free': 'Free',
                'Premium': 'Premium',
                
                // Settings menu
                'Settings': 'Settings',
                'Personalization': 'Personalization',
                'Data controls': 'Data controls',
                'Voice settings': 'Voice settings',
                'Notifications': 'Notifications',
                'Subscription': 'Subscription',
                'About': 'About',
                'Logout': 'Logout',
                
                // Voice settings
                'auto_detect': 'Auto-detect',
                'input_language': 'Input Language',
                'select_input_language': 'Select Input Language',
                'english': 'English',
                'japanese': 'Japanese',
                'korean': 'Korean',
                
                // About page
                'Help Center': 'Help Center',
                'Terms of Use': 'Terms of Use',
                'Privacy Policy': 'Privacy Policy',
                'Licenses': 'Licenses',
                
                // Personalization page
                'Custom Instructions': 'Custom Instructions',
                'Tell HanasanAI about your preferences and context': 'Tell HanasanAI about your preferences and context...',
                
                // Interface elements
                'Model': 'Model',
                'Suggestions': 'Suggestions',
                'Voice Control': 'Voice Control',
                'Start Recording': 'Start Recording',
                'Stop Recording': 'Stop Recording',
                'Upload Image': 'Upload Image',
                'Clear Chat': 'Clear Chat',
                'Send': 'Send',
                'New chat': 'New chat',
                'Message HanasanAI...': 'Message HanasanAI...',
                
                // Model selector elements
                'View details': 'View details',
                'Rename': 'Rename',
                'Delete': 'Delete',
                'Great for most tasks': 'Great for most tasks',
                'Fastest and most efficient': 'Fastest and most efficient',
                'Optimized for writing and ideation': 'Optimized for writing and ideation',
                'Research Preview': 'Research Preview',
                'Uses advanced reasoning': 'Uses advanced reasoning',
                
                // Model Info Modal
                'Model Info': 'Model Info',
                'View documentation': 'View documentation',
                'Context length': 'Context length',
                'tokens': 'tokens',
                'Strengths': 'Strengths',
                'reasoning': 'reasoning',
                'multilingual': 'multilingual',
                'visual understanding': 'visual understanding',
                'complex reasoning': 'complex reasoning',
                'mathematical problems': 'mathematical problems',
                'Speed tier': 'Speed tier',
                'priority': 'priority',
                'deep processing': 'deep processing',
                'fast response': 'fast response',
                'efficiency': 'efficiency',
                'fastest': 'fastest',
                'creative writing': 'creative writing',
                'analytical thinking': 'analytical thinking',
                'Status': 'Status',
                
                // Subscription page
                'Choose your plan': 'Choose your plan',
                '$20/month auto-renewal': '$20/month auto-renewal',
                'Unlimited access to all AI models and advanced features': 'Unlimited access to all AI models and advanced features',
                'Current Plan': 'Current Plan',
                'Cancel Subscription': 'Cancel Subscription',
                'Access to all AI models (GPT-4o, GPT-4o-mini)': 'Access to all AI models (GPT-4o, GPT-4o-mini)',
                'Unlimited conversations': 'Unlimited conversations',
                'Voice recognition and response': 'Voice recognition and response',
                'Messenger mode AI first message': 'Messenger mode AI first message',
                'Image analysis features': 'Image analysis features',
                'Priority response speed': 'Priority response speed',
                'Free': 'Free',
                '$0/month': '$0/month',
                'Basic features with limited model access': 'Basic features with limited model access',
                'GPT-4o mini model only': 'GPT-4o mini model only',
                'Basic chat functionality': 'Basic chat functionality',
                'Messenger mode': 'Messenger mode',
                'No access to advanced models': 'No access to advanced models',
                'Guest Mode': 'Guest Mode',
                'Limited Access': 'Limited Access',
                'Login to access all features': 'Login to access all features',
                'Cannot save conversation history': 'Cannot save conversation history',
                'No access to advanced features': 'No access to advanced features',
                
                // Voice settings page
                'Voice': 'Voice',
                'Input Language': 'Input Language',
                
                // Data controls
                'Data Controls': 'Data Controls',
                'Save Chat History': 'Save Chat History',
                'Chat history will be saved to your account': 'Chat history will be saved to your account',
                
                // Subscription page
                'Access to all AI models': 'Access to all AI models',
                'Limited AI model access': 'Limited AI model access',
                'Unlimited conversations': 'Unlimited conversations',
                'Voice recognition and response': 'Voice recognition and response',
                'Messenger mode AI first message': 'Messenger mode AI first message',
                'Image analysis features': 'Image analysis features',
                'Priority response speed': 'Priority response speed',
                'Basic chat functionality': 'Basic chat functionality',
                'Cannot save conversation history': 'Cannot save conversation history',
                'No access to advanced features': 'No access to advanced features',
                
                // Main page interface
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
                'View details': 'View details',
                'Rename': 'Rename',
                'Delete': 'Delete',
                'Great for most tasks': 'Great for most tasks',
                'Fastest and most efficient': 'Fastest and most efficient',
                'Optimized for writing and ideation': 'Optimized for writing and ideation',
                'Research Preview': 'Research Preview',
                
                // Model info
                '모델 정보': 'Model Information',
                '대부분의 업무에 탁월한 OpenAI의 가장 진보된 모델': 'OpenAI\'s most advanced model, excelling at most tasks',
                '컨텍스트 길이: 128k 토큰': 'Context length: 128k tokens',
                '강점: 추론, 다국어, 시각적 이해': 'Strengths: Reasoning, multilingual, visual understanding',
                '속도 등급: 우선순위': 'Speed rating: Priority',
                '문서 보기': 'View documentation',
                '고급 이성 사용': 'Uses advanced reasoning'
            },
            'ko': {
                // Sidebar elements
                'Search': '검색',
                'Chat History': '채팅 기록',
                'No saved chats': '저장된 채팅이 없습니다',
                'Guest': '게스트',
                'Login': '로그인하기',
                'Free': '무료',
                'Premium': '프리미엄',
                
                // Settings menu
                'Settings': '설정',
                'Personalization': '개인화',
                'Data controls': '데이터 관리',
                'Voice settings': '음성 설정',
                'Notifications': '알림',
                'Subscription': '구독',
                'About': '정보',
                'Logout': '로그아웃',
                
                // Voice settings
                'auto_detect': '자동 감지',
                'input_language': '입력 언어',
                'select_input_language': '입력 언어 선택',
                'english': '영어',
                'japanese': '일본어',
                'korean': '한국어',
                
                // About page
                'Help Center': '도움말 센터',
                'Terms of Use': '이용 약관',
                'Privacy Policy': '개인정보 처리방침',
                'Licenses': '라이선스',
                
                // Personalization page
                'Custom Instructions': '맞춤형 지침',
                'Tell HanasanAI about your preferences and context': 'HanasanAI에게 선호사항과 상황을 알려주세요...',
                
                // Interface elements
                'Model': '모델',
                'Suggestions': '제안',
                'Voice Control': '음성 제어',
                'Start Recording': '녹음 시작',
                'Stop Recording': '녹음 중지',
                'Upload Image': '이미지 업로드',
                'Clear Chat': '채팅 지우기',
                'Send': '보내기',
                'New chat': '새 채팅',
                'Message HanasanAI...': 'HanasanAI에게 메시지...',
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
                
                // Model selector elements
                'View details': '세부 정보 보기',
                'Rename': '이름 변경',
                'Delete': '삭제',
                'Great for most tasks': '대부분의 업무에 탁월함',
                'Fastest and most efficient': '가장 빠르고 효율적인 모델',
                'Optimized for writing and ideation': '글쓰기 및 아이디어 도출에 최적화',
                'Research Preview': '리서치 프리뷰',
                'Uses advanced reasoning': '고급 이성 사용',
                
                // Model Info Modal
                'Model Info': '모델 정보',
                'View documentation': '문서 보기',
                'Context length': '컨텍스트 길이',
                'tokens': '토큰',
                'Strengths': '강점',
                'reasoning': '추론',
                'multilingual': '다국어',
                'visual understanding': '시각적 이해',
                'complex reasoning': '복잡한 추론',
                'mathematical problems': '수학적 문제',
                'Speed tier': '속도 등급',
                'priority': '우선순위',
                'deep processing': '심화 처리',
                'fast response': '빠른 응답',
                'efficiency': '효율성',
                'fastest': '최고속',
                'creative writing': '창작 글쓰기',
                'analytical thinking': '분석적 사고',
                'Status': '상태',
                
                // Subscription page
                'Choose your plan': '플랜을 선택하세요',
                '$20/month auto-renewal': '$20/월 자동 갱신',
                'Unlimited access to all AI models and advanced features': '모든 AI 모델과 고급 기능에 무제한 접근',
                'Current Plan': '현재 플랜',
                'Cancel Subscription': '구독 취소',
                'Access to all AI models (GPT-4o, GPT-4o-mini)': '모든 AI 모델 접근 (GPT-4o, GPT-4o-mini)',
                'Unlimited conversations': '무제한 대화',
                'Voice recognition and response': '음성 인식 및 응답',
                'Messenger mode AI first message': '메신저 모드 AI 먼저 메시지',
                'Image analysis features': '이미지 분석 기능',
                'Priority response speed': '우선순위 응답 속도',
                'Free': '무료',
                '$0/month': '$0/월',
                'Basic features with limited model access': '기본 기능과 제한된 모델 접근',
                'GPT-4o mini model only': 'GPT-4o mini 모델만 사용',
                'Basic chat functionality': '기본 채팅 기능',
                'Messenger mode': '메신저 모드',
                'No access to advanced models': '고급 모델 접근 불가',
                'Guest Mode': '게스트 모드',
                'Limited Access': '제한적 접근',
                'Login to access all features': '로그인하여 모든 기능을 이용하세요',
                'Cannot save conversation history': '대화 기록 저장 불가',
                'No access to advanced features': '고급 기능 접근 불가',
                
                // Voice settings page
                'Voice': '음성',
                'Input Language': '입력 언어',
                
                // Data controls
                'Data Controls': '데이터 제어',
                'Save Chat History': '채팅 기록 저장',
                'Chat history will be saved to your account': '채팅 기록이 계정에 저장됩니다',
                'Clear Chat History': '채팅 기록 삭제',
                'Remove all saved conversations': '저장된 모든 대화 삭제',
                'Cancel': '취소',
                'Delete All': '모두 삭제',
                
                // Personalization page
                'Language': '언어',
                'English': '영어',
                'What would you like HanasanAI to know about you?': 'HanasanAI가 당신에 대해 알았으면 하는 것은?',
                'Tell me about your background, interests, goals...': '당신의 배경, 관심사, 목표에 대해 알려주세요...',
                'How would you like HanasanAI to respond?': 'HanasanAI가 어떻게 응답하기를 원하시나요?',
                'Specify tone, style, format preferences...': '톤, 스타일, 형식 선호도를 지정하세요...',
                'Save': '저장',
                'Custom instructions saved successfully!': '맞춤형 지침이 성공적으로 저장되었습니다!',
                'Failed to save custom instructions': '맞춤형 지침 저장에 실패했습니다',
                'This will permanently delete all your chat history. This action cannot be undone.': '모든 채팅 기록이 영구적으로 삭제됩니다. 이 작업은 취소할 수 없습니다.',
                'Rename Chat': '채팅 이름 변경',
                'Enter chat title': '채팅 제목 입력',
                'Rename': '이름 변경',
                'Auto-detect': '자동 감지',
                
                // Model info
                '모델 정보': '모델 정보',
                '대부분의 업무에 탁월한 OpenAI의 가장 진보된 모델': '대부분의 업무에 탁월한 OpenAI의 가장 진보된 모델',
                '컨텍스트 길이: 128k 토큰': '컨텍스트 길이: 128k 토큰',
                '강점: 추론, 다국어, 시각적 이해': '강점: 추론, 다국어, 시각적 이해',
                '속도 등급: 우선순위': '속도 등급: 우선순위',
                '문서 보기': '문서 보기',
                '고급 이성 사용': '고급 이성 사용'
            },
            'ja': {
                // Sidebar elements
                'Search': '検索',
                'Chat History': 'チャット履歴',
                'No saved chats': '保存されたチャットがありません',
                'Guest': 'ゲスト',
                'Login': 'ログイン',
                'Free': '無料',
                'Premium': 'プレミアム',
                
                // Settings menu
                'Settings': '設定',
                'Personalization': 'パーソナライゼーション',
                'Data controls': 'データ管理',
                'Voice settings': '音声設定',
                'Notifications': '通知',
                'Subscription': 'サブスクリプション',
                'About': '概要',
                'Logout': 'ログアウト',
                
                // Voice settings
                'auto_detect': '自動検出',
                'input_language': '入力言語',
                'select_input_language': '入力言語を選択',
                'english': '英語',
                'japanese': '日本語',
                'korean': '韓国語',
                
                // About page
                'Help Center': 'ヘルプセンター',
                'Terms of Use': '利用規約',
                'Privacy Policy': 'プライバシーポリシー',
                'Licenses': 'ライセンス',
                
                // Personalization page
                'Custom Instructions': 'カスタム指示',
                'Tell HanasanAI about your preferences and context': 'HanasanAIにあなたの好みと文脈を教えてください...',
                
                // Interface elements
                'Model': 'モデル',
                'Suggestions': '提案',
                'Voice Control': '音声操作',
                'Start Recording': '録音開始',
                'Stop Recording': '録音停止',
                'Upload Image': '画像アップロード',
                'Clear Chat': 'チャットクリア',
                'Send': '送信',
                'New chat': '新しいチャット',
                'Message HanasanAI...': 'HanasanAIにメッセージ...',
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
                
                // Model selector elements
                'View details': '詳細を表示',
                'Rename': '名前変更',
                'Delete': '削除',
                'Great for most tasks': 'ほとんどのタスクに最適',
                'Fastest and most efficient': '最速で最も効率的',
                'Optimized for writing and ideation': '執筆とアイデア創出に最適化',
                'Research Preview': 'リサーチプレビュー',
                'Uses advanced reasoning': '高度な推論を使用',
                
                // Model Info Modal
                'Model Info': 'モデル情報',
                'View documentation': 'ドキュメントを表示',
                'Context length': 'コンテキスト長',
                'tokens': 'トークン',
                'Strengths': '強み',
                'reasoning': '推論',
                'multilingual': '多言語',
                'visual understanding': '視覚的理解',
                'complex reasoning': '複雑な推論',
                'mathematical problems': '数学的問題',
                'Speed tier': 'スピード階層',
                'priority': '優先',
                'deep processing': '深層処理',
                'fast response': '高速応答',
                'efficiency': '効率性',
                'fastest': '最高速',
                'creative writing': '創作文章',
                'analytical thinking': '分析的思考',
                'Status': 'ステータス',
                
                // Subscription page
                'Choose your plan': 'プランを選択してください',
                '$20/month auto-renewal': '$20/月 自動更新',
                'Unlimited access to all AI models and advanced features': 'すべてのAIモデルと高度な機能への無制限アクセス',
                'Current Plan': '現在のプラン',
                'Cancel Subscription': 'サブスクリプション解約',
                'Access to all AI models (GPT-4o, GPT-4o-mini)': 'すべてのAIモデルにアクセス (GPT-4o, GPT-4o-mini)',
                'Unlimited conversations': '無制限の会話',
                'Voice recognition and response': '音声認識と応答',
                'Messenger mode AI first message': 'メッセンジャーモードAI最初のメッセージ',
                'Image analysis features': '画像分析機能',
                'Priority response speed': '優先応答速度',
                'Free': '無料',
                '$0/month': '$0/月',
                'Basic features with limited model access': '限定モデルアクセスの基本機能',
                'GPT-4o mini model only': 'GPT-4o miniモデルのみ',
                'Basic chat functionality': '基本チャット機能',
                'Messenger mode': 'メッセンジャーモード',
                'No access to advanced models': '高度なモデルへのアクセスなし',
                'Guest Mode': 'ゲストモード',
                'Limited Access': '制限付きアクセス',
                'Login to access all features': 'ログインしてすべての機能にアクセス',
                'Cannot save conversation history': '会話履歴を保存できません',
                'No access to advanced features': '高度な機能へのアクセスなし',
                
                // Voice settings page
                'Voice': '音声',
                'Input Language': '入力言語',
                
                // Data controls
                'Data Controls': 'データ制御',
                'Save Chat History': 'チャット履歴を保存',
                'Chat history will be saved to your account': 'チャット履歴はアカウントに保存されます',
                'Clear Chat History': 'チャット履歴を削除',
                'Remove all saved conversations': '保存されたすべての会話を削除',
                'Cancel': 'キャンセル',
                'Delete All': 'すべて削除',
                
                // Personalization page
                'Language': '言語',
                'English': '英語',
                'What would you like HanasanAI to know about you?': 'HanasanAIにあなたについて何を知ってもらいたいですか？',
                'Tell me about your background, interests, goals...': 'あなたの背景、興味、目標について教えてください...',
                'How would you like HanasanAI to respond?': 'HanasanAIにどのように返答してもらいたいですか？',
                'Specify tone, style, format preferences...': 'トーン、スタイル、フォーマットの好みを指定してください...',
                'Save': '保存',
                'Custom instructions saved successfully!': 'カスタム指示が正常に保存されました！',
                'Failed to save custom instructions': 'カスタム指示の保存に失敗しました',
                'This will permanently delete all your chat history. This action cannot be undone.': 'すべてのチャット履歴が永久に削除されます。この操作は取り消すことができません。',
                'Rename Chat': 'チャット名を変更',
                'Enter chat title': 'チャットタイトルを入力',
                'Rename': '名前を変更',
                'Auto-detect': '自動検出',
                
                // Data controls
                'Data Controls': 'データ制御',
                'Save Chat History': 'チャット履歴を保存',
                'Chat history will be saved to your account': 'チャット履歴がアカウントに保存されます',
                
                // Model info
                '모델 정보': 'モデル情報',
                '대부분의 업무에 탁월한 OpenAI의 가장 진보된 모델': 'ほとんどのタスクに優れたOpenAIの最も高度なモデル',
                '컨텍스트 길이: 128k 토큰': 'コンテキスト長: 128kトークン',
                '강점: 추론, 다국어, 시각적 이해': '強み: 推論、多言語、視覚的理解',
                '속도 등급: 우선순위': 'スピード評価: 優先',
                '문서 보기': 'ドキュメントを見る',
                '고급 이성 사용': '高度な推論を使用'
            }
        };
        
        this.initialize();
    }
    
    initialize() {
        // Ensure language consistency across pages
        this.currentLanguage = localStorage.getItem('language') || 'en';
        
        // Auto-translate on page load with multiple attempts for dynamic content
        this.translateAll();
        setTimeout(() => this.translateAll(), 100);
        setTimeout(() => this.translateAll(), 300);
        setTimeout(() => this.translateAll(), 500);
        
        // Make function globally available
        window.comprehensiveTranslator = this;
        window.translateToLanguage = (lang) => this.setLanguageAndTranslate(lang);
        
        // Update language selector display if present
        this.updateLanguageDisplay();
    }
    
    setLanguageAndTranslate(language) {
        this.currentLanguage = language;
        localStorage.setItem('language', language);
        
        // Clear all existing translations and re-translate immediately
        this.translateAll();
        
        // Force translate main page elements
        if (window.forceTranslateMainPage) {
            window.forceTranslateMainPage();
        }
        
        // Multiple translation passes for dynamic content
        for (let i = 1; i <= 5; i++) {
            setTimeout(() => {
                this.translateAll();
                if (window.forceTranslateMainPage) {
                    window.forceTranslateMainPage();
                }
            }, i * 200);
        }
    }
    
    translateAll() {
        const translations = this.translations[this.currentLanguage] || this.translations['en'];
        
        try {
            // Update language display first
            this.updateLanguageDisplay();
            
            // Translate main page content with robust error handling
            this.translateMainPageContent();
            
            // Translate elements with data-translate attribute
            document.querySelectorAll('[data-translate]').forEach(element => {
                const key = element.getAttribute('data-translate');
                if (translations[key]) {
                    try {
                        element.textContent = translations[key];
                    } catch (e) {}
                }
            });
            
            // Handle data-i18n attributes
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                if (translations[key]) {
                    try {
                        if (element.tagName === 'INPUT') {
                            element.placeholder = translations[key];
                        } else {
                            element.textContent = translations[key];
                        }
                    } catch (e) {}
                }
            });
            
            // Translate placeholders
            document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
                const key = element.getAttribute('data-translate-placeholder');
                if (translations[key]) {
                    try {
                        element.placeholder = translations[key];
                    } catch (e) {}
                }
            });
            
            // Force translate all text nodes by content matching
            this.translateByContent(translations);
            
            // Translate specific known elements
            this.translateSpecificElements(translations);
            
        } catch (error) {
            console.debug('Translation process error:', error);
        }
    }
    
    translateByContent(translations) {
        // Create reverse lookup for all languages to current language
        const reverseMap = {};
        
        // Build reverse mapping from all language values to current language keys
        Object.keys(this.translations).forEach(lang => {
            Object.keys(this.translations[lang]).forEach(key => {
                const value = this.translations[lang][key];
                reverseMap[value] = key;
            });
        });
        
        // Update language display controls first
        this.updateLanguageDisplay();
        
        // Find and translate all text nodes
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            if (node.parentElement && 
                node.parentElement.tagName !== 'SCRIPT' && 
                node.parentElement.tagName !== 'STYLE' &&
                node.textContent.trim()) {
                textNodes.push(node);
            }
        }
        
        textNodes.forEach(textNode => {
            const trimmedText = textNode.textContent.trim();
            const key = reverseMap[trimmedText];
            if (key && translations[key]) {
                try {
                    textNode.textContent = textNode.textContent.replace(trimmedText, translations[key]);
                } catch (e) {
                    console.debug('Text node translation skipped:', e);
                }
            }
        });
    }
    
    translateSpecificElements(translations) {
        // Specific selectors with fallback content matching
        const specificSelectors = [
            '.section-title',
            '.settings-label',
            '.user-email',
            '.user-plan',
            '.model-subtitle',
            '.model-tagline',
            '.feature-item',
            '#sidebarSearch',
            '.sidebar-brand-text'
        ];
        
        specificSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                const text = element.textContent.trim();
                if (translations[text]) {
                    try {
                        element.textContent = translations[text];
                    } catch (e) {
                        console.debug('Specific element translation skipped:', e);
                    }
                } else if (element.placeholder && translations[element.placeholder]) {
                    try {
                        element.placeholder = translations[element.placeholder];
                    } catch (e) {
                        console.debug('Placeholder translation skipped:', e);
                    }
                }
            });
        });
    }
    
    translateMainPageContent() {
        // Direct translation mapping for main page content
        const contentMap = {
            'Message HanasanAI...': this.translate('message_placeholder'),
            'Attach Image': this.translate('attach_image'),
            'Messenger Mode': this.translate('messenger_mode'),
            'Voice Input': this.translate('voice_input'),
            'Video Call Mode': this.translate('video_call_mode'),
            'Create an image': this.translate('create_image'),
            'Summarize text': this.translate('summarize_text'),
            'Analyze data': this.translate('analyze_data'),
            'Brainstorm ideas': this.translate('brainstorm'),
            'Type directly': this.translate('type_directly'),
            'View details': this.translate('View details'),
            'Rename': this.translate('Rename'),
            'Delete': this.translate('Delete'),
            'Great for most tasks': this.translate('Great for most tasks'),
            'Fastest and most efficient': this.translate('Fastest and most efficient'),
            'Optimized for writing and ideation': this.translate('Optimized for writing and ideation'),
            'Research Preview': this.translate('Research Preview'),
            'Search': this.translate('Search'),
            'Chat History': this.translate('Chat History'),
            'No saved chats': this.translate('No saved chats'),
            'Guest': this.translate('Guest'),
            'Login': this.translate('Login'),
            'Free': this.translate('Free')
        };
        
        // Handle input placeholder specifically
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            try {
                messageInput.placeholder = this.translate('message_placeholder');
            } catch (e) {}
        }
        
        // Walk through all text nodes and translate
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    if (node.parentElement && 
                        node.parentElement.tagName !== 'SCRIPT' && 
                        node.parentElement.tagName !== 'STYLE' &&
                        node.textContent.trim()) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_REJECT;
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
            if (contentMap[text]) {
                try {
                    textNode.textContent = contentMap[text];
                } catch (e) {}
            }
        });
    }
    
    translate(text) {
        const translations = this.translations[this.currentLanguage] || this.translations['en'];
        return translations[text] || text;
    }
    
    translatePage() {
        this.translateAll();
    }
    
    updateLanguageDisplay() {
        // Update language selector display in personalization page
        const currentLangElement = document.getElementById('currentLanguage');
        if (currentLangElement) {
            const languageNames = {
                'en': 'English',
                'ko': '한국어', 
                'ja': '日本語'
            };
            try {
                currentLangElement.textContent = languageNames[this.currentLanguage] || 'English';
            } catch (error) {
                console.debug('Language display update skipped:', error);
            }
        }
        
        // Update radio buttons in language modal
        const radioButtons = document.querySelectorAll('.radio-button');
        radioButtons.forEach(btn => {
            const lang = btn.getAttribute('data-lang');
            if (lang === this.currentLanguage) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Update voice language display for voice settings page
        if (window.location.pathname.includes('voice')) {
            const voiceCurrentLang = document.getElementById('currentLanguage');
            if (voiceCurrentLang) {
                const voiceLanguage = localStorage.getItem('voiceLanguage') || 'auto';
                const voiceLanguageMap = {
                    'auto': this.translate('Auto-detect'),
                    'en': this.translate('English'),
                    'ja': this.translate('Japanese'),
                    'ko': this.translate('Korean')
                };
                try {
                    voiceCurrentLang.textContent = voiceLanguageMap[voiceLanguage] || this.translate('Auto-detect');
                } catch (error) {
                    console.debug('Voice language display update skipped:', error);
                }
            }
        }
    }
}
} // Close the if statement for preventing duplicate declaration

// Initialize on DOM load
if (typeof ComprehensiveTranslator !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof window.translator === 'undefined') {
                window.translator = new ComprehensiveTranslator();
            }
        });
    } else {
        if (typeof window.translator === 'undefined') {
            window.translator = new ComprehensiveTranslator();
        }
    }
}