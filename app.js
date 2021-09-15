//#region Global Constants
const clientId="56c1bd9731fc4880988e268fe1e85eec"; // Spotify app client id
const redirectUrl="http://localhost:8000/"; // Spotify app redirect url
const scope = null; // Scopes to access spotify api
//#endregion

//#region Main function of file
function app(){ 

    if (window.location.hash.length == 0) { // Check if url has no #, used to check if this is a url returned from spotify

        window.location.href = authorize(clientId, redirectUrl, scope); // Change url to authorize with spotify api

    } else {
        
        const accessToken = getAccessToken(window.location);
        console.log(getData(accessToken));

    }

}
//#endregion

//#region Authorization Flow - Implicit Grant
// Returns url to authorize with spotify api
function authorize(clientId, redirectUrl, scope) {
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

async function getData(accessToken) {
    let data = await fetch("https://api.spotify.com/v1/playlists/1Ev0Nv8kzmHEKinLAxKWqX/tracks", {
        method: "GET",
        headers: {Authorization: accessToken.tokenType + " " + accessToken.accessToken}
    });

    console.log(await data.json())
}