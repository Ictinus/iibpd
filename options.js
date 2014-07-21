var iibpdOptions = {
    updateAutoOpenDepthDisplay: function () {
        document.getElementById('autoOpenDepthDisplay').textContent = document.getElementById('autoOpenDepth').value; 
    },
    
    saveOptions: function () {
        var hideMetadata = !!document.getElementById('hide_metadata').checked;
        chrome.storage.sync.set({
            'hide_metadata': hideMetadata,
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
            'hide_metadata': true,
            'autoOpenDepth': 1
        }, function(items) {
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
