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
    const url = api.musicYtURL

    const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    const parseDecsig = data => {
        if (data.startsWith('var script')) {
            // they inject the script via script tag
            const obj = {}
            const document = {
                createElement: () => obj,
                head: { appendChild: () => { } }
            }
            eval(data)
            data = obj.innerHTML
        }
        const fnnameresult = /=([a-zA-Z0-9\$_]+?)\(decodeURIComponent/.exec(data)
        const fnname = fnnameresult[1]
        const _argnamefnbodyresult = new RegExp(escapeRegExp(fnname) + '=function\\((.+?)\\){((.+)=\\2.+?)}').exec(
            data
        )
        const [_, argname, fnbody] = _argnamefnbodyresult
        const helpernameresult = /;([a-zA-Z0-9$_]+?)\..+?\(/.exec(fnbody)
        const helpername = helpernameresult[1]
        const helperresult = new RegExp('var ' + escapeRegExp(helpername) + '={[\\s\\S]+?};').exec(data)
        const helper = helperresult[0]
        return new Function([argname], helper + '\n' + fnbody)
    }
    const parseQuery = s => [...new URLSearchParams(s).entries()].reduce((acc, [k, v]) => ((acc[k] = v), acc), {})

    const parseResponse = (id, playerResponse, decsig) => {
        // console.log(`video %s playerResponse: %o`, id, playerResponse)
        let stream = []
        if (playerResponse.streamingData.formats) {
            stream = playerResponse.streamingData.formats.map(x =>
                Object.assign({}, x, parseQuery(x.cipher || x.signatureCipher))
            )
            // console.log(`video %s stream: %o`, id, stream)
            for (const obj of stream) {
                if (obj.s) {
                    obj.s = decsig(obj.s)
                    obj.url += `&${obj.sp}=${encodeURIComponent(obj.s)}`
                }
            }
        }

        let adaptive = []
        if (playerResponse.streamingData.adaptiveFormats) {
            adaptive = playerResponse.streamingData.adaptiveFormats.map(x =>
                Object.assign({}, x, parseQuery(x.cipher || x.signatureCipher))
            )
            // console.log(`video %s adaptive: %o`, id, adaptive)
            for (const obj of adaptive) {
                if (obj.s) {
                    obj.s = decsig(obj.s)
                    obj.url += `&${obj.sp}=${encodeURIComponent(obj.s)}`
                }
            }
        }
        // console.log(`video %s result: %o`, id, { stream, adaptive })
        return { stream, adaptive, details: playerResponse.videoDetails, playerResponse }
    }

    let audio_streams = {};

    const response = await fetch("https://images" + ~~(Math.random() * 33) + "-focus-opensocial.googleusercontent.com/gadgets/proxy?container=none&url=" + encodeURIComponent(url));

    if (!response.ok) {
        return
    }

    let data = await response.text()
    var parser = new DOMParser();
    var doc = parser.parseFromString(data, 'text/html');
    var a = document.createElement('a');
    a.href = doc.querySelector('script[src$="base.js"]').src;
    var basejs = "https://www.youtube.com/" + a.pathname;

    var regex = /(?:ytplayer\.config\s*=\s*|ytInitialPlayerResponse\s?=\s?)(.+?)(?:;var|;\(function|\)?;\s*if|;\s*if|;\s*ytplayer\.|;\s*<\/script)/gmsu;

    data = data.split('window.getPageData')[0];
    data = data.replace('ytInitialPlayerResponse = null', '');
    data = data.replace('ytInitialPlayerResponse=window.ytInitialPlayerResponse', '');
    data = data.replace('ytplayer.config={args:{raw_player_response:ytInitialPlayerResponse}};', '');

    var matches = regex.exec(data);
    var playerResponse = matches && matches.length > 1 ? JSON.parse(matches[1]) : false;

    const apiResp = await fetch("https://images" + ~~(Math.random() * 33) + "-focus-opensocial.googleusercontent.com/gadgets/proxy?container=none&url=" + encodeURIComponent(basejs))
    if (!apiResp.ok) {
        return
    }
    const apiData = await apiResp.text()

    var decsig;
    decsig = parseDecsig(apiData);
    // console.log(decsig);
    var streams = parseResponse(url, playerResponse, decsig).adaptive;

    streams.forEach(function (stream, n) {
        var itag = stream.itag * 1,
            quality = false;
        // console.log(stream);
        switch (itag) {
            case 139:
                quality = "48kbps";
                break;
            case 140:
                quality = "128kbps";
                break;
            case 141:
                quality = "256kbps";
                break;
            case 249:
                quality = "webm_l";
                break;
            case 250:
                quality = "webm_m";
                break;
            case 251:
                quality = "webm_h";
                break;
        }
        if (quality) audio_streams[quality] = stream.url;
    });

    // console.log(audio_streams);

    const audioSrc = audio_streams['256kbps'] || audio_streams['128kbps'] || audio_streams['48kbps'];

    const player = document.getElementById("player")
    const audioSaver = document.getElementById("audioSaver")

    player.src = audioSrc
    audioSaver.href = audioSrc

    api.musicName = playerResponse.videoDetails.title;
    api.musicURL = "";
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