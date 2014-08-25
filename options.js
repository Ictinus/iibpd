var iibpdOptions = {
    updateAutoOpenDepthDisplay: function () {
        document.getElementById('autoOpenDepthDisplay').textContent = document.getElementById('autoOpenDepth').value;
    },

    updateColours: function () {

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
            'hide_metadata': !!document.getElementById('hide_metadata').checked,
            'autoOpenDepth': document.getElementById("autoOpenDepth").valueAsNumber,
            'colourTagEnds': document.getElementById("colourTagEnds").value,
            'colourTagName': document.getElementById("colourTagName").value,
            'colourAttrName': document.getElementById("colourAttrName").value,
            'colourAttrValue': document.getElementById("colourAttrValue").value,
            'colourData': document.getElementById("colourData").value
        }, function() {
            // Update status to let user know options were saved.
            var status = document.getElementById('status');
            status.classList.remove('fade');
            status.textContent = ' Options saved.';
            setTimeout(function() {
                status.classList.add('fade');
                //setTimeout(function () { status.textContent = ''; }, 500);
            }, 1000);
        });
    },
    loadOptions: function () {

        chrome.storage.sync.get({
            'enableIIBPD': true,
            'discardMetadata': true,
            'hide_metadata': true,
            'autoOpenDepth': 1,
            'colourTagEnds': '#000000',
            'colourTagName': '#800080',
            'colourAttrName': '#000000',
            'colourAttrValue': '#0000FF',
            'colourData': '#008000'
        }, function(items) {
            document.getElementById('enableIIBPD').checked = (items.enableIIBPD)? 'checked': '';
            document.getElementById('discardMetadata').checked = (items.discardMetadata)? 'checked': '';
            document.getElementById('hide_metadata').checked = (items.hide_metadata)? 'checked': '';
            document.getElementById('autoOpenDepth').value = items.autoOpenDepth;
            document.getElementById('autoOpenDepthDisplay').textContent = items.autoOpenDepth;
            document.getElementById("colourTagEnds").value = items.colourTagEnds;
            document.getElementById("colourTagName").value = items.colourTagName;
            document.getElementById("colourAttrName").value = items.colourAttrName;
            document.getElementById("colourAttrValue").value = items.colourAttrValue;
            document.getElementById("colourData").value = items.colourData;
			iibpdOptions.toggleDisabled(document.getElementById("hide_metadata"), items.discardMetadata);
        });
    }
};

document.addEventListener("readystatechange", function () {
    if (document.readyState == "complete") {
        iibpdOptions.loadOptions();
        document.getElementById("save").addEventListener('click', iibpdOptions.saveOptions);
        document.getElementById("autoOpenDepth").addEventListener('input', iibpdOptions.updateAutoOpenDepthDisplay);
        document.getElementById("discardMetadata").addEventListener('click', iibpdOptions.toggleHideMetadata);
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
