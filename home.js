const APIController = (function() {
    
    const clientId = '40aac490b1dc47ac8d817e0b2408e340';
    const clientSecret = '3fc161b75f9b4f1c9cde7c3ddb0af2c2';
    const redirectUri = 'http://127.0.0.1:5500/home.html';

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
            '&redirect_uri=' + encodeURI('http://127.0.0.1:5500/home.html')
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
        localStorage.setItem('access_token', data.access_token);
        return data.access_token;
    }

    const _getPlaylists = async (token) => {
        
        const result = await fetch(`https://api.spotify.com/v1/me/playlists`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        playlists = data.items;
        if (data.next == null) {
            return playlists;
        } else {
            concatPlaylist = playlists.concat(await _getMorePlaylists(token, data.next));
            return concatPlaylist;
        }
    }

    const _getMorePlaylists = async (token, apiCall) => {

        console.log('ran get more playlists')
        const result = await fetch(`${apiCall}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        playlists = data.items;
        if (data.next == null) {
            return playlists;
        } else {
            concatPlaylist = playlists.concat(await _getMorePlaylists(token, data.next));
            return concatPlaylist;
        }

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

    const _getSongs = async (token, playlistId) => {

        const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token }
        });

        const data = await result.json();
        playlists = data.items;
        if (data.next == null) {
            return playlists;
        } else {
            concatPlaylist = playlists.concat(await _getMorePlaylists(token, data.next));
            return concatPlaylist;
        }

    }

    const _searchSong = async (token, artist, track, uri) => {
        search_string = artist + ' ' + track;
        query = encodeURIComponent(search_string.slice(0,100));

        const result = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=5`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token }
        });

        const data = await result.json();
        return data.tracks.items;

    }

    const _addSongsToPlaylist = async (token, playlistId, uris_to_add) => {

        const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'POST',
            headers: { 
                'Authorization' : 'Bearer ' + token
            },
            body: JSON.stringify({
                uris : uris_to_add
            })
        });

        console.log('SUCCESSFULLY ADDED SONGS TO PLAYLIST');

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
        getSongs(token, playlistId) {
            return _getSongs(token, playlistId)
        },
        searchSong(token, artist, track, uri) {
            return _searchSong(token, artist, track, uri);
        },
        addSongsToPlaylist(token, playlistId, uris_to_add) {
            return _addSongsToPlaylist(token, playlistId, uris_to_add);
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
        loadingBar: '#loading-bar',
        loadingBarDiv: '#loading-bar-div',
        keepExplicit: '#keep-explicit',
        logoutButton: '#logout-button'
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
                convertButton: document.querySelector(DOMElements.convertButton),
                loadingBar: document.querySelector(DOMElements.loadingBar),
                loadingBarDiv: document.querySelector(DOMElements.loadingBarDiv),
                keepExplicit: document.querySelector(DOMElements.keepExplicit),
                logoutButton: document.querySelector(DOMElements.logoutButton)
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

        editIsConvertingText(name) {
            document.querySelector(DOMElements.selectedPlaylistText).innerHTML = '"' + name + '" is converting.';
        },

        editHasBeenConvertedText(name) {
            document.querySelector(DOMElements.selectedPlaylistText).innerHTML = '"' + name + '" has been converted.';
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

        getExplicit() {
            return document.querySelector(DOMElements.keepExplicit).checked;
        },

        updateLoadingBar(percent) {
            document.querySelector(DOMElements.loadingBar).style = 'width: ' + percent + '%';
        },

        showLoadingBar() {
            document.querySelector(DOMElements.loadingBarDiv).style = '';
        },

        hideLoadingBar() {
            document.querySelector(DOMElements.loadingBarDiv).style = 'display : none;';
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
        token = 'blank token';
        code = 'blank code';
        // if (localStorage.getItem('access_token') == 'undefined') {
        //     // gets auth code
        //     const code = await getCode();
        //     //get the access token from auth code
        //     token = await APICtrl.getToken2(code);
        //     //store the token onto the page
        //     UICtrl.storeToken(token);
        // } else {
        //     token = localStorage.getItem('access_token');
        //     UICtrl.storeToken(token);
        // }

        if (localStorage.getItem('auth_code') == 'undefined') {
            console.log('ran if auth code');
            code = await getCode();
            window.history.pushState("", "", 'http://127.0.0.1:5500/home.html'); // remove param from url
        } else {
            console.log('ran else auth code')
            code = localStorage.getItem('auth_code');
        }

        if (localStorage.getItem('access_token') == 'undefined') {
            console.log('ran if token');
            token = await APICtrl.getToken2(code);
            UICtrl.storeToken(token);
        } else {
            console.log('ran else token');
            token = localStorage.getItem('access_token');
            UICtrl.storeToken(token);
        }

        // gets user
        const user = await APICtrl.getUser(token);
        // changes welcome username
        UICtrl.editWelcomeUser(user.display_name);

        //get the playlists
        const playlists = await APICtrl.getPlaylists(token);
        console.log(playlists);
        //populate our playlist list
        playlists.forEach(element => {
            if (element.images.length > 0) {
                UICtrl.createPlaylist(element.images[0].url, element.name, element.id);
            } else {
                UICtrl.createPlaylist('https://community.spotify.com/t5/image/serverpage/image-id/25294i2836BD1C1A31BDF2?v=v2', element.name, element.id);
            }
        });
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
        localStorage.setItem('auth_code', code);
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

    //logout button
    DOMInputs.logoutButton.addEventListener('click', async () => {
        localStorage.setItem('access_token', 'undefined');
        localStorage.setItem('auth_code', 'undefined');
        window.location.replace("index.html");
    })

    // convert button
    DOMInputs.convertButton.addEventListener('click', async () => {
        UICtrl.disableConvertButton();
        UICtrl.showLoadingBar();

        // get token
        token = UICtrl.getStoredToken().token;

        playlistName = UICtrl.getPlaylistName('p' + localStorage.getItem('selected_playlist_id'));
        UICtrl.editIsConvertingText(playlistName);        

        // // create new playlist bassed on selected playlist name
        playlistId = localStorage.getItem('selected_playlist_id');
        playlistName = UICtrl.getPlaylistName('p' + playlistId);
        const newPlaylist = await APICtrl.createPlaylist(token, playlistName);

        // get songs from selected playlist
        search_keywords = [];
        const songs = await APICtrl.getSongs(token, playlistId);
        songs.forEach(element => search_keywords.push({
            artist : element.track.artists[0].name, 
            track : element.track.name, 
            explicit : element.track.explicit,
            uri : element.track.uri,
            id : element.track.id}));
        console.log(search_keywords);

        // if songs are explicit, search for clean song
        let keepExplicit = UICtrl.getExplicit();
        let uris_to_add = [];
        for (let i = 0; i < search_keywords.length; i++) {
            console.log('Searching for song '+ (i+1));
            if (search_keywords[i].explicit) {
                let found = false;
                const search_results = await APICtrl.searchSong(token, search_keywords[i].artist, search_keywords[i].track, search_keywords[i].uri);
                for (let j = 0; j < search_results.length; j++) {
                    console.log('Searching for a clean version of ' + search_keywords[i].track + '...');
                    if (!search_results[j].explicit && search_keywords[i].artist == search_results[j].artists[0].name) {
                        console.log('Clean version of ' + search_keywords[i].track + ' added!');
                        uris_to_add.push(search_results[j].uri);
                        found = true;
                        break;
                    }
                }
                if (!found && keepExplicit) {
                    console.log('No clean version found, added explicit version of ' + search_keywords[i].track + '.');
                    uris_to_add.push(search_keywords[i].uri);
                }
            } else {
                uris_to_add.push(search_keywords[i].uri);
            }
            UICtrl.updateLoadingBar((i/search_keywords.length)*100);
        }
        console.log(uris_to_add);

        // add songs to created playlist
        let total_songs = uris_to_add.length;
        for (let i = 0; i < uris_to_add.length; i+=100) {
            if (total_songs > 100) {
                await APICtrl.addSongsToPlaylist(token, newPlaylist.id, uris_to_add.slice(i, i+99));
                total_songs = total_songs-100;
            } else {
                await APICtrl.addSongsToPlaylist(token, newPlaylist.id, uris_to_add.slice(i, i+total_songs));
            }
        }

        // await new Promise(resolve => setTimeout(resolve, 1000));
        UICtrl.editHasBeenConvertedText(playlistName);
        UICtrl.hideLoadingBar();
        UICtrl.updateLoadingBar(0);
        UICtrl.enableConvertButton();
    })

    return {
        init() {
            // access_token = localStorage.getItem('access_token')
            // if (access_token == null) {
            //     window.location.replace("login.html");
            // } else {
            //     console.log('App is starting');
            //     loadPlaylists();
            // }
            // if (window.location.search.length > 0) {
            //     loadInitialPage();
            // }
            // if (localStorage.getItem('access_token') != 'undefined') {
            //     loadInitialPage();
            //     // window.history.pushState("", "", 'http://127.0.0.1:5500/home.html'); // remove param from url
            // }
            loadInitialPage();
            console.log('App is starting');
        }
    }

})(UIController, APIController);

// will need to call a method to load the genres on page load
APPController.init();