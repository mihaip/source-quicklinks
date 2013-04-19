var EXTRACTORS_BY_HOSTNAME = {
  'trac.webkit.org': extractFromWebKitTrac,
  'src.chromium.org': extractFromChromium,
  'git.chromium.org': extractFromChromiumGit,
  'code.google.com': extractFromCodesite
};

var CHROMIUM_CODE_SEARCH_PATH_PREFIX = "chromium";

var BLINK_REPOSITORY_PREFIX = 'chrome/trunk/src/third_party/WebKit/';
var BLINK_LAYOUT_TEST_PREFIX = 'LayoutTests/';
var FLAKINESS_DASHBOARD_PATH = 'http://test-results.appspot.com/dashboards/flakiness_dashboard.html';

var WEBKIT_TRAC_BASE_BROWSER_PATH = 'http://trac.webkit.org/browser/trunk/';
var WEBKIT_TRAC_BASE_LOG_PATH = 'http://trac.webkit.org/log/trunk/';

var CHROMIUM_REPOSITORY_PREFIX = 'chrome/trunk/';
var CHROMIUM_VIEWVC_PATH = 'http://src.chromium.org/viewvc/chrome/trunk/';
var CHROMIUM_GIT_PATH = 'http://git.chromium.org/gitweb/?p=chromium.git;hb=HEAD;f=';

var V8_REPOSITORY_PREFIX = 'chrome/trunk/src/v8/';
var V8_CODESITE_HOSTNAME = 'http://code.google.com';
var V8_CODESITE_BASE_PATH = '/trunk/';
var V8_CODESITE_BROWSE_PATH = '/p/v8/source/browse' + V8_CODESITE_BASE_PATH;
var V8_CODESITE_BASE_LOG_PATH = 'http://code.google.com/p/v8/source/list?path=' + V8_CODESITE_BASE_PATH;

var BLINK_VIEWVC_PATH = 'http://src.chromium.org/viewvc/blink/trunk/';
// Map of the moves described in http://goo.gl/T4VfS.
var BLINK_PATH_TO_WEBKIT_PATH = {
  'Source/core': 'Source/WebCore',
  'Source/yarr': 'Source/JavaScriptCore/yarr',
  'Source/devtools': 'Source/WebCore/inspector',
  'Source/modules': 'Source/WebCore/Modules',
  'Source/wtf': 'Source/WTF/wtf',
  'Source/bindings': 'Source/WebCore/bindings'
};

var TRAC_ICON_URL = 'http://trac.webkit.org/chrome/common/trac.ico';
var CHROMIUM_ICON_URL = 'http://build.chromium.org/favicon.ico';
var GIT_ICON_URL = 'http://git.chromium.org/gitweb/static/git-favicon.png';
var CODE_SEARCH_ICON_URL = 'http://www.google.com/favicon.ico';
var CODESITE_ICON_URL = 'http://www.gstatic.com/codesite/ph/images/phosting.ico';

function extractFromChromiumRepositoryPath(path) {
  if (goog.string.isEmptySafe(path)) {
    return null;
  }

  if (goog.string.startsWith(path, V8_REPOSITORY_PREFIX)) {
    return new V8Link(goog.string.removeAt(path, 0, V8_REPOSITORY_PREFIX.length));
  }

  if (goog.string.startsWith(path, BLINK_REPOSITORY_PREFIX)) {
    var blinkPath =
      goog.string.removeAt(path, 0, BLINK_REPOSITORY_PREFIX.length);
    return BlinkLayoutTestLink.getTestPath(blinkPath)
        ? new BlinkLayoutTestLink(blinkPath)
        : new BlinkLink(blinkPath);
  }

  // Should be last
  if (goog.string.startsWith(path, CHROMIUM_REPOSITORY_PREFIX)) {
    return new ChromiumLink(
        goog.string.removeAt(path, 0, CHROMIUM_REPOSITORY_PREFIX.length));
  }

  return null;
}

function extractFromWebKitTrac(url) {
  var path = goog.uri.utils.getPath(url);

  var TRUNK_RE = new RegExp('/[^/]+/trunk/(.+)');
  var match = TRUNK_RE.exec(path);
  if (match) {
    return new WebKitLink(match[1]);
  }
}

function extractFromChromium(url) {
  var path = goog.uri.utils.getPath(url);

  var CHROMIUM_VIEWVC_TRUNK_SRC_RE = new RegExp('/viewvc/chrome/trunk/(.+)');
  var match = CHROMIUM_VIEWVC_TRUNK_SRC_RE.exec(path);
  if (match) {
    return new ChromiumLink(match[1]);
  }
  var BLINK_VIEWVC_TRUNK_SRC_RE = new RegExp('/viewvc/blink/trunk/(.+)');
  var match = BLINK_VIEWVC_TRUNK_SRC_RE.exec(path);
  if (match) {
    return new BlinkLink(match[1]);
  }

  return null;
}

function extractFromChromiumGit(url) {
  var path = goog.uri.utils.getPath(url);

  if (path == '/gitweb/') {
    var query = goog.uri.utils.getQueryData(url);
    var pieces = query.split(';');
    var params = {};
    for (var i = 0; i < pieces.length; i++) {
      var keyAndValue = pieces[i].split('=');
      params[keyAndValue[0]] = keyAndValue[1];
    }
    if (params.p == 'chromium.git' && params.f) {
      return new ChromiumLink('src/' + params.f);
    }
  }
}

function extractFromCodesite(url) {
  var path = goog.uri.utils.getPath(url);

  if (goog.string.startsWith(path, '/p/v8/')) {
    if (goog.string.startsWith(path, V8_CODESITE_BROWSE_PATH)) {
      return new V8Link(goog.string.removeAt(path, 0, V8_CODESITE_BROWSE_PATH.length));
    }
    var pathParam = goog.uri.utils.getParamValue(url, 'path');
    if (goog.string.startsWith(pathParam, V8_CODESITE_BASE_PATH)) {
      return new V8Link(goog.string.removeAt(pathParam, 0, V8_CODESITE_BASE_PATH.length));
    }

    return null;
  }

  if (path == '/p/chromium/codesearch') {
    var fragment = goog.uri.utils.getFragment(url);
    if (goog.string.isEmptySafe(fragment)) {
      return null;
    }

    var path = fragment.split('&')[0];
    if (!goog.string.startsWith(path, CHROMIUM_CODE_SEARCH_PATH_PREFIX)) {
      return null;
    }

    return extractFromChromiumRepositoryPath(
      'chrome/trunk' + goog.string.removeAt(
        path, 0, CHROMIUM_CODE_SEARCH_PATH_PREFIX.length));
  }

  return null;
}

function WebKitLink(path) {
  Link.call(this, path);
  this.chromiumRepositoryPath = null;
}
goog.inherits(WebKitLink, Link);

WebKitLink.prototype.addRelatedLinks = function(relatedLinks) {
  WebKitLink.superClass_.addRelatedLinks.call(this, relatedLinks);

  goog.array.extend(relatedLinks, [
    new RelatedLink(
        WEBKIT_TRAC_BASE_BROWSER_PATH + this.path,
        'Current version (Trac)',
        TRAC_ICON_URL),
    new RelatedLink(
        WEBKIT_TRAC_BASE_LOG_PATH + this.path,
        'Revision log (Trac)',
        TRAC_ICON_URL),
    new RelatedLink(
        WEBKIT_TRAC_BASE_BROWSER_PATH + this.path + '?annotate=blame',
        'Annotation (Trac)',
        TRAC_ICON_URL)
  ]);

  var blinkPath = this.path;
  for (var p in BLINK_PATH_TO_WEBKIT_PATH) {
    blinkPath = blinkPath.replace(BLINK_PATH_TO_WEBKIT_PATH[p], p);
  }

  goog.array.extend(relatedLinks, [
    new RelatedLink(
        BLINK_VIEWVC_PATH + blinkPath + '?view=markup',
        'Blink equivalent - current version',
        CHROMIUM_ICON_URL),
    new RelatedLink(
        BLINK_VIEWVC_PATH + blinkPath + '?view=log',
        'Blink equivalent - revision log',
        CHROMIUM_ICON_URL),
    new RelatedLink(
        BLINK_VIEWVC_PATH + blinkPath + '?view=annotate',
        'Blink equivalent - annotation',
        CHROMIUM_ICON_URL)
  ]);
};

function ChromiumLink(path) {
  Link.call(this, path);
  this.chromiumRepositoryPath = path;
}
goog.inherits(ChromiumLink, Link);

ChromiumLink.prototype.addRelatedLinks = function(relatedLinks) {
  ChromiumLink.superClass_.addRelatedLinks.call(this, relatedLinks);
  goog.array.extend(relatedLinks, [
    new RelatedLink(
        CHROMIUM_VIEWVC_PATH + this.path + '?view=markup',
        'Current version (ViewVC)',
        CHROMIUM_ICON_URL),
    new RelatedLink(
        CHROMIUM_VIEWVC_PATH + this.path + '?view=log',
        'Revision log (ViewVC)',
        CHROMIUM_ICON_URL),
    new RelatedLink(
        CHROMIUM_VIEWVC_PATH + this.path + '?view=annotate',
        'Annotation (ViewVC)',
        CHROMIUM_ICON_URL)
  ]);

  // Git repository only has the src/ subtree from the Chromium repository
  if (goog.string.startsWith(this.path, 'src/')) {
    var gitPath = goog.string.removeAt(this.path, 0, 'src/'.length);
    goog.array.extend(relatedLinks, [
      new RelatedLink(
          CHROMIUM_GIT_PATH + gitPath + ';a=blob',
          'Current version (Gitweb)',
          GIT_ICON_URL),
      new RelatedLink(
          CHROMIUM_GIT_PATH + gitPath + ';a=history',
          'History (Gitweb)',
          GIT_ICON_URL),
      new RelatedLink(
          CHROMIUM_GIT_PATH + gitPath + ';a=blame',
          'Blame (Gitweb)',
          GIT_ICON_URL)
    ]);
  }
};


function V8Link(path) {
  Link.call(this, path);
  this.chromiumRepositoryPath = 'src/v8/' + path;
}
goog.inherits(V8Link, Link);

V8Link.prototype.addRelatedLinks = function(relatedLinks) {
  V8Link.superClass_.addRelatedLinks.call(this, relatedLinks);
  goog.array.extend(relatedLinks, [
    new RelatedLink(
        V8_CODESITE_HOSTNAME + V8_CODESITE_BROWSE_PATH + this.path,
        'Current version (code.google.com)',
        CODESITE_ICON_URL),
    new RelatedLink(
        V8_CODESITE_BASE_LOG_PATH + encodeURIComponent(this.path),
        'Revision Log (code.google.com)',
        CODESITE_ICON_URL)
  ]);
};

function BlinkLink(path) {
  Link.call(this, path);
  this.chromiumRepositoryPath = 'src/third_party/WebKit/' + path;
}
goog.inherits(BlinkLink, Link);

BlinkLink.prototype.addRelatedLinks = function(relatedLinks) {
  BlinkLink.superClass_.addRelatedLinks.call(this, relatedLinks);

  goog.array.extend(relatedLinks, [
    new RelatedLink(
        BLINK_VIEWVC_PATH + this.path + '?view=markup',
        'Current version (ViewVC)',
        CHROMIUM_ICON_URL),
    new RelatedLink(
        BLINK_VIEWVC_PATH + this.path + '?view=log',
        'Revision log (ViewVC)',
        CHROMIUM_ICON_URL),
    new RelatedLink(
        BLINK_VIEWVC_PATH + this.path + '?view=annotate',
        'Annotation (ViewVC)',
        CHROMIUM_ICON_URL)
  ]);

  var webKitPath = this.path;
  for (var p in BLINK_PATH_TO_WEBKIT_PATH) {
    webKitPath = webKitPath.replace(p, BLINK_PATH_TO_WEBKIT_PATH[p]);
  }

  goog.array.extend(relatedLinks, [
    new RelatedLink(
        WEBKIT_TRAC_BASE_BROWSER_PATH + webKitPath,
        'WebKit equivalent - current version',
        TRAC_ICON_URL),
    new RelatedLink(
        WEBKIT_TRAC_BASE_LOG_PATH + webKitPath,
        'WebKit equivalent - revision log',
        TRAC_ICON_URL),
    new RelatedLink(
        WEBKIT_TRAC_BASE_BROWSER_PATH + webKitPath + '?annotate=blame',
        'WebKit equivalent - annotation',
        TRAC_ICON_URL),
  ]);
};

function BlinkLayoutTestLink(path) {
  BlinkLink.call(this, path);
  this.testPath = BlinkLayoutTestLink.getTestPath(path);
}
goog.inherits(BlinkLayoutTestLink, BlinkLink);

BlinkLayoutTestLink.getTestPath = function(path) {
  if (goog.string.startsWith(path, BLINK_LAYOUT_TEST_PREFIX)) {
    return goog.string.removeAt(path, 0, BLINK_LAYOUT_TEST_PREFIX.length);
  } else {
    return null;
  }
};

BlinkLayoutTestLink.prototype.addRelatedLinks = function(relatedLinks) {
  BlinkLayoutTestLink.superClass_.addRelatedLinks.call(this, relatedLinks);

  var encodedPath = encodeURIComponent(this.testPath)
  goog.array.extend(relatedLinks, [
    new RelatedLink(
        FLAKINESS_DASHBOARD_PATH + '#group=%40ToT%20-%20chromium.org&tests=' +
          encodedPath,
        'Flakiness Dashboard (@ToT)',
        CHROMIUM_ICON_URL),
      new RelatedLink(
        FLAKINESS_DASHBOARD_PATH + '#group=%40DEPS%20-%20chromium.org&tests=' +
          encodedPath,
        'Flakiness Dashboard (@DEPS)',
        CHROMIUM_ICON_URL)
  ]);
}

function RelatedLink(url, title, iconUrl) {
  this.url = url;
  this.title = title;
  this.iconUrl = iconUrl;
}

function Link(path) {
  this.path = path;
}

Link.prototype.addRelatedLinks = function(relatedLinks) {
  if (this.chromiumRepositoryPath) {
    relatedLinks.push(
        new RelatedLink(
            'https://code.google.com/p/chromium/codesearch#chromium/' +
              this.chromiumRepositoryPath,
            'Code Search',
            CODE_SEARCH_ICON_URL));
  }
};

Link.prototype.getRelatedLinks = function() {
  var relatedLinks = [];
  this.addRelatedLinks(relatedLinks);
  return relatedLinks;
}

Link.fromUrl = function(url) {
  var hostname = goog.uri.utils.getDomain(url);

  if (hostname in EXTRACTORS_BY_HOSTNAME) {
    return EXTRACTORS_BY_HOSTNAME[hostname](url);
  }

  return null;
};
