function injectScript(script) {
    var s = document.createElement('script');
    s.src = chrome.extension.getURL(script);
    s.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
}

injectScript('src/icsjs/ics.deps.min.js');
injectScript('src/export.js');
