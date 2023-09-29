import videojs from 'video.js'
// log assets downloading progress
let loading = document.getElementById("loading");

let progressMap = {};
window.onload = () => {
    progressMap = {};
}

function onProgress(xhr) {

    if (xhr.lengthComputable) {
        // load 3 files
        let percentComplete = xhr.loaded / xhr.total * 33.3;
        progressMap[xhr.total] = percentComplete;

        let percentCompleteAll = 0;
        for (const progress of Object.values(progressMap)) {
            percentCompleteAll += progress;
        }
        loading.textContent = "Loading " + Math.round(percentCompleteAll, 2) + "%...";

        if (percentCompleteAll > 100) {
            progressMap = {};
        }
    }

}

function loadMusicFromYT(url) {
    const player = videojs('myPlayer', {
        "audioOnlyMode": true,
        "techOrder": ["youtube"], 
        "sources": [{ 
            "type": "video/youtube", 
            "src": url
        }] 
    })
    player.src([{ 
        "type": "video/youtube", 
        "src": url
    }])

    return player
}

let _currTimePrevUpdate = 0;
function saveCurrTime(api, currTime) {
    let now = Date.now();
    // update current time every one secs
    if (now - _currTimePrevUpdate > 1000) {
        // save current Time in browser
        api["currentTime"] = currTime;
        _currTimePrevUpdate = now;
    }
}

export { onProgress, loadMusicFromYT, saveCurrTime }