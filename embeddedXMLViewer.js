var iibpd = {
    debug: false,
    options: {
        enableIIBPD: true,
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
			enableIIBPD: true,
            discardMetadata: true,
            hide_metadata: true,
            autoOpenDepth: 1,
            attrWidth: 7,
            colourTagEnds: '#000000',
            colourTagName: '#800080',
            colourAttrName: '#000000',
            colourAttrValue: '#0000FF',
            colourData: '#008000',
            colourBackground: '#dae3ec',
            colourForeground: '#000000'
        }, function (items) {
            iibpd.options.enableIIBPD = items.enableIIBPD;
            iibpd.options.discardMetadata = items.discardMetadata;
            iibpd.options.hide_metadata = items.hide_metadata;
            iibpd.options.autoOpenDepth = items.autoOpenDepth;
            iibpd.options.attrWidth = items.attrWidth;
            iibpd.options.colourTagEnds = items.colourTagEnds;
            iibpd.options.colourTagName = items.colourTagName;
            iibpd.options.colourAttrName = items.colourAttrName;
            iibpd.options.colourAttrValue = items.colourAttrValue;
            iibpd.options.colourData = items.colourData;
            iibpd.options.colourBackground = items.colourBackground;
            iibpd.options.colourForeground = items.colourForeground;
            if (iibpd.options.enableIIBPD) {
                var element, arrEl = document.getElementsByTagName('pre');
                for (var i=0; i < arrEl.length; i++) {
                    element = arrEl[i];
                    LoadXMLString(element, element.textContent);
                }
                //load colour styles
                var styleEl = document.createElement('style'),
                styleSheet;
                document.head.appendChild(styleEl);
                styleSheet = styleEl.sheet;
                styleSheet.insertRule(".NodeName, .Clickable {color: " + iibpd.options.colourTagName + ";}", 0);
                styleSheet.insertRule(".AttributeName {color: " + iibpd.options.colourAttrName + ";", 0);
                styleSheet.insertRule(".AttributeValue {color: " + iibpd.options.colourAttrValue + ";}", 0);
                styleSheet.insertRule(".NodeValue {color: " + iibpd.options.colourData + ";}", 0);
                styleSheet.insertRule(".NodeName + .NodeValue:before, .NodeName:not(.endTag):before, .NodeName.endTag:before, .NodeName.endTag:after, .NodeName:nth-last-child(2):after, .AttributeValue:last-child:after, .AttributeValue.last-of-class:after {color:"+ iibpd.options.colourTagEnds +";}", 0);
                styleSheet.insertRule("table tr[id] {background-color: " + iibpd.options.colourBackground + ";}", 0);
                styleSheet.insertRule("table tr[id] td, div.info1 {color: " + iibpd.options.colourForeground + ";}", 0);
                styleSheet.insertRule(".AttributeValue {min-width: " + iibpd.options.attrWidth + "em;}", 0);
            }

            console.info("iibpd.options: " + JSON.stringify(iibpd.options));
        });
    },

    init: function () {
        iibpd.loadOptions();

        document.addEventListener("keydown", iibpd.processKey, true);
        chrome.storage.onChanged.addListener(function (changes, namespace) {
            var options = {};
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
                    options.metaData = true;
                }
                if (key === "autoOpenDepth") {
                    iibpd.options.autoOpenDepth = storageChange.newValue;
                }
                if (key === "discardMetadata") {
                    iibpd.options.discardMetadata = storageChange.newValue;
                }
                if (key === "attrWidth") {
                    iibpd.options.attrWidth = storageChange.newValue;
                    options.attrWidth = true;
                }
                if (key === "colourTagEnds") {
                    iibpd.options.colourTagEnds = storageChange.newValue;
                    options.colourTagEnds = true;
                }
                if (key === "colourTagName") {
                    iibpd.options.colourTagName = storageChange.newValue;
                    options.colourTagName = true;
                }
                if (key === "colourAttrName") {
                    iibpd.options.colourAttrName = storageChange.newValue;
                    options.colourAttrName = true;
                }
                if (key === "colourAttrValue") {
                    iibpd.options.colourAttrValue = storageChange.newValue;
                    options.colourAttrValue = true;
                }
                if (key === "colourData") {
                    iibpd.options.colourData = storageChange.newValue;
                    options.colourData = true;
                }
                if (key === "colourForeground") {
                    iibpd.options.colourForeground = storageChange.newValue;
                    options.colourForeground = true;
                }
                if (key === "colourBackground") {
                    iibpd.options.colourBackground = storageChange.newValue;
                    options.colourBackground = true;
                }
            }
            iibpd.processConfigOptions(options);
        });
    },

    processConfigOptions: function (options) {
        if (!!options.metaData) {
            //hide/show metadata
            var arrMetadata = document.querySelectorAll("div.metadata");
            for (var i=0; i < arrMetadata.length; i++) {
                if (!!arrMetadata[i]) {
                    arrMetadata[i].classList.toggle("hide_metadata", iibpd.options.hide_metadata);
                }
            }
        }

        // stylesheet updates
        var styleEl = document.createElement('style'),
        styleSheet;
        document.head.appendChild(styleEl);
        styleSheet = styleEl.sheet;
        if (!!options.attrWidth) {
            styleSheet.insertRule(".AttributeValue {min-width: " + iibpd.options.attrWidth + "em;}", 0);
        }
        if (!!options.colourTagEnds) {
            styleSheet.insertRule(".NodeName + .NodeValue:before, .NodeName:not(.endTag):before, .NodeName.endTag:before, .NodeName.endTag:after, .NodeName:nth-last-child(2):after, .AttributeValue:last-child:after, .AttributeValue.last-of-class:after {color:"+ iibpd.options.colourTagEnds +";}", 0);
        }
        if (!!options.colourTagName) {
            styleSheet.insertRule(".NodeName, .Clickable {color: " + iibpd.options.colourTagName + ";}", 0);
        }
        if (!!options.colourAttrName) {
            styleSheet.insertRule(".AttributeName {color: " + iibpd.options.colourAttrName + ";", 0);
        }
        if (!!options.colourAttrValue) {
            styleSheet.insertRule(".AttributeValue {color: " + iibpd.options.colourAttrValue + ";}", 0);
        }
        if (!!options.colourData) {
            styleSheet.insertRule(".NodeValue {color: " + iibpd.options.colourData + ";}", 0);
        }
        if (!!options.colourForeground) {
            styleSheet.insertRule("table tr[id] td, div.info1 {color: " + iibpd.options.colourForeground + ";}", 0);
        }
        if (!!options.colourBackground) {
            styleSheet.insertRule("table tr[id] {background-color: " + iibpd.options.colourBackground + ";}", 0);
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
