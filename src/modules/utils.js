// log assets downloading progress
let loading = document.getElementById("loading");

let progressMap = {};

function onProgress( xhr ) {

    if ( xhr.lengthComputable ) {
        let percentComplete = Math.round( xhr.loaded / xhr.total * 33, 2 ) ;
        progressMap[xhr.total] = percentComplete;

        let percentCompleteAll = 0;
        for (const progress of Object.values(progressMap)) {
            percentCompleteAll += progress;
        }
        loading.textContent = "Loading " + percentCompleteAll + "%...";

    }

}

export {onProgress}