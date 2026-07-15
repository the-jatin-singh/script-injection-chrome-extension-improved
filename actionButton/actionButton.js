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
        container.style.zIndex = '99999';
        container.style.left = '20px';
        container.style.bottom = '20px';
        container.style.cursor = 'default';

        const pauseButton = document.createElement('div');
        pauseButton.className = 'icon pause';
        pauseButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.625 2.1875H12.5C12.0856 2.1875 11.6882 2.35212 11.3951 2.64515C11.1021 2.93817 10.9375 3.3356 10.9375 3.75V16.25C10.9375 16.6644 11.1021 17.0618 11.3951 17.3549C11.6882 17.6479 12.0856 17.8125 12.5 17.8125H15.625C16.0394 17.8125 16.4368 17.6479 16.7299 17.3549C17.0229 17.0618 17.1875 16.6644 17.1875 16.25V3.75C17.1875 3.3356 17.0229 2.93817 16.7299 2.64515C16.4368 2.35212 16.0394 2.1875 15.625 2.1875ZM15.3125 15.9375H12.8125V4.0625H15.3125V15.9375ZM7.5 2.1875H4.375C3.9606 2.1875 3.56317 2.35212 3.27015 2.64515C2.97712 2.93817 2.8125 3.3356 2.8125 3.75V16.25C2.8125 16.6644 2.97712 17.0618 3.27015 17.3549C3.56317 17.6479 3.9606 17.8125 4.375 17.8125H7.5C7.9144 17.8125 8.31183 17.6479 8.60485 17.3549C8.89788 17.0618 9.0625 16.6644 9.0625 16.25V3.75C9.0625 3.3356 8.89788 2.93817 8.60485 2.64515C8.31183 2.35212 7.9144 2.1875 7.5 2.1875ZM7.1875 15.9375H4.6875V4.0625H7.1875V15.9375Z" fill="#5A706A"/>
            </svg>`;

        const playButton = document.createElement('div');
        playButton.className = 'icon play';
        playButton.style.display = 'none';
        playButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5A706A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"/></svg>`;

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
                <path d="M15.625 2.8125H4.375C3.9606 2.8125 3.56317 2.97712 3.27015 3.27015C2.97712 3.56317 2.8125 3.9606 2.8125 4.375V15.625C2.8125 16.0394 2.97712 16.4368 3.27015 16.7299C3.56317 17.0229 3.9606 17.1875 4.375 17.1875H15.625C16.0394 17.1875 16.4368 17.0229 16.7299 16.7299C17.0229 16.4368 17.1875 16.0394 17.1875 15.625V4.375C17.1875 3.9606 17.0229 3.56317 16.7299 3.27015C16.4368 2.97712 16.0394 2.8125 15.625 2.8125ZM15.3125 15.3125H4.6875V4.6875H15.3125V15.3125Z" fill="white"/>
            </svg>`;

        const resetButton = document.createElement('div');
        resetButton.className = 'icon reset';
        resetButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.8125 10.0001C17.8127 12.0541 17.004 14.0256 15.5614 15.4877C14.1188 16.9499 12.1585 17.7851 10.1047 17.8126H10C8.00552 17.8168 6.08591 17.0534 4.63906 15.6806C4.45828 15.5099 4.35273 15.2743 4.34562 15.0258C4.33851 14.7772 4.43044 14.536 4.60117 14.3552C4.7719 14.1744 5.00746 14.0689 5.25602 14.0618C5.50458 14.0547 5.74578 14.1466 5.92656 14.3173C6.77519 15.1185 7.84111 15.6518 8.99112 15.8506C10.1411 16.0494 11.3242 15.9049 12.3926 15.4352C13.4609 14.9654 14.3671 14.1912 14.998 13.2093C15.6288 12.2274 15.9563 11.0814 15.9395 9.9144C15.9227 8.74745 15.5623 7.61133 14.9035 6.64802C14.2446 5.6847 13.3165 4.93691 12.2351 4.4981C11.1536 4.05929 9.96684 3.94891 8.82303 4.18076C7.67922 4.41261 6.62911 4.97641 5.80391 5.8017C5.79375 5.81185 5.78438 5.82123 5.77344 5.8306L4.28828 7.18763H5.625C5.87364 7.18763 6.1121 7.28641 6.28791 7.46222C6.46373 7.63804 6.5625 7.87649 6.5625 8.12513C6.5625 8.37377 6.46373 8.61223 6.28791 8.78805C6.1121 8.96386 5.87364 9.06263 5.625 9.06263H1.875C1.62636 9.06263 1.3879 8.96386 1.21209 8.78805C1.03627 8.61223 0.9375 8.37377 0.9375 8.12513V4.37513C0.9375 4.12649 1.03627 3.88804 1.21209 3.71222C1.3879 3.53641 1.62636 3.43763 1.875 3.43763C2.12364 3.43763 2.3621 3.53641 2.53791 3.71222C2.71373 3.88804 2.8125 4.12649 2.8125 4.37513V5.99388L4.49062 4.45795C5.58508 3.36937 6.97748 2.62942 8.49209 2.33148C10.0067 2.03354 11.5756 2.19096 13.0008 2.78388C14.4261 3.37681 15.6437 4.37865 16.5001 5.66296C17.3564 6.94728 17.8131 8.4565 17.8125 10.0001Z" fill="#5A706A"/>
            </svg>`;

        const deleteButton = document.createElement('div');
        deleteButton.className = 'icon delete';
        deleteButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.875 3.75H3.125C2.87636 3.75 2.6379 3.84877 2.46209 4.02459C2.28627 4.2004 2.1875 4.43886 2.1875 4.6875C2.1875 4.93614 2.28627 5.1746 2.46209 5.35041C2.6379 5.52623 2.87636 5.625 3.125 5.625H3.4375V16.25C3.4375 16.6644 3.60212 17.0618 3.89515 17.3549C4.18817 17.6479 4.5856 17.8125 5 17.8125H15C15.4144 17.8125 15.8118 17.6479 16.1049 17.3549C16.3979 17.0618 16.5625 16.6644 16.5625 16.25V5.625H16.875C17.1236 5.625 17.3621 5.52623 17.5379 5.35041C17.7137 5.1746 17.8125 4.93614 17.8125 4.6875C17.8125 4.43886 17.7137 4.2004 17.5379 4.02459C17.3621 3.84877 17.1236 3.75 16.875 3.75ZM14.6875 15.9375H5.3125V5.625H14.6875V15.9375ZM5.9375 1.5625C5.9375 1.31386 6.03627 1.0754 6.21209 0.899587C6.3879 0.723772 6.62636 0.625 6.875 0.625H13.125C13.3736 0.625 13.6121 0.723772 13.7879 0.899587C13.9637 1.0754 14.0625 1.31386 14.0625 1.5625C14.0625 1.81114 13.9637 2.0496 13.7879 2.22541C13.6121 2.40123 13.3736 2.5 13.125 2.5H6.875C6.62636 2.5 6.3879 2.40123 6.21209 2.22541C6.03627 2.0496 5.9375 1.81114 5.9375 1.5625Z" fill="#5A706A"/>
            </svg>`;

        const infoButton = document.createElement('div');
        infoButton.className = 'icon info';
        infoButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.4375 6.5625C8.4375 6.31527 8.51081 6.0736 8.64817 5.86804C8.78552 5.66248 8.98074 5.50226 9.20915 5.40765C9.43756 5.31304 9.68889 5.28829 9.93137 5.33652C10.1738 5.38475 10.3966 5.5038 10.5714 5.67862C10.7462 5.85343 10.8653 6.07616 10.9135 6.31864C10.9617 6.56111 10.937 6.81245 10.8424 7.04085C10.7477 7.26926 10.5875 7.46449 10.382 7.60184C10.1764 7.73919 9.93473 7.8125 9.6875 7.8125C9.35598 7.8125 9.03804 7.6808 8.80362 7.44638C8.5692 7.21196 8.4375 6.89402 8.4375 6.5625ZM18.4375 10C18.4375 11.6688 17.9427 13.3001 17.0155 14.6876C16.0884 16.0752 14.7706 17.1566 13.2289 17.7952C11.6871 18.4338 9.99064 18.6009 8.35393 18.2754C6.71721 17.9498 5.2138 17.1462 4.03379 15.9662C2.85379 14.7862 2.05019 13.2828 1.72463 11.6461C1.39907 10.0094 1.56616 8.31286 2.20477 6.77111C2.84338 5.22936 3.92484 3.9116 5.31238 2.98448C6.69992 2.05735 8.33122 1.5625 10 1.5625C12.237 1.56498 14.3817 2.45473 15.9635 4.03653C17.5453 5.61833 18.435 7.763 18.4375 10ZM16.5625 10C16.5625 8.70206 16.1776 7.43327 15.4565 6.35407C14.7354 5.27487 13.7105 4.43374 12.5114 3.93704C11.3122 3.44034 9.99272 3.31038 8.71972 3.5636C7.44672 3.81681 6.2774 4.44183 5.35962 5.35961C4.44183 6.27739 3.81682 7.44672 3.5636 8.71972C3.31038 9.99272 3.44034 11.3122 3.93704 12.5114C4.43374 13.7105 5.27488 14.7354 6.35407 15.4565C7.43327 16.1776 8.70206 16.5625 10 16.5625C11.7399 16.5606 13.408 15.8686 14.6383 14.6383C15.8686 13.408 16.5606 11.7399 16.5625 10ZM10.9375 12.8656V10.3125C10.9375 9.8981 10.7729 9.50067 10.4799 9.20765C10.1868 8.91462 9.7894 8.75 9.375 8.75C9.1536 8.74967 8.93923 8.82771 8.76986 8.97029C8.60048 9.11287 8.48703 9.31079 8.4496 9.52901C8.41217 9.74722 8.45318 9.97164 8.56536 10.1625C8.67754 10.3534 8.85365 10.4984 9.0625 10.5719V13.125C9.0625 13.5394 9.22712 13.9368 9.52015 14.2299C9.81318 14.5229 10.2106 14.6875 10.625 14.6875C10.8464 14.6878 11.0608 14.6098 11.2302 14.4672C11.3995 14.3246 11.513 14.1267 11.5504 13.9085C11.5878 13.6903 11.5468 13.4659 11.4346 13.275C11.3225 13.0841 11.1464 12.9391 10.9375 12.8656Z" fill="#5A706A"/>
            </svg>`;

        const grabButton = document.createElement('div');
        grabButton.className = 'icon grab';
        grabButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5A706A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grip-vertical"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>`;
        
        // Make button show it's draggable
        grabButton.style.cursor = 'grab';

        infoButton.onclick = () => {
            chrome.runtime.sendMessage({ action: 'infoRecording' });
        };
        resetButton.onclick = () => {
            chrome.runtime.sendMessage({ action: 'resetRecording' });
        };
        deleteButton.onclick = () => {
            chrome.runtime.sendMessage({ action: 'deleteRecording' });
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

        const resetDeleteContainer = document.createElement('div');
        resetDeleteContainer.className = 'btns-container';
        resetDeleteContainer.appendChild(resetButton);
        resetDeleteContainer.appendChild(deleteButton);
        resetDeleteContainer.appendChild(infoButton);
        resetDeleteContainer.appendChild(grabButton);

        container.appendChild(pausePlayContainer);
        container.appendChild(timer);
        container.appendChild(resetDeleteContainer);

        // Add draggable functionality
        let isDragging = false;
        let offsetX, offsetY;

        // Function to handle mouse down event on the grab button
        grabButton.onmousedown = (e) => {
            isDragging = true;
            grabButton.style.cursor = 'grabbing';
            
            // Calculate the offset of the mouse pointer relative to the container
            const rect = container.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            // Prevent default behavior to avoid text selection during drag
            e.preventDefault();
        };

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

injectActionButtons();

// ========== EVENT CAPTURE SYSTEM ==========
let recordingStartTime = null;
let isRecordingActive = false;
let capturedEvents = [];

// Get recording start time and status
chrome.storage.local.get(['recordingStartTime', 'isRecordingActive'], (result) => {
    recordingStartTime = result.recordingStartTime;
    isRecordingActive = result.isRecordingActive;
});

// Listen for recording state changes
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'recordingStarted') {
        recordingStartTime = Date.now();
        isRecordingActive = true;
        capturedEvents = [];
        chrome.storage.local.set({ recordingStartTime, isRecordingActive });
    } else if (message.action === 'recordingStopped') {
        isRecordingActive = false;
        chrome.storage.local.set({ isRecordingActive: false });
    }
});

// Interactive elements/roles we consider "clickable" for the purposes of
// resolving the *real* target of a click (see resolveInteractiveElement).
const CLICKABLE_ROLES = ['button', 'link', 'checkbox', 'radio', 'menuitem', 'tab', 'switch', 'option'];
const INTERACTIVE_SELECTOR = [
    'button', 'a[href]', 'input', 'select', 'textarea', '[contenteditable="true"]',
    '[role="button"]', '[role="link"]', '[role="checkbox"]', '[role="radio"]',
    '[role="menuitem"]', '[role="tab"]', '[role="switch"]', '[role="option"]',
    '[tabindex]', '[onclick]'
].join(', ');

// A click's e.target is often an inner icon/span/svg with no text or
// attributes of its own (e.g. an <svg> inside a <button>, or a <span> of
// text inside an <a>). Walking up to the nearest real interactive ancestor
// is what makes three visually-different buttons resolve to three
// different, correctly-labeled elements instead of all collapsing to the
// same generic "svg"/"span" description.
function resolveInteractiveElement(element) {
    if (!element || !element.closest) return element;
    const ancestor = element.closest(INTERACTIVE_SELECTOR);
    return ancestor || element;
}

// Builds a selector that is unique on the page right now, the same way
// DevTools "Copy selector" / Playwright codegen do it: prefer a stable
// test hook or id, otherwise walk up the tree appending
// tag:nth-of-type(n) segments (scoped to the parent) until the resulting
// selector resolves to exactly one element. This is what makes the
// recorded locator actually distinguish "button 1/2/3" even when they
// share identical classes and have no text/aria-label at all.
function buildUniqueSelector(element) {
    if (!element || element.nodeType !== 1) return '';

    // Prefer explicit QA/test hooks - these are what most automation tools
    // (Playwright, Cypress, Testigma, Selenium) recommend and are stable
    // across CSS/markup refactors.
    const testHookAttrs = ['data-testid', 'data-test-id', 'data-test', 'data-qa', 'data-cy'];
    for (const attr of testHookAttrs) {
        const value = element.getAttribute && element.getAttribute(attr);
        if (value) {
            const sel = `[${attr}="${CSS.escape(value)}"]`;
            if (document.querySelectorAll(sel).length === 1) return sel;
        }
    }

    if (element.id && document.getElementById(element.id) === element) {
        const sel = `#${CSS.escape(element.id)}`;
        if (document.querySelectorAll(sel).length === 1) return sel;
    }

    const segments = [];
    let node = element;
    while (node && node.nodeType === 1 && node !== document.documentElement) {
        const tag = node.tagName.toLowerCase();
        let segment = tag;

        if (node.id && document.getElementById(node.id) === node) {
            segment = `${tag}#${CSS.escape(node.id)}`;
            segments.unshift(segment);
            break; // an id anchors the path; no need to go further up
        }

        const parent = node.parentElement;
        if (parent) {
            const siblingsOfSameTag = Array.from(parent.children).filter(
                (child) => child.tagName === node.tagName
            );
            if (siblingsOfSameTag.length > 1) {
                const index = siblingsOfSameTag.indexOf(node) + 1;
                segment = `${tag}:nth-of-type(${index})`;
            }
        }

        segments.unshift(segment);

        const candidate = segments.join(' > ');
        if (document.querySelectorAll(candidate).length === 1) {
            return candidate;
        }

        node = parent;
    }

    return segments.join(' > ');
}

// Helper function to get element details.
// Resolves a human-readable label the way an accessibility tree / QA tool would:
// visible text, then <label for="id">/wrapping <label>, then aria-label /
// aria-labelledby, then placeholder/title, then name/id/tag as a last resort.
// This matters most for icon-only controls (e.g. GitHub's icon buttons) whose
// textContent is empty but whose aria-label carries the real meaning.
// Collapses runs of whitespace/newlines from raw textContent into single
// spaces. Real pages routinely indent their markup, so `textContent` on
// anything but a leaf node comes back full of "\n      " - without this,
// labels render as visibly broken multi-line garbage.
function collapseWhitespace(text) {
    return text ? text.replace(/\s+/g, ' ').trim() : '';
}

// Containers whose direct textContent is a dump of every descendant's text
// (a <form> wrapping a whole search bar + hidden a11y copy, for example)
// rather than a meaningful label of their own. For these we skip straight
// to aria-label/name/id instead of using the noisy full-subtree text.
const CONTAINER_TAGS_WITHOUT_OWN_TEXT = ['form', 'div', 'section', 'nav', 'ul', 'ol', 'table'];

function getElementDetails(element) {
    const tagName = element.tagName ? element.tagName.toLowerCase() : '';
    const id = element.id || '';
    const name = element.name || '';
    const type = element.type || '';
    const placeholder = element.placeholder || '';
    const role = (element.getAttribute && element.getAttribute('role')) || '';
    const ariaLabel = (element.getAttribute && element.getAttribute('aria-label')) || '';
    const title = (element.getAttribute && element.getAttribute('title')) || '';
    const value = (element.type === 'submit' || element.type === 'button') ? (element.value || '') : '';
    const alt = (element.getAttribute && element.getAttribute('alt')) || '';

    let associatedLabel = '';
    if (element.labels && element.labels.length > 0) {
        associatedLabel = collapseWhitespace(element.labels[0].textContent);
    } else if (id) {
        const forLabel = document.querySelector(`label[for="${CSS.escape(id)}"]`);
        if (forLabel) associatedLabel = collapseWhitespace(forLabel.textContent);
    }

    let labelledByText = '';
    const labelledById = element.getAttribute && element.getAttribute('aria-labelledby');
    if (labelledById) {
        const labelledByEl = document.getElementById(labelledById.split(' ')[0]);
        if (labelledByEl) labelledByText = collapseWhitespace(labelledByEl.textContent);
    }

    const ownText = !CONTAINER_TAGS_WITHOUT_OWN_TEXT.includes(tagName)
        ? collapseWhitespace(element.textContent).substring(0, 80)
        : '';

    let description = ownText || associatedLabel || ariaLabel || labelledByText ||
        value || placeholder || title || alt || name || id || tagName;
    description = description.trim();

    // Last-resort disambiguation: if the description is so generic (bare tag
    // name, no text/aria-label/id at all) that several elements on the page
    // would produce the exact same label, append its occurrence index among
    // its identical-looking siblings so "button" becomes "button (2 of 3)"
    // instead of being indistinguishable from the other two.
    const isGenericDescription = description === tagName;
    if (isGenericDescription) {
        const sameTagElements = Array.from(document.getElementsByTagName(tagName || 'div'));
        if (sameTagElements.length > 1) {
            const index = sameTagElements.indexOf(element) + 1;
            description = `${description} (${index} of ${sameTagElements.length})`;
        }
    }

    const uniqueSelector = buildUniqueSelector(element);

    // Cap the classes shown in the human-readable `selector` field. Sites
    // routinely stack a dozen+ utility/feature-detection classes onto <html>
    // or <body> (Modernizr-style: "a-ws a-js a-audio a-canvas ..."); dumping
    // all of them turns every navigation/scroll event's `element` field into
    // an unreadable wall of text that adds no identifying value (there's
    // only one <html>/<body> per document - it's already unique by tag alone).
    const MAX_CLASSES_IN_SELECTOR = 3;
    const classes = typeof element.className === 'string' && element.className.trim()
        ? element.className.trim().split(/\s+/)
        : [];
    const classSelector = (tagName === 'html' || tagName === 'body' || classes.length === 0)
        ? ''
        : '.' + classes.slice(0, MAX_CLASSES_IN_SELECTOR).join('.');
    const selector = tagName + (id ? `#${id}` : '') + classSelector;

    return {
        selector,
        uniqueSelector,
        description: description.trim(),
        tag: tagName,
        type,
        id,
        name,
        placeholder,
        ariaLabel,
        role
    };
}

// Function to capture and store event
function captureEvent(eventType, element, details = {}, labelOverride = null) {
    if (!isRecordingActive || !recordingStartTime) return;

    const timestamp = Date.now() - recordingStartTime;
    const elementInfo = getElementDetails(element);

    const event = {
        timestamp,
        type: eventType,
        element: elementInfo.selector,
        label: labelOverride || elementInfo.description,
        // A selector guaranteed unique on the page at capture time (data-testid
        // > id > tag:nth-of-type path) - this is what QA tools should copy
        // into a locator so the exact element clicked can be re-identified,
        // even when several elements share identical classes/text.
        uniqueSelector: elementInfo.uniqueSelector || null,
        // Extra DOM info useful for QA/test-case generation, since the CSS
        // selector alone is often just a hashed/auto-generated classname.
        elementId: elementInfo.id || null,
        elementName: elementInfo.name || null,
        elementType: elementInfo.type || null,
        role: elementInfo.role || null,
        ariaLabel: elementInfo.ariaLabel || null,
        details,
        url: window.location.href,
        tabTitle: document.title
    };

    // Hand the event to the background script rather than doing our own
    // storage.get -> push -> storage.set here. A click that also triggers a
    // page navigation fires both this handler and the 'beforeunload' handler
    // in the same tab; both used to read the array before either had written
    // it back, so whichever set() ran last silently clobbered the other
    // event. The background script is a single serialized writer per event,
    // so two events landing at the same instant can no longer overwrite one
    // another (confirmed against a real recording where 3 tab clicks that
    // each triggered navigation produced 3 "navigation" events and zero
    // "click" events).
    chrome.runtime.sendMessage({ action: 'recordEvent', event });
}

// CLICK EVENT CAPTURE
document.addEventListener('click', (e) => {
    if (isRecordingActive && recordingStartTime) {
        // e.target is often an inner icon/span/svg with no identifying text
        // or attributes of its own - resolve up to the real button/link/etc.
        // so distinct controls don't all collapse into the same generic label.
        const clickedElement = resolveInteractiveElement(e.target);
        const tagName = clickedElement.tagName ? clickedElement.tagName.toLowerCase() : '';
        const role = clickedElement.getAttribute && clickedElement.getAttribute('role');

        // Capture button clicks, form inputs, links, contenteditable areas,
        // and anything with an interactive ARIA role (e.g. custom icon buttons).
        if (tagName === 'button' || tagName === 'a' || tagName === 'input' ||
            tagName === 'select' || tagName === 'textarea' ||
            clickedElement.isContentEditable ||
            (role && CLICKABLE_ROLES.includes(role))) {

            // A link with a `download` attribute is the browser's own signal
            // that clicking it saves a file rather than navigating. During a
            // recording we only want to log that the click happened, not
            // actually pull the file into the tester's Downloads folder
            // every time this page interaction is captured.
            if (clickedElement.hasAttribute && clickedElement.hasAttribute('download')) {
                e.preventDefault();
            }

            captureEvent('click', clickedElement, {
                x: e.clientX,
                y: e.clientY
            });
        }
    }
}, true); // Use capture phase

// ENTER KEY CAPTURE
// A user pressing Enter in a field (e.g. a search box) is functionally a
// submit/click even though no button was pressed. QA needs the same
// "which exact field" identification for this as for a real button click,
// so it gets the same resolved element + uniqueSelector treatment.
document.addEventListener('keydown', (e) => {
    if (isRecordingActive && recordingStartTime && e.key === 'Enter') {
        const element = e.target;
        const tagName = element.tagName ? element.tagName.toLowerCase() : '';
        const isEditable = element.isContentEditable;

        if (tagName === 'input' || tagName === 'textarea' || isEditable) {
            let value = isEditable ? element.textContent : element.value;
            if (element.type === 'password') value = '***';

            captureEvent('keypress-enter', element, {
                value: (value || '').substring(0, 200),
                inputType: isEditable ? 'contenteditable' : (element.type || 'text')
            }, `Pressed Enter in "${getElementDetails(element).description}"`);
        }
    }
}, true);

// FORM INPUT CAPTURE
document.addEventListener('change', (e) => {
    if (isRecordingActive && recordingStartTime) {
        const element = e.target;
        const tagName = element.tagName.toLowerCase();
        
        if (tagName === 'input' || tagName === 'select' || tagName === 'textarea') {
            let value = element.value;
            
            // Don't capture sensitive inputs
            if (element.type === 'password') {
                value = '***';
            }
            
            captureEvent('change', element, {
                value: value,
                inputType: element.type || 'text'
            });
        }
    }
}, true);

// TEXT INPUT CAPTURE (with debounce)
let inputTimeout;
document.addEventListener('input', (e) => {
    if (isRecordingActive && recordingStartTime) {
        const element = e.target;
        const tagName = element.tagName.toLowerCase();
        const isEditable = element.isContentEditable;

        // Also capture contenteditable areas (rich-text editors that aren't
        // real <textarea>/<input> elements, e.g. comment/description boxes).
        if (isEditable || tagName === 'textarea' || (tagName === 'input' && element.type !== 'password')) {
            clearTimeout(inputTimeout);
            inputTimeout = setTimeout(() => {
                const value = isEditable ? element.textContent : element.value;
                captureEvent('input', element, {
                    value: value.substring(0, 200), // Limit length
                    inputType: isEditable ? 'contenteditable' : (element.type || 'text')
                });
            }, 500); // Debounce 500ms
        }
    }
}, true);

// SUBMIT EVENT CAPTURE
document.addEventListener('submit', (e) => {
    if (isRecordingActive && recordingStartTime) {
        captureEvent('submit', e.target, {
            formName: e.target.name || 'form'
        });
    }
}, true);

// SCROLL EVENT CAPTURE (throttled)
let lastScrollCapture = 0;
window.addEventListener('scroll', () => {
    if (isRecordingActive && recordingStartTime) {
        const now = Date.now();
        if (now - lastScrollCapture > 1000) { // Capture every 1 second
            lastScrollCapture = now;
            captureEvent('scroll', document.documentElement, {
                scrollX: window.scrollX,
                scrollY: window.scrollY
            }, 'Page scroll');
        }
    }
}, true);

// NAVIGATION CAPTURE
window.addEventListener('beforeunload', () => {
    if (isRecordingActive && recordingStartTime) {
        captureEvent('navigation', document.documentElement, {
            fromUrl: window.location.href
        }, 'Page navigation');
    }
});