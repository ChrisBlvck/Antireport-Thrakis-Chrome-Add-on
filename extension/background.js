// background.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "showNotification") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "Images/icon128.png",
      title: msg.title,
      message: msg.body,
      priority: 2
    });
  }
});
