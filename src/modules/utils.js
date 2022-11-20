// log assets downloading progress
let loading = document.getElementById("loading");

function onProgress( xhr ) {

    if ( xhr.lengthComputable ) {

        const percentComplete = Math.round( xhr.loaded / xhr.total * 100, 2 ) ;
        console.log( percentComplete + '% downloaded' );
        loading.textContent = "Loading " + percentComplete + "%..."

    }

}

export {onProgress}