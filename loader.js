// Rename your existing JS files:
// mobile.js - for the touch version
// desktop.js - for the click version

function detectMobile() {
    return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

// Remove the original script tag from your HTML
// <script src="./index.js"></script>

// Add this script instead
async function loadAppropriateScript() {
    try {
        if (detectMobile()) {
            await loadScript('./mobile.js');
        } else {
            await loadScript('./desktop.js');
        }
    } catch (error) {
        console.error('Error loading script:', error);
    }
}

// Initialize the appropriate version
loadAppropriateScript();