(function (window) {
    // API Wrapper
    var getAllTabsInWindow = function (windowId, callback) {
        var tabs = browser.tabs.query({currentWindow: true});
        tabs.then(callback);
    };
    var sendMessage2Tab = browser.tabs.sendMessage;
    var browserAction = browser.browserAction;
    var contextMenus = browser.menus;
    var onMessage = browser.runtime.onMessage;
    // End API Wrapper

    var localStorage = window.localStorage;

    function setLocalStorageItem(key, value) {
        if (localStorage)
            localStorage[key] = value;
    }

    function getLocalStorageItem(key) {
        if (localStorage)
            return localStorage.getItem(key);

        return;
    }

    function removeLocalStorageItem(key) {
        if (localStorage)
            localStorage.removeItem(key);
    }

    function getPrefs(callback) {
        if (!getLocalStorageItem('method')) {
            init();
        }
        var prefs = {
            'method': parseInt(getLocalStorageItem('method')),
            'onOff': parseInt(getLocalStorageItem('onOff')),
            'ckSpell': parseInt(getLocalStorageItem('ckSpell')),
            'oldAccent': parseInt(getLocalStorageItem('oldAccent'))
        };

        callback.call(this, prefs);
    }

    function toggleAvim(callback) {
        if (!getLocalStorageItem('method')) {
            init();
        }

        var onOff = getLocalStorageItem('onOff');
        setLocalStorageItem('onOff', onOff == '1' ? '0' : '1');

        getPrefs(function (prefs) {
            updateAllTabs(prefs);
            if (typeof callback === "function") {
                callback.call(this);
            }
        });
    }

    function updateAllTabs(prefs) {
        getAllTabsInWindow(null, function (tabs) {
            for (var i = 0; i < tabs.length; i++) {
                var tab = tabs[i];
                // todo: exception when send to tab about:debugging and similar urls (firefox url, etc,...)
                sendMessage2Tab(tab.id, prefs);
            }
        });

        updateIcon(prefs);
    }

    function updateIcon(prefs) {
        var txt = {};
        var bg = {};

        if (prefs.onOff == 1) {
            txt.text = "on";
            bg.color = [0, 255, 0, 255];
        } else {
            txt.text = "off";
            bg.color = [255, 0, 0, 255];
        }

        browserAction.setBadgeText(txt);
        browserAction.setBadgeBackgroundColor(bg);
    }

    function savePrefs(request, callback) {
        if (typeof request.method !== 'undefined') {
            setLocalStorageItem("method", request.method);
        }
        if (typeof request.onOff !== 'undefined') {
            setLocalStorageItem("onOff", request.onOff);
        }
        if (typeof request.ckSpell !== 'undefined') {
            setLocalStorageItem("ckSpell", request.ckSpell);
        }
        if (typeof request.oldAccent !== 'undefined') {
            setLocalStorageItem("oldAccent", request.oldAccent);
        }

        getPrefs(function (prefs) {
            updateAllTabs(prefs);
            callback.call(this);
        });
    }

    function processRequest(request, sender, sendResponse) {
        if (request.get_prefs) {
            getPrefs(sendResponse);
            return;
        }

        if (request.save_prefs) {
            savePrefs(request, sendResponse);
            return;
        }

        if (request.turn_avim) {
            toggleAvim(sendResponse);
            return;
        }
    }

    function genericOnClick() {
        alert("demo");
    }

    function createMenus() {
        var parentId = contextMenus.create({"title": "AVIM", "contexts": ["selection"]});
        var demo = contextMenus.create({
            "title": "AVIM Demo",
            "contexts": ["selection"],
            "parentId": parentId,
            "onclick": genericOnClick
        });
    }

    function init() {
        if (!getLocalStorageItem('method')) {
            setLocalStorageItem('method', '0');
        }

        if (!getLocalStorageItem('onOff')) {
            setLocalStorageItem('onOff', '1');
        }

        if (!getLocalStorageItem('ckSpell')) {
            setLocalStorageItem('ckSpell', '1');
        }

        if (!getLocalStorageItem('oldAccent')) {
            setLocalStorageItem('oldAccent', '1');
        }

        getPrefs(updateIcon);

        onMessage.addListener(processRequest);

        //createMenus();
    }

    init();
    browserAction.onClicked.addListener(toggleAvim);

})(window);
