// #region Global Constants
const clientId="56c1bd9731fc4880988e268fe1e85eec"; // Spotify app client id
const redirectUrl="http://localhost:8000/"; // Spotify app redirect url
const scope = "playlist-modify-public playlist-modify-private"; // Scopes to access spotify api
//#endregion


// #region Executes on page load
function onLoad() {
    
    if (sessionStorage.getItem("accessTokenRequested") == "true") { // If token was requested before url change
        sessionStorage.setItem("accessToken", JSON.stringify(getAccessToken(window.location))); // Set the token as a JSON object
        sessionStorage.setItem("accessTokenExpirationDate", Date.now() + 3600*1000); // Establishes time when token expires
        sessionStorage.setItem("accessTokenRequested", "false"); // Remove token request
    }

    if (sessionStorage.getItem("accessTokenExpirationDate") > Date.now()) { // If token exists and has not expired
        tokenTimer();
    }

    if (sessionStorage.getItem("inputPlaylistUrl")) { // Autosave input data
        document.getElementById("inputPlaylistUrl").innerHTML = sessionStorage.getItem("inputPlaylistUrl");
        getPlaylistId("input");
    }

    if (sessionStorage.getItem("outputPlaylistUrl")) { // Autosave output data
        document.getElementById("outputPlaylistUrl").innerHTML = sessionStorage.getItem("outputPlaylistUrl");
        getPlaylistId("output");
    }

    checkTabs()
    checkAppButton()

}
// #endregion


// #region Adds timer for when access token expires
function tokenTimer() {

    let accessTokenExpiresIn = 0;
    let accessTokenExpirationDate = new Date();
    let minutes = "";
    let seconds = "";

    let accessTokenCountdown = setInterval(function() {
        
        accessTokenExpirationDate = sessionStorage.getItem("accessTokenExpirationDate");
        accessTokenExpiresIn = Math.floor((accessTokenExpirationDate - Date.now()) / 1000); // Convert back from ms to s
        minutes = String(Math.floor(accessTokenExpiresIn/60)).padStart(2, "0");
        seconds = String(Math.floor(accessTokenExpiresIn%60)).padStart(2, "0");
        document.getElementById("accessTokenExpiresIn").innerHTML = "Access token expires in " + minutes + ":" + seconds;

        if (accessTokenExpiresIn <= 0) {
            document.getElementById("appButton").setAttribute("disabled", "");
            clearInterval(accessTokenCountdown);
        }
        
    }, 1000);

}
// #endregion


// #region Takens text input of playlist url and converts it to playlist id
function getPlaylistId(io) {
    let url = new URL(document.getElementById(io + "PlaylistUrl").innerHTML);
    sessionStorage.setItem(io + "PlaylistUrl", url);
    url = url.pathname.replace("/playlist/", "");
    document.getElementById(io + "PlaylistId").innerHTML = url;
    checkTabs();
}
// #endregion


// #region Check whether to disable or enable element
// Checks whether to enable or disable app button
function checkAppButton() {
    if (sessionStorage.getItem("accessTokenExpirationDate") > Date.now()) { // If token exists and has not expired
        document.getElementById("appButton").removeAttribute("disabled"); // Enable button
    } else {
        document.getElementById("appButton").setAttribute("disabled", ""); // Disable button
    }
}

// Checks whether to enable or disable tabs
function checkTabs() {
    if (document.getElementById("inputPlaylistId").innerHTML != "" && // If input playlist id has a value
    document.getElementById("outputPlaylistId").innerHTML != "") { // If output playlist id has a value)
        for (let tab of document.getElementById("tabs").children) {
            tab.removeAttribute("disabled");
        }
    }
}
// #endregion


// #region Authorization Flow - Implicit Grant
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

function accessToken() {
    sessionStorage.setItem("accessTokenRequested", "true");
    window.location.href = getAuthorizeUrl(clientId, redirectUrl, scope); // Change url to authorize with spotify api
}
//#endregion


// #region Sets which tab is active
function setActiveTab(buttonId) {
    for (let button of document.getElementById("tabs").children) {
        if (button.id == buttonId) {
            button.classList.add("activeTab");
            document.getElementById(button.id + "Div").removeAttribute("hidden");
        } else {
            button.classList.remove("activeTab");
            document.getElementById(button.id + "Div").setAttribute("hidden", "");
        }
    }
}
// #endregion