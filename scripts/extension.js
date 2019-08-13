var document = window.document;
var sendMessage = browser.runtime.sendMessage;
var onMessage = browser.runtime.onMessage;

var inputTypes = ["textarea", "text", "search", "tel"];

function findIgnore(el) {
    var va = exclude, i;
    for (i = 0; i < va.length; i++) {
        if ((va[i].length > 0) && (el.name == va[i] || el.id == va[i])) {
            return true;
        }
    }
    return false;
}

function _keyPressHandler(e) {
    var el = e.target, code = e.which;
    if (e.ctrlKey || e.altKey || !checkExecCode(code)) {
        return;
    }
    if (inputTypes.indexOf(el.type) < 0) { // Not contains in list of input types
        if (el.isContentEditable) {
            ifMoz(e);
        }
        return;
    }
    AVIMObj.sk = fromCharCode(code);
    if (findIgnore(el) || el.readOnly) {
        return;
    }
    start(el, e);
    if (AVIMObj.changed) {
        AVIMObj.changed = false;
        e.preventDefault();
        return false;
    }
    return;
}

var isPressCtrl = false;

function _keyUpHandler(evt) {
    var code = evt.which;

    // Press Ctrl twice to off/on AVIM
    if (code === 17) {
        if (isPressCtrl) {
            isPressCtrl = false;
            sendMessage({'turn_avim': 'onOff'}).then(configAVIM);
        } else {
            isPressCtrl = true;
            // Must press twice in 300ms
            setTimeout(function () {
                isPressCtrl = false;
            }, 300);
        }
    } else {
        isPressCtrl = false;
    }
}

function keyUpHandler(evt) {
    // Only for on/off purpose
    _keyUpHandler(evt);
}

function keyPressHandler(evt) {
    if (_keyPressHandler(evt) === false) {
        evt.preventDefault();
    }
}

function attachEvt(obj, evt, handle, capture) {
    obj.addEventListener(evt, handle, capture);
}

function removeEvt(obj, evt, handle, capture) {
    obj.removeEventListener(evt, handle, capture);
}

function removeOldAVIM() {
    // Untrigger event
    removeEvt(document, "keypress", keyPressHandler, true);
    removeEvt(document, "keyup", keyUpHandler, true);

    // Remove AVIM
    AVIMObj = null;
    //delete AVIMObj;
}

function newAVIMInit() {
    if (typeof AVIMObj !== "undefined" && AVIMObj) {
        removeOldAVIM();
    }

    AVIMObj = new AVIM();

    // Trigger event
    attachEvt(document, "keyup", keyUpHandler, true);
    attachEvt(document, "keypress", keyPressHandler, true);
}

function configAVIM(data) {
    if (data) {
        method = data.method;
        onOff = data.onOff;
        checkSpell = data.ckSpell;
        oldAccent = data.oldAccent;
    }

    newAVIMInit();
}

sendMessage({'get_prefs': 'all'}).then(configAVIM);

onMessage.addListener(function (request, sender, sendResponse) {
    configAVIM(request);
});

