let mediaRecorder;
let recordedChunks = [];
let timerInterval;
let startTime;
let pausedTime = 0;
let isPaused = false;
let pauseStartTime = 0;

async function switchToPreviousTab() {
  return new Promise(async (resolve) => {
    try {
      console.log("Switching to previous tab");
      const data = await chrome.storage.local.get("previousTabId");
      if (data.previousTabId) {
        await chrome.tabs.update(data.previousTabId, { active: true });
        resolve(); // Resolve immediately after switching tabs
      } else {
        resolve(); // If no previous tab, resolve immediately
      }
    } catch (error) {
      console.error("Error switching to previous tab:", error);
      resolve();
    }
  });
}


function injectCountdownAndWait() {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.background = "rgba(0, 0, 0, 0.6)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "99999";
    document.body.appendChild(overlay);

    // Disable interactions with background content
    document.body.style.pointerEvents = "none";

    const outerCircle = document.createElement("div");
    outerCircle.className = "outer-circle";
    outerCircle.style.width = "260px";
    outerCircle.style.height = "260px";
    outerCircle.style.borderRadius = "50%";
    outerCircle.style.background = "rgba(255, 255, 255, 0.1)";
    outerCircle.style.display = "flex";
    outerCircle.style.alignItems = "center";
    outerCircle.style.justifyContent = "center";
    outerCircle.style.border = "6px solid #12B97B";
    outerCircle.style.position = "relative";
    overlay.appendChild(outerCircle);

    // Create countdown container
    const countdownContainer = document.createElement("div");
    countdownContainer.className = "countdown-container";
    countdownContainer.style.width = "220px";
    countdownContainer.style.height = "220px";
    countdownContainer.style.borderRadius = "50%";
    countdownContainer.style.backgroundColor = "#12B97B";
    countdownContainer.style.display = "flex";
    countdownContainer.style.flexDirection = "column";
    countdownContainer.style.alignItems = "center";
    countdownContainer.style.justifyContent = "center";
    countdownContainer.style.boxShadow = "0 0 20px rgba(0, 0, 0, 0.3)";
    countdownContainer.style.color = "white";
    countdownContainer.style.textAlign = "center";
    outerCircle.appendChild(countdownContainer);

    // Create text span
    const textSpan = document.createElement("span");
    textSpan.textContent = "Starting in";
    textSpan.style.fontSize = "22px";
    textSpan.style.fontWeight = "600";
    textSpan.style.marginBottom = "10px";
    countdownContainer.appendChild(textSpan);

    // Create number circle
    const numberCircle = document.createElement("div");
    numberCircle.className = "number-circle";
    numberCircle.style.width = "110px";
    numberCircle.style.height = "110px";
    numberCircle.style.borderRadius = "50%";
    numberCircle.style.backgroundColor = "#12B97B";
    numberCircle.style.display = "flex";
    numberCircle.style.alignItems = "center";
    numberCircle.style.justifyContent = "center";
    numberCircle.style.position = "relative";
    numberCircle.style.overflow = "hidden";
    countdownContainer.appendChild(numberCircle);

    let count = 3;
    const countdownElement = document.createElement("div");
    countdownElement.className = "countdown-number";
    countdownElement.textContent = count;
    countdownElement.style.fontSize = "90px";
    countdownElement.style.fontWeight = "bold";
    countdownElement.style.fontFamily = "Arial, sans-serif"; // Font change applied here
    countdownElement.style.position = "absolute";
    countdownElement.style.transition = "transform 1s ease-in-out";
    numberCircle.appendChild(countdownElement);

    function updateCountdown() {
      if (count > 1) {
        count--;
        countdownElement.textContent = count;
      } else {
        clearInterval(countdownInterval);
        setTimeout(() => {
          overlay.remove();
          document.body.style.pointerEvents = "auto"; // Re-enable interactions after countdown
          resolve(); // Resolve the Promise when the countdown is done
        }, 1000);
      }
    }

    // Start countdown without skipping "3"
    const countdownInterval = setInterval(updateCountdown, 1000);

    setInterval(() => {
      outerCircle.style.borderColor = outerCircle.style.borderColor === "transparent" ? "#12B97B" : "transparent";
    }, 1000);
  });
}













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
    console.log("stream ", stream);

    // Always switch back to the previous tab, even if the user cancels
    await switchToPreviousTab();

    // Inject the countdown and wait for it to complete
    const data = await chrome.storage.local.get("previousTabId");
    if (data.previousTabId) {
      await chrome.scripting.executeScript({
        target: { tabId: data.previousTabId },
        func: injectCountdownAndWait,
      });
    }

    // Now that the countdown is done, start the recording
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
    mediaRecorder.start();

    // Update UI to show recording status
    document.getElementById('pre-recording').style.display = 'none';
    document.getElementById('recording-status').style.display = 'flex';
    initializeRecorderControls();

    // Start the timer
    startTime = new Date().getTime();
    timerInterval = setInterval(updateTimer, 1000);

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
      } else if (message.action === 'resetRecording') {
        resetRecording();
      }
    });

  } catch (err) {
    if (err.name === "NotAllowedError") {
      console.log("User canceled screen sharing.");
      // Always switch back to the previous tab, even if the user cancels
      await switchToPreviousTab();
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

async function resetRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    // Stop current recording
    clearInterval(timerInterval);
    // mediaRecorder.stop();
    // mediaRecorder.stream.getTracks().forEach(track => track.stop());
    
    // Reset timer variables
    startTime = null;
    pausedTime = 0;
    isPaused = false;
    pauseStartTime = 0;
    
    // Clear recorded chunks
    recordedChunks = [];
    
    // Start new recording
    startRecording();
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
