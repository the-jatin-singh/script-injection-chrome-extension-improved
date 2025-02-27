document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;
    const body = document.body;

    // Hide the inject button
    const injectButton = document.getElementById('injectIframe');
    if (injectButton) {
      injectButton.style.display = 'none';
    }

    // Check if the URL is a valid website
    if (!url || url.startsWith('chrome://') || url === 'about:blank') {
      body.style.display = 'block'; // Make popup visible
      body.style.background='#f7faf8'

      // Create the main container
      const container = document.createElement('div');
      container.style.width = '350px';
      container.style.padding = '20px';
      
      
      
      container.style.background = '#f7faf8';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.alignItems = 'center';
      container.style.fontFamily = 'Arial, sans-serif';

      // Create the header section (logo + close button)
      const header = document.createElement('div');
      header.style.width = '100%';
      header.style.height='10px'
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';
      header.style.marginBottom = '20px';
      header.style.border = '1px solid #ddd';
      header.style.background = '#ffffff';
      header.style.borderRadius = '6px';
      header.style.padding = '20px';

      // Logo Image
      const logo = document.createElement('img');
      logo.src = 'botgauge-green.png'; // Ensure this image is in your extension's assets
      logo.style.height = '25px';
      logo.style.objectFit = 'contain';

      // Close button (X)
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '&times;';
      closeButton.style.border = 'none';
      closeButton.style.background = 'none';
      closeButton.style.fontSize = '30px';
      closeButton.style.cursor = 'pointer';
      closeButton.onclick = () => window.close();

      header.appendChild(logo);
      header.appendChild(closeButton);

      // Create message box
      const messageBox = document.createElement('div');
      messageBox.style.width = '100%';
      messageBox.style.height='100px'
      messageBox.style.padding = '20px';
      messageBox.style.border = '1px solid #ddd';
      messageBox.style.borderRadius = '6px';
      messageBox.style.background = '#ffffff';
      messageBox.style.display = 'flex';
      messageBox.style.flexDirection = 'column';
      messageBox.style.justifyContent='center'
      messageBox.style.alignItems = 'flex-start';

      // Status indicator (Green line) - Centered
      const statusLine = document.createElement('div');
      statusLine.style.width = '20px';
      statusLine.style.height = '4px';
      statusLine.style.borderRadius = '2px';
      statusLine.style.backgroundColor = '#12b97b';
      statusLine.style.marginBottom = '10px';
      statusLine.style.alignSelf = 'start'; // Ensures it is centered

      // Message text - Bold
      const messageText = document.createElement('p');
      messageText.style.color = '#333';
      messageText.style.fontSize = '19px';
      messageText.style.fontWeight = 'bold'; // Make it bolder
      messageText.style.margin = '0';
      messageText.style.textAlign = 'center';
      messageText.innerText = 'Extension not supported on this tab';

      // Subtext
      const subText = document.createElement('p');
      subText.style.color = '#666';
      subText.style.fontSize = '16px';
      subText.style.marginTop = '5px';
      subText.style.textAlign = 'center';
      subText.innerText = 'Navigate to a website to start recording';

      // Append everything
      messageBox.appendChild(statusLine);
      messageBox.appendChild(messageText);
      messageBox.appendChild(subText);

      container.appendChild(header);
      container.appendChild(messageBox);

      body.appendChild(container);
      return;
    }

    // If valid website, keep popup hidden and inject iframe
    injectButton.style.display = 'block'; // Show inject button only if supported
    injectButton.click();

    setTimeout(() => {
      window.close();
    }, 100);
  });
});





document.getElementById('injectIframe').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: injectIframe
    });
  });
});

function injectIframe() {
  // Create the dimming overlay
  const overlay = document.createElement('div');
  overlay.id = 'customOverlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black
  overlay.style.zIndex = '999';
  document.body.appendChild(overlay);

  // Create the iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'customIframe';
  iframe.style.position = 'fixed';
  iframe.style.top = '80px';
  iframe.style.right = '80px';
  iframe.style.width = '340px';
  iframe.style.height = '350px';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '15px';
  iframe.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
  iframe.style.zIndex = '1000';

  // Set the iframe source to the given link
  iframe.src = 'https://chatbotgauge.netlify.app/';

  document.body.appendChild(iframe);
  // window.addEventListener('message', async (event) => {
  //   // Ensure the message is from the expected origin (security check)
  //   if (event.origin !== 'https://chatbotgauge.netlify.app') return;
  
  //   if (event.data.action === 'startRecording') {
  //     console.log('Recording started from iframe!');
  
  //     try {
  //       // Get the current active tab
  //       const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  //       // Store the current tab ID before opening recording.html
  //       await chrome.storage.local.set({ previousTabId: currentTab.id });
  
  //       // Open recording.html in a new tab
  //       chrome.tabs.create({ url: 'recording.html' }, (tab) => {
  //         chrome.tabs.update(tab.id, { pinned: true });
  //       });
  
  //       // Close the iframe
  //       document.getElementById('customIframe')?.remove();
  //       document.getElementById('customOverlay')?.remove();
  
  //     } catch (error) {
  //       console.error('Error handling start recording:', error);
  //     }
  //   }
  // });
  
  

  // Close the iframe and overlay when clicking outside
  overlay.addEventListener('click', () => {
    document.body.removeChild(iframe);
    document.body.removeChild(overlay);
  });
}



// document.getElementById('startRecord').addEventListener('click', async () => {
//   const tab = await chrome.tabs.create({
//     url: 'recorder/recorder.html',
//     pinned: true
//   });
  
//   chrome.runtime.sendMessage({ action: 'startRecording', tabId: tab.id });
//   window.close();
// });
