const APIController = (function() {
    
    const clientId = '***REMOVED***';
    const clientSecret = '***REMOVED***';

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
                playlistList: document.querySelector(DOMElements.divPlaylistList)
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
        //store the token onto the page
        UICtrl.storeToken(token);
        //get the genres
        const playlists = await APICtrl.getPlaylists(token);
        //populate our genres select element
        playlists.forEach(element => UICtrl.createPlaylist(element.images[0].url, element.name, element.id));
    } 

    return {
        init() {
            console.log('App is starting');
            loadPlaylists();
        }
    }

})(UIController, APIController);

// will need to call a method to load the genres on page load
APPController.init();




