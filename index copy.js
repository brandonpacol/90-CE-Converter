const APIController = (function() {
    
    const clientId = '40aac490b1dc47ac8d817e0b2408e340';
    const clientSecret = '3fc161b75f9b4f1c9cde7c3ddb0af2c2';
    const redirectUri = 'http://127.0.0.1:5500/index.html';

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

    const _getToken2 = async (code) => {
        return await code;
    }

    const _getPlaylists = async (token) => {

        const limit = 10;
        
        const result = await fetch(`https://api.spotify.com/v1/users/brandonkai/playlists`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.items;
    }

    return {
        getToken() {
            return _getToken();
        },
        getToken2() {
            return _getToken2(code);
        },
        getPlaylists(token) {
            return _getPlaylists(token);
        }
    }
})();


// UI Module
const UIController = (function() {

    //object to hold references to html selectors
    const DOMElements = {
        hfToken: '#hidden_token',
        divPlaylistList: '.playlist-list',
        divPlaylistDetail: '.playlist' 
    }

    //public methods
    return {
        //method to get input fields
        inputField() {
            return {
                playlistList: document.querySelector(DOMElements.divPlaylistList),
                login: document.querySelector(DOMElements.loginButton)
            }
        },

        // need method to create a playlist list group item 
        createPlaylist(img, title, id) {
            const html = `
            <div class="row mb-2 playlist">
                <div class="col-sm-4 d-flex justify-content-center" id="${id}">
                    <img src="${img}" class="playlist-thumbnail rounded" alt="...">
                </div>
                <div class="col-sm-8 text-center my-auto">
                    <h5>${title}</h5>
                </div>
            </div>
            `;
            document.querySelector(DOMElements.divPlaylistList).insertAdjacentHTML('beforeend', html);
        },
        
        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        }
    }

})();

const APPController = (function(UICtrl, APICtrl) {

    // get input field object ref
    const DOMInputs = UICtrl.inputField();

    // get playlists on page load
    const loadPlaylists = async () => {
        //get the token
        const token = await APICtrl.getToken();
        // const token = localStorage.getItem('access_token');
        //store the token onto the page
        UICtrl.storeToken(token);
        //get the genres
        const playlists = await APICtrl.getPlaylists(token);
        //populate our genres select element
        playlists.forEach(element => UICtrl.createPlaylist(element.images[0].url, element.name, element.id));
    } 

    const handleRedirect = async () => {
        const code = await getCode();
        console.log(code);
        const token = await APICtrl.getToken2(code);
        console.log(token);
    }

    const getCode = async () => {
        let code = null;
        const queryString = window.location.search;
        if (queryString.length > 0) {
            const urlParams = new URLSearchParams(queryString);
            code = urlParams.get('code')
        }
        return code;
    }

    return {
        init() {
            // access_token = localStorage.getItem('access_token')
            // if (access_token == null) {
            //     window.location.replace("login.html");
            // } else {
            //     console.log('App is starting');
            //     loadPlaylists();
            // }
            if (window.location.search.length > 0) {
                handleRedirect();
            }
            console.log('App is starting');
            loadPlaylists();
        }
    }

})(UIController, APIController);

// will need to call a method to load the genres on page load
APPController.init();




