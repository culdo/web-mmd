// log assets downloading progress
let loading = document.getElementById("loading");

let progressMap = {};
window.onload = () => {
    progressMap = {};
}

function onProgress( xhr ) {

    if ( xhr.lengthComputable ) {
        // load 3 files
        let percentComplete =  xhr.loaded / xhr.total * 33.3 ;
        progressMap[xhr.total] = percentComplete;

        let percentCompleteAll = 0;
        for (const progress of Object.values(progressMap)) {
            percentCompleteAll += progress;
        }
        loading.textContent = "Loading " + Math.round(percentCompleteAll, 2) + "%...";

    }

}

export {onProgress}