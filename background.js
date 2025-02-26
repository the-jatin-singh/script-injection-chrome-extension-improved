let recordingTabId = null;
let isRecording = false;

async function injectStopButton(tabId) {
  try {
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ['actionButton/actionButton.css']
    });
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['actionButton/actionButton.js']
    });
  } catch (e) {
    console.log(`Could not inject into tab ${tabId}:`, e);
  }
}

// Handle tab updates
chrome.webNavigation.onCompleted.addListener((details) => {
  if (isRecording && details.frameId === 0) {
    injectStopButton(details.tabId);
  }
});

// Handle new tabs
chrome.tabs.onCreated.addListener((tab) => {
  if (isRecording && tab.id !== recordingTabId) {
    injectStopButton(tab.id);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startRecording') {
    recordingTabId = message.tabId;
    isRecording = true;
    // Inject into all existing tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id !== recordingTabId) {
          injectStopButton(tab.id);
        }
      });
    });
  } else if (message.action === 'stopRecording') {
    isRecording = false;
    if (recordingTabId) {
      chrome.tabs.sendMessage(recordingTabId, { action: 'stopRecording' });
      // Remove stop buttons from all tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          try {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              function: () => {
                const actionBtnContainer = document.querySelector('.btg-action-btns-container');
                if (actionBtnContainer) actionBtnContainer.remove();
              }
            });
          } catch (e) {
            console.log(`Could not clean up tab ${tab.id}:`, e);
          }
        });
      });
    }
  } else if (message.action === 'closePinnedTab') {
    if (recordingTabId) {
      const newTabId = message.newTabId;
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === newTabId && changeInfo.status === 'complete') {
          chrome.tabs.remove(recordingTabId);
          recordingTabId = null;
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    }
  }
});
