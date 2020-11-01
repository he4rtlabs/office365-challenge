import React, { createContext, useContext, useEffect, useState } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import msalConfig from '../config.js';

import { getUserDetails }from '../graph.js';


const AuthContext = createContext({});

// const msalRequest = {
//     scopes: ["user.read", "mail.send"] // optional Array<string>
// }

export const AuthProvider = ({children}) => {

    const publicClientApplication = new PublicClientApplication(msalConfig);

    const [user, setUser] = useState(null);
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function loadStorageData() {

            const userData = sessionStorage.getItem('msalAccount');
            console.log("userData " + userData);
            if (userData) {
              setUser({user: {
                name: userData.user.name,
                email: userData.user.email,
              } ,token: userData.token});
              setError(
                  { message: "Access token:", debug: userData }
              );
            }

            
            // If MSAL already has an account, the user
            // is already logged in
            // const accounts = publicClientApplication.getAllAccounts();
            
            // if (accounts && accounts.length > 0) {
            //     // Enhance user object with data from Graph
            //     getUserProfile();
            // }

            setLoading(false);
        }
        
        loadStorageData();
    }, []);

    async function signIn() {
        // Vamos fazer um try catch para capturarmos algum erro que possa acontecer
        try {
            // Fazendo a requisição através de um Pop-up
            await publicClientApplication.loginPopup({scopes: msalConfig.scopes});
        
            // Pegando os dados de usuário com o Graph
            await getUserProfile();

        }catch(err) {
            setUser({});
            setError(
                { message: normalizeError(err) }
            );
        }

    }

    async function signOut() {
        // Vamos remover o usuário do sessionStorage
        sessionStorage.removeItem('graphUser');

        setUser(null);
        
        // Vamos fazer a comunicação para o client que estamos fazendo signOut
        (await publicClientApplication).logout();
    }

    if(loading){
        return (
            <h1>
                loading...
            </h1>

        )
    }

    const getUserProfile = async () => {
        try {
          var accessToken = await getAccessToken(msalConfig.scopes);
  
          if (accessToken) {
            // TEMPORARY: Display the token in the error flash
            var userDetails = await getUserDetails(accessToken);
            console.log("userDetails " + userDetails);
            const userWholeData = {user: {
              name: userDetails.displayName,
              email: userDetails.mail,
            } ,token: accessToken};

            setUser(userWholeData);
            
            sessionStorage.setItem('msalAccount', JSON.stringify(userWholeData));
          
          }
        }
        catch(err) {
            console.error(err);
            setUser({});
            setError(
                { message: normalizeError(err) }
            );
        }
      }

    const getAccessToken = async (scopes) => {
        try {
          const accounts = await publicClientApplication
            .getAllAccounts();
  
          if (accounts.length <= 0) throw new Error('login_required');
          // Get the access token silently
          // If the cache contains a non-expired token, this function
          // will just return the cached token. Otherwise, it will
          // make a request to the Azure OAuth endpoint to get a token
          var silentResult = await publicClientApplication
              .acquireTokenSilent({
                scopes: scopes,
                account: accounts[0]
              });
  
          return silentResult.accessToken;

        } catch (err) {
          // If a silent request fails, it may be because the user needs
          // to login or grant consent to one or more of the requested scopes
          if (isInteractionRequired(err)) {
            var interactiveResult = await publicClientApplication
                .acquireTokenPopup({
                  scopes: scopes
                });
  
            return interactiveResult.accessToken;

          } else {
            throw err;
          }
        }
    }

    const isInteractionRequired = (err) => {
        if (    err.message || err.message.length <= 0) {
          return false;
        }
  
        return (
            err.message.indexOf('consent_required') > -1 ||
            err.message.indexOf('interaction_required') > -1 ||
            err.message.indexOf('login_required') > -1 ||
            err.message.indexOf('no_account_in_silent_request') > -1
        );
    }

    const normalizeError = (err) => {
        var normalizedError = {};
        if (typeof(err) === 'string') {
          var errParts = err.split('|');
          normalizedError = errParts.length > 1 ?
            { message: errParts[1], debug: errParts[0] } :
            { message: err };
        } else {
          normalizedError = {
            message: err.message,
            debug: JSON.stringify(err)
          };
        }
        return normalizedError;
      }


    return (
        <AuthContext.Provider value={{signed: !!user, user, loading, error , signIn, signOut}}> 
            {children}
        </AuthContext.Provider>
    )

}

export function useAuth(){
    const context = useContext(AuthContext);

    return context;
}

// export async function getToken(){
//     const msalClient = await publicClientApplication(msalConfig);

//     // Vamos procurar o resultado da autenticação que fizemos lá em cima com a autenticação.
//     const account = sessionStorage.getItem('msalAccount');
  
//     // Caso ele não encontre a conta um erro será disparado, pedindo para refazer o login.
//     if (!account){
//       throw new Error(
//         'Conta de usuário ausente na sessão. Saia e faça login novamente.');
//     }
  
//     // Vamos iniciar com try catch para capturarmos erros de requisição
//     try {
//       // Aqui vamos a primeira tentativa para obter o token passando o nome de usuário e o escopo 
//       const silentRequest = {
//         scopes: msalConfig.scopes,
//         account: msalClient.getAccountByUsername(account)
//       };
  
//       // Adicionando o resultado do token a uma constante
//       const silentResult = await msalClient.acquireTokenSilent(silentRequest);
//       return silentResult.accessToken;

//     } catch (silentError) {
//       // Na parte do try estamos tentando fazer requisições de uma forma silenciosa caso elas falhem vamos tentar fazer de forma interativa.
//       if (silentError instanceof window.msal.InteractionRequiredAuthError) {
//         const interactiveResult = await msalClient.acquireTokenPopup(msalRequest);
//         return interactiveResult.accessToken;
//       } else {
//         // Caso falhe de novo ele vai retorna um erro
//         throw silentError;
//       }
//     }
//   }