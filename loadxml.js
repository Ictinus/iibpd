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

var emptyDiv = document.createElement('div');
	emptyDiv.className = 'Element';
var emptySpan = document.createElement('span');
var nodeName = emptySpan.cloneNode(false);
	nodeName.className = "NodeName";

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

		xmlHolderElement.innerHTML = '';

		ShowXML(xmlHolderElement, xmlDoc.documentElement, 0);

		return true;
	} else {
		return false;
	}
}
function LoadXMLString(ParentElementID, XMLString) {
	xmlDoc = CreateXMLDOM(XMLString);
	if ( !!xmlDoc && !!xmlDoc.body && !!xmlDoc.body.childNodes && !!xmlDoc.body.childNodes[0] && xmlDoc.body.childNodes[0].nodeName === "parsererror") {
		return false;
	} else {
		LoadXMLDom(ParentElementID, xmlDoc);
		return true;
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
				if (!!xmlHolderElement) {
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
	httpRequest = new XMLHttpRequest();
	if (httpRequest.overrideMimeType) {
		httpRequest.overrideMimeType('text/xml');
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
	if (document.implementation && document.implementation.createDocument) {
		var parser = new DOMParser();
		return parser.parseFromString(XMLStr, "text/xml");
	} else {
		return null;
	}
}

var IDCounter = 1;
var NestingIndent = 15;
function ShowXML(xmlHolderElement, RootNode, indent) {

	if (RootNode == null || xmlHolderElement == null || (iibpd.options.discardMetadata && RootNode.nodeName === "metadata")) {
		return false;
	}
	var Result = true;
	var TagEmptyElement = emptyDiv.cloneNode(false); // div.Element

	if (RootNode.nodeName === "metadata") {
		TagEmptyElement.classList.add("metadata"); //to allow hiding of metadata elements
		TagEmptyElement.classList.toggle("hide_metadata", iibpd.options.hide_metadata);
	}

	if (RootNode.childNodes.length === 0) {
		var ClickableElement = AddTextNode(TagEmptyElement, ' ', ['Clickable']); //no action on this Clickable

		AddNodeName(TagEmptyElement, RootNode.nodeName);

		for (var i = 0, attLen = RootNode.attributes.length; i < attLen; ++i) {
			CurrentAttribute = RootNode.attributes.item(i);
			AddTextNode(TagEmptyElement, ' ' + CurrentAttribute.nodeName, ['AttributeName']);
			AddTextNode(TagEmptyElement, '"' + CurrentAttribute.value + '"', ['AttributeValue']);
		}
		xmlHolderElement.appendChild(TagEmptyElement);

	} else { // mo child nodes
		// build collapsed display elements
		// Look for text content and display in single line
		var NodeContent = null;
		for (var i = 0, childNodesLen=RootNode.childNodes.length; i < childNodesLen; ++i) {
			if (RootNode.childNodes.item(i).nodeName === '#text') {
				NodeContent = RootNode.childNodes.item(i).nodeValue;
			}
		}
		var bSimpleContentExists = ( !!NodeContent && !!(NodeContent.trim()));
		var ClickableElement;
		if (bSimpleContentExists) {
			// no expand button
			ClickableElement = AddTextNode(TagEmptyElement, ' ', ['Clickable']); //no action on this Clickable
		} else {
			// expand button
			if (indent < iibpd.options.autoOpenDepth) {
				ClickableElement = AddTextNode(TagEmptyElement, '-', ['Clickable']);
			} else {
				ClickableElement = AddTextNode(TagEmptyElement, '+', ['Clickable']);
			}
			ClickableElement.onclick = function(e) {
				ToggleElementVisibility(this, e.ctrlKey);
			}
			ClickableElement.id = 'div_empty_' + IDCounter;
		}
		// element
		AddNodeName(TagEmptyElement, RootNode.nodeName);
		// element attributes
		for (var i = 0, attrLen = RootNode.attributes.length; i < attrLen; ++i) {
			CurrentAttribute = RootNode.attributes.item(i);
			AddTextNode(TagEmptyElement, ' ' + CurrentAttribute.nodeName, ['AttributeName']);

			if (i === attrLen-1) {
				AddTextNode(TagEmptyElement, '"' + CurrentAttribute.value + '"', ['AttributeValue', 'last-of-class']);
			} else {
				AddTextNode(TagEmptyElement, '"' + CurrentAttribute.value + '"', ['AttributeValue']);
			}
		}

		if (bSimpleContentExists) { //display inline simple content
			AddTextNode(TagEmptyElement, NodeContent, ['NodeValue']);
		}

		//endTag </nodeName>
		AddNodeName(TagEmptyElement, RootNode.nodeName, true, (indent < iibpd.options.autoOpenDepth)); // true = mark as endTag, true=fade

		xmlHolderElement.appendChild(TagEmptyElement);

		//----------------------------------------------
		if (!bSimpleContentExists) {
			// build uncollapsed display elements
			var TagElement =  emptyDiv.cloneNode(false); // div.Element

			if (RootNode.nodeName === "metadata") {
				TagElement.classList.add("metadata");  //to allow hiding of metadata elements
				TagElement.classList.toggle("hide_metadata", iibpd.options.hide_metadata);
			}

			var NodeContent = null;
			for (var i = 0, childNodesLen = RootNode.childNodes.length; i < childNodesLen; ++i) {
				if (RootNode.childNodes.item(i).nodeName != '#text') {
					ShowXML(TagElement, RootNode.childNodes.item(i), indent + 1);
				}
			}

			// end the expanded xml object
			AddTextNode(TagElement, ' ', ['Clickable']);

			AddNodeName(TagElement, RootNode.nodeName, true, false);

			xmlHolderElement.appendChild(TagElement);

			//AutoExpandDepth, expand until we shouldn't
			TagElement.classList.toggle('Element_hide', !(indent < iibpd.options.autoOpenDepth));
		}
	}

	return true;
}
function AddNodeName(ParentNode, Text, bEndTag, bFade) {
	NewNode = nodeName.cloneNode(false);
	NewNode.textContent = Text || '';
	NewNode.classList.toggle('endTag', bEndTag);
	NewNode.classList.toggle('fade', bFade);
	if (!!ParentNode) {
		ParentNode.appendChild(NewNode);
	}
	return NewNode;
}
function AddTextNode(ParentNode, Text, Classes) {
	NewNode = emptySpan.cloneNode(false);
	Classes.map( function(aClass) {
		NewNode.classList.add(aClass);
	});
	if (!!Text) {
		NewNode.textContent = Text;
	}
	ParentNode.appendChild(NewNode);
	return NewNode;
}

function SetVisibility(HTMLElement, Visible) {
	if (!!HTMLElement) {
		if (Visible) {
			setMaxHeight(HTMLElement, false);
			clearParentMaxHeight(HTMLElement.parentNode); //clear parent max heights before expand
		} else {
			setMaxHeight(HTMLElement, true); //set parent max heights before collapse
		}
		 //timeout to ensure max heights are set before execution.
		setTimeout(function(){HTMLElement.classList.toggle('Element_hide', !Visible);}, 50);  //TODO
	}
}
function clearParentMaxHeight (element) {
	if (!!element && element.nodeName.toLowerCase() != 'pre') {
		element.style.maxHeight = "";
		clearParentMaxHeight(element.parentNode);
	}
}
function setMaxHeight(element, bIncludeParents) {
	if (!!element && element.nodeName.toLowerCase() != 'pre') {
		var LAST_TAG_LEN = 0;
		arrChildren = element.children;
		var iChildrenHeight = 0;
		for (var i=0, len=arrChildren.length - LAST_TAG_LEN; i < len; i++) {
			iChildrenHeight += arrChildren.item(i).offsetHeight;
		}
		element.style.maxHeight = iChildrenHeight;

		if (bIncludeParents) {
			setMaxHeight(element.parentNode, bIncludeParents);
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


	var objectHead = Element.parentNode;
	//show or hide?
	var ElementToToggle = objectHead.nextSibling;
	var bExpand = ElementToToggle.classList.contains('Element_hide');

	var arrEndTags_hide;
	if (!!objectHead) {
		arrEndTags_hide = objectHead.getElementsByClassName('endTag');
		for (var i=0; i < arrEndTags_hide.length; i++) {
			arrEndTags_hide.item(i).classList.toggle('fade', bExpand);
		}
		objectHead.firstChild.textContent = (bExpand) ? '-' : '+' ;
	}

	SetVisibility(ElementToToggle, bExpand);
}
