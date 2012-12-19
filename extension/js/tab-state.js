// Map from tab ID to URL object. The URL isn't necessarily the tab's current
// top-level URL (e.g. for framed Code Search pages, the URL will be the inner
// frame's). Populated by the background page when the tab URL changes, and read
// by the popup when it's being displayed for that tab, so that it doesn't have
// to do the same URL extraction that the background page already did.

var TAB_STATE_KEY = 'tab-state';
var storage = chrome.storage.local;

var tabState = {
  reset: function() {
    storage.remove(TAB_STATE_KEY);
  },

  get: function(tabId, callback) {
    storage.get(TAB_STATE_KEY, function(items) {
      var tabState = items[TAB_STATE_KEY] || {};
      callback(tabState[tabId]);
    });
  },

  set: function(tabId, url) {
    storage.get(TAB_STATE_KEY, function(items) {
      if (!(TAB_STATE_KEY in items)) {
        items[TAB_STATE_KEY] = {};
      }
      items[TAB_STATE_KEY][tabId] = url;
      storage.set(items);
    });
  },
  delete: function(tabId) {
    storage.get(TAB_STATE_KEY, function(items) {
      delete items[TAB_STATE_KEY][tabId];
      storage.set(items);
    });
  }
};
