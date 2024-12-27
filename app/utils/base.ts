import { Material, SkinnedMesh } from 'three';
import videojs from 'video.js';
import "video.js/dist/video-js.css";
import 'videojs-youtube';


function onProgress(xhr: { lengthComputable: any; loaded: number; total: number; }) {

    const loading = document.getElementById("loading")!
    let progressMap: Record<number, number> = {};
    window.onload = () => {
        progressMap = {};
    }

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

function withProgress(resp: Response, totalSize: number) {

    const loading = document.getElementById("loading")!
    if (!totalSize) {
        totalSize = parseInt(resp.headers.get('content-length') as string, 10);
    }

    return new Response(new ReadableStream({
        async start(controller) {
            const reader = resp.body!.getReader();
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

function dataURItoBlobUrl(dataURI: string) {
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
function saveCurrTime(api: { currentTime: any; }, currTime: any) {
    let now = Date.now();
    // update current time every one secs
    if (now - _currTimePrevUpdate > 1000) {
        // save current Time in browser
        api.currentTime = currTime;
        _currTimePrevUpdate = now;
    }
}

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
}

function startFileDownload(url: string, fileName: string) {
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}


async function withTimeElapse(func: () => any, name: any) {
    const start = Date.now()
    await func()
    console.log(`${name} time elapsed: ${(Date.now() - start) / 1000}s`)
}


function disposeMesh(obj: SkinnedMesh) {
    obj.geometry.dispose()
    for (const material of obj.material as Material[]) {
        material.dispose()
        // dispose textures
        for (const key of Object.keys(material)) {
            const value = material[key as keyof Material]
            if (value && typeof value === 'object' && 'minFilter' in value) {
                value.dispose()
            }
        }
    }
}

function debugWait(ms = 2000) {
    return new Promise((res) => setTimeout(() => res(true), ms))
}

export { blobToBase64, dataURItoBlobUrl, debugWait, disposeMesh, onProgress, saveCurrTime, startFileDownload, withProgress, withTimeElapse };
