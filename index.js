if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 5500;
const url = `${process.env.NODE_ENV === 'production' ? "https" : "http" }://${process.env.HOST_NAME}${process.env.NODE_ENV === 'production' ? "" : ":" + port }`

var SpotifyWebApi = require('spotify-web-api-node');
var bodyParser = require('body-parser');

// create application/json parser
var jsonParser = bodyParser.json();

app.use(express.static('public'));

app.use(session({
    secret: generateRandomString(16), // Use a long, random string here
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production' } // Set to true if using HTTPS
}));

app.listen(port, () => {
    console.log(`App listening on ${url}`);
});

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirectUri = url + '/callback';
const scopes = [
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private'
];
const state = generateRandomString(16);
const showDialog = true;
const spotifyApiObjects = {};

function storeSpotifyObject(sessionId, spotifyApiObject) {
    spotifyApiObjects[sessionId] = spotifyApiObject;
}

function getSpotifyObject(sessionId) {
    return spotifyApiObjects[sessionId];
}

function removeSpotifyObject(sessionId) {
    delete spotifyApiObjects[sessionId];
}

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function generateRandomString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

// page calls
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

app.get('/home', (req, res) => {
    const spotifyApi = getSpotifyObject(req.sessionID);
    if (spotifyApi && spotifyApi.getAccessToken() != null) {
        res.set('Cache-Control', 'no-store')
        res.sendFile(__dirname + '/public/home.html');
    } else {
        res.redirect('/');
    }
})

// api calls
app.get('/login', (req, res) => {
    try {
        const spotifyApi = new SpotifyWebApi({
            clientId: client_id,
            clientSecret: client_secret,
            redirectUri: redirectUri,
        });

        let url = spotifyApi.createAuthorizeURL(scopes, state, showDialog);
        res.redirect(url);
    } catch (err) {
        console.error("Error in login endpoint: ", err);
        res.redirect('/');
    }
    
})

app.get('/callback', async (req, res) => {
    try {

        const code = req.query.code;
        console.log("CALLBACK");
        console.log(req);

        if (code) {
            const spotifyApi = new SpotifyWebApi({
                clientId: client_id,
                clientSecret: client_secret,
                redirectUri: redirectUri,
            });
    
            
            const result = await spotifyApi.authorizationCodeGrant(code);
            const data = result.body;
            const access_token = data.access_token;
            const refresh_token = data.refresh_token;
            spotifyApi.setAccessToken(access_token);
            spotifyApi.setRefreshToken(refresh_token);
    
            storeSpotifyObject(req.sessionID, spotifyApi);
    
            res.redirect('/home');
        } else {
            res.redirect('/');
        }

    } catch (err) {
        console.log("Error in callback endpoint: ", err);
        res.redirect('/');
    }
});

app.get('/getPlaylists', async (req, res) => {
    try {
        // get current user's id
        const spotifyApi = getSpotifyObject(req.sessionID);
        if (spotifyApi) {

            const userdata = await spotifyApi.getMe();
            const userId = userdata.body['id'];
            console.log(req.sessionID);
            /// get user playlists
            let offset = 0;
            let morePlaylists = true;
            let playlists = [];
            while (morePlaylists) {
                const result = await spotifyApi.getUserPlaylists(userId, { limit: 20, offset: offset });
                const data = result.body;
                playlists = playlists.concat(data['items']);
                if (data['next'] == null) {
                    morePlaylists = false;
                } else {
                    offset += 20;
                }
            }
            res.json(playlists);

        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.log("Error in getPlaylists endpoint: ", err);
        res.status(500).json({
            message: 'An error occured'
        });
        
    }
})

app.get('/getMe', async (req, res) => {
    try {

        const spotifyApi = getSpotifyObject(req.sessionID);
        if (spotifyApi) {
            const result = await spotifyApi.getMe();
            const data = result.body;
            res.json(data);
        } else {
            res.redirect('/');
        }

    } catch (err) {
        console.log("Error in getMe endpoint: ", err);
        res.status(500).json({
            message: 'An error occured'
        });
    }
})

app.post('/createPlaylist', jsonParser, async (req, res) => {
    try {

        const spotifyApi = getSpotifyObject(req.sessionID);
        if (spotifyApi) {
            const body = req.body;
            const result = await spotifyApi.createPlaylist(body.name, { 'description' : body.description, 'public' : body.public });
            const data = result.body;
            res.json(data);
        } else {
            res.redirect('/');
        }

    } catch (err) {
        console.log("Error in createPlaylist endpoint: ", err);
        res.status(500).json({
            message: 'An error occured'
        });
    }
})

app.post('/getSongs', jsonParser, async (req, res) => {
    try {

        const spotifyApi = getSpotifyObject(req.sessionID);
        if (spotifyApi) {
            const body = req.body;
            const playlistId = body.playlistId;
            let offset = 0;
            let moreSongs = true;
            let songs = [];
        
            while (moreSongs) {
                const result = await spotifyApi.getPlaylistTracks(playlistId, { offset: offset });
                const data = result.body;
                songs = songs.concat(data.items);
                if (data.next == null) {
                    moreSongs = false;
                } else {
                    offset += 100;
                }
            }
            res.json(songs);
        } else {
            res.redirect('/');
        }

    } catch (err) {
        console.log("Error in getSongs endpoint: ", err);
        res.status(500).json({
            message: 'An error occured'
        });
    }
})

app.post('/searchTrack', jsonParser, async (req, res) => {
    try {

        const spotifyApi = getSpotifyObject(req.sessionID);
        if (spotifyApi) {
            const body = req.body;
            const track = body.track;
            const artist = body.artist;
            const query = ('artist:' + artist + ' track:' + track).slice(0, 100);
            const results = await spotifyApi.searchTracks(query, { limit: 5 });
            const data = results.body;
            res.json(data);
        } else {
            res.redirect('/');
        }

    } catch (err) {
        console.log("Error in searchTrack endpoint: ", err);
        res.status(500).json({
            message: 'An error occured'
        });
    }
})

app.post('/addToPlaylist', jsonParser, async (req, res) => {
    try {

        const spotifyApi = getSpotifyObject(req.sessionID);
        if (spotifyApi) {
            const body = req.body;
            const playlistId = body.playlistId;
            const uris = body.uris;
            await spotifyApi.addTracksToPlaylist(playlistId, uris);
            res.end();
        } else {
            res.redirect('/');
        }

    } catch (err) {
        console.log("Error in addToPlaylist endpoint: ", err);
        res.status(500).json({
            message: 'An error occured'
        });
    }
})

app.get('/logout', (req, res) => {
    try {

        const spotifyApi = getSpotifyObject(req.sessionID)
        if (spotifyApi) {
            spotifyApi.setAccessToken(null);
            spotifyApi.setRefreshToken(null);
            removeSpotifyObject(req.sessionID);
            res.end();
        } else {
            res.redirect('/');
        }
        
    } catch (err) {
        console.log("Error in logout endpoint: ", err);
        res.status(500).json({
            message: 'An error occured'
        });
    }
})