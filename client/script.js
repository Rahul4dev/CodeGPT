import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

function typeText(element, text) {
  let i = 0;
  let interval = setInterval(() => {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueID() {
  const timeStamp = Date.now();
  const randomNumber = Math.random();
  const hexaDecimalString = randomNumber.toString(16);

  return `id-${timeStamp}-${hexaDecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img src="${isAi ? bot : user}" alt="${isAi ? 'bot' : 'user'}"/>
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
    
    `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user's chat Stipe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  // to clear the textarea input
  form.reset();

  // bot's chat Stipe
  const uniqueId = generateUniqueID();
  chatContainer.innerHTML += chatStripe(true, ' ', uniqueId);

  // to focus scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight; // will remain in viewport

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from the server

  const response = await fetch('http://localhost:5000/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt'),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    console.log({ parsedData });

    typeText(messageDiv, parsedData);
  } else {
    const error = await response.text();
    messageDiv.innerHTML = 'Something went wrong';

    alert(error.message);
  }
};

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.code === 13) {
    handleSubmit(e);
  }
});
