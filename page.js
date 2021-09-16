// Adds timer for when access token expires
function countdownTimer(){
    if (window.location.hash.length != 0) {

        let accessTokenExpiresIn = 0;
        let accessTokenExpirationDate = new Date();
        let minutes = "";
        let seconds = "";

        if (sessionStorage.getItem("accessTokenExpirationDate") == null) { // Establishes time when token expires
            accessTokenExpirationDate = Date.now() + 3600*1000; // 3600s converted to ms
            sessionStorage.setItem("accessTokenExpirationDate", accessTokenExpirationDate);
        }

        setInterval(function() {
            accessTokenExpirationDate = sessionStorage.getItem("accessTokenExpirationDate");
            accessTokenExpiresIn = ( accessTokenExpirationDate - Date.now() ) / 1000; // Convert back from ms to s
            minutes = String(Math.floor(accessTokenExpiresIn/60)).padStart(2, "0");
            seconds = String(Math.floor(accessTokenExpiresIn%60)).padStart(2, "0");
            document.getElementById("accessTokenExpiresIn").innerHTML = "Access token expires in " + minutes + ":" + seconds;
        }, 1000);
    }
}

// Takens text input of playlist url and converts it to playlist id
function getPlaylistId(io) {
    let url = new URL(document.getElementById(io + "PlaylistUrl").value);
    url = url.pathname.replace("/playlist/", "");
    document.getElementById(io + "PlaylistId").innerHTML = url;
}