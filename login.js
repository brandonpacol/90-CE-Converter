const APIController = (function() {
    
    const clientId = '40aac490b1dc47ac8d817e0b2408e340';
    const clientSecret = '3fc161b75f9b4f1c9cde7c3ddb0af2c2';
    const redirectUri = 'http://127.0.0.1:5500/index.html';
    const AUTHORIZE = "https://accounts.spotify.com/authorize";

    // private methods
    const _getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }

    const _requestAuthorization = async () => {
        let url = AUTHORIZE;
        url += "?client_id=" + clientId;
        url += "&response_type=code";
        url += "&redirect_uri=" + encodeURI(redirectUri);
        url += "&show_dialog=true";
        url += "&scope=user-read-private user-read-email playlist-read-private playlist-modify-public playlist-modify-private";
        return url;
    }

    return {
        getToken() {
            return _getToken();
        },
        requestAuthorization() {
            return _requestAuthorization();
        }
    }
})();


// UI Module
const UIController = (function() {

    //object to hold references to html selectors
    const DOMElements = {
        loginButton: '#btn_login'
    }

    //public methods
    return {
        //method to get input fields
        inputField() {
            return {
                login: document.querySelector(DOMElements.loginButton)
            }
        }
    }

})();

const APPController = (function(UICtrl, APICtrl) {

    // get input field object ref
    const DOMInputs = UICtrl.inputField();

    // create login button click event listener
    DOMInputs.login.addEventListener('click', async (e) => {
        url = await APICtrl.requestAuthorization();
        window.location.href = url;
    });

})(UIController, APIController);