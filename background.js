let recordingTabId = null;
let isRecording = false;

// Single in-memory source of truth for recorded events, written through a
// serialized queue. Every tab's content script funnels its captured events
// here via the 'recordEvent' message instead of each doing its own
// storage.get -> push -> storage.set: two of those racing (e.g. a click and
// the 'beforeunload' it triggers, or two tabs at once) silently clobber each
// other since both read the array before either writes it back. Routing
// through one process with one queue makes appends atomic.
let recordedEvents = [];
let recordedEventsLoaded = false;
let eventWriteQueue = Promise.resolve();

function resetRecordedEvents() {
  recordedEvents = [];
  recordedEventsLoaded = true;
  eventWriteQueue = Promise.resolve();
}

function queueEventWrite(event) {
  eventWriteQueue = eventWriteQueue.then(async () => {
    if (!recordedEventsLoaded) {
      const stored = await chrome.storage.local.get('recordedEvents');
      recordedEvents = stored.recordedEvents || [];
      recordedEventsLoaded = true;
    }
    recordedEvents.push(event);
    await chrome.storage.local.set({ recordedEvents });
  });
  return eventWriteQueue;
}

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

    // Store the tab ID and recording start time
    resetRecordedEvents();
    await chrome.storage.local.set({
      recordingTabId: recordingTabId,
      recordingStartTime: Date.now(),
      isRecordingActive: true,
      recordedEvents: []
    });

    // Inject into all existing tabs except the recorder tab
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id !== recordingTabId && tab.id !== chrome.tabs.TAB_ID_NONE) {
        injectActionButton(tab.id);
        // Notify tab that recording has started
        try {
          chrome.tabs.sendMessage(tab.id, { action: 'recordingStarted' });
        } catch (e) {
          console.log(`Could not notify tab ${tab.id}:`, e);
        }
      }
    }
  } else if (message.action === 'recordEvent') {
    queueEventWrite(message.event);
  } else if (message.action === 'stopRecording') {
    isRecording = false;
    
    // Update recording state
    await chrome.storage.local.set({ isRecordingActive: false });
    
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
            // Notify tab that recording has stopped
            chrome.tabs.sendMessage(tab.id, { action: 'recordingStopped' });
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
  } else if (message.action === 'createRecordingTab') {
    // Create recording tab from background script
    const tab = await chrome.tabs.create({
      url: 'recorder/recorder.html',
      pinned: true
    });
    recordingTabId = tab.id;
    isRecording = true;

    // Store recording start time
    resetRecordedEvents();
    await chrome.storage.local.set({
      recordingStartTime: Date.now(),
      isRecordingActive: true,
      recordedEvents: []
    });
    
    // Inject into all existing tabs except the recorder tab
    const tabs = await chrome.tabs.query({});
    for (const existingTab of tabs) {
      if (existingTab.id !== recordingTabId && existingTab.id !== chrome.tabs.TAB_ID_NONE) {
        injectActionButton(existingTab.id);
        // Notify tab that recording has started
        try {
          chrome.tabs.sendMessage(existingTab.id, { action: 'recordingStarted' });
        } catch (e) {
          console.log(`Could not notify tab ${existingTab.id}:`, e);
        }
      }
    }
  }
});
