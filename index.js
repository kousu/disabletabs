

let tabs = require('sdk/tabs');
let windows = require('sdk/windows').browserWindows;
let notifications = require('sdk/notifications');
let privateBrowsing = require('sdk/private-browsing');

// these translate between the chrome (aka XUL) elements and the internal objects
// the chrome elements are /views/ of the internal /model/ objects
// this means they have CSS attached but not data
// So if you want to fiddle with the look, you need to use the view
// Most of the high level SDK deals with the model
// hacking the view is considered the low-level API
// and apparently, things named 'utils' are the views...
//// ALSO, this syntax is non-standard Javascript: it's a Mozilla extension which gives flexible destructuring: what this means is "assign to modelFor in the localnamespace the value of require("sdk/model/core").modelFor"
//// and you can say `var {a,  b,  c} ` to extract multiples
const { modelFor } = require("sdk/model/core");
const { viewFor } = require("sdk/view/core");
const { getTabContainer } = require("sdk/tabs/utils");

//require("experiments/test-buttons.js");

function remove_tabbar(window) {
	// this gets the .tabbrowser-tabs element that is defined in chrome://browser/content/tabbrowser.xml
	// and hides it (well, actually, makes sure that whenever it tries to show itself it actually hides itself)
	// // this trick ported from a XUL overlay in @Chris000001's [hide tab bar](https://addons.mozilla.org/en-US/firefox/addon/hide-tab-bar-with-one-tab/).
	let tabbar = getTabContainer(viewFor(window));
	tabbar.updateVisibility = function() { this.visible = false; }
	tabbar.updateVisibility();
	
	// it would be better to override updateVisibility in a prototype, but which one? Does this internal code use prototypes?
	
	// It would be better to attach a stylesheet to XUL that says ".tabbrowser-tabs { display: none }"
	// and I only want to do that once, at module load. but I don't know how to do that.
	// further, since my previous method caused page crashes a global stylesheet with equivalent CSS probably would too

	// Previous method: use CSS to remove the tab bar
	// in obscure cases, like using "Search <engine> for <linktext>", this causes a page to crash hard:
	// it stops rendering and may or may not be responding to input.
	//c.style.display = "none";
}


/* monkey-patch (model-side) Tab objects to have a "detach" method which puts tears it off its current window and moves it to a new one.
 * if the tab is the only one on the current window it is not moved .
 * private browsing is preserved: if this.window is a private browsing window, so will the new window be.
 *
 * this is just a more convenient XULBrowser.replaceTabWithWindow()
 */
require("sdk/tabs/tab").Tab.prototype.detach = function() {
        // ((the single-tab check is handled by replaceTabWithWindow, so we don't need to do it))
	viewFor(this.window).gBrowser.replaceTabWithWindow(viewFor(this));
}

exports.main = function(){
	// run this on any windows open at boot, because the first windows
	// don't trigger the 'open' event, at least on Firefox 44.
	for(let w of windows) {
		remove_tabbar(w);
	}

	// Set "Open new windows in a new tab instead". Messing with global prefs is probably frowned upon, but since this is Disable Tabs, everything to do with tabs should be fair game.
	// This *sidesteps* but does not solve or really deal with at all the problem (bug?) that windows.on('open') doesn't trigger for new windows.
	require('sdk/preferences/service').set('browser.link.open_newwindow', 3);

	tabs.on('open', function(tab) {
		if(tab.window.tabs.length > 1) {
			// Quirk: this is *not* triggered on opening a new window, only on opening a second tab in that window
			// which means that we could assume this code is running in an unwanted new tab
			// but I don't trust assuming that: it seems like the correct API is that every new page triggers a tabs.open
			
			// translate new tab -> new window
			tab.detach();
		}
	});
	
	windows.on('open', remove_tabbar);
	windows.on('activate', remove_tabbar); // defensive coding
	
	tabs.on('open', function(tab) {
		console.log("tabs.open: " + tab);
	});
	windows.on('open', function(window) {
		console.log("windows.open: " + window);
	});
	tabs.on('ready', function(tab) {
		console.log("tabs.ready: " + tab);
	});
	windows.on('ready', function(window) {
		console.log("windows.ready: " + window);
	});
	tabs.on('load', function(tab) {
		console.log("tabs.load: " + tab);
	});
	windows.on('load', function(window) {
		console.log("windows.load: " + window);
	});
};
