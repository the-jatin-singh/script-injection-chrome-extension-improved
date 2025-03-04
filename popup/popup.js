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
      .btg-overlay-wrapper {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
      }
      
      .btg-overlay-wrapper * {
          all: unset;
          box-sizing: border-box !important;
      }

      .btg-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          background: rgba(0, 0, 0, 0.5) !important;
          z-index: 2147483647 !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          font-family: inherit !important;
      }

      .btg-content {
          background: #F7FAF8 !important;
          padding: 40px 28px !important;
          border-radius: 12px !important;
          position: absolute !important;
          top: 0px !important;
          right: 200px !important;
          width: 448px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          gap:32px !important;
          box-shadow: 0px 2px 4px 0px #00000014 !important;
      }
      .btg-popup-header{
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        border: 1px solid #D9E7E0 !important;
        background-color: white !important;
        height: 60px !important;
        width:100% !important;
        border-radius: 6px !important;
      }

      .btg-close {
          cursor: pointer !important;
      }

      .recording-container {
          width: 100% !important;
          background-color: #FFFFFF !important;
          border-radius: 6px !important;
          border: 1px solid #D9E7E0 !important;
          padding: 32px 20px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 32px !important;
      }

      .recording-container-information{
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          gap:6px !important;
      }

      .recording-container h2 {
          display: block !important;
          color: #191F1F !important;
          font-size: 20px !important;
          font-weight: 6pp !important;
          line-height: 26px !important;
          margin: 0 !important;
          padding: 0 !important;
      }

      .recording-container p {
          display: block !important;
          color: #191F1F !important;
          font-size: 16px !important;
          line-height: 20.8px !important;
          margin: 0 !important;
          padding: 0 !important;
      }

      .green-line {
          width: 20px !important;
          height: 3px !important;
          background-color: #12B97B !important;
          border: 3px solid #12B97B !important;
          display: block !important;
      }

      .btg-start-button {
          height: 40px !important;
          width: 100% !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          border: 1px solid #12B97B !important;
          border-radius: 8px !important;
          cursor: pointer !important;
          background-color: #12B97B !important;
          color: #FFFFFF !important;
          transition: all 0.2s ease !important;
          display: block !important;
          text-align: center !important;
          line-height: 40px !important;
      }

      .btg-start-button:hover {
          background-color: #0C372A !important;
          color: #00D596 !important;
      }

      .btg-footer {
          height: 56px !important;
          width: 100%;
          padding: 0 20px !important;
          background-color: white !important;
          border-radius: 6px !important;

          font-size: 16px !important;
          font-weight: 600 !important;

          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          border: 1px solid #D9E7E0 !important;
      }

      .btg-footer a {
          color: #12B97B !important;
          text-decoration: underline !important;
          cursor: pointer !important;
          display: inline !important;
      }
  `;

  const overlayHTML = `
      <div class="btg-overlay-wrapper">
          <div class="btg-overlay">
              <div class="btg-content">
                  <div class="btg-popup-header">

                    <svg class="btg-close" width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.3603 14.5027C16.5805 14.7229 16.7041 15.0215 16.7041 15.3328C16.7041 15.6442 16.5805 15.9427 16.3603 16.1629C16.1402 16.383 15.8416 16.5067 15.5302 16.5067C15.2189 16.5067 14.9203 16.383 14.7002 16.1629L8.49996 9.96074L2.29781 16.1609C2.07766 16.3811 1.77907 16.5048 1.46773 16.5048C1.15639 16.5048 0.857803 16.3811 0.637653 16.1609C0.417503 15.9408 0.293823 15.6422 0.293823 15.3309C0.293823 15.0195 0.417503 14.7209 0.637653 14.5008L6.8398 8.30059L0.639606 2.09844C0.419455 1.87829 0.295776 1.5797 0.295776 1.26836C0.295776 0.95702 0.419455 0.658432 0.639606 0.438282C0.859756 0.218131 1.15834 0.0944517 1.46968 0.0944517C1.78102 0.0944517 2.07961 0.218131 2.29976 0.438282L8.49996 6.64043L14.7021 0.437305C14.9223 0.217154 15.2208 0.0934753 15.5322 0.0934753C15.8435 0.0934753 16.1421 0.217154 16.3623 0.437305C16.5824 0.657455 16.7061 0.956043 16.7061 1.26738C16.7061 1.57872 16.5824 1.87731 16.3623 2.09746L10.1601 8.30059L16.3603 14.5027Z" fill="#869891"/>
                    </svg>
                  </div>
                  <div class="recording-container">
                      <div class="recording-container-information">
                        <div class="green-line"></div>
                        <h2>How to use?</h2>
                        <p>Use BotGauge’s recording bot to capture video and audio while explaining the actions/pages to be tested.</p>
                      </div>
                      <button class="btg-start-button">Start Recording</button>
                  </div>
                  <div class="btg-footer">
                      <p>Need more help?</p>
                       <a href="https://botgauge.com/contact/" target="_blank">Contact support</a>
                  </div>
              </div>
          </div>
      </div>
  `;

    try {
        // Inject CSS
        await chrome.scripting.insertCSS({
            target: {
                tabId: tab.id
            },
            css: overlayCSS
        });

        // Inject HTML and add event listeners
        await chrome.scripting.executeScript({
            target: {
                tabId: tab.id
            },
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
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

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