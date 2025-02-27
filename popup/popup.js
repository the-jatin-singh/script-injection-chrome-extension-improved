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
            background: white;
            padding: 20px;
            border-radius: 8px;
            position: relative;
            text-align: center;
            min-width: 300px;
            position:absolute;
            top: 0px;
            right: 160px;
        }
        
        .btg-close {
            cursor: pointer;
            padding: 5px;
            color:black;
        }
        
        .btg-heading {
            font-size: 18px;
            margin: 15px 0;
            color: #333;
        }
        
        .btg-start-button {
            padding: 10px 20px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 10px;
        }
        
        .btg-start-button:hover {
            background: #45a049;
        }
    `;

    const overlayHTML = `
        <div class="btg-overlay">
            <div class="btg-content">
                <div class="btg-close">x</div>
                <p class="btg-heading">Use Botguage</p>
                <button class="btg-start-button">Start Recording</button>
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
                startBtn.addEventListener('click', () => {  // Remove async
                    overlay.remove();
                    // Send message to background script to create tab
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

        // Add listener outside executeScript
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
        document.body.innerHTML = `
            <div class="invalid-tab-message">
                Please navigate to a webpage to start recording
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', initializePopup);
