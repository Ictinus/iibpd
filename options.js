var iibpdOptions = {
    updateAutoOpenDepthDisplay: function () {
        document.getElementById('autoOpenDepthDisplay').textContent = document.getElementById('autoOpenDepth').value; 
    },
    
    toggleDisabled: function (element, bDisabled) {
        console.log('toggleDisabled is ' + bDisabled);
        if (bDisabled) {
            element.setAttribute("disabled", "true");
        } else {
            element.removeAttribute("disabled");
        }
    },
    
    saveOptions: function () {
        chrome.storage.sync.set({
            'discardMetadata': !!document.getElementById('discardMetadata').checked,
            'hide_metadata': !!document.getElementById('hide_metadata').checked,
            'autoOpenDepth': document.getElementById("autoOpenDepth").valueAsNumber
        }, function() {
            // Update status to let user know options were saved.
            var status = document.getElementById('status');
            status.classList.remove('fade');
            status.textContent = ' Options saved.';
            setTimeout(function() {
                status.classList.add('fade');
                status.textContent = '';
            }, 1000);
        });
    },
    loadOptions: function () {

        chrome.storage.sync.get({
            'discardMetadata': true,
            'hide_metadata': true,
            'autoOpenDepth': 1
        }, function(items) {
            document.getElementById('discardMetadata').checked = (items.discardMetadata)? 'checked': '';
            document.getElementById('hide_metadata').checked = (items.hide_metadata)? 'checked': '';
            document.getElementById('autoOpenDepth').value = items.autoOpenDepth;
            document.getElementById('autoOpenDepthDisplay').textContent = items.autoOpenDepth;
        });
    }
};

document.addEventListener("readystatechange", function () {
    if (document.readyState == "complete") {
        iibpdOptions.loadOptions();
        document.getElementById("save").addEventListener('click', iibpdOptions.saveOptions);
        document.getElementById("autoOpenDepth").addEventListener('input', iibpdOptions.updateAutoOpenDepthDisplay);
    }
}, true);
