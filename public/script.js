document.addEventListener('DOMContentLoaded', () => {
    const users = {
        SessionA: [],
        SessionB: []
            // Add more users and their message arrays as needed
    };
    let messageMe = 0;
    let messageYou = 0;
    let currentUser = 'SessionA';
    let contextMenu = document.getElementById('contextMenu');
    let currentMessageIndex = null;
    let selectedLanguage = 'English'; // Default language
    let mandatoryQuestionCount = 0;
    const MANDATORY_QUESTIONS = 2;

    function switchUser(user) {
        currentUser = user;
        document.getElementById('chatWith').textContent = `Chat with ${user.charAt(0).toUpperCase() + user.slice(1)}`;
        renderMessages();
    }

    function renderMessages() {
        const chat = document.getElementById('chat');
        chat.innerHTML = '';
        users[currentUser].forEach((message, index) => {
            let li = document.createElement('li');
            li.className = message.type;
            li.classList.add(message.sender); // Add sender class to differentiate between user and chatbot messages
            li.dataset.index = index;

            let entete = document.createElement('div');
            entete.className = 'entete';

            let time = document.createElement('h3');
            time.textContent = message.time;

            let username = document.createElement('h2');
            username.textContent = message.type === 'me' ? 'Me' : currentUser.charAt(0).toUpperCase() + currentUser.slice(1);

            let status = document.createElement('span');
            status.className = message.type === 'me' ? 'status blue' : 'status green';

            entete.appendChild(time);
            entete.appendChild(username);
            entete.appendChild(status);

            let triangle = document.createElement('div');
            triangle.className = 'triangle';

            let messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.textContent = message.text;

            li.appendChild(entete);
            li.appendChild(triangle);
            li.appendChild(messageDiv);

            chat.appendChild(li);

            li.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                currentMessageIndex = this.dataset.index;
                contextMenu.style.top = `${e.pageY}px`;
                contextMenu.style.left = `${e.pageX}px`;
                contextMenu.style.display = 'block';
            });
        });

        chat.scrollTop = chat.scrollHeight; // Auto-scroll to the bottom
    }

    document.getElementById('sendMessage').addEventListener('click', function(event) {
        event.preventDefault();
        let messageInput = document.getElementById('messageInput');
        let messageText = messageInput.value.trim();

        if (messageText !== '') {
            handleMessage(messageText);
            messageInput.value = '';
        }
    });

    document.getElementById('messageInput').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.getElementById('sendMessage').click();
        }
    });

    document.querySelectorAll('#userList li').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelector('#userList li.active').classList.remove('active');
            this.classList.add('active');
            switchUser(this.getAttribute('data-user'));
        });
    });

    document.getElementById('readAloudOption').addEventListener('click', function() {
        if (currentMessageIndex !== null) {
            const message = users[currentUser][currentMessageIndex];
            const utterance = new SpeechSynthesisUtterance(message.text);

            // Set the language of the utterance
            const languageMapping = {
                'en': 'en-US',
                'te': 'te-IN',
                'hi': 'hi-IN',
                'ar': 'ar-SA'
            };

            const lang = message.lang || 'en';
            utterance.lang = languageMapping[lang];

            window.speechSynthesis.speak(utterance);
            contextMenu.style.display = 'none';
        }
    });

    document.querySelectorAll('#languageList li').forEach(item => {
        item.addEventListener('click', async function() {
            if (currentMessageIndex !== null) {
                const message = users[currentUser][currentMessageIndex];
                const targetLanguage = this.dataset.lang;

                try {
                    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(message.text)}`);
                    const result = await response.json();
                    const translatedText = result[0][0][0];
                    // Update the message text with the translated text
                    message.text = translatedText;
                    message.lang = targetLanguage; // Save the language for read aloud
                    renderMessages();
                } catch (error) {
                    console.error('Error translating message:', error);
                }

                contextMenu.style.display = 'none';
            }
        });
    });

    document.addEventListener('click', function(e) {
        if (!contextMenu.contains(e.target)) {
            contextMenu.style.display = 'none';
        }
    });

    renderMessages(); // Initial render

    function appendWelcomeMessage() {
        let messageText = "Welcome to Lingual Web-Bot: Pls paste your URL to know more!!"
        let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        users[currentUser].push({ type: 'you', sender: 'chatbot', text: messageText, count: ++messageYou, time: `${currentTime}, Today` });
        renderMessages();
        textToSpeech(messageText);
    }

    appendWelcomeMessage(); // Append welcome message on page load

    const languageSelector = document.getElementById('languageSelector');
    const dropdownBtn = document.querySelector('.dropbtn');

    languageSelector.addEventListener('change', function(event) {
        selectedLanguage = event.target.value; // Update the selectedLanguage variable
        updateDropdownPlaceholder(dropdownBtn, selectedLanguage);
        otherFunction(selectedLanguage);
    });

    function updateDropdownPlaceholder(dropdownBtn, selectedOption) {
        dropdownBtn.textContent = selectedOption; // Update button text with selected language
    }

    function otherFunction(language) {
        console.log('Selected language:', language);
        // Perform other actions based on the selected language
    }

    function handleMessage(messageText) {
        let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Check if the message is "End The Chat"
        if (messageText.toLowerCase() === "end the chat") {
            users[currentUser].push({ type: 'me', sender: 'user', text: messageText, count: 0, time: `${currentTime}, Today` });
            renderMessages();
            alert('Chat has ended.');
            return;
        }

        // Append user's message
        users[currentUser].push({ type: 'me', sender: 'user', text: messageText, count: ++messageMe, time: `${currentTime}, Today` });
        renderMessages();

        // Check if it's the first message (assuming the first message is always a URL)
        if (users[currentUser].length === 2) { // 1st message from user + welcome message from chatbot
            fetchData(messageText);
        } else if (users[currentUser].length === 5) { // 1st message from user + welcome message from chatbot
            askQuestion(messageText);
        }

        // Increase the count of mandatory questions
        mandatoryQuestionCount++;

        // Check if the mandatory question count has been reached
        if (mandatoryQuestionCount >= MANDATORY_QUESTIONS) {
            setTimeout(() => {
                askEndChatPrompt();
            }, 500); // Delay to mimic chatbot response time
        }
    }

    function askEndChatPrompt() {
        let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let promptMessage = "Do you want to end the chat?";

        users[currentUser].push({ type: 'you', sender: 'chatbot', text: promptMessage, count: ++messageYou, time: `${currentTime}, Today` });
        renderMessages();
    }

    function fetchData(url) {
        $.post('http://127.0.0.1:5000/fetch', {
            url: url
        }, function(data) {
            if (data.success) {
                // You can also add the response from the server to the chat if needed
                let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                users[currentUser].push({ type: 'you', sender: 'chatbot', text: "Great! Thanksfor the URL", count: ++messageYou, time: `${currentTime}, Today` });
                renderMessages();
                textToSpeech("Great! Thanksfor the URL");
                // After successful data fetch, ask a question to the user
                setTimeout(() => {
                    askQuestionToUser();
                }, 500); // Delay to mimic chatbot response time
            }
        });
    }

    function askQuestion(msg) {
        var query = msg;
        $.post('http://127.0.0.1:5000/ask', {
            query: query
        }, function(data) {
            let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            users[currentUser].push({ type: 'you', sender: 'chatbot', text: data.answer, count: ++messageYou, time: `${currentTime}, Today` });
            renderMessages();
            textToSpeech(data.answer); // Automatically call TTS for the answer
        });
    }

    function textToSpeech(text) {
        $.ajax({
            url: 'http://127.0.0.1:5000/tts',
            method: 'POST',
            data: {
                text: text
            },
            xhrFields: {
                responseType: 'blob' // Expect binary data (Blob)
            },
            success: function(data) {
                var audioBlob = new Blob([data], {
                    type: 'audio/mp3'
                });
                var audioURL = URL.createObjectURL(audioBlob);
                var audio = new Audio(audioURL);
                audio.play();
            }
        });
    }

    function askQuestionToUser() {
        var currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        var promptMessage = "Please ask your query: ";
        users[currentUser].push({ type: 'you', sender: 'chatbot', text: promptMessage, count: ++messageYou, time: `${currentTime}, Today` });
        renderMessages();
    }

    // Handle user's response to the second question
    function handleSecondQuestionResponse(answer) {
        let currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        users[currentUser].push({ type: 'me', sender: 'user', text: answer, time: `${currentTime}, Today` });
        renderMessages();

        // Check if user wants to continue or end the chat
        setTimeout(() => {
            askEndChatPrompt();
        }, 500); // Delay to mimic chatbot response time
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const dropdown = document.querySelector('.dropdown');
    const dropbtn = dropdown.querySelector('.dropbtn');
    const dropdownContent = dropdown.querySelector('.dropdown-content');

    dropbtn.addEventListener('click', function(event) {
        event.stopPropagation(); // Prevent the event from bubbling up to the document
        dropdown.classList.toggle('clicked');
    });

    document.addEventListener('click', function(event) {
        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove('clicked');
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var loginButton = document.getElementById('loginButton');
    loginButton.addEventListener('click', validateLogin);
});

function validateLogin() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    // Example validation
    if (username === 'admin' && password === 'admin123') {
        // If validation passes, navigate to chat.html
        window.location.href = 'chat.html';
    } else {
        // If validation fails, show an alert
        alert('Invalid username or password');
    }
}