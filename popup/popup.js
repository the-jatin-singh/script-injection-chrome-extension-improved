function isValidUrl(url) {
    return url && 
           url.length > 0 && 
           !url.startsWith('chrome://') && 
           !url.startsWith('chrome-extension://') &&
           !url.startsWith('edge://') &&
           !url.startsWith('about:') &&
           !url.startsWith('chrome://newtab') &&
           url !== 'about:blank' &&
           url !== 'about:newtab';
}


async function injectOverlay(tab) {
  const overlayCSS = `
      .btg-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999999;
          display: flex;
          justify-content: center;
          align-items: center;
      }

      .btg-content {
          background: #F7FAF8;
          padding: 20px;
          border-radius: 8px;
          position: absolute;
          top: 0px;
          right: 160px;
          width: 320px;
          height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
      }

      .btg-close {
          cursor: pointer;
          color: black;
          font-size: 16px;
          align-self: flex-end;
          margin-bottom: 10px;
      }

      .btg-heading {
          font-size: 18px;
          margin-bottom: 10px;
          color: #333;
      }

      .recording-container {
          width: 100%;
          background-color: #FFFFFF;
          border-radius: 8px;
          padding: 15px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
      }

      .green-line {
          width: 25px;
          height: 4px;
          background-color: #12B97B;
          border-radius: 2px;
      }

      .btg-start-button {
          height: 40px;
          width: 100%;
          font-size: 14px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          background-color: #12B97B;
          color: #FFFFFF;
          border: 1px solid #12B97B;
          transition: 0.2s;
      }

      .btg-start-button:hover {
          background-color: #0C372A;
          color: #00D596;
      }

      .btg-footer {
          margin-top: auto;
          font-size: 12px;
          color: #5A706A;
      }

      .btg-footer a {
          color: #12B97B;
          text-decoration: underline;
          cursor: pointer;
      }
  `;

  const overlayHTML = `
      <div class="btg-overlay">
          <div class="btg-content">
              <div class="btg-close">X</div>
              <h4 class="btg-heading">Use BotGauge</h4>
              <div class="recording-container">
                  <div class="green-line"></div>
                  <p>Use BotGauge’s recording bot to capture video and audio while explaining the actions/pages to be tested.</p>
                  <button class="btg-start-button">Start Recording</button>
              </div>
              <div class="btg-footer">
                  <p>Need more help? <a href="https://botgauge.com/contact/" target="_blank">Contact support</a></p>
              </div>
          </div>
      </div>
  `;

  try {
      // Inject CSS
      await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          css: overlayCSS
      });

      // Inject HTML and add event listeners
      await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (overlayHTML) => {
              // Remove any existing overlay
              const existingOverlay = document.querySelector('.btg-overlay');
              if (existingOverlay) existingOverlay.remove();

              // Add new overlay
              document.body.insertAdjacentHTML('beforeend', overlayHTML);

              const overlay = document.querySelector('.btg-overlay');
              const closeBtn = document.querySelector('.btg-close');
              const startBtn = document.querySelector('.btg-start-button');

              // Close on clicking X
              closeBtn.addEventListener('click', () => overlay.remove());

              // Close on clicking outside content
              overlay.addEventListener('click', (e) => {
                  if (e.target === overlay) overlay.remove();
              });

              // Start recording button
              startBtn.addEventListener('click', () => {  
                  overlay.remove();
                  chrome.runtime.sendMessage({ 
                      action: 'createRecordingTab'
                  });
              });

              // Remove overlay when tab loses focus
              document.addEventListener('visibilitychange', () => {
                  if (document.hidden) overlay.remove();
              });
          },
          args: [overlayHTML]
      });

      chrome.runtime.onMessage.addListener((message) => {
          if (message.action === 'createRecordingTab') {
              chrome.tabs.create({
                  url: 'recorder/recorder.html',
                  pinned: true
              }).then(tab => {
                  chrome.runtime.sendMessage({ 
                      action: 'startRecording', 
                      tabId: tab.id 
                  });
              });
          }
      });
  } catch (err) {
      console.error('Failed to inject overlay:', err);
  }
} 


async function initializePopup() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab && isValidUrl(tab.url)) {
    await injectOverlay(tab);
    window.close();
  } else {
    document.body.style.display = 'block'; // Make popup visible
    document.body.style.background = '#f7faf8';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.width = '430px';
    document.body.style.height = 'auto';
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';
    document.body.style.fontFamily = 'Arial, sans-serif';

    // Create the main container
    const container = document.createElement('div');
    container.style.width = '350px';
    container.style.padding = '20px';
    container.style.background = '#f7faf8';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';

    // Create the header section (logo + close button)
    const header = document.createElement('div');
    header.style.width = '100%';
    header.style.height = '26px'; // Increased height
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '26px';
    header.style.border = '1px solid #ddd';
    header.style.background = '#ffffff';
    header.style.borderRadius = '6px';
    header.style.padding = '10px 20px'; // Adjusted padding

    // Logo Image
    const logo = document.createElement('img');
    logo.src = 'botgauge-green.png'; // Ensure this image is in your extension's assets
    logo.style.height = '25px';
    logo.style.objectFit = 'contain';

    // Close button (X)
    // const closeButton = document.createElement('button');
    // closeButton.innerHTML = '&times;';
    // closeButton.style.border = 'none';
    // closeButton.style.background = 'none';
    // closeButton.style.fontSize = '30px';
    // closeButton.style.cursor = 'pointer';
    // closeButton.style.minWidth = '30px'; // Ensuring proper width
    // closeButton.style.color = '#333';
    // closeButton.onclick = () => window.close();

    header.appendChild(logo);
    // header.appendChild(closeButton);

    // Create message box
    const messageBox = document.createElement('div');
    messageBox.style.width = '100%';
    messageBox.style.height = '100px';
    messageBox.style.padding = '20px';
    messageBox.style.border = '1px solid #ddd';
    messageBox.style.borderRadius = '6px';
    messageBox.style.background = '#ffffff';
    messageBox.style.display = 'flex';
    messageBox.style.flexDirection = 'column';
    messageBox.style.justifyContent = 'center';
    messageBox.style.alignItems = 'flex-start';

    // Status indicator (Green line) - Centered
    const statusLine = document.createElement('div');
    statusLine.style.width = '20px';
    statusLine.style.height = '4px';
    statusLine.style.borderRadius = '2px';
    statusLine.style.backgroundColor = '#12b97b';
    statusLine.style.marginBottom = '10px';
    statusLine.style.alignSelf = 'start';

    // Message text - Bold
    const messageText = document.createElement('p');
    messageText.style.color = '#333';
    messageText.style.fontSize = '19px';
    messageText.style.fontWeight = 'bold';
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

    document.body.appendChild(container);
  }
}

document.addEventListener('DOMContentLoaded', initializePopup);

