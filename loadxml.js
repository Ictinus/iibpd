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
var emptyBreak = document.createElement('br');
var equalsSpan = emptySpan.cloneNode(false);
	equalsSpan.textContent = "=";
	equalsSpan.className = "Utility";
var openTag = equalsSpan.cloneNode(false);
	openTag.textContent = "<";
var openEndTag = equalsSpan.cloneNode(false);
	openEndTag.textContent = "</";
var endTag = equalsSpan.cloneNode(false);
	endTag.textContent = ">";
var endEmptyTag = equalsSpan.cloneNode(false);
	endEmptyTag.textContent = " />";
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

		//var ReferenceElement = document.createElement('div');
		return true;
	} else {
		return false;
	}
}
function LoadXMLString(ParentElementID, XMLString) {
	xmlDoc = CreateXMLDOM(XMLString);
	if ( !! xmlDoc && !!xmlDoc.body && !!xmlDoc.body.childNodes && !!xmlDoc.body.childNodes[0] && xmlDoc.body.childNodes[0].nodeName === "parsererror") {
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
	if (RootNode == null || xmlHolderElement == null) {
		return false;
	}
	var Result = true;
	var TagEmptyElement = emptyDiv.cloneNode(false); // div.Element
	
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
	if (RootNode.childNodes.length === 0) {
		var ClickableElement = AddTextNode(TagEmptyElement, ' ', 'Clickable'); //no action on this Clickable

		TagEmptyElement.appendChild(openTag.cloneNode(true)); // add '<' 
		AddNodeName(TagEmptyElement, RootNode.nodeName);
		for (var i = 0, attLen = RootNode.attributes.length; i < attLen; ++i) {
			CurrentAttribute = RootNode.attributes.item(i);
			AddTextNode(TagEmptyElement, ' ' + CurrentAttribute.nodeName, 'AttributeName');
			TagEmptyElement.appendChild(equalsSpan.cloneNode(true)); // add '='
			AddTextNode(TagEmptyElement, '"' + CurrentAttribute.value + '"', 'AttributeValue');
		}
		
		TagEmptyElement.appendChild(endEmptyTag.cloneNode(true)); //add ' />'
		
		xmlHolderElement.appendChild(TagEmptyElement);
		
	} else { // mo child nodes

		// build collapsed display elements
		
		//Look for text content and display in single line 
		var NodeContent = null;
		for (var i = 0, childNodesLen=RootNode.childNodes.length; i < childNodesLen; ++i) {
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
		TagEmptyElement.appendChild(openTag.cloneNode(true)); // add '<' 
		AddNodeName(TagEmptyElement, RootNode.nodeName);
		// element attributes
		for (var i = 0, attrLen = RootNode.attributes.length; i < attrLen; ++i) {
			CurrentAttribute = RootNode.attributes.item(i);
			AddTextNode(TagEmptyElement, ' ' + CurrentAttribute.nodeName, 'AttributeName');

			TagEmptyElement.appendChild(equalsSpan.cloneNode(true)); // add '='

			AddTextNode(TagEmptyElement, '"' + CurrentAttribute.value + '"', 'AttributeValue');
		}

		TagEmptyElement.appendChild(endTag.cloneNode(true)); //add '>'
		
		if (bSimpleContentExists) { //display inline simple content
			AddTextNode(TagEmptyElement, NodeContent, 'NodeValue');
		}

		TagEmptyElement.appendChild(openEndTag.cloneNode(true)); //add '</'
		AddNodeName(TagEmptyElement, RootNode.nodeName);

		TagEmptyElement.appendChild(endTag.cloneNode(true)); //add '>'

		xmlHolderElement.appendChild(TagEmptyElement);

		//AutoExpandDepth, expand until we shouldn't
		TagEmptyElement.style.display = (indent < iibpd.options.autoOpenDepth && !bSimpleContentExists) ? 'none': 'block';
		
		//---------------------------------------------- 
		if (!bSimpleContentExists) {
			// build uncollapsed display elements
			var TagElement =  emptyDiv.cloneNode(false); // div.Element
			
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

			TagElement.appendChild(openTag.cloneNode(true)); // add '<' 
			AddNodeName(TagElement, RootNode.nodeName);

			for (var i = 0, attrLen = RootNode.attributes.length; i < attrLen; ++i) {
				CurrentAttribute = RootNode.attributes.item(i);
				AddTextNode(TagElement, ' ' + CurrentAttribute.nodeName, 'AttributeName');
				TagElement.appendChild(equalsSpan.cloneNode(true)); //add '='
				AddTextNode(TagElement, '"' + CurrentAttribute.value + '"', 'AttributeValue');
			}

			TagElement.appendChild(endTag.cloneNode(true)); //add '>'

			TagElement.appendChild(emptyBreak.cloneNode(false)); // add 'br'
			var NodeContent = null;
			for (var i = 0, childNodesLen = RootNode.childNodes.length; i < childNodesLen; ++i) {
				if (RootNode.childNodes.item(i).nodeName != '#text') {
					ShowXML(TagElement, RootNode.childNodes.item(i), indent + 1);
				}
			}

			AddTextNode(TagElement, ' ', 'Clickable');

			TagElement.appendChild(openEndTag.cloneNode(true)); //add '</'
			AddNodeName(TagElement, RootNode.nodeName);
			TagElement.appendChild(endTag.cloneNode(true)); //add '>'

			xmlHolderElement.appendChild(TagElement);

			//AutoExpandDepth, expand until we shouldn't
			TagElement.style.display = (indent < iibpd.options.autoOpenDepth) ? 'block': 'none';
		}
	}

	return true;
}
function AddNodeName(ParentNode, Text) {
	NewNode = nodeName.cloneNode(false);
	NewNode.textContent = Text || '';

	if (!!ParentNode) {
		ParentNode.appendChild(NewNode);
	}
	return NewNode;	
}
function AddTextNode(ParentNode, Text, Class) {
	NewNode = emptySpan.cloneNode(false);
	if (Class) {
		NewNode.className = Class;
	}
	if (Text) {
		NewNode.textContent = Text;
	}
	if (ParentNode) {
		ParentNode.appendChild(NewNode);
	}
	return NewNode;
}

function SetVisibility(HTMLElement, Visible) {
	if (!HTMLElement) {
		return;
	}
	HTMLElement.style.display = (Visible) ? 'block': 'none';
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
	ElementToHide = document.getElementById(ElementToHide);
	ElementToShow = document.getElementById(ElementToShow);
	if (ElementToHide) {
		ElementToHide = ElementToHide.parentNode;
	}
	if (ElementToShow) {
		ElementToShow = ElementToShow.parentNode;
	}
	SetVisibility(ElementToHide, false);
	SetVisibility(ElementToShow, true);
}
