var iibpd = {
	
	simulateClick: function(elem) {
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
			null); /* relatedTarget */
		elem.dispatchEvent(evt);
		return check = true;
	},

	processKey: function(e) { //e is event object passed from function invocation
		var kc //literal character code will be stored in this variable

		e = (e) ? e : ((window.event) ? window.event : "");
		kc = e.keyCode?e.keyCode:e.which;
		sk = e.shiftKey?e.shiftKey:((kc == 16)?true:false);

		if (kc == 83 || kc == 13 || kc == 39) {
			// 83:S, 13:enter, 39:right arrow
			if (e.shiftKey) {
				var btnStep = document.querySelectorAll("input[value='Step Over']");			
			} else {
				var btnStep = document.querySelectorAll("input[value=Step]");
			}
			if (!!btnStep && btnStep[0]) {
				iibpd.simulateClick(btnStep[0]);
			}
		} else if (kc == 82) {
			// R
			var btnRun = document.querySelectorAll("input[value=Run]");
			if (!!btnRun && btnRun[0]) iibpd.simulateClick(btnRun[0]);
		}
	},

	init: function() {
		var arrEl = document.getElementsByTagName('pre');
		for(var i=0; i < arrEl.length; i++) {
			var element = arrEl[i];
				LoadXMLString(element, Encoder.htmlDecode(element.innerHTML));
		}
		
		document.addEventListener("keydown", iibpd.processKey, true);	
	},

	load: function () {
		document.addEventListener("readystatechange", function() {
			if (document.readyState == "complete") {
				iibpd.init();
			}
		}, true)
	}
}
iibpd.load();
