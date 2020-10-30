# Consumir OAuth2 com Microsoft Graph

### O que é OAuth2 ? 

Bom basicamente OAuth 2 é um protocolo de autorização que permite que uma aplicação se autentique em outra. Para que isso aconteça, uma aplicação pede permissão de acesso para um usuário, sem que para isso ela tenha acesso a alguma senha dele.

### Crie o aplicativo no Azure


### Instalando dependências

Crie um arquivo `index.html` nele adicione esses dois scripts:

```html
<!-- MSAL -->
<script src="https://alcdn.msauth.net/browser/2.1.0/js/msal-browser.min.js"
        integrity="sha384-EmYPwkfj+VVmL1brMS1h6jUztl4QMS8Qq8xlZNgIT/luzg7MAzDVrRa2JxbNmk/e"
        crossorigin="anonymous"></script>
  
<!-- Graph SDK -->
<script src="https://cdn.jsdelivr.net/npm/@microsoft/microsoft-graph-client/lib/graph-js-sdk.js"></script>  
```

#### MSAL

A biblioteca MSAL foi criada pela Microsoft para fazermos a autenticação com sua base de usuários.

#### Graph SDK

O Graph SDK foi criado para consumirmos os dados do Office como por exemplo:

* Sua lista de emails
* Seu calendário

### Configuração de autenticação

Crie um arquivo `config.js` para que possamos configurar algumas coisas. Dentro desse arquivo adicione:

```js
const msalConfig = {
  auth: {
    clientId: 'YOUR_APP_ID_HERE',
    redirectUri: 'http://localhost:8080'
  }
};
```

Onde o msalConfig é um objeto onde contém o clientId e o redirectUri.

* cliendId você configurou quando criou o aplicativo na azure.
* redirectUri é para onde você quer que o usuário seja redirecionado após concluir a autenticação.

Crie um novo arquivo `auth.js` onde vamos instanciar o MSAL então nesse arquivo adicione: 

```js
const msalClient = new msal.PublicClientApplication(msalConfig);
```

No mesmo arquivo crie a função de signIn e signOut

#### SignIn

```js
async function signIn() {
  // Vamos fazer um try catch para capturarmos algum erro que possa acontecer
  try {
    // Fazendo a requisição através de um Pop-up
    const authResult = await msalClient.loginPopup(msalRequest);
  
    // Vamos salvar o resultado da autenticação no sessionStorage 
    sessionStorage.setItem('msalAccount', authResult.account.username);

    // Pegando os dados de usuário com o Graph
    user = await getUser();

    // Salvando também o resultado do usuário no sessionStorage
    sessionStorage.setItem('graphUser', JSON.stringify(user));
  } catch (error) {
    console.log(error);
  }
}
```

#### SignOut

Vamos adicionar a função para o usuário fazer signOut:

```js
function signOut() {
  // Vamos remover o usuário do sessionStorage
  sessionStorage.removeItem('graphUser');
  
  // Vamos fazer a comunicação para o client que estamos fazendo signOut
  msalClient.logout();
}
```

#### Token

Agora vamos criar uma função para pegarmos o token de usuário com MSAL, então adicione:

```js
async function getToken() {
  // Vamos procurar o resultado da autenticação que fizemos lá em cima com a autenticação.
  const account = sessionStorage.getItem('msalAccount');

  // Caso ele não encontre a conta um erro será disparado, pedindo para refazer o login.
  if (!account){
    throw new Error(
      'Conta de usuário ausente na sessão. Saia e faça login novamente.');
  }

  // Vamos iniciar com try catch para capturarmos erros de requisição
  try {
    // Aqui vamos a primeira tentativa para obter o token passando o nome de usuário e o escopo 
    const silentRequest = {
      scopes: msalRequest.scopes,
      account: msalClient.getAccountByUsername(account)
    };

    // Adicionando o resultado do token a uma constante
    const silentResult = await msalClient.acquireTokenSilent(silentRequest);
    return silentResult.accessToken;
  } catch (silentError) {
    // Na parte do try estamos tentando fazer requisições de uma forma silenciosa caso elas falhem vamos tentar fazer de forma interativa.
    if (silentError instanceof msal.InteractionRequiredAuthError) {
      const interactiveResult = await msalClient.acquireTokenPopup(msalRequest);
      return interactiveResult.accessToken;
    } else {
      // Caso falhe de novo ele vai retorna um erro
      throw silentError;
    }
  }
}
```

#### AuthProvider

Agora vamos criar um novo arquivo chamado `graph.js` para configurarmos o provider de auth. Vamos começar criando uma função:

```js
const authProvider = {
  getAccessToken: async () => {
    // Vamos chamar a função getToken no arquivo auth.js
    return await getToken();
  }
};
```

Agora no mesmo arquivo vamos instanciar o Graph Client:

```js
const graphClient = MicrosoftGraph.Client.initWithMiddleware({authProvider});
```

#### Requisição

Vamos fazer uma requisição para pegarmos os dados do usuário, adicione:

```js
async function getUser() {
  // Chamando o cliente do Graph para fazer a requisição
  return await graphClient
    // Ele vai buscar no endpoint "me"
    .api('/me')
    // Ele irá buscar apenas os campos que pedirmos
    .select('id,displayName,mail,userPrincipalName,mailboxSettings')
    // É um método GET
    .get();
}
```