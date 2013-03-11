function getRelatedLinksNode(link, currentUrl) {
  var relatedLinks = link.getRelatedLinks();

  var relatedLinksNode = goog.dom.$dom('ul', 'related-links');

  for (var i = 0, relatedLink; relatedLink = relatedLinks[i]; i++) {
    // Skip related links that point to the current URL
    if (currentUrl == relatedLink.url) continue;

    var relatedLinkNode = goog.dom.$dom(
        'a', {
          'href': relatedLink.url,
          'target': '_blank',
        }, [
            goog.dom.$dom('img', {
              'src': relatedLink.iconUrl,
              'width': '16',
              'height': '16',
              'border': '0',
              'alt': ''
            }),
            relatedLink.title
        ]);
    relatedLinksNode.appendChild(goog.dom.$dom('li', {}, relatedLinkNode));
  }

  return relatedLinksNode;
}

chrome.tabs.query({currentWindow: true, active:true}, function(tabs) {
  var currentTabId = tabs[0].id;

  tabState.get(currentTabId, function(url) {
    if (!url) {
      console.warn("Could not find state for current tab " + currentTabId);
      return;
    }
    var link = Link.fromUrl(url);
    if (!link) {
      console.warn("Could not extract link from " + url);
      return;
    }

    document.body.appendChild(getRelatedLinksNode(link, url));
  });
});
