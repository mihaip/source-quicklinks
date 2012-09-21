function checkForLink(tabId, changeInfo, tab) {
  var link = Link.fromUrl(tab.url);
  if (link) {
    chrome.pageAction.show(tabId);
  }
}

chrome.tabs.onUpdated.addListener(checkForLink);