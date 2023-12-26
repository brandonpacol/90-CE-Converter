const APIController = (function() {
    
    // private methods
    const _getPlaylists = async () => {
        const result = await fetch('/getPlaylists');
        if (result.ok) {
            const data = await result.json();
            result.data = data;
        }
        return result;
    }

    const _getUser = async () => {
        const result = await fetch('/getMe');
        if (result.ok) {
            const data = await result.json();
            result.data = data;
        }
        return result;
    }

    const _createPlaylist = async (playlistName, percentageString) => {

        const result = await fetch('/createPlaylist', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name : playlistName + percentageString,
                description : 'Created with 90% Clean Converter',
                public : true
            })
        });

        if (result.ok) {
            const data = await result.json();
            console.log('SUCCESSFULLY CREATED PLAYLIST WITH ID: ' + data.id);
            result.data = data;
        }
        return result;

    }

    const _getSongs = async (playlistId) => {

        const result = await fetch('/getSongs', {
            method: "POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              playlistId : playlistId
            })});

        if (result.ok) {
            const data = await result.json();
            result.data = data;
        }
        return result;

    }

    const _searchSong = async (artist, track) => {
        search_string = artist + ' ' + track;
        query = encodeURIComponent(search_string.slice(0,100));

        const result = await fetch('/searchTrack', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                artist : artist,
                track : track
            })
        });

        if (result.ok) {
            const data = await result.json();
            result.data = data;
        }

        return result;

    }

    const _addSongsToPlaylist = async (playlistId, uris_to_add) => {

        const result = await fetch('/addToPlaylist', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                playlistId : playlistId,
                uris : uris_to_add
            })
        });

        console.log('SUCCESSFULLY ADDED SONGS TO PLAYLIST');

        return result;

    }

    const _logout = () => {
        fetch('/logout');
    }

    return {
        getPlaylists() {
            return _getPlaylists();
        },
        createPlaylist(name, percentageString) {
            return _createPlaylist(name, percentageString);
        },
        getSongs(playlistId) {
            return _getSongs(playlistId)
        },
        searchSong(artist, track) {
            return _searchSong(artist, track);
        },
        addSongsToPlaylist(playlistId, uris_to_add) {
            return _addSongsToPlaylist(playlistId, uris_to_add);
        },
        getUser() {
            return _getUser();
        },
        logout() {
            return _logout();
        }
    }
})();


// UI Module
const UIController = (function() {

    //object to hold references to html selectors
    const DOMElements = {
        divPlaylistList: '#playlist-list',
        divPlaylistDetail: '.playlist',
        selectedPlaylistText: '#selected-playlist-text',
        playlistName: '.playlist-name',
        welcomeUser: '#welcome-user',
        convertButton: '#convert-button',
        loadingBar: '#loading-bar',
        loadingBarDiv: '#loading-bar-div',
        keepExplicit: '#keep-explicit',
        logoutButton: '#logout-button',
        errorModal: '#error-modal',
        errorModalLabel: '#error-modal-label',
        loadingPage: '#loading-page',
        loggedInDiv: '#logged-in',
    }

    //public methods
    return {
        //method to get input fields
        inputField() {
            return {
                playlists: document.querySelector(DOMElements.divPlaylistList),
                convertButton: document.querySelector(DOMElements.convertButton),
                logoutButton: document.querySelector(DOMElements.logoutButton),
                errorModal: document.querySelector(DOMElements.errorModal),
            }
        },

        // need method to create a playlist list group item 
        createPlaylist(img, title, id , position) {
            const html = `
            <a href="#" id=p${id} class="playlist list-group-item list-group-item-action">
                <h5 class='playlist-name'>${title}</h5>
            </a>
            `;
            document.querySelector(DOMElements.divPlaylistList).insertAdjacentHTML(position, html);
        },

        getPlaylistImage(playlist_id) {
            return document.querySelector('#'+playlist_id).getElementsByTagName('img')[0].src;
        },

        editSelectedPlaylistText(text) {
            document.querySelector(DOMElements.selectedPlaylistText).textContent = text;
        },

        disableConvertButton() {
            document.querySelector(DOMElements.convertButton).disabled = true;
            document.querySelector(DOMElements.convertButton).innerHTML = 'Converting <div class="spinner-border spinner-border-sm" role="status"></div>';
        },

        enableConvertButton() {
            document.querySelector(DOMElements.convertButton).disabled = false;
            document.querySelector(DOMElements.convertButton).textContent = 'Convert';
        },

        editWelcomeUser(name) {
            document.querySelector(DOMElements.welcomeUser).textContent = 'Welcome, ' + name + '!';
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
            document.querySelector(DOMElements.loadingBarDiv).classList.remove("invisible");
        },

        hideLoadingBar() {
            document.querySelector(DOMElements.loadingBarDiv).classList.add("invisible");
        },

        setModalLabel(text) {
            document.querySelector(DOMElements.errorModalLabel).textContent = text;
        },

        setHomePage(success) {
            document.querySelector(DOMElements.loadingPage).classList.add('d-none');
            if (success) document.querySelector(DOMElements.loggedInDiv).classList.remove('d-none');
        }
    }

})();

const APPController = (function(UICtrl, APICtrl) {

    // holds the currently selected playlist
    let selectedPlaylistId = "";

    // get input field object ref
    const DOMInputs = UICtrl.inputField();

    // used to hide/show the error modal
    const errorModal = new bootstrap.Modal(DOMInputs.errorModal);

    // get playlists on page load
    const loadInitialPage = async () => {

        let success = false;

        // gets user
        const userResult = await APICtrl.getUser();
        if (userResult.ok) {

            const user = userResult.data;
            UICtrl.editWelcomeUser(user.display_name);
    
            //get the playlists
            const playlistResult = await APICtrl.getPlaylists();
            if (playlistResult.ok) {
                const playlists = playlistResult.data;

                //populate our playlist list
                playlists.forEach(element => {
                    if (element.images.length > 0) {
                        UICtrl.createPlaylist(element.images[0].url, element.name, element.id, 'beforeend');
                    } else {
                        UICtrl.createPlaylist('https://community.spotify.com/t5/image/serverpage/image-id/25294i2836BD1C1A31BDF2?v=v2', element.name, element.id, 'beforeend');
                    }
                });

                success = true;

            } else {
                UICtrl.setModalLabel("Could not retrieve user's playlists. Please log out and try again.")
                errorModal.show();
            }

        } else {
            UICtrl.setModalLabel("Could not retrieve user's info. Please log out and try again.")
            errorModal.show();
        }

        UICtrl.setHomePage(success);
    }

    // select playlist
    DOMInputs.playlists.addEventListener('click', (e) => {
        e.preventDefault();
        let playlistEndpoint = e.target.closest('.playlist').id;
        let playlistName = UICtrl.getPlaylistName(playlistEndpoint);
        playlistEndpoint = playlistEndpoint.slice(1);
        selectedPlaylistId = playlistEndpoint;
        UICtrl.editSelectedPlaylistText(`"${playlistName}" is selected.`);
    });

    // logout button
    DOMInputs.logoutButton.addEventListener('click', () => {
        APICtrl.logout();
    });

    // logout when closing
    window.addEventListener('beforeunload', () => {
        APICtrl.logout();
    });

    // convert button
    DOMInputs.convertButton.addEventListener('click', async () => {      

        UICtrl.disableConvertButton();
        UICtrl.showLoadingBar();
        let playlistName = UICtrl.getPlaylistName(`p${selectedPlaylistId}`);
        UICtrl.editSelectedPlaylistText(`"${playlistName}" is converting.`);

        let keepExplicit = !(UICtrl.getExplicit());
        let percentageString = '';
        if (keepExplicit) {
            percentageString = ' (90% Clean)'
        } else {
            percentageString = ' (100% Clean)'
        }
        
        // get songs from selected playlist
        const songsResult = await APICtrl.getSongs(selectedPlaylistId);
        if (songsResult.ok) {

            let search_keywords = [];
            const songs = songsResult.data;

            songs.forEach(element => search_keywords.push({
                artist: element.track.artists[0].name,
                track: element.track.name,
                explicit: element.track.explicit,
                uri: element.track.uri,
                id: element.track.id
            }));

            // if songs are explicit, search for clean song
            let uris_to_add = [];
            for (let i = 0; i < search_keywords.length; i++) {
                //console.log('Searching for song ' + (i + 1));
                if (search_keywords[i].explicit) {
                    let found = false;
                    const searchResults = await APICtrl.searchSong(search_keywords[i].artist, search_keywords[i].track, search_keywords[i].uri);

                    if (searchResults.ok) {
                        const search_results = searchResults.data;
                        for (let j = 0; j < search_results.length; j++) {
                            //console.log('Searching for a clean version of ' + search_keywords[i].track + '...');
                            if (!search_results[j].explicit && search_keywords[i].artist == search_results[j].artists[0].name) {
                                //console.log('Clean version of ' + search_keywords[i].track + ' added!');
                                uris_to_add.push(search_results[j].uri);
                                found = true;
                                break;
                            }
                        }
                        if (!found && keepExplicit) {
                            //console.log('No clean version found, added explicit version of ' + search_keywords[i].track + '.');
                            uris_to_add.push(search_keywords[i].uri);
                        }
                    } else {
                        console.error("Error searching track: ", search_keywords[i].track);
                    }

                } else {
                    uris_to_add.push(search_keywords[i].uri);
                }

                UICtrl.updateLoadingBar((i / search_keywords.length) * 100);
            }

            // create new playlist bassed on selected playlist name
            const newPlaylistResult = await APICtrl.createPlaylist(playlistName, percentageString);
            if (newPlaylistResult.ok) {

                const newPlaylist = newPlaylistResult.data;
                // add songs to created playlist
                let total_songs = uris_to_add.length;
                for (let i = 0; i < uris_to_add.length; i += 100) {
                    if (total_songs > 100) {
                        await APICtrl.addSongsToPlaylist(newPlaylist.id, uris_to_add.slice(i, i + 99));
                        total_songs = total_songs - 100;
                    } else {
                        await APICtrl.addSongsToPlaylist(newPlaylist.id, uris_to_add.slice(i, i + total_songs));
                    }
                }

                // let playlistImage = UICtrl.getPlaylistImage('p' + localStorage.getItem('selected_playlist_id'));
                let playlistImage = null;
                UICtrl.createPlaylist(playlistImage, newPlaylist.name, newPlaylist.id, 'afterbegin')
                UICtrl.editSelectedPlaylistText(`"${playlistName}" has been converted.`);

            } else {
                UICtrl.setModalLabel("Could not create new playlist. Please try converting again.");
                errorModal.show();
            }

        } else {
            UICtrl.setModalLabel("Could not retrieve songs from playlist. Please try converting again.");
            errorModal.show();
        }

        UICtrl.hideLoadingBar();
        UICtrl.updateLoadingBar(0);
        UICtrl.enableConvertButton();
        UICtrl.editSelectedPlaylistText(`"${playlistName}" is selected.`);
    });

    return {
        init() {
            loadInitialPage();
        }
    }

})(UIController, APIController);

APPController.init();