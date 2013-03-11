function log(msg, opt_color) {
  goog.dom.$('log').appendChild(
      goog.dom.$dom(
          'div',
          opt_color ? {'style': 'color: ' + opt_color} : undefined,
          msg));
}

function assertTrue(cond, opt_msg) {
  if (cond) {
    log('PASS: true');
  } else {
    log(opt_msg ? 'FAIL: ' + opt_msg : 'FAIL', 'red');
  }
}

function assertEquals(expected, actual, opt_msg) {
  if (expected == actual) {
    log('PASS: ' + expected + ' (as expected)');
  } else {
    var msg = opt_msg ? ' ' + opt_msg : '';
    log('FAIL: ' + expected + ' (expected) != ' + actual + ' (actual)' + msg, 'red');
  }
}

function assertLinkFromUrl(url, expectedType, expectedPath, expectedRelatedLinkUrls) {
  log('\ntesting ' + url, 'gray');
  var link = Link.fromUrl(url);

  if (!link) {
    log('FAIL: could not extract link', 'red');
    return;
  }

  assertTrue(link instanceof expectedType, 'Not of expected type');

  assertEquals(expectedPath, link.path);
  var relatedLinks = link.getRelatedLinks();
  var relatedLinkUrls = goog.array.map(relatedLinks, function(relatedLink) {
    return relatedLink.url;
  });
  for (var i = 0, expectedRelatedLinkUrl; expectedRelatedLinkUrl = expectedRelatedLinkUrls[i]; i++) {
    var found = goog.array.contains(relatedLinkUrls, expectedRelatedLinkUrl);
    assertTrue(found, 'Could not find related link URL ' + expectedRelatedLinkUrl + ' among ' + relatedLinkUrls.join(',\n '));
  }
}

function runTests() {
  // WebKit from Google Project Hosting Code Search (and related links)
  assertLinkFromUrl(
      'https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/WebCore/dom/ExceptionCode.h&q=exceptioncode',
      WebKitLink,
      'Source/WebCore/dom/ExceptionCode.h',
      ['http://trac.webkit.org/log/trunk/Source/WebCore/dom/ExceptionCode.h',
       'http://trac.webkit.org/browser/trunk/Source/WebCore/dom/ExceptionCode.h',
       'https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/WebCore/dom/ExceptionCode.h']);

  // WebKit layout test from Google Project Hosting Code Search (and related links)
  assertLinkFromUrl(
      'https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/LayoutTests/http/tests/security/cross-frame-access-first-time.html&q=canGet.*location%20file:LayoutTests%20-file:expected&sq=package:chromium&type=cs&l=39',
      WebKitLayoutTestLink,
      'LayoutTests/http/tests/security/cross-frame-access-first-time.html',
      ['http://test-results.appspot.com/dashboards/flakiness_dashboard.html#useWebKitCanary=true&tests=http%2Ftests%2Fsecurity%2Fcross-frame-access-first-time.html']);

  // WebKit from HTTP (not HTTPS) Code Search with no extra params
  assertLinkFromUrl(
      'http://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/Source/WebCore/dom/ExceptionCode.h',
      WebKitLink,
      'Source/WebCore/dom/ExceptionCode.h',
      []);

  // WebKit from WebKit Trac
  assertLinkFromUrl(
      'http://trac.webkit.org/log/trunk/WebCore/dom/ExceptionCode.h?rev=64763',
      WebKitLink,
      'WebCore/dom/ExceptionCode.h',
      []);
  assertLinkFromUrl(
      'http://trac.webkit.org/browser/trunk/LayoutTests/http/tests/security/cross-frame-access-location-get.html',
      WebKitLink,
      'LayoutTests/http/tests/security/cross-frame-access-location-get.html',
      []);
  assertLinkFromUrl(
      'http://trac.webkit.org/browser/trunk/LayoutTests/http/tests/security/cross-frame-access-location-get.html?annotate=blame&rev=30157',
      WebKitLink,
      'LayoutTests/http/tests/security/cross-frame-access-location-get.html',
      []);

  // Chromium from Google Project Hosting Code Search (and Chromium related links)
  assertLinkFromUrl(
      'https://code.google.com/p/chromium/codesearch#chromium/src/content/public/browser/navigation_controller.h&q=NavigationController&sq=package:chromium&type=cs',
      ChromiumLink,
      'src/content/public/browser/navigation_controller.h',
      ['http://src.chromium.org/viewvc/chrome/trunk/src/content/public/browser/navigation_controller.h?view=annotate',
       'http://src.chromium.org/viewvc/chrome/trunk/src/content/public/browser/navigation_controller.h?view=log',
       'http://src.chromium.org/viewvc/chrome/trunk/src/content/public/browser/navigation_controller.h?view=markup',
       'https://code.google.com/p/chromium/codesearch#chromium/src/content/public/browser/navigation_controller.h',
       'http://git.chromium.org/gitweb/?p=chromium.git;hb=HEAD;f=content/public/browser/navigation_controller.h;a=blob',
       'http://git.chromium.org/gitweb/?p=chromium.git;hb=HEAD;f=content/public/browser/navigation_controller.h;a=history'
       ]);

  // Chromium from Chromium ViewVC
  assertLinkFromUrl(
      'http://src.chromium.org/viewvc/chrome/trunk/src/chrome/browser/tab_contents/navigation_controller.h?view=markup',
      ChromiumLink,
      'src/chrome/browser/tab_contents/navigation_controller.h',
      []);
  assertLinkFromUrl(
      'http://src.chromium.org/viewvc/chrome/trunk/src/chrome/browser/tab_contents/navigation_controller.h?view=log',
      ChromiumLink,
      'src/chrome/browser/tab_contents/navigation_controller.h',
      []);
  assertLinkFromUrl(
      'http://src.chromium.org/viewvc/chrome/trunk/src/chrome/browser/tab_contents/navigation_controller.h?view=annotate',
      ChromiumLink,
      'src/chrome/browser/tab_contents/navigation_controller.h',
      []);

  // Chromium from Chromium Git
  assertLinkFromUrl(
      'http://git.chromium.org/gitweb/?p=chromium.git;a=blob;f=chrome/browser/app_modal_dialog_mac.mm;h=8d233870779deb041cc49c54b110f6f927d42a8a;hb=HEAD',
      ChromiumLink,
      'src/chrome/browser/app_modal_dialog_mac.mm',
      []);
  assertLinkFromUrl(
      'http://git.chromium.org/gitweb/?p=chromium.git;a=history;f=chrome/browser/app_modal_dialog_mac.mm;h=8d233870779deb041cc49c54b110f6f927d42a8a;hb=HEAD',
      ChromiumLink,
      'src/chrome/browser/app_modal_dialog_mac.mm',
      []);
  assertLinkFromUrl(
      'http://git.chromium.org/gitweb/?p=chromium.git;a=blob_plain;f=chrome/browser/app_modal_dialog_mac.mm;hb=HEAD',
      ChromiumLink,
      'src/chrome/browser/app_modal_dialog_mac.mm',
      []);

  // Chromium tools from Google Project Hosting Code Search
  assertLinkFromUrl(
      'https://code.google.com/p/chromium/codesearch#chromium/tools/chromium-buildbot/app.yaml&q=chromium-buildbot&type=cs&sq=package:chromium',
      ChromiumLink,
      'tools/chromium-buildbot/app.yaml',
      []);

  // V8 from Google Project Hosting Code Search (and related links)
  assertLinkFromUrl(
      'https://code.google.com/p/chromium/codesearch#chromium/src/v8/include/v8.h&q=v8&type=cs&sq=package:chromium',
      V8Link,
      'include/v8.h',
      ['http://code.google.com/p/v8/source/browse/trunk/include/v8.h',
       'http://code.google.com/p/v8/source/list?path=/trunk/include%2Fv8.h']);

  // V8 from code site
  assertLinkFromUrl(
      'http://code.google.com/p/v8/source/browse/trunk/src/accessors.h',
      V8Link,
      'src/accessors.h',
      []);
  assertLinkFromUrl(
      'http://code.google.com/p/v8/source/list?path=/trunk/include/v8.h&start=5462',
      V8Link,
      'include/v8.h',
      []);


  log('\nTESTS COMPLETE', 'green');
}

onload = runTests;
