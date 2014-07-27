var iibpd = {
    debug: false,
    options: {
        discardMetadata: true,
        hide_metadata: true,
        autoOpenDepth: 1
    },
    
    simulateClick: function (elem) {
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent(
            "click", /* type */
            true, /* canBubble */
            true, /* cancelable */
            window, /* view */
            0, /* detail */
            0, /* screenX */
            0, /* screenY */
            0, /* clientX */
            0, /* clientY */
            false, /* ctrlKey */
            false, /* altKey */
            false, /* shiftKey */
            false, /* metaKey */
            0, /* button */
            null /* relatedTarget */
        );
        elem.dispatchEvent(evt);
    },
    
    processKey: function (e) { //e is event object passed from function invocation
        var kc, btnStep, btnRun; //sk
        e = e || window.event || "";
        kc = e.keyCode || e.which;
        //sk = e.shiftKey || ((kc === 16) ? true : false);

        if (kc === 83 || kc === 13 || kc === 39) {
            // 83:S, 13:enter, 39:right arrow
            if (e.shiftKey) {
                btnStep = document.querySelectorAll("input[value='Step Over']");
            } else {
                btnStep = document.querySelectorAll("input[value=Step]");
            }
            if (!!btnStep && btnStep[0]) {
                iibpd.simulateClick(btnStep[0]);
            }
        } else if (kc === 82) {
            // R
            btnRun = document.querySelectorAll("input[value=Run]");
            if (!!btnRun && btnRun[0]) {
                iibpd.simulateClick(btnRun[0]);
            }
        }
    },
    
    loadOptions: function () {
        chrome.storage.sync.get({
            discardMetadata: true,
            hide_metadata: true,
            autoOpenDepth: 1
        }, function (items) {
            iibpd.options.discardMetadata = items.discardMetadata;
            iibpd.options.hide_metadata = items.hide_metadata;
            iibpd.options.autoOpenDepth = items.autoOpenDepth;
            var element, arrEl = document.getElementsByTagName('pre');
            for (var i=0; i < arrEl.length; i++) {
                element = arrEl[i];
                LoadXMLString(element, element.textContent);
            }
        });
    },
    
    init: function () {
        iibpd.loadOptions();

        document.addEventListener("keydown", iibpd.processKey, true);
        chrome.storage.onChanged.addListener(function (changes, namespace) {
            for (key in changes) {
                var storageChange = changes[key];
                if (iibpd.debug) {
                    console.log('Storage key "%s" in namespace "%s" changed. ' +
                        'Old value was "%s", new value is "%s".',
                        key,
                        namespace,
                        storageChange.oldValue,
                        storageChange.newValue);
                }
                if (key === "hide_metadata") {
                    iibpd.options.hide_metadata = storageChange.newValue;
                    iibpd.processConfigOptions();
                }
                if (key === "autoOpenDepth") {
                    iibpd.options.autoOpenDepth = storageChange.newValue;
                }
                if (key === "discardMetadata") {
                    iibpd.options.discardMetadata = storageChange.newValue;
                }
            }
        });
    },
    
    processConfigOptions: function () {
        //hide/show metadata
        var arrMetadata = document.querySelectorAll("div.metadata");
        for (var i=0; i < arrMetadata.length; i++) {
            if (!!arrMetadata[i]) {
                arrMetadata[i].classList.toggle("hide_metadata", iibpd.options.hide_metadata);
            }
        }
    },
    
    load: function () {
        document.addEventListener("readystatechange", function () {
            if (document.readyState === "complete") {
                iibpd.init();
            }
        }, true)
    }
};
iibpd.load();
