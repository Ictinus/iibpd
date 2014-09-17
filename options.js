var iibpdOptions = {
    updateRangeDisplays: function () {
        document.getElementById('autoOpenDepthDisplay').textContent = document.getElementById('autoOpenDepth').value;
        document.getElementById('attrWidthDisplay').textContent = document.getElementById('attrWidth').value;
    },

    toggleDisabled: function (element, bDisabled) {
        if (bDisabled) {
            element.setAttribute("disabled", "disabled");
        } else {
            element.removeAttribute("disabled");
        }
    },
    toggleHideMetadata: function () {
    	var bDiscardMetadata = document.getElementById("discardMetadata").checked;
    	iibpdOptions.toggleDisabled(document.getElementById("hide_metadata"), bDiscardMetadata);
    },
    saveOptions: function () {
        chrome.storage.sync.set({
            'enableIIBPD': !!document.getElementById('enableIIBPD').checked,
            'discardMetadata': !!document.getElementById('discardMetadata').checked,
            'hide_metadata': !!document.getElementById('hide_metadata').checked || !!document.getElementById('discardMetadata').checked,
            'autoOpenDepth': document.getElementById("autoOpenDepth").valueAsNumber,
            'attrWidth': document.getElementById("attrWidth").valueAsNumber,
            'colourTagEnds': document.getElementById("colourTagEnds").value,
            'colourTagName': document.getElementById("colourTagName").value,
            'colourAttrName': document.getElementById("colourAttrName").value,
            'colourAttrValue': document.getElementById("colourAttrValue").value,
            'colourData': document.getElementById("colourData").value,
            'colourBackground': document.getElementById("colourBackground").value,
            'colourForeground': document.getElementById("colourForeground").value
        }, function() {
            // Update status to let user know options were saved.
            var status = document.getElementById('status');
            status.classList.remove('fade');
            status.textContent = ' Options saved.';
            setTimeout(function() {
                status.classList.add('fade');
            }, 1000);
        });
    },
    loadOptions: function () {

        chrome.storage.sync.get({
            'enableIIBPD': true,
            'discardMetadata': true,
            'hide_metadata': true,
            'autoOpenDepth': 1,
            'attrWidth': 7,
            'colourTagEnds': '#000000',
            'colourTagName': '#800080',
            'colourAttrName': '#000000',
            'colourAttrValue': '#0000FF',
            'colourData': '#008000',
            'colourBackground': '#dae3ec',
            'colourForeground': '#000000',
        }, function(items) {
            document.getElementById('enableIIBPD').checked = (items.enableIIBPD)? 'checked': '';
            document.getElementById('discardMetadata').checked = (items.discardMetadata)? 'checked': '';
            document.getElementById('hide_metadata').checked = (!items.discardMetadata && items.hide_metadata)? 'checked': '';
            document.getElementById('show_metadata').checked = (!items.discardMetadata && !items.hide_metadata)? 'checked': '';
            document.getElementById('autoOpenDepth').value = items.autoOpenDepth;
            document.getElementById('autoOpenDepthDisplay').textContent = items.autoOpenDepth;
            document.getElementById('attrWidth').value = items.attrWidth;
            document.getElementById('attrWidthDisplay').textContent = items.attrWidth;
            document.getElementById("colourTagEnds").value = items.colourTagEnds;
            document.getElementById("colourTagName").value = items.colourTagName;
            document.getElementById("colourAttrName").value = items.colourAttrName;
            document.getElementById("colourAttrValue").value = items.colourAttrValue;
            document.getElementById("colourData").value = items.colourData;
            document.getElementById("colourBackground").value = items.colourBackground;
            document.getElementById("colourForeground").value = items.colourForeground;
//			iibpdOptions.toggleDisabled(document.getElementById("hide_metadata"), items.discardMetadata);
        });
    }
};

document.addEventListener("readystatechange", function () {
    if (document.readyState == "complete") {
        iibpdOptions.loadOptions();
        document.getElementById("save").addEventListener('click', iibpdOptions.saveOptions);
        document.getElementById("autoOpenDepth").addEventListener('input', iibpdOptions.updateRangeDisplays);
//        document.getElementById("discardMetadata").addEventListener('click', iibpdOptions.toggleHideMetadata);
        document.getElementById("attrWidth").addEventListener('input', iibpdOptions.updateRangeDisplays);
    }
}, true);

document.getElementById("resetColourTagEnds").addEventListener("click", function () {
    document.getElementById("colourTagEnds").value = '#000000';
}, true);
document.getElementById("resetColourTagName").addEventListener("click", function () {
    document.getElementById("colourTagName").value = '#800080';
}, true);
document.getElementById("resetColourAttrName").addEventListener("click", function () {
    document.getElementById("colourAttrName").value = '#000000';
}, true);
document.getElementById("resetColourAttrValue").addEventListener("click", function () {
    document.getElementById("colourAttrValue").value = '#0000FF';
}, true);
document.getElementById("resetColourData").addEventListener("click", function () {
    document.getElementById("colourData").value = '#008000';
}, true);
document.getElementById("resetColourBackground").addEventListener("click", function () {
    document.getElementById("colourBackground").value = '#dae3ec';
}, true);
document.getElementById("resetColourForeground").addEventListener("click", function () {
    document.getElementById("colourForeground").value = '#000000';
}, true);
