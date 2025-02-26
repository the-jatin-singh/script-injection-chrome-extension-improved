let mediaRecorder;
let recordedChunks = [];

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { mediaSource: "screen" }
    });

    // Update UI to show recording status
    document.getElementById('pre-recording').style.display = 'none';
    document.getElementById('recording-status').style.display = 'flex';

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
    mediaRecorder.start();

    // Wait a bit to ensure tabs are ready
    setTimeout(async () => {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.id !== chrome.tabs.TAB_ID_NONE) {
          chrome.runtime.sendMessage({ 
            action: 'injectActionButton', 
            tabId: tab.id 
          });
        }
      }
    }, 500);

    // Listen for stop message from injected button
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'stopRecording') {
        stream.getTracks().forEach(track => track.stop());
        mediaRecorder.stop();
        // Reset UI (although the page will be closed soon)
        document.getElementById('pre-recording').style.display = 'block';
        document.getElementById('recording-status').style.display = 'none';
      }
    });

  } catch (err) {
    console.error(err);
    // Reset UI if there's an error
    document.getElementById('pre-recording').style.display = 'block';
    document.getElementById('recording-status').style.display = 'none';
  }
}

function handleDataAvailable(event) {
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
  }
}

function handleStop() {
  const blob = new Blob(recordedChunks, { type: 'video/webm' });
  const blobUrl = URL.createObjectURL(blob);
  chrome.tabs.create({ 
    url: `/viewer/viewer.html?blobUrl=${encodeURIComponent(blobUrl)}` 
  }, (tab) => {
    chrome.runtime.sendMessage({ action: 'closePinnedTab', newTabId: tab.id });
  });
  recordedChunks = [];
}

document.addEventListener('DOMContentLoaded', startRecording);
