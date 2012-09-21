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

function getCodeSearchUrl(query) {
  return 'http://code.google.com/p/chromium/source/search?q=' + query;
}

chrome.omnibox.setDefaultSuggestion({
  description: '<match>%s</match> in the Chromium repository'
});

chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
  suggest([
    {
      content: getCodeSearchUrl(text + ' -file:^src/third_party -file:^src/v8'),
      description: '<match>' + text + '</match> in the Chromium repository (no dependencies)'
    },
    {
      content: getCodeSearchUrl('file:^src/third_party/WebKit ' + text),
      description: '<match>' + text + '</match> in the WebKit repository'
    },
    {
      content: getCodeSearchUrl('file:' + text),
      description: '<match>' + text + '</match> in file names'
    },
  ]);
});

chrome.omnibox.onInputEntered.addListener(function(text) {
  var url;

  if (text.indexOf('http') == 0) {
    url = text;
  } else {
    url = getCodeSearchUrl(text);
  }
  chrome.tabs.update({url: url});
});