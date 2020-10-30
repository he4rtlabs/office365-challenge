const msalClient = new msal.PublicClientApplication(msalConfig);

async function signIn() {
  try {
    const authResult = await msalClient.loginPopup(msalRequest);

    sessionStorage.setItem('msalAccount', authResult.account.username);

    user = await getUser();

    sessionStorage.setItem('graphUser', JSON.stringify(user));
    updatePage(Views.home);
  } catch (error) {
    console.log(error);
    updatePage(Views.error, {
      message: 'Error logging in',
      debug: error
    });
  }
}

function signOut() {
  account = null;
  sessionStorage.removeItem('graphUser');
  msalClient.logout();
}

async function getToken() {
  let account = sessionStorage.getItem('msalAccount');
  if (!account){
    throw new Error(
      'User account missing from session. Please sign out and sign in again.');
  }

  try {
    const silentRequest = {
      scopes: msalRequest.scopes,
      account: msalClient.getAccountByUsername(account)
    };

    const silentResult = await msalClient.acquireTokenSilent(silentRequest);
    return silentResult.accessToken;
  } catch (silentError) {
    if (silentError instanceof msal.InteractionRequiredAuthError) {
      const interactiveResult = await msalClient.acquireTokenPopup(msalRequest);
      return interactiveResult.accessToken;
    } else {
      throw silentError;
    }
  }
}
