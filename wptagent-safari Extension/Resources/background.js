// Relay the extension event to wptagent listening on localhost
const SERVER = "http://127.0.0.1:8888/";
let messages = '';
let message_timer = undefined;
let last_send = undefined;

const send_messages = function() {
  message_timer = undefined;
  last_send = performance.now();
  const message_headers = new Headers({
    "Content-Type": "application/json",
    "Content-Length": messages.length.toString()
  });
  fetch(SERVER + 'messages',
        {method: 'POST', headers: message_headers, body: messages});
  messages = '';
};

const send_message = function(event, body = undefined) {
  message = {path: event}
  if (body !== undefined)
    message['body'] = body;
  messages += JSON.stringify(message) + "\n";
  if (message_timer == undefined) {
    elapsed = 1000;
    if (last_send !== undefined)
      elapsed = performance.now() - last_send;
    if (elapsed > 500) {
      send_messages();
    } else {
      delay = Math.max(1, Math.min(500 - elapsed, 500));
      message_timer = setTimeout(send_messages, delay);
    }
  }
};

//
// webNavigation events
//
browser.webNavigation.onBeforeNavigate.addListener((details) => {
  if (!details.url.startsWith(SERVER))
    send_message("webNavigation.onBeforeNavigate", details);
});

browser.webNavigation.onCommitted.addListener((details) => {
  if (!details.url.startsWith(SERVER))
    send_message("webNavigation.onCommitted", details);
});

browser.webNavigation.onCompleted.addListener((details) => {
  if (!details.url.startsWith(SERVER))
    send_message("webNavigation.onCompleted", details);
});

browser.webNavigation.onDOMContentLoaded.addListener((details) => {
  if (!details.url.startsWith(SERVER))
    send_message("webNavigation.onCompleted", details);
});

browser.webNavigation.onErrorOccurred.addListener((details) => {
  if (!details.url.startsWith(SERVER))
    send_message("webNavigation.onCompleted", details);
});

//
// webRequest events
//
const filter = { urls: ["<all_urls>"] };

browser.webRequest.onBeforeRedirect.addListener((details) => {
  if (!details.url.startsWith(SERVER))
    send_message("webRequest.onBeforeRedirect", details);
}, filter);

browser.webRequest.onBeforeRequest.addListener((details) => {
  if (!details.url.startsWith(SERVER))
    send_message("webRequest.onBeforeRequest", details);
}, filter);

browser.webRequest.onBeforeSendHeaders.addListener((details) => {
  if (!details.url.startsWith(SERVER))
    send_message("webRequest.onBeforeSendHeaders", details);
}, filter);

browser.webRequest.onCompleted.addListener((details) => {
  if (!details.url.startsWith(SERVER))
    send_message("webRequest.onCompleted", details);
}, filter);

browser.webRequest.onErrorOccurred.addListener((details) => {
  if (!details.url.startsWith(SERVER))
    send_message("webRequest.onErrorOccurred", details);
}, filter);

browser.webRequest.onHeadersReceived.addListener((details) => {
  if (!details.url.startsWith(SERVER))
    send_message("webRequest.onHeadersReceived", details);
}, filter);

browser.webRequest.onResponseStarted.addListener((details) => {
  if (!details.url.startsWith(SERVER))
    send_message("webRequest.onResponseStarted", details);
}, filter);

browser.webRequest.onSendHeaders.addListener((details) => {
  if (!details.url.startsWith(SERVER))
    send_message("webRequest.onSendHeaders", details);
}, filter);
