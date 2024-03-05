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
        loading.textContent = "Loading " + Math.round(percentCompleteAll) + "%...";

        if (percentCompleteAll > 100) {
            progressMap = {};
        }
    }

}

function withProgress(resp, totalSize = null) {
    if (!totalSize) {
        totalSize = parseInt(resp.headers.get('content-length'), 10);
    }

    return new Response(new ReadableStream({
        async start(controller) {
            const reader = resp.body.getReader();
            let loaded = 0
            for (; ;) {
                const { done, value } = await reader.read();
                if (done) break;
                loaded += value.length;
                if (totalSize) {
                    loading.textContent = "Loading " + Math.round((loaded / totalSize) * 100) + "%...";
                }
                controller.enqueue(value);
            }
            console.log(`${resp.url}: ${loaded} bytes`)
            controller.close();
        },
    }));
}

async function loadMusicFromYT(api) {
    const player = videojs('player', {
        "audioOnlyMode": true,
        "techOrder": ["youtube"], 
        "sources": [{ 
            "type": "video/youtube", 
            "src": api.musicYtURL
        }] 
    })
    player.src([{ 
        "type": "video/youtube", 
        "src": api.musicYtURL
    }])
    
    
    api.musicName = "testing";
    api.musicURL = "";

    return player
}

let _currTimePrevUpdate = 0;
function saveCurrTime(api, currTime) {
    let now = Date.now();
    // update current time every one secs
    if (now - _currTimePrevUpdate > 1000) {
        // save current Time in browser
        api.currentTime = currTime;
        _currTimePrevUpdate = now;
    }
}

function blobToBase64(blob) {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}

function startFileDownload(url, fileName) {
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

function createAudioLink() {
    const a = document.createElement("a")
    a.id = "audioSaver"
    a.target = "_blank"
    a.style = "display: table; margin: auto;"
    a.text = "right click me to save music"
    return a
}

async function withTimeElapse(func, name) {
    const start = Date.now()
    await func()
    console.log(`${name} time elapsed: ${(Date.now() - start)/1000}s`)
} 
export { withTimeElapse, onProgress, loadMusicFromYT, saveCurrTime, blobToBase64, withProgress, startFileDownload, createAudioLink }