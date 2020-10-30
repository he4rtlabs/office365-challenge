const msalConfig = {
  auth: {
    clientId: 'APP__ID',
    redirectUri: 'http://localhost:5500'
  },
  cache: {
    cacheLocation: 'localStorage'
  }
};

const msalRequest = {
  scopes: [
    'user.read',
    'mailboxsettings.read',
    'Mail.Read'
  ]
}
