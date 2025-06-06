from flask import render_template, request, jsonify, session, redirect, url_for, send_from_directory
from flask_socketio import emit, join_room, leave_room
from flask_login import login_required, current_user, logout_user, login_user
from app import app, socketio, db
from models import ChatSession, ChatMessage, ProactiveMessage, User
from openai_service import OpenAIService
from rate_limiter import RateLimiter
from paypal_service import PayPalService
import json
import logging
import base64
import os
from datetime import datetime, timedelta
import uuid

# Initialize services
openai_service = OpenAIService()
rate_limiter = RateLimiter()
paypal_service = PayPalService()

# Route to serve VRM files from public directory
@app.route('/public/<path:filename>')
def serve_public_files(filename):
    """Serve files from the public directory"""
    return send_from_directory('public', filename)

@app.route('/')
def index():
    """Main chat interface with VRM character"""
    import os
    import random
    
    # Random VRM and wallpaper selection
    character_dir = 'public/character'
    wallpaper_dir = 'static/wallpaper'
    
    vrms = [f for f in os.listdir(character_dir) if f.endswith('.vrm')] if os.path.exists(character_dir) else ['annie.vrm']
    wallpapers = [f for f in os.listdir(wallpaper_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))] if os.path.exists(wallpaper_dir) else ['default.jpg']
    
    vrm_file = random.choice(vrms)
    bg_file = random.choice(wallpapers)
    
    # Create or get admin user for testing
    admin_user = User.query.filter_by(email='admin@hanasanai.com').first()
    if not admin_user:
        admin_user = User()
        admin_user.email = 'admin@hanasanai.com'
        admin_user.name = '관리자'
        admin_user.provider = 'admin'
        admin_user.provider_id = 'admin_001'
        admin_user.subscription_status = 'premium'
        db.session.add(admin_user)
        db.session.commit()
    
    # Log in the admin user
    login_user(admin_user)
    
    # Select random VRM character
    character_dir = os.path.join('public', 'character')
    try:
        character_files = [f for f in os.listdir(character_dir) if f.endswith('.vrm')]
        selected_character = random.choice(character_files) if character_files else 'AvatarSample_B.vrm'
    except:
        selected_character = 'AvatarSample_B.vrm'
    
    # Select random wallpaper
    wallpaper_dir = os.path.join('public', 'wallpaper')
    try:
        wallpaper_files = [f for f in os.listdir(wallpaper_dir) if f.endswith(('.png', '.jpg', '.jpeg'))]
        selected_wallpaper = random.choice(wallpaper_files) if wallpaper_files else None
    except:
        selected_wallpaper = None
    
    # Get VRM and wallpaper lists for JavaScript
    vrm_list = [f for f in os.listdir('public/character') if f.endswith('.vrm')] if os.path.exists('public/character') else []
    wp_list = [f for f in os.listdir('static/wallpaper') if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))] if os.path.exists('static/wallpaper') else ['default.jpg']
    
    return render_template('index.html', 
                         character_model=vrm_file,
                         background_image=bg_file,
                         vrm_file=vrm_file,
                         bg_file=bg_file,
                         vrm_list=json.dumps(vrm_list),
                         wp_list=json.dumps(wp_list))

@app.route('/login')
def login_page():
    """Login page for authentication"""
    return render_template('login.html')

@app.route('/messenger')
def messenger():
    """Messenger-style interface without VRM character"""
    return render_template('messenger.html')

@app.route('/video_call')
def video_call():
    """Video call interface with AI character"""
    return render_template('video_call.html')

@app.route('/voice_picker')
def voice_picker():
    """Voice model picker interface"""
    return render_template('voice_picker.html')

def can_use_model(model_name):
    """Check if user can use the specified model - all models available in open source version"""
    return True

def get_available_models():
    """Get list of models available to current user - all models available in open source"""
    return ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo', 'o1-preview', 'o1-mini']

@app.route('/create-subscription-plan', methods=['POST'])
@login_required
def create_subscription_plan():
    """Create PayPal subscription plan"""
    try:
        plan_id = paypal_service.create_subscription_plan()
        return jsonify({'success': True, 'plan_id': plan_id})
    except Exception as e:
        logging.error(f"Failed to create subscription plan: {e}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/subscription/success', methods=['POST'])
@login_required
def subscription_success():
    """Handle successful PayPal subscription"""
    data = request.get_json()
    subscription_id = data.get('subscriptionID')
    
    if subscription_id:
        try:
            # Verify subscription with PayPal
            subscription_info = paypal_service.verify_subscription(subscription_id)
            
            if subscription_info['status'] == 'ACTIVE':
                # Update user subscription status
                current_user.subscription_status = 'premium'
                current_user.subscription_start_date = datetime.utcnow()
                current_user.subscription_end_date = datetime.utcnow() + timedelta(days=30)
                current_user.stripe_subscription_id = subscription_id  # Store PayPal subscription ID
                db.session.commit()
                
                return jsonify({'success': True})
        except Exception as e:
            logging.error(f"Failed to verify subscription: {e}")
    
    return jsonify({'success': False})

@app.route('/subscription/cancel', methods=['POST'])
@login_required
def subscription_cancel():
    """Handle subscription cancellation"""
    current_user.subscription_status = 'free'
    current_user.subscription_end_date = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'success': True})

@app.route('/settings')
def settings():
    """Settings page"""
    return render_template('settings.html')

@app.route('/settings/personalization')
def personalization():
    """Personalization settings page"""
    return render_template('settings/personalization.html')

@app.route('/settings/data-controls')
def data_controls():
    """Data controls settings page"""
    return render_template('settings/data-controls.html')

@app.route('/settings/notifications')
def notifications():
    """Notifications settings page"""
    return render_template('settings/notifications.html')

@app.route('/settings/voice')
def voice_settings():
    """Voice settings page"""
    return render_template('settings/voice.html')

@app.route('/settings/subscription')
def subscription():
    """Subscription settings page"""
    return render_template('settings/subscription.html')

@app.route('/settings/about')
def about():
    """About settings page"""
    return render_template('settings/about.html')

@app.route('/api/delete-all-chats', methods=['POST'])
def delete_all_chats():
    """Delete all chat history for current user"""
    try:
        if current_user.is_authenticated:
            # Delete all chat sessions and messages for the user
            user_sessions = ChatSession.query.filter_by(user_id=current_user.id).all()
            for session in user_sessions:
                # Delete all messages in the session
                ChatMessage.query.filter_by(session_id=session.id).delete()
                # Delete the session
                db.session.delete(session)
            
            db.session.commit()
            return jsonify({'success': True, 'message': 'All chat history deleted'})
        else:
            # For guest users, just return success (client-side deletion only)
            return jsonify({'success': True, 'message': 'Chat history cleared'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat_api():
    """REST API endpoint for chat messages"""
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        session_id = data.get('session_id')
        message_type = data.get('type', 'text')
        image_data = data.get('image')
        
        if not message and not image_data:
            return jsonify({'error': 'Message or image required'}), 400
        
        # Check rate limits
        if not rate_limiter.check_rate_limit('chat'):
            return jsonify({'error': 'Rate limit exceeded. Please try again later.'}), 429
        
        # Get or create session
        if session_id:
            chat_session = ChatSession.query.get(session_id)
        else:
            chat_session = ChatSession()
            chat_session.session_type = 'main'
            db.session.add(chat_session)
            db.session.commit()
        
        # Save user message
        user_message = ChatMessage()
        user_message.session_id = chat_session.id
        user_message.content = message
        user_message.role = 'user'
        user_message.message_type = message_type
        db.session.add(user_message)
        
        # Get conversation history
        history = get_conversation_history(chat_session.id)
        
        # Get custom instructions from request data
        custom_instructions = data.get('custom_instructions')
        
        # Generate AI response
        if image_data:
            # Handle image analysis
            response_data = openai_service.analyze_image_with_chat(image_data, message, history)
        else:
            # Handle text chat - pass current user for custom instructions
            response_data = openai_service.generate_chat_response(message, history, custom_instructions, current_user if current_user.is_authenticated else None)
        
        # Analyze emotion for character animation
        emotion_data = openai_service.analyze_emotion(message)
        
        # Save AI response
        ai_message = ChatMessage()
        ai_message.session_id = chat_session.id
        ai_message.content = response_data['content']
        ai_message.role = 'assistant'
        ai_message.emotion_data = json.dumps(emotion_data)
        ai_message.tokens_used = response_data.get('tokens_used', 0)
        ai_message.model_used = response_data.get('model_used', 'gpt-4o')
        db.session.add(ai_message)
        
        # Update session
        chat_session.last_activity = datetime.utcnow()
        chat_session.character_emotion = emotion_data.get('emotion', 'neutral')
        
        db.session.commit()
        
        # Update rate limiter
        rate_limiter.update_usage('chat', response_data.get('tokens_used', 0))
        
        return jsonify({
            'response': response_data['content'],
            'session_id': chat_session.id,
            'emotion': emotion_data,
            'suggestions': generate_suggestions(response_data['content'])
        })
        
    except Exception as e:
        logging.error(f"Chat API error: {e}")
        return jsonify({'error': 'An error occurred processing your request'}), 500

@app.route('/api/session/<session_id>/history')
def get_session_history(session_id):
    """Get session history for messenger continuity"""
    try:
        session = ChatSession.query.filter_by(id=session_id).first()
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        messages = ChatMessage.query.filter_by(session_id=session_id).order_by(ChatMessage.timestamp).all()
        
        message_data = []
        for msg in messages:
            message_data.append({
                'content': msg.content,
                'role': msg.role,
                'timestamp': msg.timestamp.isoformat(),
                'message_type': msg.message_type
            })
        
        return jsonify({
            'session_id': session_id,
            'messages': message_data,
            'session_type': session.session_type
        })
        
    except Exception as e:
        print(f"Error getting session history: {e}")
        return jsonify({'error': 'Failed to get session history'}), 500

@app.route('/api/voice-transcribe', methods=['POST'])
def transcribe_voice():
    """Transcribe voice input to text"""
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        # Check rate limits
        if not rate_limiter.check_rate_limit('whisper'):
            return jsonify({'error': 'Voice processing rate limit exceeded'}), 429
        
        audio_file = request.files['audio']
        
        # Save temporary file
        temp_filename = f"/tmp/audio_{uuid.uuid4().hex}.wav"
        audio_file.save(temp_filename)
        
        # Transcribe audio
        transcription = openai_service.transcribe_audio(temp_filename)
        
        # Clean up temp file
        import os
        os.remove(temp_filename)
        
        # Update rate limiter
        rate_limiter.update_usage('whisper', 1000)  # Approximate tokens for audio
        
        return jsonify({'transcription': transcription})
        
    except Exception as e:
        logging.error(f"Voice transcription error: {e}")
        return jsonify({'error': 'Voice transcription failed'}), 500

@app.route('/api/custom-instructions', methods=['POST'])
def save_custom_instructions():
    """Save custom instructions for the current user"""
    try:
        if not current_user.is_authenticated:
            return jsonify({"success": False, "message": "User not authenticated"}), 401
        
        data = request.get_json()
        about_you = data.get('aboutYou', '')
        response_style = data.get('responseStyle', '')
        
        # Update user's custom instructions
        current_user.custom_instructions_about = about_you
        current_user.custom_instructions_style = response_style
        db.session.commit()
        
        return jsonify({"success": True, "message": "Custom instructions saved successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/custom-instructions', methods=['GET'])
def get_custom_instructions():
    """Get custom instructions for the current user"""
    try:
        if not current_user.is_authenticated:
            return jsonify({"success": False, "message": "User not authenticated"}), 401
        
        return jsonify({
            "success": True,
            "aboutYou": current_user.custom_instructions_about or '',
            "responseStyle": current_user.custom_instructions_style or ''
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/user-settings', methods=['POST'])
def save_user_settings():
    """Save user settings (theme, language, etc.)"""
    try:
        if not current_user.is_authenticated:
            return jsonify({"success": False, "message": "User not authenticated"}), 401
        
        data = request.get_json()
        
        # Update user settings
        if 'theme' in data:
            current_user.theme_preference = data['theme']
        if 'language' in data:
            current_user.language_preference = data['language']
        if 'notifications_enabled' in data:
            current_user.notifications_enabled = data['notifications_enabled']
        if 'voice_language' in data:
            current_user.voice_language = data['voice_language']
        
        db.session.commit()
        
        return jsonify({"success": True, "message": "Settings saved successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/user-settings', methods=['GET'])
def get_user_settings():
    """Get user settings"""
    try:
        if not current_user.is_authenticated:
            return jsonify({"success": False, "message": "User not authenticated"}), 401
        
        return jsonify({
            "success": True,
            "theme": getattr(current_user, 'theme_preference', 'dark'),
            "language": getattr(current_user, 'language_preference', 'en'),
            "notifications_enabled": getattr(current_user, 'notifications_enabled', True),
            "voice_language": getattr(current_user, 'voice_language', 'en')
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/custom-instructions', methods=['GET', 'POST'])
def custom_instructions_api():
    """Handle custom instructions API"""
    try:
        if not current_user.is_authenticated:
            return jsonify({"success": False, "message": "User not authenticated"}), 401
        
        if request.method == 'GET':
            return jsonify({
                "success": True,
                "aboutYou": getattr(current_user, 'custom_instructions_about', '') or '',
                "responseStyle": getattr(current_user, 'custom_instructions_style', '') or ''
            })
        
        elif request.method == 'POST':
            data = request.get_json()
            current_user.custom_instructions_about = data.get('aboutYou', '')
            current_user.custom_instructions_style = data.get('responseStyle', '')
            
            db.session.commit()
            return jsonify({"success": True, "message": "Custom instructions saved successfully"})
            
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "message": str(e)}), 500

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    session['user_id'] = str(uuid.uuid4())
    logging.info(f"Client connected: {session['user_id']}")

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logging.info(f"Client disconnected: {session.get('user_id', 'unknown')}")

@socketio.on('join_session')
def handle_join_session(data):
    """Join a chat session room"""
    session_id = data.get('session_id')
    if session_id:
        join_room(session_id)
        emit('joined_session', {'session_id': session_id})

@socketio.on('leave_session')
def handle_leave_session(data):
    """Leave a chat session room"""
    session_id = data.get('session_id')
    if session_id:
        leave_room(session_id)

@socketio.on('typing_start')
def handle_typing_start(data):
    """Handle typing indicator start"""
    session_id = data.get('session_id')
    if session_id:
        emit('user_typing', {'typing': True}, to=session_id, include_self=False)

@socketio.on('typing_stop')
def handle_typing_stop(data):
    """Handle typing indicator stop"""
    session_id = data.get('session_id')
    if session_id:
        emit('user_typing', {'typing': False}, to=session_id, include_self=False)

@socketio.on('messenger_chat')
def handle_messenger_chat(data):
    """Handle messenger-style chat with proactive messaging"""
    try:
        message = data.get('message', '').strip()
        session_id = data.get('session_id')
        
        if not message:
            return
        
        # Check rate limits
        if not rate_limiter.check_rate_limit('chat'):
            emit('error', {'message': 'Rate limit exceeded'})
            return
        
        # Get or create session
        if session_id:
            chat_session = ChatSession.query.get(session_id)
        else:
            chat_session = ChatSession()
            chat_session.session_type = 'messenger'
            db.session.add(chat_session)
            db.session.commit()
            join_room(chat_session.id)
        
        # Save user message
        user_message = ChatMessage()
        user_message.session_id = chat_session.id
        user_message.content = message
        user_message.role = 'user'
        db.session.add(user_message)
        
        # Get conversation history
        history = get_conversation_history(chat_session.id)
        
        # Generate AI response
        response_data = openai_service.generate_chat_response(message, history)
        
        # Save AI response
        ai_message = ChatMessage()
        ai_message.session_id = chat_session.id
        ai_message.content = response_data['content']
        ai_message.role = 'assistant'
        ai_message.tokens_used = response_data.get('tokens_used', 0)
        ai_message.model_used = response_data.get('model_used', 'gpt-4o')
        db.session.add(ai_message)
        
        # Update session
        chat_session.last_activity = datetime.utcnow()
        
        db.session.commit()
        
        # Send response
        emit('message_response', {
            'message': response_data['content'],
            'session_id': chat_session.id,
            'timestamp': datetime.utcnow().isoformat()
        }, to=chat_session.id)
        
        # Schedule proactive message
        schedule_proactive_message(chat_session.id, history + [{'role': 'assistant', 'content': response_data['content']}])
        
        # Update rate limiter
        rate_limiter.update_usage('chat', response_data.get('tokens_used', 0))
        
    except Exception as e:
        logging.error(f"Messenger chat error: {e}")
        emit('error', {'message': 'An error occurred'})

def get_conversation_history(session_id, limit=10):
    """Get recent conversation history for context"""
    messages = ChatMessage.query.filter_by(session_id=session_id)\
        .order_by(ChatMessage.timestamp.desc())\
        .limit(limit)\
        .all()
    
    history = []
    for msg in reversed(messages):
        history.append({
            'role': msg.role,
            'content': msg.content
        })
    
    return history

def generate_suggestions(response_content):
    """Generate conversation suggestions based on AI response"""
    try:
        suggestions = openai_service.generate_suggestions(response_content)
        return suggestions[:3]  # Limit to 3 suggestions
    except Exception as e:
        logging.error(f"Suggestion generation error: {e}")
        return ["Tell me more", "What do you think about...", "Can you explain..."]

def schedule_proactive_message(session_id, conversation_history):
    """Schedule a proactive message for messenger mode"""
    try:
        # Generate context summary
        context_summary = openai_service.summarize_conversation(conversation_history)
        
        # Schedule message for 2-5 minutes from now
        import random
        delay_minutes = random.randint(2, 5)
        scheduled_time = datetime.utcnow() + timedelta(minutes=delay_minutes)
        
        proactive_msg = ProactiveMessage()
        proactive_msg.session_id = session_id
        proactive_msg.scheduled_time = scheduled_time
        proactive_msg.context_summary = context_summary
        db.session.add(proactive_msg)
        db.session.commit()
        
    except Exception as e:
        logging.error(f"Proactive message scheduling error: {e}")

# Background task to send proactive messages
def start_proactive_messaging():
    """Start background task for proactive messaging"""
    import threading
    import time
    
    def check_proactive_messages():
        while True:
            try:
                with app.app_context():
                    # Find due proactive messages
                    due_messages = ProactiveMessage.query.filter(
                        ProactiveMessage.scheduled_time <= datetime.utcnow(),
                        ProactiveMessage.sent == False
                    ).all()
                    
                    for msg in due_messages:
                        # Generate proactive message content
                        content = openai_service.generate_proactive_message(msg.context_summary)
                        
                        # Save as AI message
                        ai_message = ChatMessage()
                        ai_message.session_id = msg.session_id
                        ai_message.content = content
                        ai_message.role = 'assistant'
                        ai_message.message_type = 'proactive'
                        db.session.add(ai_message)
                        
                        # Mark as sent
                        msg.sent = True
                        msg.content = content
                        
                        # Send via websocket
                        socketio.emit('proactive_message', {
                            'message': content,
                            'timestamp': datetime.utcnow().isoformat()
                        }, to=msg.session_id)
                    
                    db.session.commit()
                    
            except Exception as e:
                logging.error(f"Proactive messaging error: {e}")
            
            time.sleep(30)  # Check every 30 seconds
    
    thread = threading.Thread(target=check_proactive_messages)
    thread.daemon = True
    thread.start()

@app.route('/api/save-chat-history-setting', methods=['POST'])
def save_chat_history_setting():
    """Save chat history setting for user"""
    data = request.get_json()
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400
    
    enabled = data.get('enabled', True)
    
    if current_user.is_authenticated:
        current_user.save_chat_history = enabled
        try:
            db.session.commit()
            return jsonify({'success': True})
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': str(e)}), 500
    else:
        # For guest users, store in session
        session['save_chat_history'] = enabled
        return jsonify({'success': True})

@app.route('/api/get-chat-history-setting', methods=['GET'])
def get_chat_history_setting():
    """Get chat history setting for user"""
    if current_user.is_authenticated:
        enabled = getattr(current_user, 'save_chat_history', True)  # Default to True
        return jsonify({'enabled': enabled})
    else:
        # For guest users, check session
        enabled = session.get('save_chat_history', True)  # Default to True
        return jsonify({'enabled': enabled})

@app.route('/save_voice_settings', methods=['POST'])
def save_voice_settings():
    """Save voice language preference for AI recognition weighting"""
    try:
        data = request.get_json()
        if current_user.is_authenticated:
            user = current_user
            user.voice_language = data.get('language', 'en')
            
            db.session.commit()
            return jsonify({'success': True})
        
        return jsonify({'success': False, 'error': 'User not authenticated'}), 401
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/analyze-emotion', methods=['POST'])
def analyze_emotion():
    """Analyze emotion from text input and suggest appropriate VRM animation"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        input_type = data.get('input_type', 'text')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Use OpenAI to analyze emotion and suggest animation
        openai_service = OpenAIService()
        
        # Create emotion analysis prompt
        emotion_prompt = f"""
        Analyze the emotion in this {input_type} input and suggest an appropriate VRM animation.
        
        Text: "{text}"
        
        Available VRM animations:
        - idle_loop.vrma (neutral, default)
        - 愛包ダンスホール.vrma (happy dance)
        - うでぶんぶん.vrma (excited arm movement)
        - 挨拶.vrma (greeting)
        - Vサイン.vrma (victory sign)
        - 屈伸運動.vrma (exercise/stretching)
        - 全身を見せる.vrma (showing full body)
        - 回る.vrma (spinning/turning)
        - 撃つ.vrma (shooting gesture)
        - モデルポーズ.vrma (model pose)
        - デビルじゃないもん.vrma (playful/mischievous)
        - パイパイ仮面でどうかしらん_.vrma (funny/comedic)
        - シカ色デイズ.vrma (energetic dance)
        
        Respond with JSON format:
        {{
            "emotion": "emotion_name",
            "intensity": 0.0-1.0,
            "animation": "filename.vrma",
            "expression": "facial_expression"
        }}
        
        Emotion categories: neutral, happy, excited, sad, angry, surprised, greeting, victory, dance, exercise
        Facial expressions: neutral, happy, sad, angry, surprised, fun
        """
        
        response = openai_service.generate_chat_response(
            emotion_prompt,
            conversation_history=[],
            user=current_user if current_user.is_authenticated else None
        )
        
        try:
            import json
            emotion_data = json.loads(response)
            
            # Validate response format
            if not all(key in emotion_data for key in ['emotion', 'intensity', 'animation', 'expression']):
                raise ValueError("Invalid response format")
                
            return jsonify(emotion_data)
            
        except (json.JSONDecodeError, ValueError):
            # Fallback emotion detection
            emotion_keywords = {
                'happy': ['happy', 'joy', 'great', 'awesome', 'love', '😊', '😄'],
                'excited': ['excited', 'amazing', 'wow', 'fantastic'],
                'sad': ['sad', 'sorry', 'disappointed', '😢'],
                'angry': ['angry', 'mad', 'annoyed', '😠'],
                'surprised': ['surprised', 'shock', 'omg', '😮'],
                'greeting': ['hello', 'hi', 'hey', 'morning', 'afternoon'],
                'victory': ['victory', 'win', 'success', 'yes', 'done'],
                'dance': ['dance', 'music', 'party', 'fun'],
                'exercise': ['exercise', 'workout', 'move', 'stretch']
            }
            
            detected_emotion = 'neutral'
            text_lower = text.lower()
            
            for emotion, keywords in emotion_keywords.items():
                if any(keyword in text_lower for keyword in keywords):
                    detected_emotion = emotion
                    break
            
            animation_map = {
                'neutral': 'idle_loop.vrma',
                'happy': '愛包ダンスホール.vrma',
                'excited': 'うでぶんぶん.vrma',
                'greeting': '挨拶.vrma',
                'victory': 'Vサイン.vrma',
                'dance': 'シカ色デイズ.vrma',
                'exercise': '屈伸運動.vrma',
                'sad': 'idle_loop.vrma',
                'angry': 'デビルじゃないもん.vrma',
                'surprised': '全身を見せる.vrma'
            }
            
            expression_map = {
                'neutral': 'neutral',
                'happy': 'happy',
                'excited': 'happy',
                'greeting': 'happy',
                'victory': 'happy',
                'dance': 'happy',
                'exercise': 'neutral',
                'sad': 'sad',
                'angry': 'angry',
                'surprised': 'surprised'
            }
            
            return jsonify({
                'emotion': detected_emotion,
                'intensity': 0.7,
                'animation': animation_map.get(detected_emotion, 'idle_loop.vrma'),
                'expression': expression_map.get(detected_emotion, 'neutral')
            })
        
    except Exception as e:
        print(f"Emotion analysis error: {e}")
        return jsonify({
            'emotion': 'neutral',
            'intensity': 0.5,
            'animation': 'idle_loop.vrma',
            'expression': 'neutral'
        })

@app.route('/settings/save-api-key', methods=['POST'])
def save_api_key():
    """Save user's OpenAI API key"""
    try:
        data = request.get_json()
        api_key = data.get('api_key', '').strip()
        
        # Validate API key format
        if api_key and not api_key.startswith('sk-'):
            return jsonify({'success': False, 'error': 'Invalid API key format'}), 400
        
        if current_user.is_authenticated:
            # Save to user account
            current_user.openai_api_key = api_key if api_key else None
            db.session.commit()
        else:
            # Save to session for guest users
            session['openai_api_key'] = api_key if api_key else None
        
        return jsonify({'success': True})
    except Exception as e:
        logging.error(f"Error saving API key: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/settings/get-api-key', methods=['GET'])
def get_api_key():
    """Get user's OpenAI API key (masked for security)"""
    try:
        api_key = None
        
        if current_user.is_authenticated:
            # Get from user account
            api_key = current_user.openai_api_key if hasattr(current_user, 'openai_api_key') else None
        else:
            # Get from session for guest users
            api_key = session.get('openai_api_key')
        
        if api_key:
            # Mask the API key for display (show only first 7 and last 4 characters)
            masked_key = api_key[:7] + '...' + api_key[-4:] if len(api_key) > 11 else api_key[:3] + '...'
            return jsonify({'success': True, 'api_key': masked_key, 'has_key': True})
        else:
            return jsonify({'success': True, 'api_key': '', 'has_key': False})
    except Exception as e:
        logging.error(f"Error getting API key: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
