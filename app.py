from flask import Flask, request, jsonify, send_file, render_template
from flask_ngrok import run_with_ngrok
from flask_cors import CORS
from googletrans import Translator
from bs4 import BeautifulSoup
import requests
from nltk.tokenize import sent_tokenize, word_tokenize
import string
import ssl
ssl._create_default_https_context = ssl._create_unverified_context
from gtts import gTTS
import speech_recognition as sr
import nltk
nltk.download('punkt')
from nltk.corpus import stopwords
nltk.download('punkt')
nltk.download('stopwords')
app = Flask(__name__)
run_with_ngrok(app)  # Start ngrok when app is run
CORS(app)  # Enable CORS for all routes
translator = Translator()

class WebChatBot:
    def __init__(self):
        self.session = requests.Session()
        self.text_content = ''
        self.stop_words = set(stopwords.words('english'))

    def fetch_website_data(self, url):
        try:
            response = self.session.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            self.text_content = ' '.join([p.text for p in soup.find_all('p')])
            return True
        except Exception as e:
            print(f"Error fetching website data: {e}")
            return False

    def preprocess_text(self, text):
        tokens = [word.lower() for word in word_tokenize(text) if word.lower() not in self.stop_words and word not in string.punctuation]
        return tokens

    def answer_query(self, query):
        query_tokens = self.preprocess_text(query)
        content_sentences = sent_tokenize(self.text_content)
        sentence_scores = {}
        for sentence in content_sentences:
            sentence_tokens = self.preprocess_text(sentence)
            score = sum(1 for token in query_tokens if token in sentence_tokens)
            sentence_scores[sentence] = score
        best_sentences = sorted(sentence_scores, key=sentence_scores.get, reverse=True)
        best_sentences = [sentence for sentence in best_sentences if sentence_scores[sentence] > 0]
        if best_sentences:
            return ' '.join(best_sentences[:3])
        else:
            return "Sorry, I couldn't find an answer to your question."

bot = WebChatBot()

@app.route('/')
def home():
    return render_template('chat.html')

@app.route('/translate', methods=['POST'])
def translate_text():
    data = request.get_json()
    text = data['text']
    lang = data['lang']
    translation = translator.translate(text, dest=lang)
    return jsonify({'translation': translation.text})

@app.route('/fetch', methods=['GET', 'POST'])
def fetch_data():
    if request.method == 'POST':
        url = request.form['url']
        success = bot.fetch_website_data(url)
        return jsonify({'success': success, 'content': bot.text_content})
    elif request.method == 'GET':
        return jsonify({'error': 'Please use POST method to fetch data'}), 405

@app.route('/ask', methods=['POST'])
def ask_question():
    query = request.form['query']
    answer = bot.answer_query(query)
    return jsonify({'answer': answer})

@app.route('/tts', methods=['POST'])
def text_to_speech():
    text = request.form['text']
    tts = gTTS(text=text, lang='en')
    tts.save('response.mp3')
    return send_file('response.mp3', mimetype='audio/mp3')

@app.route('/stt', methods=['POST'])
def speech_to_text():
    audio_file = request.files['audio']
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_file) as source:
        audio_data = recognizer.record(source)
    try:
        text = recognizer.recognize_google(audio_data)
        return jsonify(text=text)
    except sr.UnknownValueError:
        return jsonify(error="Speech Recognition could not understand audio")
    except sr.RequestError as e:
        return jsonify(error=f"Could not request results from Speech Recognition service; {e}")

if __name__ == "__main__":
    app.run()
