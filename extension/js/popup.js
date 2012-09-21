onload = function() {
  chrome.tabs.getSelected(undefined, function(tab) {
    var link = Link.fromUrl(tab.url);
    if (link) {
      // TODO(mihaip): allow visibility of internal-only links to be
      // configured.
      document.body.appendChild(link.getRelatedLinksNode(false, tab.url));
    } else {
      // Shouldn't happen...
      goog.dom.classes.remove(goog.dom.$('no-link'), 'hidden');
    }
  });
};