import os
import json
import logging
from openai import OpenAI

class OpenAIService:
    """Service class for OpenAI API interactions"""
    
    def __init__(self):
        # No default API key - users must provide their own
        # the newest OpenAI model is "gpt-4o" which was released May 13, 2024.
        # do not change this unless explicitly requested by the user
        self.chat_model = "gpt-4o"
        self.light_model = "gpt-3.5-turbo"
    
    def _get_client(self, user=None):
        """Get OpenAI client using user's API key - required for all requests"""
        import logging
        import os
        api_key = None
        
        # Use environment API key
        api_key = os.environ.get('OPENAI_API_KEY')
        if api_key:
            logging.debug("Using environment API key")
        else:
            # Try to get API key from authenticated user
            if user and hasattr(user, 'openai_api_key') and user.openai_api_key:
                api_key = user.openai_api_key
                logging.debug(f"Using user API key: {api_key[:10]}...")
            else:
                # Try to get API key from session for guest users
                from flask import session
                api_key = session.get('openai_api_key')
                if api_key:
                    logging.debug(f"Using session API key: {api_key[:10]}...")
                else:
                    logging.debug("No API key found")
        
        if api_key:
            return OpenAI(api_key=api_key)
        logging.debug("No API key available, returning None")
        return None
        
    def generate_chat_response(self, message, conversation_history=None, custom_instructions=None, user=None, model=None):
        """Generate a chat response using OpenAI"""
        try:
            client = self._get_client(user)
            if not client:
                return {
                    'success': False,
                    'error': 'OpenAI API key required. Please add your API key in settings to use AI features.',
                    'response': None,
                    'emotion': 'neutral',
                    'tokens_used': 0
                }
            
            messages = []
            
            # System prompt for character personality
            system_prompt = """You are an advanced AI assistant with a warm, helpful, and engaging personality. 
            You should respond naturally and conversationally, showing appropriate emotions and reactions.
            Be concise but informative, and always try to be helpful while maintaining a friendly tone.
            When appropriate, show curiosity about the user's thoughts and experiences."""
            
            # Add user's custom instructions from database
            if user and hasattr(user, 'custom_instructions_about') and user.custom_instructions_about:
                system_prompt += f"\n\nAbout the user: {user.custom_instructions_about}"
            
            if user and hasattr(user, 'custom_instructions_style') and user.custom_instructions_style:
                system_prompt += f"\n\nResponse style preferences: {user.custom_instructions_style}"
            
            # Add legacy custom instructions for compatibility
            if custom_instructions:
                if custom_instructions.get('aboutYou'):
                    system_prompt += f"\n\nAdditional context: {custom_instructions['aboutYou']}"
                if custom_instructions.get('responseStyle'):
                    system_prompt += f"\n\nAdditional style preferences: {custom_instructions['responseStyle']}"
            
            messages.append({"role": "system", "content": system_prompt})
            
            # Add conversation history
            if conversation_history:
                messages.extend(conversation_history[-8:])  # Last 8 messages for context
            
            # Add current message
            messages.append({"role": "user", "content": message})
            
            # Use provided model or determine based on complexity
            if model:
                selected_model = self._normalize_model_name(model)
            else:
                selected_model = self._select_model(message, conversation_history)
            
            response = client.chat.completions.create(
                model=selected_model,
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            return {
                'content': response.choices[0].message.content,
                'tokens_used': response.usage.total_tokens if response.usage else 0,
                'model_used': selected_model
            }
            
        except Exception as e:
            logging.error(f"Chat response generation error: {e}")
            raise Exception(f"Failed to generate response: {e}")
    
    def analyze_emotion(self, message, user=None):
        """Analyze emotion in user message for character animation"""
        try:
            client = self._get_client(user)
            if not client:
                return "neutral"
            
            response = client.chat.completions.create(
                model=self.light_model,
                messages=[
                    {
                        "role": "system",
                        "content": """Analyze the emotional tone of the user's message and determine appropriate character reactions.
                        Respond with JSON in this format:
                        {
                            "emotion": "happy|sad|excited|neutral|confused|angry|surprised",
                            "intensity": 0.1-1.0,
                            "expression": "smile|frown|wide_eyes|neutral|raised_eyebrows|concern",
                            "animation": "bounce|nod|shake|idle|wave|thinking"
                        }"""
                    },
                    {"role": "user", "content": message}
                ],
                response_format={"type": "json_object"},
                max_tokens=150
            )
            
            content = response.choices[0].message.content
            if content:
                return json.loads(content)
            else:
                return {
                    "emotion": "neutral",
                    "intensity": 0.3,
                    "expression": "neutral",
                    "animation": "idle"
                }
            
        except Exception as e:
            logging.error(f"Emotion analysis error: {e}")
            return {
                "emotion": "neutral",
                "intensity": 0.3,
                "expression": "neutral",
                "animation": "idle"
            }
    
    def analyze_image_with_chat(self, base64_image, message, conversation_history=None, user=None, model=None):
        """Analyze image and generate response"""
        try:
            client = self._get_client(user)
            if not client:
                return {
                    'success': False,
                    'error': 'OpenAI API key required. Please add your API key in settings to use AI features.',
                    'response': None,
                    'tokens_used': 0
                }
            
            messages = []
            
            # System prompt
            system_prompt = """You are an AI assistant that can see and analyze images. 
            Describe what you see and respond to the user's question or comment about the image naturally and helpfully."""
            
            messages.append({"role": "system", "content": system_prompt})
            
            # Add conversation history
            if conversation_history:
                messages.extend(conversation_history[-6:])  # Fewer messages due to image content
            
            # Add current message with image
            message_content = [
                {"type": "text", "text": message or "What do you see in this image?"}
            ]
            
            if base64_image:
                message_content.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                })
            
            messages.append({"role": "user", "content": message_content})
            
            # Use provided model or default to GPT-4o for vision
            if model:
                selected_model = self._normalize_model_name(model)
            else:
                selected_model = self.chat_model  # Use GPT-4o for vision
                
            response = client.chat.completions.create(
                model=selected_model,
                messages=messages,
                max_tokens=600
            )
            
            return {
                'content': response.choices[0].message.content,
                'tokens_used': response.usage.total_tokens if response.usage else 0,
                'model_used': selected_model
            }
            
        except Exception as e:
            logging.error(f"Image analysis error: {e}")
            raise Exception(f"Failed to analyze image: {e}")
    
    def transcribe_audio(self, audio_file_path, user=None):
        """Transcribe audio to text using Whisper with language preference weighting or auto-detect"""
        try:
            client = self._get_client(user)
            if not client:
                return {
                    'success': False,
                    'error': 'OpenAI API key required. Please add your API key in settings to use voice features.',
                    'text': None
                }
            
            # Get user's preferred voice language for better recognition
            language_hint = None  # Default to auto-detect
            if user and hasattr(user, 'voice_language') and user.voice_language:
                if user.voice_language != 'auto':
                    language_hint = user.voice_language
            
            with open(audio_file_path, "rb") as audio_file:
                # Create transcription request
                transcription_params = {
                    "model": "whisper-1",
                    "file": audio_file
                }
                
                # Add language hint only if not auto-detect
                if language_hint:
                    transcription_params["language"] = language_hint
                    transcription_params["prompt"] = self._get_language_prompt(language_hint)
                
                response = client.audio.transcriptions.create(**transcription_params)
            return response.text
            
        except Exception as e:
            logging.error(f"Audio transcription error: {e}")
            raise Exception(f"Failed to transcribe audio: {e}")
    
    def _get_language_prompt(self, language_code):
        """Get language-specific prompt to improve recognition accuracy"""
        prompts = {
            'en': "This is spoken English. Please transcribe accurately with proper punctuation.",
            'ja': "これは日本語の音声です。正確に転写してください。",
            'ko': "이것은 한국어 음성입니다. 정확하게 전사해주세요."
        }
        return prompts.get(language_code, prompts['en'])
    
    def generate_suggestions(self, ai_response, user=None):
        """Generate conversation suggestions based on AI response"""
        try:
            client = self._get_client(user)
            if not client:
                return ["Tell me more", "That's interesting", "What else?"]
            
            response = client.chat.completions.create(
                model=self.light_model,
                messages=[
                    {
                        "role": "system",
                        "content": """Generate 3 natural follow-up questions or conversation starters based on the AI's response.
                        Make them engaging and relevant. Respond with JSON:
                        {"suggestions": ["question1", "question2", "question3"]}"""
                    },
                    {"role": "user", "content": f"AI response: {ai_response}"}
                ],
                response_format={"type": "json_object"},
                max_tokens=150
            )
            
            content = response.choices[0].message.content
            if content:
                result = json.loads(content)
                return result.get("suggestions", ["Tell me more", "What else?", "Interesting!"])
            else:
                return ["Tell me more", "What else?", "Interesting!"]
            
        except Exception as e:
            logging.error(f"Suggestion generation error: {e}")
            return ["Tell me more", "What do you think?", "Can you explain?"]
    
    def summarize_conversation(self, conversation_history, user=None):
        """Summarize conversation for proactive messaging context"""
        try:
            client = self._get_client(user)
            if not client:
                return "No conversation context available."
            
            if len(conversation_history) < 2:
                return "New conversation started"
            
            # Create conversation text
            conv_text = ""
            for msg in conversation_history[-6:]:  # Last 6 messages
                role = "User" if msg['role'] == 'user' else "AI"
                conv_text += f"{role}: {msg['content']}\n"
            
            response = client.chat.completions.create(
                model=self.light_model,
                messages=[
                    {
                        "role": "system",
                        "content": "Summarize this conversation in 1-2 sentences, focusing on the main topics and user's interests."
                    },
                    {"role": "user", "content": conv_text}
                ],
                max_tokens=100
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logging.error(f"Conversation summary error: {e}")
            return "Ongoing conversation"
    
    def generate_proactive_message(self, context_summary, user=None):
        """Generate a proactive message for messenger mode"""
        try:
            client = self._get_client(user)
            if not client:
                return "Hey! How are you doing?"
            
            response = client.chat.completions.create(
                model=self.light_model,
                messages=[
                    {
                        "role": "system",
                        "content": """Generate a natural, friendly proactive message to continue the conversation.
                        The message should be relevant to the conversation context, show interest in the user,
                        and feel like a natural continuation. Keep it conversational and not too long.
                        Examples: asking about something mentioned, sharing a related thought, or showing curiosity."""
                    },
                    {"role": "user", "content": f"Conversation context: {context_summary}"}
                ],
                max_tokens=150,
                temperature=0.8
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logging.error(f"Proactive message generation error: {e}")
            return "Hey! How are you doing?"
    
    def _normalize_model_name(self, model):
        """Normalize model names from frontend to OpenAI API format"""
        model_mapping = {
            'gpt-4o': 'gpt-4o',
            'gpt-4o-mini': 'gpt-4o-mini',
            'o4-mini': 'o4-mini',
            
            'o3': 'o3',  # Fallback to gpt-4o for o3 until available
            'gpt-3.5-turbo': 'gpt-3.5-turbo'
        }
        return model_mapping.get(model, 'gpt-4o')  # Default to gpt-4o if unknown
    
    def _select_model(self, message, conversation_history):
        """Select appropriate model based on request complexity"""
        # Use GPT-4o for complex requests, GPT-3.5-turbo for simple ones
        complex_indicators = [
            'analyze', 'explain', 'compare', 'create', 'write', 'code', 'solve',
            'complex', 'detailed', 'comprehensive', 'step by step'
        ]
        
        message_lower = message.lower()
        if any(indicator in message_lower for indicator in complex_indicators):
            return self.chat_model
        
        # Use lighter model for simple conversations
        if len(message.split()) < 10 and not conversation_history:
            return self.light_model
        
        # Default to main model for balanced performance
        return self.chat_model
