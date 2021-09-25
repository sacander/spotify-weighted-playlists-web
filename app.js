// #region Sends or receives data to the Spotify Web API
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


// #region Main function of file
async function app(){ 
        
    const accessToken = JSON.parse(sessionStorage.getItem("accessToken"));
    let tracks = await getPlaylistItems(accessToken, document.getElementById("inputPlaylistId").innerHTML);
    let x = await getPlaylistItems(accessToken, "29eVFm6KNSJnfUcRghmWab");
    let tracksByTaylorSwift = filterByArtist(tracks, "Taylor Swift");
    y = weightedTrackArray([tracks, x], [5, 1]);
    // replacePlaylist(accessToken, document.getElementById("outputPlaylistId").innerHTML, y);
    console.log(tracksByTaylorSwift)

}
// #endregion


// #region Import Data to Custom Track Object Array
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


// #region Output Data to Playlist
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


// #region Logic
// Filters tracks by specific artist
function filterByArtist(trackArray, artist) {
    return trackArray.filter(track => {
        return track.artists.includes(artist)
    });
}

// Takes an array of numbers, converts into relative probabilities, then makes it cumulative
function getCumulativeProbabilities(probabilityValues) { // Array of numbers
    const cumulativeProbabilities = [0];

    let sum = 0;
    for (let i of probabilityValues) {
        sum += i;
    }

    for (let i of probabilityValues) {
        cumulativeProbabilities.push(i / sum + cumulativeProbabilities.at(-1)); // Finds probability of i and adds it to previous probability
    }

    cumulativeProbabilities.shift(); // Removes initial 0 in cumulativeProbabilities
    return cumulativeProbabilities; // Returns array of numbers
}

// Takes an array of custom track object arrays, and an array of corresponding probability values
function weightedTrackArray(trackArrays, probabilityValues) {
    const weightedTrackArray = [];
    const cumulativeProbabilities = getCumulativeProbabilities(probabilityValues);
    let random = 0;
    let randomIndex = 0;

    trackArrays.forEach((trackArray, index) => { // Adds a marker for when an array has been looped, the corresponding probability and a backup to restore from
        trackArray.unlooped = true;
        trackArray.probability = cumulativeProbabilities[index];
        trackArray.backup = Array.from(trackArray);
    });

    while (trackArrays.some(trackArray => trackArray.unlooped)) { // While at least one track array has not been looped through
        random = Math.random();

        for (let trackArray of trackArrays) { // Iterate through each track array
            if (random < trackArray.probability) { // If the random number is less than probability threshold
                randomIndex = Math.floor(Math.random() * trackArray.length); // Get random number from 0 to length - 1
                weightedTrackArray.push(...trackArray.splice(randomIndex, 1)); // Remove track object from track array and add it to outputt array

                if (trackArray.length == 0) { // If track array is empty, make it as looped and reset it
                    trackArray.unlooped = false;
                    trackArray.push(...trackArray.backup);
                }
                break;
            }
        }

    }

    return weightedTrackArray; // Returns array of custom track objects
}
//#endregion