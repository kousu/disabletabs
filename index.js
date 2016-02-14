

var tabs = require('sdk/tabs');
var windows = require('sdk/windows').browserWindows;
var notifications = require('sdk/notifications');
var privateBrowsing = require('sdk/private-browsing');

// these translate between the chrome (aka XUL) elements and the internal objects
// the chrome elements are /views/ of the internal /model/ objects
// this means they have CSS attached but not data
// So if you want to fiddle with the look, you need to use the view
// Most of the high level SDK deals with the model
// hacking the view is considered the low-level API
// and apparently, things named 'utils' are the views...
//// ALSO, this syntax is non-standard Javascript: it's a Mozilla extension which gives flexible destructuring: what this means is "assign to modelFor in the localnamespace the value of require("sdk/model/core").modelFor"
//// and you can say `var {a,  b,  c} ` to extract multiples
var { modelFor } = require("sdk/model/core");
var { viewFor } = require("sdk/view/core");
var { getTabContainer } = require("sdk/tabs/utils");


function remove_tabbar(window) {
	// this gets the .tabbrowser-tabs element that is defined in chrome://browser/content/tabbrowser.xml
	var c = getTabContainer(viewFor(window));
	
	// And this axes the tabbar on it.
	//   I'm not totally sure why this works, since I'd expect this to hide the *entire* Window,
	//   since you'd think a tabcontainer would contain tabs, but apparently not.
	c.style.display = "none";
}

// run this on the main window, because the first window doesn't trigger the 'open' event, at least on Firefox 44.	
remove_tabbar(windows.activeWindow);


function introspect(o) {
	console.log("properties of " + o + ":");
	for(p in o) {
		console.log(o + "." + p + " = " + o[p]);
	}
	console.log("/properties of " + o);
}


exports.main = function(){
	tabs.on('open', function(tab){
		
		// this is *not* triggered on opening a new window, only on opening a second tab in that window
		// which means that we can *assume* this code is running in an unwanted new tab

		// i. translate new tab -> new window
		// We spawn a window out here to give user feedback; if not, the window doesn't spawn until the remote site responds, and that's annoying.
		// once the tab has told us its URL, we clone the URL over to there
		// 
		// This is actually bad: to get the URL, the page has to be downloaded because 'ready' doesn't fire until it has followed all redirects *and* downloaded the page
		// but we just want the first URL in the chain! This method means we do two downloads of the page!
		//  - though we're using 'ready' instead of 'load' which means we fire before images and scripts download, at least
		//  -  and caching will help in a lot of cases.
		//
		// Possible fixes:
		// - somehow catch an earlier event
		//    - .on('loadstart') doesn't work
		//    - addProgressListener() doesn't exist on these SDK objects--high nor low level(??)
		//    - loadContext this: https://github.com/Noitidart/demo-on-http-examine/blob/master/bootstrap.js), and hope that it will give us the target URL
		// - instead of spawning a new tab, detach it and reattach it to the new window
		// - spawn a new window and tab, but clone the .document over to it, and also set the .url but somehow disable the load that that will invoke
		if(!(tab.url == "about:blank")) { throw "initial tab url should always be about:blank"; }
		var window = windows.open(tab.url);

		// > Properties relating to the tab's content (for example: title, favicon, and url) will not be
		// > correct at this point. If you need to access these properties, listen for the ready event:
		// The 'ready' event happens after the page has been downloaded but before its requisites have been.
		// 
		// TODO: save a connection by figuring out if there's a way to detach a tab from a window via the SDK (you can do it with your mouse, afterall!)
		//       It makes sense that title and favicon will be wrong until then, but it's annoying that .url isn't available.
		tab.on('ready', function() {
			// here we actually clone the URL to the new window
			window.tabs[0].url = tab.url;
			
			// ii. cancel the new tab
			tab.close();
		});
	});
	
	// next step: can I edit the XUL stylesheet from here?
	// answer: according to https://developer.mozilla.org/en-US/Add-ons/SDK/Guides/XUL_Migration_Guide, yes:
	// "by using the SDK's low-level APIs you can directly modify the browser chrome."
	// see  https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs
	windows.on('open', function(window) {
		remove_tabbar(window);
	});
};
