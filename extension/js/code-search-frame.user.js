console.log('code-search-frame.js');

chrome.extension.sendMessage({codeSearchUrl: location.href});

window.addEventListener('hashchange', function(event) {
  chrome.extension.sendMessage({codeSearchUrl: event.newURL});
});