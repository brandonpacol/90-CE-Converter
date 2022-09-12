const APIController = (function() {
    
    // const redirectUri = 'http://127.0.0.1:5500/home.html';
    const redirectUri = 'https://brandonpacol.github.io/90-Clean-Converter/home.html';
    const AUTHORIZE = "https://accounts.spotify.com/authorize";

    // private methods
    const _requestAuthorization = async () => {
        let url = AUTHORIZE;
        url += "?client_id=" + document.getElementById('client-id').value;
        url += "&response_type=code";
        url += "&redirect_uri=" + encodeURI(redirectUri);
        url += "&show_dialog=true";
        url += "&scope=playlist-read-private playlist-modify-public playlist-modify-private";
        return url;
    }

    return {
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
        localStorage.setItem('client_id', document.getElementById('client-id').value);
        localStorage.setItem('client_secret', document.getElementById('client-secret').value);
        url = await APICtrl.requestAuthorization();
        window.location.href = url;
    });

    return {
        init() {
            localStorage.setItem('client_id', 'undefined');
            localStorage.setItem('client_secret', 'undefined');
            localStorage.setItem('access_token', 'undefined');
            localStorage.setItem('auth_code', 'undefined')
        }
    }

})(UIController, APIController);

APPController.init();