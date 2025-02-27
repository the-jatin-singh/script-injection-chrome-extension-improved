let recordingTabId = null;
let isRecording = false;

async function injectActionButton(tabId) {
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
    injectActionButton(details.tabId);
  }
});

// Handle new tabs
chrome.tabs.onCreated.addListener((tab) => {
  if (isRecording && tab.id !== recordingTabId) {
    injectActionButton(tab.id);
  }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'startRecording') {
    recordingTabId = message.tabId;
    isRecording = true;

    // Store tab ID in chrome.storage


    // Inject into all existing tabs except the recorder tab
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id !== recordingTabId && tab.id !== chrome.tabs.TAB_ID_NONE) {
        injectActionButton(tab.id);
      }
    }
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
  else if (message.action === 'screenShareCanceled') {
    if (recordingTabId) {
      chrome.tabs.remove(recordingTabId);
      recordingTabId = null;
      isRecording = false;
      // Remove action buttons from all tabs
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
  }
  else if (message.action === 'createRecordingTab') {
    // Create recording tab from background script
    const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    await chrome.storage.local.set({ previousTabId: currentTab.id });
    console.log("pinned tab")

    // Store the tab ID
    await chrome.storage.local.set({ recordingTabId: recordingTabId });
    const tab = await chrome.tabs.create({
      url: 'recorder/recorder.html',
      pinned: true
    });
    recordingTabId = tab.id;
    isRecording = true;
    // Inject into all existing tabs except the recorder tab
    const tabs = await chrome.tabs.query({});
    for (const existingTab of tabs) {
      if (existingTab.id !== recordingTabId && existingTab.id !== chrome.tabs.TAB_ID_NONE) {
        injectActionButton(existingTab.id);
      }
    }
  }
});
