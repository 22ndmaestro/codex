import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element){
  element.textContent = '';

  loadInterval = setInterval(()=>{
    element.textContent += '.';
    if(element.textContent === '....'){
      element.textContent = '';
    }
  }, 300);
}

function typeText(element,text){
  let index = 0;

  let interval = setInterval(()=>{
    if(index<text.length){
      element.textContent += text.charAt(index);
      index++;
    } else{
      clearInterval(interval);
    }
  },20)
}

function generateUniqueId(){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId){
  return (`
  <div class="wrapper ${isAi && 'ai'}">
    <div class="chat">
      <div class="profile">
        <img
          src="${isAi ? bot : user}"
          alt="${isAi ? 'bot' : 'user'}"
        />
      </div>
      <div class="message" id=${uniqueId}>${value}</div>
    </div>
  </div>
  `)
}

const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  //user's chat Stripe:
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  form.reset();

  //bot's chat stripe:
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, "",uniqueId);

  //keep user message inview;

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  //fetch data from server -> bot's response

  const response = await fetch('https://codex-s4ft.onrender.com',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/jason'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  //clear div because we don't know at what point in the .... loading dots we are in
  messageDiv.innerHTML = '';

  if(response.ok){
    //giving us response from the backend
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv,parsedData);
  }else{
    const err = await response.json();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e)=>{
  if(e.keyCode === 13) {
    handleSubmit(e);
  }
});