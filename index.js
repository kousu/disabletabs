

var tabs = require('sdk/tabs');
var windows = require('sdk/windows').browserWindows;
var notifications = require('sdk/notifications');
var privateBrowsing = require('sdk/private-browsing');

require("tab_setWindow.js");

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
	//c.style.display = "none";
}

// run this on any windows open at boot, because the first windows
// don't trigger the 'open' event, at least on Firefox 44.
for(let w of windows) {
  remove_tabbar(w);
}


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
		/*// We spawn a window out here to give user feedback; if not, the window doesn't spawn until the remote site responds, and that's annoying.
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
		*/
		
		console.log("new tab!" + tab.hack);
		if(tab.hack) return;
		
		if(!(tab.url == "about:blank")) { throw "initial tab url should always be about:blank"; }
		var window = windows.open({'url': tab.url, 'isPrivate': privateBrowsing.isPrivate(tab) });
		//console.log("at creation gBrowser = " + getXULWindow(viewFor(window)).gBrowser);
		//console.log("OR at creation gBrowser = " + getMostRecentBrowserWindow().gBrowser);
		//console.log(window); // why are these different?
		//console.log(getMostRecentBrowserWindow());
		tab.setWindow(window, 0);
		window.on('open', function() {
			// tear off tab and put it on the new window
			//console.log("tearing off");
			//console.log("at tear off gBrowser = " + getXULWindow(viewFor(window)).gBrowser);
			//console.log("OR gBrowse = " + getMostRecentBrowserWindow().gBrowser);
			//return;
			//tab.setWindow(window, 0);
		});
		
		/*
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
		*/
	});
	
	// next step: can I edit the XUL stylesheet from here?
	// answer: according to https://developer.mozilla.org/en-US/Add-ons/SDK/Guides/XUL_Migration_Guide, yes:
	// "by using the SDK's low-level APIs you can directly modify the browser chrome."
	// see  https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs
	windows.on('open', remove_tabbar);
	windows.on('_open', function(w) {
		//w = getMostRecentBrowserWindow();
		console.log("<<<----------[ opened window ]-----------------<");
		console.log(w);
		console.log("------------------------------------");
		//console.log(getXULWindow(w).gBrowser); // this crashes
		//console.log(getXULWindow(viewFor(w))); // this works, but
		//console.log(getXULWindow(viewFor(w)).gBrowser); // this doesn't 
		//introspect(getXULWindow(viewFor(w)).XULBrowserWindow) //maybe it's got a different name? nope. null.
		//introspect(getXULWindow(viewFor(w)).docShell) // or this? oh, this is like, stuff about the contained document. ..but. that would be.. the contained XUL document. mostly(?) readonly.
		
		// why is viewFor not the same as getMostRecentBrowserWindow?
		//introspect(viewFor(w));
		introspect(viewFor(w).gBrowser);
		
		//introspect(getMostRecentBrowserWindow());
		//introspect(getMostRecentBrowserWindow().gBrowser); // this does
		console.log("------------------------------------");
		
	});
	//windows.on('activate', remove_tabbar); // this is defensive coding: sometimes the 'open' event doesn't trigger (e.g. clicking a developer's name in about:addons).
	                                       // these are bugs in the Firefox SDK, as far as I'm concerned, but I have to work around them. by catching 'activate' at least the bar will blip away quickly enough.
};

var stop = false;


const { getMostRecentBrowserWindow, windows: getWindows, getXULWindow } = require("sdk/window/utils");

const { ActionButton } = require("sdk/ui/button/action");

var button = ActionButton({
  id: "duplicatetab-button",
  label: "Duplicate tab",
  icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACUElEQVQ4jaWTTWtTURCGjzc33CCpbVKN4kexC9EUY1Hov+iqPyDrbgtuCrViKUERqsWVguBGQaW4UiKiaEVxoShFGgnuBMUqNW3zce49Z+ZxUWtwoRR8YXbzPswM7xj+JgVEiXGsYVknxgII4Ltt5p8AB8RArOAUVQfqQJNtAFA8QgvF6i9PR1Dt0KbVBTjncM4hIni/OZv3HsRB+wvefiP2LcQnJIkQe49FEJFNQLPZZHh4mEwmQyqVoqenh3K5TGvlK1dOlageH+HG4DFar1/S0A6Lr99xdN8QxWKRXC6HGR0dJZvNMjk5Sb1ep1gskk6nuTo/D+/ec7dvkBdhP9cKeX7UXxEZQ2/YRxRFLC8vY+bm5qhUKnjvsdYyPj5OFEWcnTnHujiS5TfcPDbAw50h9w7u5f7UadLZFLVaDRHBiGzuY61lbGyMXC5HoVBgrbGGWAW/TvvxHR7s7udFKs/1oyfZ+PSRTqeDqm7eoFqtEoYhmUyG2dlZVJU4iREfI/WP3Nt9iMUdu7jdf5Anly5i0oaVlRWazSZmYWGBIAiIoohyucz09DQTExPMnJli9dlT5vcM8Kh3gFsHDuNqb9mb7yXMRBhjWFpawpRKJVKpFMYYgiAgDEOCIOD81BkunBjh8pEhKqUhGkvP6bQ/U//wgUP5/YRhSDabxbTbbVQV5xyq2q0kgR8NdOM7JKuo/Y5qggqIdPvMlnkrQCKCquJFsOrxeHAJxA48eFU6Xv4EqOpv41YqnQirqliv4MEmQtN7RBSs7wL+/gvb038DfgJnyUabbHzUbQAAAABJRU5ErkJggg==",
  onClick: function() {
    console.log("clickclick");
    var xulwindows = getWindows("navigator:browser");
    //console.log("xulwindows");
    var xulactivewindow = getMostRecentBrowserWindow();
    //console.log(xulactivewindow);
    var xulactivetab = xulactivewindow.gBrowser.selectedTab;
    console.log(xulactivewindow.gBrowser);

    xulwindows.forEach(function(win){
      if(win === xulactivewindow)
        return;
      var duplicatedtab = win.gBrowser.duplicateTab(xulactivetab);
      win.gBrowser.moveTabTo(duplicatedtab, 0); // the second argument is the index
    });
  }
});
