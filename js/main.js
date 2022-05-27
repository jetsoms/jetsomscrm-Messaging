
(function startApp() {


//Backendless: defaults
const APPLICATION_ID = '15CC76F4-8F74-BDE3-FFD7-D458465B9C00';
const API_KEY = '843D1429-070F-4C50-88C7-4B635273EAB4';
Backendless.serverURL = "https://eu-api.backendless.com";
Backendless.initApp(APPLICATION_ID, API_KEY);

if (!APPLICATION_ID || !API_KEY) {
  alert(
    'Missing application ID or api key arguments. ' +
    'Login to Backendless Console, select your app and get the ID and key from the Manage > App Settings screen. ' +
    'Copy/paste the values into the Backendless.initApp call located in jetsomscrm-Messaging.js'
  );
}
    

  var MESSAGES_CHANNEL = 'default';
  var LOCAL_STORAGE_USERNAME_KEY = 'BackendlessChatSample.username';
  var LOCAL_STORAGE_MESSAGES_KEY = 'BackendlessChatSample.messages';
  var HIDDEN_CLASS_NAME = 'd-none';

  var $currentUsername = document.getElementById('current-username');
  var $loginBtn = document.getElementById('login-btn');
  var $logoutBtn = document.getElementById('logout-btn');
  var $usernameInput = document.getElementById('username-input');
  var $rememberMeToggler = document.getElementById('remember-me-toggler');
  var $loginPanel = document.getElementById('login-panel');
  var $chatPanel = document.getElementById('chat-panel');
  var $chatMessages = document.getElementById('chat-messages');
  var $messageInput = document.getElementById('message-input');
  var $sendBtn = document.getElementById('send-btn');
  var $alertsContainer = document.getElementById('alerts-container');

  var channel = Backendless.Messaging.subscribe(MESSAGES_CHANNEL);

  var currentUsername = localStorage.getItem(LOCAL_STORAGE_USERNAME_KEY);
  var messages = getOldMessages();

  $loginBtn.addEventListener('click', login);
  $usernameInput.addEventListener('keypress', onEnter(login));

  $logoutBtn.addEventListener('click', logout);

  $sendBtn.addEventListener('click', sendMessage);
  $messageInput.addEventListener('keypress', onEnter(sendMessage));

  renderApp();

  function login() {
    var username = $usernameInput.value.trim();

    if (username) {
      currentUsername = username;

      if ($rememberMeToggler.checked) {
        localStorage.setItem(LOCAL_STORAGE_USERNAME_KEY, username);
      }

      renderApp();
    }
  }

  function logout() {
    currentUsername = null;
    localStorage.removeItem(LOCAL_STORAGE_USERNAME_KEY);

    renderApp();
  }

  function renderApp() {
    $currentUsername.parentNode.classList.toggle(HIDDEN_CLASS_NAME, !currentUsername);
    $currentUsername.innerText = currentUsername || '';

    $logoutBtn.classList.toggle(HIDDEN_CLASS_NAME, !currentUsername);

    $chatPanel.classList.toggle(HIDDEN_CLASS_NAME, !currentUsername);
    $loginPanel.classList.toggle(HIDDEN_CLASS_NAME, !!currentUsername);

    if (currentUsername) {
      channel.addMessageListener(onMessage);

      renderMessages();

    } else {
      channel.removeMessageListener(onMessage);
    }
  }

  function getOldMessages() {
    const messagesStr = localStorage.getItem(LOCAL_STORAGE_MESSAGES_KEY);

    if (messagesStr) {
      try {
        var messages = JSON.parse(messagesStr);

        if (Array.isArray(messages)) {
          return messages;
        }

      } catch (e) {
        console.log('can not parse messages from LocalStorage');
      }
    }

    return []
  }

  function keepMessages() {
    localStorage.setItem(LOCAL_STORAGE_MESSAGES_KEY, JSON.stringify(messages));
  }

  function sendMessage() {
    var message = $messageInput.value.trim();

    if (message) {
      channel
        .publish('<font color=#cc0029>[' + currentUsername + ']</font>: ' + message)
        .catch(addErrorAlert);

      $messageInput.value = '';
    }
  }

  function onMessage(message) {
    messages.push(message.message);

    keepMessages();
    renderMessages();
  }

  function renderMessages() {
    var messagesText = '';

    messages.forEach(function (message) {
      messagesText = messagesText + '<div class="chat-message">' + message + '</div>'
    });

    $chatMessages.innerHTML = messagesText;
    $chatMessages.scrollTop = $chatMessages.scrollHeight;
  }

  function onEnter(callback) {
    return function onKeyPress(e) {
      if (e.keyCode === 13) {//Enter key
        callback()
      }
    }
  }
  
  function addErrorAlert(message) {
    message = message.message || message;

    console.log('addErrorAlert', message);

    var $item = document.createElement('div');
    $item.innerHTML = '<div class="error-item">' + message + '</div>';

    $alertsContainer.appendChild($item);

    setTimeout(function () {
      $alertsContainer.removeChild($item);
    }, 3000)
  }
})();
                