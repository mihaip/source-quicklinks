var currentTabId;
var currentUrl;
var currentLink;

function checkForLink(tabId, changeInfo, tab) {
  currentTabId = tabId;
  var link = Link.fromUrl(tab.url);
  if (link) {
    chrome.pageAction.show(tabId);
    currentLink = link;
    currentUrl = tab.url;
  } else {
    currentLink = null;
    currentUrl = null;
  }
}

chrome.tabs.onUpdated.addListener(checkForLink);

chrome.extension.onMessage.addListener(function(message, sender) {
  if (message.codeSearchUrl) {
    var link = Link.fromUrl(message.codeSearchUrl);
    if (link) {
      currentLink = link;
      currentUrl = message.codeSearchUrl;
      chrome.pageAction.show(currentTabId);
    } else {
      currentLink = null;
      currentUrl = null;
      chrome.pageAction.hide(currentTabId);
    }
  }
});