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
            body: 'grant_type=client_credentials' +
            '&code=AQD-CffBqZZQWmfaEcqJkZ8lvow8Qz_smzZm4VJSC8jOjuWzbYZLwk3ditxeKH_KdffcPyNdivI5gcaJyaShACoXv6HXMulzROeSutOg7LBlW3A0evf44L0P0C8jb4aS_LiwlJda-QvsrEqu2njB7DeyDKaQYF7lBH1YpQSL8DrI_mlsmQxhIb6vdKc4QXwlTHyAR26Au2p6N6MSj7fQsdObu3ghjMj_f-zBcTIsvVBitKz50UecF6Bd1t3VhEL-xD123D5dyPmh4hJbFrU1FhtfRNLZGP8l833uj4WmNPtALjzvOqbc4nk31y-fipdu_oZoW7DheNeR-EwNFG-4wbr8fJdpsoJ8wxMhMNHfYWYebvqrQG8MkCKDrRcZAgV2V_AGV7BFINdatqjgYChT8ks7_mlJ7Mz7cIuz51vIt9cISiKkI4-Yu45wzw' +
            '&redirect_uri=' + encodeURI('http://127.0.0.1:5500/index.html')
        });
        const data = await result.json();
        return data.access_token;
    }

    const _getToken2 = async (code) => {
        body_string = 'grant_type=authorization_code'+
        '&code='+code+
        '&redirect_uri='+encodeURI(redirectUri);

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: body_string
        });

        const data = await result.json();
        return data.access_token;
    }

    const _getPlaylists = async (token) => {

        const limit = 10;
        
        const result = await fetch(`https://api.spotify.com/v1/me/playlists`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.items;
    }

    const _getPlaylist = async (token, playlistId) => {

        const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data;
    }

    const _getUser = async (token) => {

        const result = await fetch(`https://api.spotify.com/v1/me`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data;
    }

    const _createPlaylist = async (token, playlistName) => {

        const result = await fetch(`https://api.spotify.com/v1/me/playlists`, {
            method: 'POST',
            headers: { 
                'Authorization' : 'Bearer ' + token
            },
            body: JSON.stringify({
                name : playlistName + ' (90% Clean)',
                description : 'Created with 90 CE Converter',
                public : false
            })
        });

        const data = await result.json();
        console.log('SUCCESSFULLY CREATED PLAYLIST WITH ID: ' + data.id);
        return data;

    }

    return {
        getToken() {
            return _getToken();
        },
        getToken2(code) {
            return _getToken2(code);
        },
        getPlaylists(token) {
            return _getPlaylists(token);
        },
        getPlaylist(token, playlistId) {
            return _getPlaylist(token, playlistId);
        },
        createPlaylist(token, name) {
            return _createPlaylist(token, name);
        },
        getUser(token) {
            return _getUser(token);
        }
    }
})();


// UI Module
const UIController = (function() {

    //object to hold references to html selectors
    const DOMElements = {
        hfToken: '#hidden_token',
        divPlaylistList: '#playlist-list',
        divPlaylistDetail: '.playlist',
        selectedPlaylistText: '#selected-playlist-text',
        playlistName: '.playlist-name',
        welcomeUser: '#welcome-user',
        convertButton: '#convert-button',
    }

    //public methods
    return {
        //method to get input fields
        inputField() {
            return {
                playlistList: document.querySelector(DOMElements.divPlaylistList),
                login: document.querySelector(DOMElements.loginButton),
                playlists: document.querySelector(DOMElements.divPlaylistList),
                selectedPlaylistText: document.querySelector(DOMElements.selectedPlaylistText),
                playlistName: document.querySelector(DOMElements.playlistName),
                welcomeUser: document.querySelector(DOMElements.welcomeUser),
                convertButton: document.querySelector(DOMElements.convertButton)
            }
        },

        // need method to create a playlist list group item 
        createPlaylist(img, title, id) {
            const html = `
            <div class="row mb-2 playlist"  id="p${id}">
                <div class="col-sm-4 d-flex justify-content-center">
                    <img src="${img}" class="playlist-thumbnail rounded" alt="...">
                </div>
                <div class="col-sm-8 text-center my-auto">
                    <h5 class="playlist-name">${title}</h5>
                </div>
            </div>
            `;
            document.querySelector(DOMElements.divPlaylistList).insertAdjacentHTML('beforeend', html);
        },

        editSelectedPlaylistText(name) {
            document.querySelector(DOMElements.selectedPlaylistText).innerHTML = '"' + name + '" is selected.';
        },

        disableConvertButton() {
            document.querySelector(DOMElements.convertButton).disabled = true;
            document.querySelector(DOMElements.convertButton).innerHTML = 'Converting <div class="spinner-border spinner-border-sm" role="status"></div>';
        },

        enableConvertButton() {
            document.querySelector(DOMElements.convertButton).disabled = false;
            document.querySelector(DOMElements.convertButton).innerHTML = 'Convert';
        },

        editWelcomeUser(name) {
            document.querySelector(DOMElements.welcomeUser).innerHTML = 'Welcome, ' + name + '!';
        },

        getPlaylistName(playlist_id) {
            return document.querySelector('#'+playlist_id).querySelector(DOMElements.playlistName).textContent;
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
    const loadInitialPage = async () => {
        // gets auth code
        const code = await getCode();
        //get the access token from auth code
        const token = await APICtrl.getToken2(code);
        //store the token onto the page
        UICtrl.storeToken(token);

        // gets user
        const user = await APICtrl.getUser(token);
        // changes welcome username
        UICtrl.editWelcomeUser(user.display_name);

        //get the playlists
        const playlists = await APICtrl.getPlaylists(token);
        //populate our playlist list
        playlists.forEach(element => UICtrl.createPlaylist(element.images[0].url, element.name, element.id));
    } 

    // const handleRedirect = async () => {
    //     const code = await getCode();
    //     // console.log(code);
    //     const token = await APICtrl.getToken2(code);
    //     // console.log(token);
    //     localStorage.setItem('access_token', token);
    // }

    const getCode = async () => {
        let code = null;
        const queryString = window.location.search;
        if (queryString.length > 0) {
            const urlParams = new URLSearchParams(queryString);
            code = urlParams.get('code')
        }
        return code;
    }

    // select playlist
    DOMInputs.playlists.addEventListener('click', async (e) => {
        e.preventDefault();
        let playlistEndpoint = null;
        let playlistName = 'No playlist';
        if (e.target.parentElement.parentElement.parentElement.id == 'playlist-list') {
            playlistEndpoint = e.target.parentElement.parentElement.id;
        } else if (e.target.parentElement.parentElement.id == 'playlist-list') {
            playlistEndpoint = e.target.parentElement.id;
        } else if (e.target.parentElement.id == 'playlist-list'){
            playlistEndpoint = e.target.id;
        } else {
            playlistEndpoint = null;
        }

        if (playlistEndpoint != null) {
            // playlistName = await getPlaylistName(playlistEndpoint);
            playlistName = UICtrl.getPlaylistName(playlistEndpoint);
            playlistEndpoint = playlistEndpoint.slice(1);
        }

        console.log("clicked on " + playlistName);
        console.log('playlist id is ' + playlistEndpoint);
        localStorage.setItem('selected_playlist_id', playlistEndpoint);
        UICtrl.editSelectedPlaylistText(playlistName);
    })

    DOMInputs.convertButton.addEventListener('click', async () => {
        UICtrl.disableConvertButton();
        
        // get token
        token = UICtrl.getStoredToken().token;

        // create new playlist bassed on selected playlist name
        playlistId = localStorage.getItem('selected_playlist_id');
        playlistName = UICtrl.getPlaylistName('p' + playlistId);
        APICtrl.createPlaylist(token, playlistName);

        // get songs from selected playlist



        await new Promise(resolve => setTimeout(resolve, 1000));
        UICtrl.enableConvertButton();
    })

    // const getPlaylistName = async (playlistEndpoint) => {
    //     token = UICtrl.getStoredToken().token;
    //     console.log('get playlist name' + token)
    //     const playlist = await APICtrl.getPlaylist(token, playlistEndpoint);
    //     return playlist.name;
    // }

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
                loadInitialPage();
            }
            console.log('App is starting');
        }
    }

})(UIController, APIController);

// will need to call a method to load the genres on page load
APPController.init();