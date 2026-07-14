document.addEventListener('DOMContentLoaded', () => {
    const videoPlayer = document.getElementById('recordingPlayer');
    const eventsPanel = document.getElementById('eventsPanel');
    const eventsList = document.getElementById('eventsList');
    const eventsCountSpan = document.getElementById('eventsCount');
    const downloadBtn = document.getElementById('downloadBtn');
    
    let recordedEvents = [];
    
    // Get the blob URL from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const blobUrl = urlParams.get('blobUrl');

    if (blobUrl) {
        videoPlayer.src = blobUrl;
    }

    // Load the recorded events (click/input/scroll/etc. with labels and
    // timestamps) that actionButton.js captured during recording.
    chrome.storage.local.get('recordedEvents', (result) => {
        recordedEvents = result.recordedEvents || [];
        displayEvents(recordedEvents);
        chrome.storage.local.remove('recordedEvents');
    });
    
    // Format milliseconds to MM:SS format
    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    
    // Display events in the timeline
    function displayEvents(events) {
        if (!events || events.length === 0) {
            eventsPanel.style.display = 'none';
            return;
        }
        
        eventsPanel.style.display = 'block';
        eventsList.innerHTML = '';
        eventsCountSpan.textContent = events.length;
        
        events.forEach((event, index) => {
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            
            const timeStr = formatTime(event.timestamp);
            const label = event.label || event.type;
            const type = event.type.toUpperCase();

            // Surface the raw DOM info (selector/id/role/aria-label) inline so
            // it's visible without downloading the JSON.
            const metaParts = [event.element];
            if (event.uniqueSelector) metaParts.push(`locator=${event.uniqueSelector}`);
            if (event.elementId) metaParts.push(`id=${event.elementId}`);
            if (event.role) metaParts.push(`role=${event.role}`);
            if (event.ariaLabel) metaParts.push(`aria-label="${event.ariaLabel}"`);
            if (event.details && event.details.value) metaParts.push(`value="${event.details.value}"`);
            const meta = metaParts.filter(Boolean).join(' | ');

            eventItem.innerHTML = `
                <div class="event-time">${timeStr}</div>
                <div class="event-label">${sanitizeHtml(label)}</div>
                <div class="event-type">${type}</div>
                <div class="event-meta">${sanitizeHtml(meta)}</div>
            `;
            
            // Click to seek video to this event
            eventItem.addEventListener('click', () => {
                const videoSeconds = event.timestamp / 1000;
                videoPlayer.currentTime = videoSeconds;
                videoPlayer.play();
            });
            
            eventsList.appendChild(eventItem);
        });
    }
    
    // Sanitize HTML to prevent XSS
    function sanitizeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Download events as JSON
    downloadBtn.addEventListener('click', () => {
        if (recordedEvents.length === 0) {
            alert('No events recorded');
            return;
        }
        
        const dataToDownload = {
            recordingMetadata: {
                timestamp: new Date().toISOString(),
                totalEvents: recordedEvents.length,
                videoDuration: videoPlayer.duration
            },
            events: recordedEvents
        };
        
        const jsonString = JSON.stringify(dataToDownload, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `recording-events-${new Date().getTime()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });

    // Re-record: discard the current video/events and start a fresh
    // recording (re-opens the screen-share picker), replacing this tab.
    const reRecordButton = document.getElementById('reRecordButton');
    reRecordButton.addEventListener('click', () => {
        videoPlayer.pause();
        if (blobUrl) {
            URL.revokeObjectURL(blobUrl);
        }
        chrome.storage.local.remove('recordedEvents');
        chrome.runtime.sendMessage({ action: 'createRecordingTab' });
        chrome.tabs.getCurrent((tab) => {
            chrome.tabs.remove(tab.id);
        });
    });
});

document.getElementById('exitButton').addEventListener('click', () => {
    chrome.tabs.getCurrent((tab) => {
      chrome.tabs.remove(tab.id);
    });
  });