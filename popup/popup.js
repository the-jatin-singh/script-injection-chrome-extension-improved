document.getElementById('startRecord').addEventListener('click', async () => {
  const tab = await chrome.tabs.create({
    url: 'recorder/recorder.html',
    pinned: true
  });
  
  chrome.runtime.sendMessage({ action: 'startRecording', tabId: tab.id });
  window.close();
});
