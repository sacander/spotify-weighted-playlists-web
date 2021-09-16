//#region Global Constants
const clientId="56c1bd9731fc4880988e268fe1e85eec"; // Spotify app client id
const redirectUrl="http://localhost:8000/"; // Spotify app redirect url
const scope = null; // Scopes to access spotify api
//#endregion


//#region Main function of file
async function app(){ 

    if (window.location.hash.length == 0) { // Check if url has no #, used to check if this is a url returned from spotify

        window.location.href = getAuthorizeUrl(clientId, redirectUrl, scope); // Change url to authorize with spotify api

    } else {
        
        const accessToken = getAccessToken(window.location);
        console.log(await getPlaylistItemsBypass100(accessToken, document.getElementById("inputPlaylistId").innerHTML));

    }

}
//#endregion


//#region Authorization Flow - Implicit Grant
// Returns url to authorize with spotify api
function getAuthorizeUrl(clientId, redirectUrl, scope) {
    let authorizeUrl = "https://accounts.spotify.com/authorize";
    authorizeUrl += "?client_id=" + clientId;
    authorizeUrl += "&response_type=" + "token";
    authorizeUrl += "&redirect_uri=" + redirectUrl;

    if (scope != null) {
        authorizeUrl += "&scope=" + scope;
    }

    return authorizeUrl;
}

// Returns access token from spotify api returned url
function getAccessToken(location) {
    let accessToken = "";
    let tokenType = "";

    if (location.href.includes("access_token")) { // Check to ensure access token is in url
        let urlHash = location.hash; // Gets hash segment of url
        urlHash = urlHash.slice(1); // Removes hash from hash segment
        const urlParams = new URLSearchParams(urlHash); // Creates url search parameters object
        accessToken = urlParams.get("access_token"); // Gets access token parameter
        tokenType = urlParams.get("token_type"); // Gets token type parameter
    } else {
        console.log("access_token was not found in: " + location);
    }

    return {accessToken, tokenType};
}
//#endregion


//#region Import Data to Custom Track Object List
// Track class for easy data management
class Track {
    constructor(name, uri, album, artists) {
        this.name = name;
        this.uri = uri;
        this.album = album;
        this.artists = artists;
    }
}

// Returns list of custom track objects
async function getPlaylistItems(accessToken, id, offset=0) { // Gets data with 100 track limit
    const url = "https://api.spotify.com/v1/playlists/" + id + "/tracks?fields=items.track" + "&offset=" + offset;
    const data = await spotify(accessToken, "GET", url);
    const tracks = [];
    
    for (let track of data.items) { // Iterates through existing track objects
        track = track.track; // data.items = [{track: {...}}, {track: {...}}, {track: {...}}...]
        if (track != null) {
            
            const name = track.name; // Gets properties
            const uri = track.uri;
            const album = track.album.name;
            const artists = [];
            for (let artist of track.artists) {
                artists.push(artist.name);
            }

            tracks.push(new Track(name, uri, album, artists)); // Creates custom track object

        }
    }

    return tracks
}

// Returns list of custom track objects, bypassing 100 tracks limit
async function getPlaylistItemsBypass100(accessToken, id) {
    const url = "https://api.spotify.com/v1/playlists/" + id + "/tracks?fields=total";
    const data = await spotify(accessToken, "GET", url);
    const numOfSublists = Math.ceil(data.total / 100); // Find number of required sublists of length 100
    let tracks = [];

    for (let i = 0; i < numOfSublists; i++) {
        tracks = tracks.concat(await getPlaylistItems(accessToken, id, i*100));
    }

    return tracks;
}

// Sends or receives data to the Spotify Web API
async function spotify(accessToken, method, url) {
    const data = await fetch(url, {
        method: method,
        headers: {Authorization: accessToken.tokenType + " " + accessToken.accessToken}
    });

    if (data.ok) {
        return data.json();
    } else {
        console.log("There was an error. Response Status " + data.status);
    }
    
}
//#endregion