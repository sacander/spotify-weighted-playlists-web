function countdownTimer(){
    if (window.location.hash.length != 0) {
        let accessTokenExpiresIn = 3600;
        let minutes = String(Math.floor(accessTokenExpiresIn/60)).padStart(2, "0")
        let seconds = String(accessTokenExpiresIn%60).padStart(2, "0")

        setInterval(function() {
            accessTokenExpiresIn -= 1;
            minutes = String(Math.floor(accessTokenExpiresIn/60)).padStart(2, "0")
            seconds = String(accessTokenExpiresIn%60).padStart(2, "0")
            document.getElementById("accessTokenExpiresIn").innerHTML = "Access token expires in " + minutes + ":" + seconds;
        }, 1000);
    }
}