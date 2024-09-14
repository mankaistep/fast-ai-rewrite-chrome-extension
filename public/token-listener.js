// token-listener.js
window.addEventListener('message', function(event) {
    if (event.data.type === 'FAST_AI_AUTH_TOKEN') {
        window.fastAIAuthToken = event.data.token;
        window.dispatchEvent(new CustomEvent('authTokenAvailable'));
    } else if (event.data.type === 'CHECK_FAST_AI_AUTH_TOKEN') {
        const isAvailable = 'fastAIAuthToken' in window;
        window.postMessage({
            type: "FAST_AI_AUTH_TOKEN_STATUS",
            isAvailable: isAvailable
        }, "*");
    }
});