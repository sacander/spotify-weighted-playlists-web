//#region Global Constants
const clientId="56c1bd9731fc4880988e268fe1e85eec"; // Spotify app client id
const redirectUrl="http://localhost:8000/"; // Spotify app redirect url
const scope = "playlist-modify-public playlist-modify-private"; // Scopes to access spotify api
//#endregion


//#region Sends or receives data to the Spotify Web API
async function spotify(accessToken, method, url, body=null, contentType=null) {
    const data = await fetch(url, {
        method: method,
        headers: {
            "Authorization": accessToken.tokenType + " " + accessToken.accessToken,
            "Content-Type": contentType
        },
        body: body
    });

    if (data.ok) {
        return data.json();
    } else {
        console.log("There was an error. Response Status " + data.status);
        console.log(await data.json());
    }
    
}
//#endregion


//#region Main function of file
async function app(){ 

    if (window.location.hash.length == 0) { // Check if url has no #, used to check if this is a url returned from spotify

        window.location.href = getAuthorizeUrl(clientId, redirectUrl, scope); // Change url to authorize with spotify api

    } else {
        
        const accessToken = getAccessToken(window.location);
        let tracks = await getPlaylistItems(accessToken, document.getElementById("inputPlaylistId").innerHTML);
        replacePlaylist(accessToken, document.getElementById("outputPlaylistId").innerHTML, tracks);

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


//#region Import Data to Custom Track Object Array
// Track class for easy data management
class Track {
    constructor(name, uri, album, artists) {
        this.name = name;
        this.uri = uri;
        this.album = album;
        this.artists = artists;
    }
}

// Returns array of custom track objects
async function getPlaylistItems(accessToken, playlistId, next=null, trackArray=[]) { // Gets data with 100 track limit
    let url = next; // Assigns url to next page of tracks
    if (url == null) {
        url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks?fields=next,items.track"; // Assigns url during first call of function
    }
    
    const data = await spotify(accessToken, "GET", url);
    const tracks = trackArray;
    
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

    if (data.next == null) { // Calls itself if there are more pages of tracks
        return tracks;
    } else {
        return getPlaylistItems(accessToken, playlistId, data.next, tracks);
    }
}
//#endregion


//#region Output Data to Playlist
async function replacePlaylist(accessToken, playlistId, trackArray) {
    const url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks";
    const uriArray = {"uris": []};
    await spotify(accessToken, "PUT", url, JSON.stringify(uriArray), "application/json");

    while (trackArray.length > 0) {
        uriArray.uris = trackArray.splice(0, 100);
        uriArray.uris = uriArray.uris.map(track => track.uri);
       await spotify(accessToken, "POST", url, JSON.stringify(uriArray), "application/json")
    }
}
//#endregion