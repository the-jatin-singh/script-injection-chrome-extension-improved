function injectActionButtons() {
    // Remove existing buttons if present
    const existingContainer = document.querySelector('.btg-action-btns-container');
    if (existingContainer) {
        existingContainer.remove();
    }

    // Only inject if not already present
    if (!document.querySelector('.btg-action-btns-container')) {
        const container = document.createElement('div');
        container.className = 'btg-action-btns-container';

        // Add styles for draggable functionality
        container.style.position = 'fixed';
        container.style.zIndex = '99998';
        container.style.left = '20px';
        container.style.bottom = '20px';
        container.style.cursor = 'default';

        const pauseButton = document.createElement('div');
        pauseButton.className = 'icon pause';
        pauseButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.5 1.75H10C9.66848 1.75 9.35054 1.8817 9.11612 2.11612C8.8817 2.35054 8.75 2.66848 8.75 3V13C8.75 13.3315 8.8817 13.6495 9.11612 13.8839C9.35054 14.1183 9.66848 14.25 10 14.25H12.5C12.8315 14.25 13.1495 14.1183 13.3839 13.8839C13.6183 13.6495 13.75 13.3315 13.75 13V3C13.75 2.66848 13.6183 2.35054 13.3839 2.11612C13.1495 1.8817 12.8315 1.75 12.5 1.75ZM12.25 12.75H10.25V3.25H12.25V12.75ZM6 1.75H3.5C3.16848 1.75 2.85054 1.8817 2.61612 2.11612C2.3817 2.35054 2.25 2.66848 2.25 3V13C2.25 13.3315 2.3817 13.6495 2.61612 13.8839C2.85054 14.1183 3.16848 14.25 3.5 14.25H6C6.33152 14.25 6.64946 14.1183 6.88388 13.8839C7.1183 13.6495 7.25 13.3315 7.25 13V3C7.25 2.66848 7.1183 2.35054 6.88388 2.11612C6.64946 1.8817 6.33152 1.75 6 1.75ZM5.75 12.75H3.75V3.25H5.75V12.75Z" fill="#5A706A"/>
</svg>
`;

        const playButton = document.createElement('div');
        playButton.className = 'icon play';
        playButton.style.display = 'none';
        playButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A706A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"/></svg>`;

        let isRecordingPaused = false;

        pauseButton.onclick = () => {
            chrome.runtime.sendMessage({ action: 'pauseRecording' });
            pauseButton.style.display = 'none';
            playButton.style.display = 'flex';
            isRecordingPaused = true;
        };

        playButton.onclick = () => {
            chrome.runtime.sendMessage({ action: 'resumeRecording' });
            playButton.style.display = 'none';
            pauseButton.style.display = 'flex';
            isRecordingPaused = false;
        };

        const stopButton = document.createElement('div');
        stopButton.className = 'icon stop';
        stopButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 1.5625C8.33122 1.5625 6.69992 2.05735 5.31238 2.98448C3.92484 3.9116 2.84338 5.22936 2.20477 6.77111C1.56616 8.31286 1.39907 10.0094 1.72463 11.6461C2.05019 13.2828 2.85379 14.7862 4.03379 15.9662C5.2138 17.1462 6.71721 17.9498 8.35393 18.2754C9.99064 18.6009 11.6871 18.4338 13.2289 17.7952C14.7706 17.1566 16.0884 16.0752 17.0155 14.6876C17.9427 13.3001 18.4375 11.6688 18.4375 10C18.435 7.763 17.5453 5.61833 15.9635 4.03653C14.3817 2.45473 12.237 1.56498 10 1.5625ZM10 16.5625C8.70206 16.5625 7.43327 16.1776 6.35407 15.4565C5.27488 14.7354 4.43374 13.7105 3.93704 12.5114C3.44034 11.3122 3.31038 9.99272 3.5636 8.71972C3.81682 7.44672 4.44183 6.27739 5.35962 5.35961C6.2774 4.44183 7.44672 3.81681 8.71972 3.5636C9.99272 3.31038 11.3122 3.44034 12.5114 3.93704C13.7105 4.43374 14.7354 5.27487 15.4565 6.35407C16.1776 7.43327 16.5625 8.70206 16.5625 10C16.5606 11.7399 15.8686 13.408 14.6383 14.6383C13.408 15.8686 11.7399 16.5606 10 16.5625ZM13.125 7.8125V12.1875C13.125 12.4361 13.0262 12.6746 12.8504 12.8504C12.6746 13.0262 12.4361 13.125 12.1875 13.125H7.8125C7.56386 13.125 7.32541 13.0262 7.14959 12.8504C6.97378 12.6746 6.875 12.4361 6.875 12.1875V7.8125C6.875 7.56386 6.97378 7.3254 7.14959 7.14959C7.32541 6.97377 7.56386 6.875 7.8125 6.875H12.1875C12.4361 6.875 12.6746 6.97377 12.8504 7.14959C13.0262 7.3254 13.125 7.56386 13.125 7.8125Z" fill="white"/>
</svg>
`;

        const resetButton = document.createElement('div');
        resetButton.className = 'icon reset';
        resetButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.8125 10.0001C17.8127 12.0541 17.004 14.0256 15.5614 15.4877C14.1188 16.9499 12.1585 17.7851 10.1047 17.8126H10C8.00552 17.8168 6.08591 17.0534 4.63906 15.6806C4.45828 15.5099 4.35273 15.2743 4.34562 15.0258C4.33851 14.7772 4.43044 14.536 4.60117 14.3552C4.7719 14.1744 5.00746 14.0689 5.25602 14.0618C5.50458 14.0547 5.74578 14.1466 5.92656 14.3173C6.77519 15.1185 7.84111 15.6518 8.99112 15.8506C10.1411 16.0494 11.3242 15.9049 12.3926 15.4352C13.4609 14.9654 14.3671 14.1912 14.998 13.2093C15.6288 12.2274 15.9563 11.0814 15.9395 9.9144C15.9227 8.74745 15.5623 7.61133 14.9035 6.64802C14.2446 5.6847 13.3165 4.93691 12.2351 4.4981C11.1536 4.05929 9.96684 3.94891 8.82303 4.18076C7.67922 4.41261 6.62911 4.97641 5.80391 5.8017C5.79375 5.81185 5.78438 5.82123 5.77344 5.8306L4.28828 7.18763H5.625C5.87364 7.18763 6.1121 7.28641 6.28791 7.46222C6.46373 7.63804 6.5625 7.87649 6.5625 8.12513C6.5625 8.37377 6.46373 8.61223 6.28791 8.78805C6.1121 8.96386 5.87364 9.06263 5.625 9.06263H1.875C1.62636 9.06263 1.3879 8.96386 1.21209 8.78805C1.03627 8.61223 0.9375 8.37377 0.9375 8.12513V4.37513C0.9375 4.12649 1.03627 3.88804 1.21209 3.71222C1.3879 3.53641 1.62636 3.43763 1.875 3.43763C2.12364 3.43763 2.3621 3.53641 2.53791 3.71222C2.71373 3.88804 2.8125 4.12649 2.8125 4.37513V5.99388L4.49062 4.45795C5.58508 3.36937 6.97748 2.62942 8.49209 2.33148C10.0067 2.03354 11.5756 2.19096 13.0008 2.78388C14.4261 3.37681 15.6437 4.37865 16.5001 5.66296C17.3564 6.94728 17.8131 8.4565 17.8125 10.0001Z" fill="#5A706A"/>
            </svg>`;

        const deleteButton = document.createElement('div');
        deleteButton.className = 'icon delete';
        deleteButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.875 3.75H3.125C2.87636 3.75 2.6379 3.84877 2.46209 4.02459C2.28627 4.2004 2.1875 4.43886 2.1875 4.6875C2.1875 4.93614 2.28627 5.1746 2.46209 5.35041C2.6379 5.52623 2.87636 5.625 3.125 5.625H3.4375V16.25C3.4375 16.6644 3.60212 17.0618 3.89515 17.3549C4.18817 17.6479 4.5856 17.8125 5 17.8125H15C15.4144 17.8125 15.8118 17.6479 16.1049 17.3549C16.3979 17.0618 16.5625 16.6644 16.5625 16.25V5.625H16.875C17.1236 5.625 17.3621 5.52623 17.5379 5.35041C17.7137 5.1746 17.8125 4.93614 17.8125 4.6875C17.8125 4.43886 17.7137 4.2004 17.5379 4.02459C17.3621 3.84877 17.1236 3.75 16.875 3.75ZM14.6875 15.9375H5.3125V5.625H14.6875V15.9375ZM5.9375 1.5625C5.9375 1.31386 6.03627 1.0754 6.21209 0.899587C6.3879 0.723772 6.62636 0.625 6.875 0.625H13.125C13.3736 0.625 13.6121 0.723772 13.7879 0.899587C13.9637 1.0754 14.0625 1.31386 14.0625 1.5625C14.0625 1.81114 13.9637 2.0496 13.7879 2.22541C13.6121 2.40123 13.3736 2.5 13.125 2.5H6.875C6.62636 2.5 6.3879 2.40123 6.21209 2.22541C6.03627 2.0496 5.9375 1.81114 5.9375 1.5625Z" fill="#5A706A"/>
            </svg>`;

        const infoButton = document.createElement('div');
        infoButton.className = 'icon info';
        infoButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.4375 6.5625C8.4375 6.31527 8.51081 6.0736 8.64817 5.86804C8.78552 5.66248 8.98074 5.50226 9.20915 5.40765C9.43756 5.31304 9.68889 5.28829 9.93137 5.33652C10.1738 5.38475 10.3966 5.5038 10.5714 5.67862C10.7462 5.85343 10.8653 6.07616 10.9135 6.31864C10.9617 6.56111 10.937 6.81245 10.8424 7.04085C10.7477 7.26926 10.5875 7.46449 10.382 7.60184C10.1764 7.73919 9.93473 7.8125 9.6875 7.8125C9.35598 7.8125 9.03804 7.6808 8.80362 7.44638C8.5692 7.21196 8.4375 6.89402 8.4375 6.5625ZM18.4375 10C18.4375 11.6688 17.9427 13.3001 17.0155 14.6876C16.0884 16.0752 14.7706 17.1566 13.2289 17.7952C11.6871 18.4338 9.99064 18.6009 8.35393 18.2754C6.71721 17.9498 5.2138 17.1462 4.03379 15.9662C2.85379 14.7862 2.05019 13.2828 1.72463 11.6461C1.39907 10.0094 1.56616 8.31286 2.20477 6.77111C2.84338 5.22936 3.92484 3.9116 5.31238 2.98448C6.69992 2.05735 8.33122 1.5625 10 1.5625C12.237 1.56498 14.3817 2.45473 15.9635 4.03653C17.5453 5.61833 18.435 7.763 18.4375 10ZM16.5625 10C16.5625 8.70206 16.1776 7.43327 15.4565 6.35407C14.7354 5.27487 13.7105 4.43374 12.5114 3.93704C11.3122 3.44034 9.99272 3.31038 8.71972 3.5636C7.44672 3.81681 6.2774 4.44183 5.35962 5.35961C4.44183 6.27739 3.81682 7.44672 3.5636 8.71972C3.31038 9.99272 3.44034 11.3122 3.93704 12.5114C4.43374 13.7105 5.27488 14.7354 6.35407 15.4565C7.43327 16.1776 8.70206 16.5625 10 16.5625C11.7399 16.5606 13.408 15.8686 14.6383 14.6383C15.8686 13.408 16.5606 11.7399 16.5625 10ZM10.9375 12.8656V10.3125C10.9375 9.8981 10.7729 9.50067 10.4799 9.20765C10.1868 8.91462 9.7894 8.75 9.375 8.75C9.1536 8.74967 8.93923 8.82771 8.76986 8.97029C8.60048 9.11287 8.48703 9.31079 8.4496 9.52901C8.41217 9.74722 8.45318 9.97164 8.56536 10.1625C8.67754 10.3534 8.85365 10.4984 9.0625 10.5719V13.125C9.0625 13.5394 9.22712 13.9368 9.52015 14.2299C9.81318 14.5229 10.2106 14.6875 10.625 14.6875C10.8464 14.6878 11.0608 14.6098 11.2302 14.4672C11.3995 14.3246 11.513 14.1267 11.5504 13.9085C11.5878 13.6903 11.5468 13.4659 11.4346 13.275C11.3225 13.0841 11.1464 12.9391 10.9375 12.8656Z" fill="#5A706A"/>
            </svg>`;

        const grabButton = document.createElement('div');
        grabButton.className = 'icon grab';
        grabButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A706A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grip-vertical"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>`;

        // Make button show it's draggable
        grabButton.style.cursor = 'grab';

        infoButton.onclick = () => {
            chrome.runtime.sendMessage({ action: 'switchToRecordingTab' });
        };
        resetButton.onclick = () => {
            openResetRecording();
        };
        deleteButton.onclick = () => {
            openDeleteRecording();
        };
        stopButton.onclick = () => {
            chrome.runtime.sendMessage({ action: 'stopRecording' });
            container.remove();
        };

        const pausePlayContainer = document.createElement('div');
        pausePlayContainer.className = 'btns-container';
        pausePlayContainer.appendChild(pauseButton);
        pausePlayContainer.appendChild(playButton);
        pausePlayContainer.appendChild(stopButton);

        const timer = document.createElement('div');
        timer.id = 'action-button-timer';
        timer.innerHTML = `00m:00s`;

        const expandableContainer = document.createElement('div');
        expandableContainer.className = 'btg-expandable-container';
        expandableContainer.appendChild(pauseButton);
        expandableContainer.appendChild(playButton);
        expandableContainer.appendChild(stopButton);
        expandableContainer.appendChild(timer);
        expandableContainer.appendChild(resetButton);
        expandableContainer.appendChild(deleteButton);
        expandableContainer.appendChild(infoButton);

        const grabButtonInner = document.createElement('div');
        grabButtonInner.className = 'icon grab inner-grab';
        grabButtonInner.innerHTML = grabButton.innerHTML;

        expandableContainer.appendChild(grabButtonInner);

        container.appendChild(expandableContainer);
        container.appendChild(grabButton);

        // Add draggable functionality
        let isDragging = false;
        let offsetX, offsetY;

        // Make both grab buttons draggable
        [grabButton, grabButtonInner].forEach(btn => {
            btn.style.cursor = 'grab';
            btn.onmousedown = (e) => {
                isDragging = true;
                btn.style.cursor = 'grabbing';

                const rect = container.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;

                e.preventDefault();
            };
        });

        // Function to handle mouse move event
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            // Calculate new position
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;

            // Get container dimensions
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;

            // Get viewport dimensions
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Ensure the container stays within viewport bounds
            newX = Math.max(0, Math.min(newX, viewportWidth - containerWidth));
            newY = Math.max(0, Math.min(newY, viewportHeight - containerHeight));

            // Set the new position
            container.style.left = newX + 'px';
            container.style.top = newY + 'px';
        });

        // Function to handle mouse up event
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                grabButton.style.cursor = 'grab';
            }
        });

        // Function to handle mouse leave event
        document.addEventListener('mouseleave', () => {
            if (isDragging) {
                isDragging = false;
                grabButton.style.cursor = 'grab';
            }
        });

        // Ensure body exists
        if (document.body) {
            document.body.appendChild(container);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.appendChild(container);
            });
        }

        // Add message listener for recording state changes
        chrome.runtime.onMessage.addListener((message) => {
            if (message.action === 'recordingStateChanged') {
                const pauseButton = document.querySelector('.icon.pause');
                const playButton = document.querySelector('.icon.play');
                if (pauseButton && playButton) {
                    if (message.isPaused) {
                        pauseButton.style.display = 'none';
                        playButton.style.display = 'flex';
                    } else {
                        playButton.style.display = 'none';
                        pauseButton.style.display = 'flex';
                    }
                }
            }
            // Keep existing timer update listener
            if (message.action === 'updateTimer') {
                const timerElement = document.getElementById('action-button-timer');
                if (timerElement) {
                    timerElement.innerHTML = message.time;
                }
            }
        });
    }
}

function createDialog(type) {
    const dialog = document.createElement('div');
    dialog.className = `btg-dialog ${type}-dialog`;
    dialog.innerHTML = `
        <div class="dialog-content">
            <div class="dialog-header">
                <h3>${type === 'delete' ? 'Delete Recording' : 'Reset Recording'}</h3>
                <span class="close-dialog">&times;</span>
            </div>
            <div class="dialog-body">
                <p>${type === 'delete' ? 'Are you sure you want to delete this recording?' : 'Are you sure you want to reset this recording?'}</p>
            </div>
            <div class="dialog-footer">
                <button class="cancel-btn">Resume recording</button>
                <button class="confirm-btn">${type === 'delete' ? 'Delete' : 'Restart'}</button>
            </div>
        </div>
    `;
    return dialog;
}

function handleDialogEvents(dialog, type) {
    const closeBtn = dialog.querySelector('.close-dialog');
    const cancelBtn = dialog.querySelector('.cancel-btn');
    const confirmBtn = dialog.querySelector('.confirm-btn');
    const dialogContent = dialog.querySelector('.dialog-content');

    const handleCancel = () => {
        if (type === 'delete') {
            cancelDeleteRecording();
        } else {
            cancelResetRecording();
        }
    };

    const handleOutsideClick = (e) => {
        if (!dialogContent.contains(e.target)) {
            handleCancel();
        }
    };

    closeBtn.onclick = handleCancel;
    cancelBtn.onclick = handleCancel;
    dialog.onclick = handleOutsideClick;

    confirmBtn.onclick = () => {
        if (type === 'delete') {
            confirmDeleteRecording();
        } else {
            confirmResetRecording();
        }
    };

    // Handle tab change
    document.addEventListener('visibilitychange', handleCancel);

    return () => {
        document.removeEventListener('visibilitychange', handleCancel);
    };
}

function openDeleteRecording() {
    chrome.runtime.sendMessage({ action: 'pauseRecording' });
    const dialog = createDialog('delete');
    document.body.appendChild(dialog);
    return handleDialogEvents(dialog, 'delete');
}

function openResetRecording() {
    chrome.runtime.sendMessage({ action: 'pauseRecording' });
    const dialog = createDialog('reset');
    document.body.appendChild(dialog);
    return handleDialogEvents(dialog, 'reset');
}

function cancelDeleteRecording() {
    const dialog = document.querySelector('.btg-dialog.delete-dialog');
    if (dialog) {
        dialog.remove();
        chrome.runtime.sendMessage({ action: 'resumeRecording' });
    }
}

function cancelResetRecording() {
    const dialog = document.querySelector('.btg-dialog.reset-dialog');
    if (dialog) {
        dialog.remove();
        chrome.runtime.sendMessage({ action: 'resumeRecording' });
    }
}

function confirmDeleteRecording() {
    const dialog = document.querySelector('.btg-dialog.delete-dialog');
    if (dialog) {
        dialog.remove();
    }
    chrome.runtime.sendMessage({ action: 'deleteRecording' });
}

function confirmResetRecording() {
    // Remove any open dialogs
    const deleteDialog = document.querySelector('.btg-dialog.delete-dialog');
    const resetDialog = document.querySelector('.btg-dialog.reset-dialog');
    if (deleteDialog) deleteDialog.remove();
    if (resetDialog) resetDialog.remove();

    // Simply send reset message to background script
    chrome.runtime.sendMessage({ action: 'resetRecording' });
}

injectActionButtons();