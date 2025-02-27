let mediaRecorder;
let recordedChunks = [];
let timerInterval;
let startTime;
let pausedTime = 0;
let isPaused = false;
let pauseStartTime = 0;

function updateTimer() {
  if (!isPaused) {
    const currentTime = new Date().getTime();
    const elapsedTime = Math.floor((currentTime - startTime - pausedTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (elapsedTime % 60).toString().padStart(2, '0');
    const timeString = `${minutes}m:${seconds}s`;
    
    // Update recorder timer
    document.getElementById('timer').textContent = timeString;
    
    // Update action button timer and state
    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(tab => {
        if (tab.id !== chrome.tabs.TAB_ID_NONE) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'updateTimer',
            time: timeString,
            isPaused: isPaused
          });
        }
      });
    });
  }
}

function initializeRecorderControls() {
  const pauseButton = document.querySelector('#recording-status .icon.pause');
  const playButton = document.querySelector('#recording-status .icon.play');
  const stopButton = document.querySelector('#recording-status .icon.stop');

  // Add message listener for recording state changes
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'recordingStateChanged') {
      if (message.isPaused) {
        pauseButton.style.display = 'none';
        playButton.style.display = 'flex';
      } else {
        playButton.style.display = 'none';
        pauseButton.style.display = 'flex';
      }
    }
  });

  pauseButton.onclick = () => {
    if (!isPaused) {
      isPaused = true;
      mediaRecorder.pause();
      pauseStartTime = new Date().getTime();
      clearInterval(timerInterval);
      
      // Update UI
      pauseButton.style.display = 'none';
      playButton.style.display = 'flex';
      
      // Notify all tabs about pause state
      chrome.tabs.query({}, function(tabs) {
        tabs.forEach(tab => {
          if (tab.id !== chrome.tabs.TAB_ID_NONE) {
            chrome.tabs.sendMessage(tab.id, {
              action: 'recordingStateChanged',
              isPaused: true
            });
          }
        });
      });
    }
  };

  playButton.onclick = () => {
    if (isPaused) {
      isPaused = false;
      mediaRecorder.resume();
      pausedTime += new Date().getTime() - pauseStartTime;
      timerInterval = setInterval(updateTimer, 1000);
      
      // Update UI
      playButton.style.display = 'none';
      pauseButton.style.display = 'flex';
      
      // Notify all tabs about resume state
      chrome.tabs.query({}, function(tabs) {
        tabs.forEach(tab => {
          if (tab.id !== chrome.tabs.TAB_ID_NONE) {
            chrome.tabs.sendMessage(tab.id, {
              action: 'recordingStateChanged',
              isPaused: false
            });
          }
        });
      });
    }
  };

  stopButton.onclick = () => {
    clearInterval(timerInterval);
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    
    // Notify all tabs
    chrome.runtime.sendMessage({ action: 'stopRecording' });
  };
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { mediaSource: "screen" }
    });

    // Update UI to show recording status
    document.getElementById('pre-recording').style.display = 'none';
    document.getElementById('recording-status').style.display = 'flex';
    initializeRecorderControls();

    // Start the timer
    startTime = new Date().getTime();
    timerInterval = setInterval(updateTimer, 1000);

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
      const pauseButton = document.querySelector('#recording-status .icon.pause');
      const playButton = document.querySelector('#recording-status .icon.play');

      if (message.action === 'stopRecording') {
        clearInterval(timerInterval); // Stop the timer
        stream.getTracks().forEach(track => track.stop());
        mediaRecorder.stop();
        // Reset UI (although the page will be closed soon)
        document.getElementById('pre-recording').style.display = 'block';
        document.getElementById('recording-status').style.display = 'none';
      } else if (message.action === 'pauseRecording') {
        if (!isPaused) {
          isPaused = true;
          mediaRecorder.pause();
          pauseStartTime = new Date().getTime();
          clearInterval(timerInterval);
          
          // Update recorder UI
          if (pauseButton && playButton) {
            pauseButton.style.display = 'none';
            playButton.style.display = 'flex';
          }
          
          // Notify all tabs about pause state
          chrome.tabs.query({}, function(tabs) {
            tabs.forEach(tab => {
              if (tab.id !== chrome.tabs.TAB_ID_NONE) {
                chrome.tabs.sendMessage(tab.id, {
                  action: 'recordingStateChanged',
                  isPaused: true
                });
              }
            });
          });
        }
      } else if (message.action === 'resumeRecording') {
        if (isPaused) {
          isPaused = false;
          mediaRecorder.resume();
          // Calculate total paused time
          pausedTime += new Date().getTime() - pauseStartTime;
          timerInterval = setInterval(updateTimer, 1000);
          
          // Update recorder UI
          if (pauseButton && playButton) {
            playButton.style.display = 'none';
            pauseButton.style.display = 'flex';
          }
          
          // Notify all tabs about resume state
          chrome.tabs.query({}, function(tabs) {
            tabs.forEach(tab => {
              if (tab.id !== chrome.tabs.TAB_ID_NONE) {
                chrome.tabs.sendMessage(tab.id, {
                  action: 'recordingStateChanged',
                  isPaused: false
                });
              }
            });
          });
        }
      }
    });

  } catch (err) {
    if (err.name === "NotAllowedError") {
      console.log("User canceled screen sharing.");
      chrome.runtime.sendMessage({ action: "screenShareCanceled" }); // Notify extension
    } else {
      console.error("Error starting screen share:", err);
    }
    
    clearInterval(timerInterval); // Clear timer if there's an error
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
