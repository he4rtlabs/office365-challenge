const authProvider = {
  getAccessToken: async () => {
    return await getToken();
  }
};

const graphClient = MicrosoftGraph.Client.initWithMiddleware({authProvider});

// Pegando os dados do usuário

async function getUser() {
  return await graphClient
    .api('/me')
    .select('id,displayName,mail,userPrincipalName,mailboxSettings,mailRead')
    .get();
}

// Listagem de emails e setando no html

async function getEvents() {
  try {
    let response = await graphClient
      .api('/me/messages')
      .get();

    let emails = document.querySelector('.emails');
    response.value.map(email => {
      emails.innerHTML += `<br>- <strong>Assunto:</strong> ${email.subject} <br> - <strong>Descrição:</strong> ${email.bodyPreview} <br> - <strong>Lido?</strong> ${email.isRead ? 'sim :)' : 'não :('} <br> ---------`;
    })


    updatePage(Views.calendar, response.value);
  } catch (error) {
    console.log(error)
    updatePage(Views.error, {
      message: 'Error getting events',
      debug: error
    });
  }
}
