var EXTRACTORS_BY_HOSTNAME = {
  'trac.webkit.org': extractFromWebKitTrac,
  'src.chromium.org': extractFromChromium,
  'git.chromium.org': extractFromChromiumGit,
  'code.google.com': extractFromCodesite
};

var CHROMIUM_CODE_SEARCH_PATH_PREFIX = "chromium";

var WEBKIT_REPOSITORY_PREFIX = 'chrome/trunk/src/third_party/WebKit/';
var WEBKIT_LAYOUT_PREFIX = 'LayoutTests/';
var WEBKIT_TRAC_BASE_BROWSER_PATH = 'http://trac.webkit.org/browser/trunk/';
var WEBKIT_TRAC_BASE_LOG_PATH = 'http://trac.webkit.org/log/trunk/';

var CHROMIUM_REPOSITORY_PREFIX = 'chrome/trunk/';
var CHROMIUM_VIEWEVC_PATH = 'http://src.chromium.org/viewvc/chrome/trunk/';
var CHROMIUM_GIT_PATH = 'http://git.chromium.org/gitweb/?p=chromium.git;hb=HEAD;f=';

var V8_REPOSITORY_PREFIX = 'chrome/trunk/src/v8/';
var V8_CODESITE_HOSTNAME = 'http://code.google.com';
var V8_CODESITE_BASE_PATH = '/trunk/';
var V8_CODESITE_BROWSE_PATH = '/p/v8/source/browse' + V8_CODESITE_BASE_PATH;
var V8_CODESITE_BASE_LOG_PATH = 'http://code.google.com/p/v8/source/list?path=' + V8_CODESITE_BASE_PATH;

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

  if (goog.string.startsWith(path, WEBKIT_REPOSITORY_PREFIX)) {
    var webKitPath =
        goog.string.removeAt(path, 0, WEBKIT_REPOSITORY_PREFIX.length);
    return WebKitLayoutTestLink.getTestPath(webKitPath)
        ? new WebKitLayoutTestLink(webKitPath)
        : new WebKitLink(webKitPath);
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

  var VIEWVC_TRUNK_SRC_RE = new RegExp('/viewvc/chrome/trunk/(.+)');
  var match = VIEWVC_TRUNK_SRC_RE.exec(path);
  if (match) {
    return new ChromiumLink(match[1]);
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
  this.chromiumRepositoryPath = 'src/third_party/WebKit/' + path;
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
};

function WebKitLayoutTestLink(path) {
  WebKitLink.call(this, path);
  this.testPath = WebKitLayoutTestLink.getTestPath(path);
}
goog.inherits(WebKitLayoutTestLink, WebKitLink);

WebKitLayoutTestLink.getTestPath = function(path) {
  if (goog.string.startsWith(path, WEBKIT_LAYOUT_PREFIX)) {
    return goog.string.removeAt(path, 0, WEBKIT_LAYOUT_PREFIX.length);
  } else {
    return null;
  }
};

WebKitLayoutTestLink.prototype.addRelatedLinks = function(relatedLinks) {
  WebKitLayoutTestLink.superClass_.addRelatedLinks.call(this, relatedLinks);

  relatedLinks.push(new RelatedLink(
      'http://test-results.appspot.com/dashboards/flakiness_dashboard.html' +
          '#useWebKitCanary=true&tests=' + encodeURIComponent(this.testPath),
      'Chromium/WebKit Test History',
      CHROMIUM_ICON_URL));
}

function ChromiumLink(path) {
  Link.call(this, path);
  this.chromiumRepositoryPath = path;
}
goog.inherits(ChromiumLink, Link);

ChromiumLink.prototype.addRelatedLinks = function(relatedLinks) {
  ChromiumLink.superClass_.addRelatedLinks.call(this, relatedLinks);
  goog.array.extend(relatedLinks, [
    new RelatedLink(
        CHROMIUM_VIEWEVC_PATH + this.path + '?view=markup',
        'Current version (ViewVC)',
        CHROMIUM_ICON_URL),
    new RelatedLink(
        CHROMIUM_VIEWEVC_PATH + this.path + '?view=log',
        'Revision log (ViewVC)',
        CHROMIUM_ICON_URL),
    new RelatedLink(
        CHROMIUM_VIEWEVC_PATH + this.path + '?view=annotate',
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

function RelatedLink(url, title, iconUrl) {
  this.url = url;
  this.title = title;
  this.iconUrl = iconUrl;
}

function Link(path) {
  this.path = path;
}

Link.prototype.addRelatedLinks = function(relatedLinks) {
  relatedLinks.push(
      new RelatedLink(
          'https://code.google.com/p/chromium/codesearch#chromium/' +
            this.chromiumRepositoryPath,
          'Code Search',
          CODE_SEARCH_ICON_URL));
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
