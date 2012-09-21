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

onload = function() {
  chrome.tabs.getSelected(undefined, function(tab) {
    var link = Link.fromUrl(tab.url);
    if (link) {
      // TODO(mihaip): allow visibility of internal-only links to be
      // configured.
      document.body.appendChild(getRelatedLinksNode(link, false, tab.url));
    } else {
      // Shouldn't happen...
      goog.dom.classes.remove(goog.dom.$('no-link'), 'hidden');
    }
  });
};