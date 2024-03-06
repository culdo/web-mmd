import videojs from 'video.js'
import 'videojs-youtube'

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
    const player = videojs.getPlayer("rawPlayer")
    player.src({
        "type": "video/youtube",
        "src": api.musicYtURL
    })

    api.musicName = "testing";
    api.musicURL = "";
}

function dataURItoBlobUrl(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    var bb = new Blob([ab], { type: mimeString });
    return {
        type: mimeString,
        src: URL.createObjectURL(bb)
    };
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
    console.log(`${name} time elapsed: ${(Date.now() - start) / 1000}s`)
}
export { withTimeElapse, onProgress, dataURItoBlobUrl, loadMusicFromYT, saveCurrTime, blobToBase64, withProgress, startFileDownload, createAudioLink }