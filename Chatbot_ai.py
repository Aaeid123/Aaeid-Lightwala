def chatbot():
    while True:
        user = input("You: ").lower()

        if user == "hello":
            print("Bot: Hi!")
        elif user == "how are you":
            print("Bot: I am fine")
        elif user == "bye":
            print("Bot: Goodbye")
            break
        else:
            print("Bot: I don't understand")

chatbot()

import google.generativeai as genai
from PIL import Image
import os

# Add your Google API Key
genai.configure(api_key="AIzaSyBSgCvGw5rBh-Uelr6DKZx9F21PVLgsuhE")

# Load and prepare the company logo
def load_company_logo(image_path):
    """Load and return the company logo image"""
    try:
        if os.path.exists(image_path):
            img = Image.open(image_path)
            return img
        else:
            print(f"Logo file not found at {image_path}")
            return None
    except Exception as e:
        print(f"Error loading logo: {e}")
        return None

# System prompt for the business assistant
SYSTEM_PROMPT = """You are an intelligent AI business assistant designed to help customers in real-time.

Your responsibilities include:
1. Answer customer questions about products and services.
2. Provide accurate business information such as pricing, availability, delivery time, and support.
3. Help customers place orders, book services, or schedule appointments.
4. Provide troubleshooting assistance.
5. Escalate complex issues to human support when needed.

Behavior Rules:
- Always respond politely and professionally.
- Keep answers short, clear, and helpful.
- If you do not know something, ask the customer for more information.
- Never provide false information.
- Suggest relevant products or services when appropriate.

Context Awareness:
Use previous conversation messages to understand customer intent.

Business Information:
Business Name: Timestag
Industry: Digital Marketing
Location: Ahmedabad / India
Services: Digital Marketing Services, SEO, Web Development, Web Design, Social Media, Graphic Design
Contact Support: timestag@gmail.com or Contact no:- 9726404840

Capabilities:
- Customer support
- Product recommendations
- Order tracking
- Appointment booking
- FAQ answering

Response Style:
- Friendly
- Professional
- Conversational
- Helpful

If the user asks unrelated or harmful questions, politely redirect them to business-related topics."""

# Initialize the model with system prompt
model = genai.GenerativeModel(
    "gemini-pro",
    system_instruction=SYSTEM_PROMPT
)

# Start chat
chat = model.start_chat(history=[])

# Load and display company logo (optional)
logo_path = "company_logo.png"  # Update this with your actual logo file path
logo = load_company_logo(logo_path)

if logo:
    print("\n" + "="*50)
    print("TIMESTAG - Digital Marketing Solutions")
    print("="*50)
    print("Logo loaded successfully!")
else:
    print("\n" + "="*50)
    print("TIMESTAG - Digital Marketing Solutions")
    print("="*50)
    print("📍 Ahmedabad, India")
    print("📧 timestag@gmail.com | 📞 9726404840")
    print("="*50 + "\n")

print("Welcome to Timestag Customer Support! How can I help you today?")
print("(Type 'exit' to end the conversation)\n")

while True:
    user_input = input("You: ")
    
    if user_input.lower() == "exit":
        print("\nThank you for contacting Timestag! Have a great day!")
        break
    
    # Send message to Gemini with the system prompt context
    response = chat.send_message(user_input)
    
    print("\nTimestag Assistant:", response.text)
    print("-" * 50 + "\n")

import google.generativeai as genai
from PIL import Image
import os
import json
import datetime
import hashlib
from typing import Dict, List, Optional
import re
import speech_recognition as sr
import pyttsx3
import threading
from queue import Queue
import time

# Add your Google API Key
genai.configure(api_key="AIzaSyBSgCvGw5rBh-Uelr6DKZx9F21PVLgsuhE")

class AdvancedChatbot:
    def __init__(self):
        self.user_name = None
        self.user_preferences = {}
        self.conversation_history = []
        self.user_mood = "neutral"
        self.session_start = datetime.datetime.now()
        self.pending_orders = []
        self.appointments = []
        self.knowledge_base = self.load_knowledge_base()
        self.response_cache = {}
        self.sentiment_score = 0
        self.topics_discussed = set()
        
        # Initialize speech components
        self.speech_engine = pyttsx3.init()
        self.recognizer = sr.Recognizer()
        self.speech_queue = Queue()
        
        # System prompt
        self.SYSTEM_PROMPT = """You are an advanced AI business assistant with human-like understanding and emotional intelligence.

Your capabilities include:
1. Emotional Intelligence: Detect user mood and adapt responses accordingly
2. Memory: Remember user preferences and past conversations
3. Proactive Assistance: Anticipate user needs
4. Multi-tasking: Handle complex queries simultaneously
5. Learning: Improve from interactions
6. Personalization: Tailor responses to individual users

Business Context:
- Name: Timestag
- Industry: Digital Marketing
- Location: Ahmedabad, India
- Services: SEO, Web Development, Design, Social Media, Graphic Design
- Contact: timestag@gmail.com | 9726404840

Response Guidelines:
- Be empathetic and emotionally aware
- Use natural, conversational language
- Remember user preferences
- Suggest relevant services proactively
- Handle complex queries with step-by-step reasoning
- Admit limitations and offer alternatives
- Maintain context throughout conversation"""

        self.model = genai.GenerativeModel("gemini-pro", system_instruction=self.SYSTEM_PROMPT)
        self.chat = self.model.start_chat(history=[])
        
        # Start background tasks
        self.start_background_tasks()

    def load_knowledge_base(self) -> Dict:
        """Load or create knowledge base"""
        try:
            with open('knowledge_base.json', 'r') as f:
                return json.load(f)
        except:
            return {
                'faqs': {},
                'user_profiles': {},
                'service_info': {},
                'common_issues': {}
            }

    def save_knowledge_base(self):
        """Save knowledge base to file"""
        with open('knowledge_base.json', 'w') as f:
            json.dump(self.knowledge_base, f)

    def start_background_tasks(self):
        """Initialize background processing threads"""
        self.background_thread = threading.Thread(target=self.process_background_tasks, daemon=True)
        self.background_thread.start()

    def process_background_tasks(self):
        """Background tasks like sentiment analysis, learning, etc."""
        while True:
            # Clean old cache entries
            self.clean_cache()
            
            # Analyze conversation patterns
            if len(self.conversation_history) > 10:
                self.analyze_conversation_patterns()
            
            time.sleep(60)  # Run every minute

    def clean_cache(self):
        """Remove old cache entries"""
        current_time = datetime.datetime.now()
        # Implementation for cache cleaning

    def analyze_conversation_patterns(self):
        """Analyze conversation for insights"""
        # Implementation for pattern analysis
        pass

    def detect_sentiment(self, text: str) -> str:
        """Detect user sentiment from text"""
        sentiment_keywords = {
            'positive': ['happy', 'great', 'excellent', 'love', 'thanks', 'good'],
            'negative': ['bad', 'terrible', 'hate', 'worst', 'poor', 'disappointed'],
            'urgent': ['urgent', 'asap', 'quickly', 'emergency', 'immediately'],
            'confused': ['confused', 'dont understand', 'unclear', 'help']
        }
        
        text_lower = text.lower()
        for sentiment, keywords in sentiment_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return sentiment
        return 'neutral'

    def get_emotional_response(self, sentiment: str) -> str:
        """Get appropriate emotional response based on sentiment"""
        emotional_responses = {
            'positive': "I'm really happy to hear that! 😊",
            'negative': "I understand this might be frustrating. Let me help you resolve this.",
            'urgent': "I understand this is urgent. I'll prioritize your request immediately.",
            'confused': "No worries! Let me explain more clearly.",
            'neutral': "I'm here to help. What would you like to know?"
        }
        return emotional_responses.get(sentiment, "I'm here to help!")

    def process_speech_input(self):
        """Process voice input"""
        try:
            with sr.Microphone() as source:
                print("🎤 Listening... (speak now)")
                self.recognizer.adjust_for_ambient_noise(source)
                audio = self.recognizer.listen(source, timeout=5)
                
            text = self.recognizer.recognize_google(audio)
            return text
        except sr.WaitTimeoutError:
            return None
        except sr.UnknownValueError:
            return "Sorry, I couldn't understand that."
        except Exception as e:
            return f"Error: {e}"

    def text_to_speech(self, text: str):
        """Convert text to speech"""
        def speak():
            self.speech_engine.say(text)
            self.speech_engine.runAndWait()
        
        # Run in separate thread to not block
        threading.Thread(target=speak, daemon=True).start()

    def get_user_context(self) -> str:
        """Build user context from history"""
        if not self.user_name:
            return "New user"
        
        context = f"User: {self.user_name}\n"
        context += f"Mood: {self.user_mood}\n"
        context += f"Preferences: {self.user_preferences}\n"
        context += f"Topics discussed: {', '.join(self.topics_discussed)}\n"
        
        if self.pending_orders:
            context += f"Pending orders: {len(self.pending_orders)}\n"
        if self.appointments:
            context += f"Appointments: {len(self.appointments)}\n"
            
        return context

    def extract_user_info(self, text: str):
        """Extract user information from conversation"""
        # Extract name
        name_patterns = [
            r"my name is (\w+)",
            r"i'm (\w+)",
            r"i am (\w+)"
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, text.lower())
            if match and not self.user_name:
                self.user_name = match.group(1).capitalize()
                break

    def handle_complex_query(self, query: str) -> str:
        """Handle complex, multi-part queries"""
        # Break down complex query into parts
        parts = query.split(' and ')
        if len(parts) > 1:
            responses = []
            for part in parts:
                response = self.chat.send_message(part)
                responses.append(response.text)
            return "\n\n".join(responses)
        return None

    def suggest_services(self) -> str:
        """Proactively suggest services based on context"""
        if 'website' in self.topics_discussed:
            return "Since you mentioned websites, would you like to know about our web development packages?"
        elif 'social media' in self.topics_discussed:
            return "I noticed you're interested in social media. We offer comprehensive SMM services!"
        return None

    def handle_appointment_booking(self, text: str) -> Optional[str]:
        """Handle appointment booking requests"""
        if 'book appointment' in text.lower() or 'schedule meeting' in text.lower():
            # Extract date and time
            date_pattern = r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}'
            time_pattern = r'\d{1,2}:\d{2}\s*(?:am|pm)?'
            
            dates = re.findall(date_pattern, text)
            times = re.findall(time_pattern, text, re.IGNORECASE)
            
            appointment = {
                'date': dates[0] if dates else 'Not specified',
                'time': times[0] if times else 'Not specified',
                'purpose': 'Consultation'
            }
            
            self.appointments.append(appointment)
            return f"Great! I've scheduled your appointment for {appointment['date']} at {appointment['time']}. You'll receive a confirmation email shortly."
        
        return None

    def handle_order_placement(self, text: str) -> Optional[str]:
        """Handle order placement"""
        if 'place order' in text.lower() or 'buy' in text.lower() or 'purchase' in text.lower():
            order_id = hashlib.md5(f"{text}{datetime.datetime.now()}".encode()).hexdigest()[:8]
            
            order = {
                'id': order_id,
                'details': text,
                'status': 'pending',
                'timestamp': datetime.datetime.now().isoformat()
            }
            
            self.pending_orders.append(order)
            return f"Order #{order_id} has been created. Our team will contact you shortly to confirm the details."
        
        return None

    def get_response_with_context(self, user_input: str) -> str:
        """Generate response with full context awareness"""
        
        # Extract user info
        self.extract_user_info(user_input)
        
        # Detect sentiment
        sentiment = self.detect_sentiment(user_input)
        self.user_mood = sentiment
        
        # Add to history
        self.conversation_history.append({
            'user': user_input,
            'timestamp': datetime.datetime.now().isoformat(),
            'sentiment': sentiment
        })
        
        # Track topics
        words = set(user_input.lower().split())
        self.topics_discussed.update(words)
        
        # Check cache
        cache_key = hashlib.md5(user_input.encode()).hexdigest()
        if cache_key in self.response_cache:
            return self.response_cache[cache_key]
        
        # Handle specific intents
        emotional_response = self.get_emotional_response(sentiment)
        
        # Check for appointments
        appointment_response = self.handle_appointment_booking(user_input)
        if appointment_response:
            return f"{emotional_response} {appointment_response}"
        
        # Check for orders
        order_response = self.handle_order_placement(user_input)
        if order_response:
            return f"{emotional_response} {order_response}"
        
        # Handle complex queries
        complex_response = self.handle_complex_query(user_input)
        if complex_response:
            return complex_response
        
        # Add user context to the query
        context = self.get_user_context()
        enhanced_query = f"Context: {context}\nUser: {user_input}\nPlease respond appropriately."
        
        try:
            # Get response from Gemini
            response = self.chat.send_message(enhanced_query)
            full_response = f"{emotional_response}\n\n{response.text}"
            
            # Add proactive suggestions
            suggestion = self.suggest_services()
            if suggestion and len(self.conversation_history) % 3 == 0:  # Every 3 messages
                full_response += f"\n\n💡 {suggestion}"
            
            # Cache response
            self.response_cache[cache_key] = full_response
            
            return full_response
            
        except Exception as e:
            return f"I apologize, but I'm having trouble processing your request. Error: {e}"

    def run(self):
        """Main chatbot loop"""
        # Display welcome with ASCII art
        self.display_welcome()
        
        while True:
            print("\n" + "─" * 50)
            print("Options: [text] / [voice] / [exit] / [help] / [history]")
            choice = input("Input mode: ").lower().strip()
            
            if choice == 'exit':
                self.goodbye()
                break
            
            elif choice == 'voice':
                print("🎤 Voice mode activated. Speak now...")
                user_input = self.process_speech_input()
                if user_input:
                    print(f"You (voice): {user_input}")
                else:
                    print("No input detected. Returning to text mode.")
                    continue
            
            elif choice == 'history':
                self.show_conversation_history()
                continue
            
            elif choice == 'help':
                self.show_help()
                continue
            
            elif choice == 'text':
                user_input = input("You: ").strip()
            
            else:
                # Default to text input
                user_input = choice
            
            if not user_input or user_input.lower() == 'exit':
                continue
            
            # Process input and get response
            start_time = time.time()
            response = self.get_response_with_context(user_input)
            response_time = time.time() - start_time
            
            # Display response
            print(f"\n🤖 Timestag AI [{response_time:.2f}s]:")
            print(response)
            
            # Optional: Text-to-speech
            if input("\n🔊 Speak response? (y/n): ").lower() == 'y':
                self.text_to_speech(response)
            
            # Add to history
            self.conversation_history.append({
                'bot': response,
                'timestamp': datetime.datetime.now().isoformat()
            })

    def display_welcome(self):
        """Display welcome message with branding"""
        welcome_art = """
    ╔══════════════════════════════════════════════════════════╗
    ║     ████████╗██╗███╗   ███╗███████╗███████╗████████╗    ║
    ║     ╚══██╔══╝██║████╗ ████║██╔════╝██╔════╝╚══██╔══╝    ║
    ║        ██║   ██║██╔████╔██║█████╗  ███████╗   ██║       ║
    ║        ██║   ██║██║╚██╔╝██║██╔══╝  ╚════██║   ██║       ║
    ║        ██║   ██║██║ ╚═╝ ██║███████╗███████║   ██║       ║
    ║        ╚═╝   ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝   ╚═╝       ║
    ║                                                          ║
    ║           🚀 ADVANCED AI BUSINESS ASSISTANT             ║
    ║                 Digital Marketing Solutions             ║
    ╚══════════════════════════════════════════════════════════╝
        """
        
        print(welcome_art)
        print(f"📍 Ahmedabad, India | 📧 timestag@gmail.com | 📞 9726404840")
        print(f"📅 Session started: {self.session_start.strftime('%Y-%m-%d %H:%M:%S')}")
        print("\n✨ I'm your advanced AI assistant with emotional intelligence and memory!")
        print("💡 Try: voice commands, complex queries, booking appointments, or placing orders")

    def show_conversation_history(self):
        """Display conversation history"""
        print("\n📝 Conversation History:")
        print("─" * 50)
        for entry in self.conversation_history[-10:]:  # Show last 10 entries
            if 'user' in entry:
                print(f"👤 You ({entry['sentiment']}): {entry['user'][:50]}...")
            if 'bot' in entry:
                print(f"🤖 Bot: {entry['bot'][:50]}...")
        print("─" * 50)

    def show_help(self):
        """Display help information"""
        help_text = """
    🤖 ADVANCED FEATURES:
    
    • Voice Input: Type 'voice' to speak your queries
    • Text-to-Speech: Enable spoken responses
    • Sentiment Detection: I understand your emotions
    • Memory: I remember our conversations
    • Proactive Suggestions: I recommend relevant services
    • Multi-tasking: Handle complex, multi-part questions
    • Appointment Booking: Schedule consultations
    • Order Placement: Create service orders
    • Conversation History: Review past interactions
    
    Try asking:
    - "Book an appointment for tomorrow at 2pm"
    - "I want to place an order for SEO services"
    - "Tell me about web development AND social media marketing"
    - "My name is John, I need help with my website"
        """
        print(help_text)

    def goodbye(self):
        """Farewell message"""
        duration = datetime.datetime.now() - self.session_start
        minutes = duration.total_seconds() / 60
        
        print(f"\n{'='*50}")
        print(f"Thank you for chatting with Timestag AI!")
        print(f"Session duration: {minutes:.1f} minutes")
        print(f"Topics discussed: {', '.join(self.topics_discussed)}")
        print(f"Overall sentiment: {self.user_mood}")
        print("\n📧 For further assistance: timestag@gmail.com")
        print("📞 Call us: 9726404840")
        print(f"{'='*50}\n")
        
        # Save knowledge base
        self.save_knowledge_base()

# Run the advanced chatbot
if __name__ == "__main__":
    chatbot = AdvancedChatbot()
    chatbot.run()

