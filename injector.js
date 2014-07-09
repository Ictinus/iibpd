var injector = {
	
	injectJs: function(srcFile) {
		var scr = document.createElement('script');
		scr.src = srcFile;
		document.getElementsByTagName('head')[0].appendChild(scr);
	},
	init: function () {
		var arrForms = document.getElementsByTagName('form');
		if (!!arrForms && !!arrForms[0] && arrForms[0].name == "debug") { //basic check for debug form
			this.injectJs(chrome.extension.getURL('encoder.js'));
			this.injectJs(chrome.extension.getURL('loadxml.js'));
			this.injectJs(chrome.extension.getURL('embeddedXMLViewer.js'));
		}
	}
};

injector.init();
