// Map from tab ID to {link, url} object. Will be loaded by the popup when it's
// displayed for a tab, so that it doesn't have to do the same link extraction
// that the background page already did.
var tabState = {};

function checkForLink(tabId, changeInfo, tab) {
  var link = Link.fromUrl(tab.url);
  if (link) {
    chrome.pageAction.show(tabId);
    tabState[tabId] = {
      link: link,
      url: tab.url
    };
  } else {
    delete tabState[tabId];
  }
}

chrome.tabs.onUpdated.addListener(checkForLink);

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  delete tabState[tabId];
});

chrome.extension.onMessage.addListener(function(message, sender) {
  if (message.codeSearchUrl) {
    var link = Link.fromUrl(message.codeSearchUrl);
    if (link) {
      tabState[sender.tab.id] = {
        link: link,
        url: message.codeSearchUrl
      }
      chrome.pageAction.show(sender.tab.id);
    } else {
      delete tabState[sender.tab.id];
      chrome.pageAction.hide(sender.tab.id);
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
  var results = [
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
  ];

  if (text.indexOf('@') != -1) {
    results.unshift.apply(results, [
      {
        content: 'http://git.chromium.org/gitweb/?p=chromium.git&a=search&h=HEAD&st=author&s=' + text,
        description: 'Changes by <match>' + text + '</match> in the Chromium repository'
      },
      {
        content: 'http://trac.webkit.org/search?q=' + text + '&noquickjump=1&changeset=on',
        description: 'Changes by <match>' + text + '</match> in the WebKit repository'
      }
    ]);
  }

  suggest(results);
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
