/* Copyright (c) 2007 Lev Muchnik <LevMuchnik@gmail.com>. All rights reserved.
 * You may copy and modify this script as long as the above copyright notice,
 * this condition and the following disclaimer is left intact.
 * This software is provided by the author "AS IS" and no warranties are
 * implied, including fitness for a particular purpose. In no event shall
 * the author be liable for any damages arising in any way out of the use
 * of this software, even if advised of the possibility of such damage.
 * $Date: 2007-10-03 19:08:15 -0700 (Wed, 03 Oct 2007) $
 */

/* Modified by Paul Blackman, July 2014,
 * for use in IBM BPM Debug pages. 
 */

function LoadXML(ParentElementID, URL) {
	var xmlHolderElement = GetParentElement(ParentElementID);
	if (xmlHolderElement == null) {
		return false;
	}
	ToggleElementVisibility(xmlHolderElement);
	return RequestURL(URL, URLReceiveCallback, ParentElementID);
}
function LoadXMLDom(ParentElementID, xmlDoc) {
	if (xmlDoc) {
		var xmlHolderElement = GetParentElement(ParentElementID);
		if (xmlHolderElement == null) {
			return false;
		}
		while (xmlHolderElement.childNodes.length) {
			xmlHolderElement.removeChild(xmlHolderElement.childNodes.item(xmlHolderElement.childNodes.length - 1));
		}
		var Result = ShowXML(xmlHolderElement, xmlDoc.documentElement, 0);

		var ReferenceElement = document.createElement('div');
		return Result;
	} else {
		return false;
	}
}
function LoadXMLString(ParentElementID, XMLString) {
	xmlDoc = CreateXMLDOM(XMLString);
	if ( !! xmlDoc && !!xmlDoc.body && !!xmlDoc.body.childNodes && !!xmlDoc.body.childNodes[0] && xmlDoc.body.childNodes[0].nodeName === "parsererror") {
		return false;
	} else {
		return LoadXMLDom(ParentElementID, xmlDoc);
	}
}
////////////////////////////////////////////////////////////
// HELPER FUNCTIONS - SHOULD NOT BE DIRECTLY CALLED BY USERS
////////////////////////////////////////////////////////////
function GetParentElement(ParentElementID) {
	if (typeof(ParentElementID) == 'string') {
		return document.getElementById(ParentElementID);
	} else if (typeof(ParentElementID) == 'object') {
		return ParentElementID;
	} else {
		return null;
	}
}
function URLReceiveCallback(httpRequest, xmlHolderElement) {
	try {
		if (httpRequest.readyState == 4) {
			if (httpRequest.status == 200) {
				var xmlDoc = httpRequest.responseXML;
				if (xmlHolderElement && xmlHolderElement != null) {
					xmlHolderElement.innerHTML = '';
					return LoadXMLDom(xmlHolderElement, xmlDoc);
				}
			} else {
				return false;
			}
		}
	} catch(e) {
		return false;
	}
}
function RequestURL(url, callback, ExtraData) {
	// based on: http://developer.mozilla.org/en/docs/AJAX:Getting_Started
	var httpRequest;
	if (window.XMLHttpRequest) {
		// Mozilla, Safari, ...
		httpRequest = new XMLHttpRequest();
		if (httpRequest.overrideMimeType) {
			httpRequest.overrideMimeType('text/xml');
		}
	} else if (window.ActiveXObject) {
		// IE
		try {
			httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
		} catch(e) {
			try {
				httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
			} catch(e) {}
		}
	}
	if (!httpRequest) {
		return false;
	}
	httpRequest.onreadystatechange = function() {
		callback(httpRequest, ExtraData);
	};
	httpRequest.open('GET', url, true);
	httpRequest.send('');
	return true;
}
function CreateXMLDOM(XMLStr) {
	if (window.ActiveXObject) {
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.loadXML(XMLStr);
		return xmlDoc;
	} else if (document.implementation && document.implementation.createDocument) {
		var parser = new DOMParser();
		return parser.parseFromString(XMLStr, "text/xml");
	} else {
		return null;
	}
}

var IDCounter = 1;
var NestingIndent = 15;
function ShowXML(xmlHolderElement, RootNode, indent) {
	if (RootNode == null || xmlHolderElement == null) {
		return false;
	}
	var Result = true;
	var TagEmptyElement = document.createElement('div');
	TagEmptyElement.className = 'Element';
	
	if (RootNode.nodeName === "metadata") {
		if (iibpd.options.discardMetadata) {
			return false; //ignore metadata elements
		}
		TagEmptyElement.classList.add("metadata"); //to allow hiding of metadata elements
		TagEmptyElement.classList.toggle("hide_metadata", iibpd.options.hide_metadata);
	}
	
	if (indent != 0) {
		TagEmptyElement.style.left = NestingIndent + 'px';
	}
	if (RootNode.childNodes.length == 0) {
		var ClickableElement = AddTextNode(TagEmptyElement, ' ', 'Clickable'); //no action on this Clickable
		AddTextNode(TagEmptyElement, '<', 'Utility');
		AddTextNode(TagEmptyElement, RootNode.nodeName, 'NodeName')
		for (var i = 0; RootNode.attributes && i < RootNode.attributes.length;++i) {
			CurrentAttribute = RootNode.attributes.item(i);
			AddTextNode(TagEmptyElement, ' ' + CurrentAttribute.nodeName, 'AttributeName');
			AddTextNode(TagEmptyElement, '=', 'Utility');
			AddTextNode(TagEmptyElement, '"' + CurrentAttribute.value + '"', 'AttributeValue');
		}
		AddTextNode(TagEmptyElement, ' />', 'Utility');
		xmlHolderElement.appendChild(TagEmptyElement);
		
	} else { // mo child nodes

		// build collapsed display elements
		
		//Look for text content and display in single line 
		var NodeContent = null;
		for (var i = 0; RootNode.childNodes && i < RootNode.childNodes.length; ++i) {
			if (RootNode.childNodes.item(i).nodeName === '#text') {
				NodeContent = RootNode.childNodes.item(i).nodeValue;
			}
		}
		var bSimpleContentExists = ( !!NodeContent && !!(NodeContent.trim()));
		
		if (bSimpleContentExists) {
			// no expand button
			var ClickableElement = AddTextNode(TagEmptyElement, ' ', 'Clickable'); //no action on this Clickable
		} else {
			// expand button
			var ClickableElement = AddTextNode(TagEmptyElement, '+', 'Clickable');
			ClickableElement.onclick = function(e) {
				ToggleElementVisibility(this, e.ctrlKey);
			}
			ClickableElement.id = 'div_empty_' + IDCounter;
		}
		// element 
		AddTextNode(TagEmptyElement, '<', 'Utility');
		AddTextNode(TagEmptyElement, RootNode.nodeName, 'NodeName')
		// element attributes
		for (var i = 0; RootNode.attributes && i < RootNode.attributes.length;++i) {
			CurrentAttribute = RootNode.attributes.item(i);
			AddTextNode(TagEmptyElement, ' ' + CurrentAttribute.nodeName, 'AttributeName');
			AddTextNode(TagEmptyElement, '=', 'Utility');
			AddTextNode(TagEmptyElement, '"' + CurrentAttribute.value + '"', 'AttributeValue');
		}
		AddTextNode(TagEmptyElement, '>', 'Utility');

//		if ( !!RootNode.nodeValue ) { NodeContent = RootNode.nodeValue; console.log(NodeContent); } //needed?
		if (bSimpleContentExists) { //display inline simple content
			AddTextNode(TagEmptyElement, NodeContent, 'NodeValue');
		}

		AddTextNode(TagEmptyElement, '</', 'Utility'); //put simple values in here

		AddTextNode(TagEmptyElement, RootNode.nodeName, 'NodeName');
		AddTextNode(TagEmptyElement, '>', 'Utility');
		xmlHolderElement.appendChild(TagEmptyElement);

		//AutoExpandDepth, expand until we shouldn't
		if (indent < iibpd.options.autoOpenDepth) {
			SetVisibility(TagEmptyElement, false);  // show as expanded
		} else {
			SetVisibility(TagEmptyElement, true);  // show as collapsed			
		}
		
		//---------------------------------------------- 
		if (!bSimpleContentExists) {
			// build uncollapsed display elements
			var TagElement = document.createElement('div');
			TagElement.className = 'Element';
			
			if (RootNode.nodeName === "metadata") {
				if (iibpd.options.discardMetadata) {
					return false; //ignore metadata elements
				}
				TagElement.classList.add("metadata");  //to allow hiding of metadata elements
				TagElement.classList.toggle("hide_metadata", iibpd.options.hide_metadata);
			}

			if (indent != 0) {
				TagElement.style.left = NestingIndent + 'px';
			}
			ClickableElement = AddTextNode(TagElement, '-', 'Clickable');
			ClickableElement.onclick = function(e) {
				ToggleElementVisibility(this, e.ctrlKey);
			}
			ClickableElement.id = 'div_content_' + IDCounter; ++IDCounter;
			AddTextNode(TagElement, '<', 'Utility');
			AddTextNode(TagElement, RootNode.nodeName, 'NodeName');

			for (var i = 0; RootNode.attributes && i < RootNode.attributes.length;++i) {
				CurrentAttribute = RootNode.attributes.item(i);
				AddTextNode(TagElement, ' ' + CurrentAttribute.nodeName, 'AttributeName');
				AddTextNode(TagElement, '=', 'Utility');
				AddTextNode(TagElement, '"' + CurrentAttribute.value + '"', 'AttributeValue');
			}
			AddTextNode(TagElement, '>', 'Utility');
			TagElement.appendChild(document.createElement('br'));
			var NodeContent = null;
			for (var i = 0; RootNode.childNodes && i < RootNode.childNodes.length; ++i) {
				if (RootNode.childNodes.item(i).nodeName != '#text') {
					Result &= ShowXML(TagElement, RootNode.childNodes.item(i), indent + 1);
				}
			}

			AddTextNode(TagElement, ' ', 'Clickable');
			AddTextNode(TagElement, '</', 'Utility');
			AddTextNode(TagElement, RootNode.nodeName, 'NodeName');
			AddTextNode(TagElement, '>', 'Utility');
			xmlHolderElement.appendChild(TagElement);

			//AutoExpandDepth, expand until we shouldn't
			if (indent < iibpd.options.autoOpenDepth) {
				SetVisibility(TagElement, true);  // show as expanded
			} else {
				SetVisibility(TagElement, false);  // show as collapsed	
			}
		}
	}

	return Result;
}
function AddTextNode(ParentNode, Text, Class) {
	NewNode = document.createElement('span');
	if (Class) {
		NewNode.className = Class;
	}
	if (Text) {
		NewNode.appendChild(document.createTextNode(Text));
	}
	if (ParentNode) {
		ParentNode.appendChild(NewNode);
	}
	return NewNode;
}
function CompatibleGetElementByID(id) {
	if (!id) {
		return null;
	}
	if (document.getElementById) {
		// DOM3 = IE5, NS6
		return document.getElementById(id);
	} else {
		if (document.layers) {
			// Netscape 4
			return document.id;
		} else {
			// IE 4
			return document.all.id;
		}
	}
}
function SetVisibility(HTMLElement, Visible) {
	if (!HTMLElement) {
		return;
	}
	var VisibilityStr = (Visible) ? 'block': 'none';
	if (document.getElementById) {
		// DOM3 = IE5, NS6
		HTMLElement.style.display = VisibilityStr;
	} else {
		if (document.layers) {
			// Netscape 4
			HTMLElement.display = VisibilityStr;
		} else {
			// IE 4
			HTMLElement.id.style.display = VisibilityStr;
		}
	}
}
function ToggleElementVisibility(Element, bCTRLKey) {
	if (bCTRLKey) {
		//TODO
		console.log('Trigger nested collapse/expand not yet implemented');
	}
	if (!Element || !Element.id) {
		return;
	}
	try {
		ElementType = Element.id.slice(0, Element.id.lastIndexOf('_') + 1);
		ElementID = parseInt(Element.id.slice(Element.id.lastIndexOf('_') + 1));
	} catch(e) {
		return;
	}
	var ElementToHide = null;
	var ElementToShow = null;
	if (ElementType == 'div_content_') {
		ElementToHide = 'div_content_' + ElementID;
		ElementToShow = 'div_empty_' + ElementID;
	} else if (ElementType == 'div_empty_') {
		ElementToShow = 'div_content_' + ElementID;
		ElementToHide = 'div_empty_' + ElementID;
	}
	ElementToHide = CompatibleGetElementByID(ElementToHide);
	ElementToShow = CompatibleGetElementByID(ElementToShow);
	if (ElementToHide) {
		ElementToHide = ElementToHide.parentNode;
	}
	if (ElementToShow) {
		ElementToShow = ElementToShow.parentNode;
	}
	SetVisibility(ElementToHide, false);
	SetVisibility(ElementToShow, true);
}
