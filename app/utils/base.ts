import { Material, SkinnedMesh } from 'three';


let progressMap: Record<string, number> = {};
function buildOnProgress(url: string) {
    if (url.startsWith("data:")) return null
    const loading = document.getElementById("loading")

    return function onProgress(xhr: ProgressEvent<EventTarget>) {
        if (xhr.lengthComputable) {
            let percentComplete = xhr.loaded / xhr.total;
            progressMap[url] = percentComplete;

            let percentCompleteAll = 0;
            const loadingFileNum = progressMap.length
            for (const progress of Object.values(progressMap)) {
                percentCompleteAll += progress;
            }
            percentCompleteAll /= loadingFileNum

            if (loading) {
                loading.textContent = "Loading " + Math.round(percentCompleteAll) + "%..."
            }

            if (percentCompleteAll > 100) {
                progressMap = {};
            }
        }

    }
}

function withProgress(resp: Response, totalSize: number) {

    const loading = document.getElementById("loading")
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
                if (totalSize && loading) {
                    loading.textContent = "Loading " + Math.round((loaded / totalSize) * 100) + "%...";
                }
                controller.enqueue(value);
            }
            console.log(`${resp.url}: ${loaded} bytes`)
            controller.close();
        },
    }));
}

async function dataURItoBlob(dataURI: string) {
    const resp = await fetch(dataURI)
    const blob = await resp.blob()
    return blob
}

async function readBlobAsChunks(blob: Blob, onProgress: (data: string) => void) {
    const chunkSize = 16384;
    const fileReader = new FileReader();
    let offset = 0;
    fileReader.addEventListener('error', error => console.error('Error reading file:', error));
    fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
    fileReader.addEventListener('load', e => {
        const result = e.target.result as string
        onProgress(result);
        offset += result.length;
        if (offset < blob.size) {
            readSlice(offset);
        }
    });
    const readSlice = (offset: number) => {
        const slice = blob.slice(offset, offset + chunkSize);
        fileReader.readAsText(slice);
    };
    readSlice(0);
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

const isDev = process.env.NODE_ENV === 'development';

export { blobToBase64, dataURItoBlob, readBlobAsChunks as readDataUrlAsChunks, debugWait, disposeMesh, buildOnProgress, saveCurrTime, startFileDownload, withProgress, withTimeElapse, isDev };
