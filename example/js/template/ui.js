const authenticatedNav = document.getElementById('authenticated-nav');
const accountNav = document.getElementById('account-nav');
const mainContainer = document.getElementById('main-container');

const Views = { error: 1, home: 2 };

function createElement(type, className, text) {
  let element = document.createElement(type);
  element.className = className;

  if (text) {
    let textNode = document.createTextNode(text);
    element.appendChild(textNode);
  }

  return element;
}

function showWelcomeMessage(user) {
  let jumbotron = createElement('div', 'jumbotron');

  if (user) {
    let welcomeMessage = createElement('h4', null, `Salve ${user.displayName} - ${user.userPrincipalName}!`);
    jumbotron.appendChild(welcomeMessage);

    let emailsTitle = createElement('h1', 'emailsTitle', `Emails:`);
    jumbotron.appendChild(emailsTitle);

    let emails = createElement('div', 'emails', null);
    jumbotron.appendChild(emails);

    let cancelButton = createElement('button', 'btn btn-secondary', 'Atualizar emails');
    cancelButton.setAttribute('type', 'button');
    cancelButton.setAttribute('onclick', 'getEvents();');
    jumbotron.appendChild(cancelButton);

    let signOutButton = createElement('button', 'dropdown-item', 'Sair');
    signOutButton.setAttribute('onclick', 'signOut();');
    jumbotron.appendChild(signOutButton)
  } else {
    let signInButton = createElement('button', 'btn btn-primary btn-large',
      'Clique aqui para entrar');
    signInButton.setAttribute('onclick', 'signIn();')
    jumbotron.appendChild(signInButton);
  }

  mainContainer.innerHTML = '';
  mainContainer.appendChild(jumbotron);
}

function showError(error) {
  console.error(error)
  alert('error ' + error.message)

  if (error.debug)
  {
    console.error(JSON.stringify(error.debug, null, 2))
  }
}

function updatePage(view, data) {
  if (!view) {
    view = Views.home;
  }

  const user = JSON.parse(sessionStorage.getItem('graphUser'));

  switch (view) {
    case Views.error:
      showError(data);
      break;
    case Views.home:
      showWelcomeMessage(user);
      break;
  }
}

updatePage(Views.home);
