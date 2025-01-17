const urlParams = new URLSearchParams(window.location.search);
const message = urlParams.get('message');
const messageType = urlParams.get('type');
if (message) {
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = `<div class="message ${messageType}">${message}</div>`;
}