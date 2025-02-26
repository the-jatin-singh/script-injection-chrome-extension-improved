document.addEventListener('DOMContentLoaded', () => {
    const videoPlayer = document.getElementById('recordingPlayer');
    
    // Get the blob URL from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const blobUrl = urlParams.get('blobUrl');
    
    if (blobUrl) {
        videoPlayer.src = blobUrl;
    }
});
