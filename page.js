function countdownTimer(){
    if (window.location.hash.length != 0) {

        let accessTokenExpiresIn = 0;
        let minutes = "";
        let seconds = "";

        if (sessionStorage.getItem("accessTokenExpiresIn") == null) {
            accessTokenExpiresIn = 3600;
        } else {
            accessTokenExpiresIn = sessionStorage.getItem("accessTokenExpiresIn");
        }

        setInterval(function() {
            accessTokenExpiresIn -= 1;
            sessionStorage.setItem("accessTokenExpiresIn", accessTokenExpiresIn);
            minutes = String(Math.floor(accessTokenExpiresIn/60)).padStart(2, "0");
            seconds = String(accessTokenExpiresIn%60).padStart(2, "0");
            document.getElementById("accessTokenExpiresIn").innerHTML = "Access token expires in " + minutes + ":" + seconds;
        }, 1000);
    }
}