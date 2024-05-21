Welcome to Lingual Web Bot - Query At your Click! - Pravaah Hackathon Challenge Conducted by Quadrant Technologies
----------------------------------------------------

Project Structure:
project/
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   └── index.html
├── templates/
│   └── chat.html
├── app.py
└── requirements.txt

--------------------------------------------------------------------------------------------------------------------------------------------------------------
Technology Stack:
Front-end Technologies
HTML: Provides the structure and layout for the webpage.
CSS: Handles webpage styling (implied but not explicitly mentioned in the code snippets).
JavaScript: Enables client-side scripting and interaction.
jQuery: A JavaScript library simplifying DOM manipulation and AJAX calls.
Bootstrap (Optional): Offers responsive design and pre-built UI components (commonly used in such projects, but not explicitly mentioned).

Back-end Technologies
Python: The primary programming language for the back-end server.
Flask: A lightweight web framework for building the back-end server and managing HTTP requests.
Flask-NGrok (Optional): Exposes the local server to the internet using NGrok, aiding in development.

Communication
AJAX: Facilitates asynchronous communication between the front-end and back-end without refreshing the page.

Text-to-Speech
SpeechSynthesis API: A browser API converting text to speech on the client side.
Custom TTS Endpoint: A custom endpoint (/tts) on the Flask server handling text-to-speech conversion and returning audio data as a response.

----------------------------------------------------------------------------------------------------------------------------------------------------------------
Detailed Tech Stack:

HTML & CSS: The basic building blocks for structuring and styling the web page.
JavaScript:
->jQuery: Simplifies making AJAX requests and manipulating the DOM.
->SpeechSynthesis API: Converts text to speech within the browser.

Python:
->Flask: Creates the back-end web server, defines routes for handling requests, and generates responses.
->Flask-NGrok: Exposes the local Flask server to the internet during development.

AJAX:
->$.ajax: A jQuery method making asynchronous HTTP requests to the Flask server.
->Bootstrap (Optional): Enhances the UI with responsive design and pre-styled components.

----------------------------------------------------------------------------------------------------------------------------------------------------------------
