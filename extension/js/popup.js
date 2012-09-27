function getRelatedLinksNode(link, showInternalOnlyLinks, opt_currentUrl) {
  var relatedLinks = link.getRelatedLinks();

  var relatedLinksNode = goog.dom.$dom('ul', 'related-links');

  for (var i = 0, relatedLink; relatedLink = relatedLinks[i]; i++) {
    // Skip internal links if not requested
    if (relatedLink.internalOnly && !showInternalOnlyLinks) continue;

    // Skip related links that point to the current URL
    if (opt_currentUrl == relatedLink.url) continue;

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
  var backgroundPage = chrome.extension.getBackgroundPage();
  var tabState = backgroundPage.tabState[currentTabId];

  if (tabState) {
    // TODO(mihaip): allow visibility of internal-only links to be
    // configured.
    document.body.appendChild(
        getRelatedLinksNode(tabState.link, false, tabState.url));
  }
});
