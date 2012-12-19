function checkForLink(url, tabId) {
  var link = Link.fromUrl(url);
  if (link) {
    chrome.pageAction.show(tabId);
    tabState.set(tabId, url);
  } else {
    tabState.delete(tabId);
  }
}

var urlFilters = [];
for (var hostname in EXTRACTORS_BY_HOSTNAME) {
  urlFilters.push({hostEquals: hostname});
}

chrome.webNavigation.onCompleted.addListener(
  function(details) {
    checkForLink(details.url, details.tabId);
  },
  {url: urlFilters});

chrome.extension.onMessage.addListener(function(message, sender) {
  if (message.codeSearchUrl) {
    var link = Link.fromUrl(message.codeSearchUrl);
    if (link) {
      tabState.set(sender.tab.id, message.codeSearchUrl);
      chrome.pageAction.show(sender.tab.id);
    } else {
      tabState.delete(sender.tab.id);
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

chrome.runtime.onStartup.addListener(function() {
  // Garbage collect tab states that are no longer needed (from the previous
  // session).
  tabState.reset();
});
