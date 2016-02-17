

const tabs = require('sdk/tabs');
const windows = require('sdk/windows').browserWindows;
const notifications = require('sdk/notifications');
const privateBrowsing = require('sdk/private-browsing');
const config = require('sdk/preferences/service')

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


///////////////  monkey-patch (model-side) Tab objects to be better ////////////////

/* Tab.detach(): tear off this tab and spawn a new window just for it.
 *
 * If the tab is the only one on its window nothing happens.
 * Private browsing is preserved: if this.window is a private browsing window, so is will the new window be.
 */
require("sdk/tabs/tab").Tab.prototype.detach = function() {
        // ((the single-tab check is handled by replaceTabWithWindow, so we don't need to do it))
	// ((as is the preservation of private browsing ))
	// ((really this is just a Jetpack SDK-friendly wrapper for XUL's replaceTabWithWindow())
	console.debug("detaching tab '" + this.title + "' from window '" + this.window.title + "'");
	viewFor(this.window).gBrowser.replaceTabWithWindow(viewFor(this));
}

/* Tab.setWindow(window): Move tab to the given window.
 *
 * window should be a 'high level' or 'model' window object from the https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/windows module.
 * If window is null, a new window is created.
 *
 * precondition: unless it's null, window has passed the 'open' state
 *   That is, you cannot call this on a newly created window.
 *   
 *   Incorrect:
 *   > tab.setWindow(windows.open("about:blank"));
 *   ( causes TypeError: viewFor(...).gBrowser is undefined )
 *
 *   Correct:
 *   > let win = windows.open("about:blank");
 *   > win.on('on', function() {
 *   >   tab.setWindow(win)
 *   > }));
 *
 * XXX how does this interact with private browsing? This could be bad...
 * XXX write a similar method attached to the Window prototype: window.adopt(tab)
 */
require("sdk/tabs/tab").Tab.prototype.setWindow = function(window, index = -1) {
	console.log("index = " + index);
	if(window) {
		console.debug("moving tab '" + this.title + "' from window '" + this.window.title + "' to window '" + window.title + "'");
		viewFor(window).gBrowser.tabContainer.appendChild(viewFor(this));
	} else {
		this.detach();
	}
}



///////////////  main  ////////////////

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

/* detach_all_tabs: make all tabs into windows */
function detach_all_tabs() {
	// simple: walk the array windows, walk their tabs, detach them all
	
	// defensive coding: Array.from clones the targets before operating on them, to avoid iterating a datastructure. This would cause exceptions in Python, but I don't know JS and definitely not XUL/Jetpack well enough to say what this will do.
	// .reverse() is because, at least on my system, the detach calls queue in reverse order, so that first detached tab ends up being the last window spawned (under a tiling window manager this effect is really obvious)
	for(let w of Array.from(windows).reverse()) {
		// defensive coding: Array.from again
		// .reverse: ditto
		// .slice(1): this also defensive coding that prevents trying to detach the last tab from the window,
		//            *but it shouldn't be necessary* since .detach() is *supposed* to handle that case. But I
		//            was getting a random empty spare straggler window and exceptions to go with it, and those
		//            vanished with this sooo I dunno what to think.
		for(let t of Array.from(w.tabs).reverse().slice(1)) {
			t.detach();
		}
	}
}


// Set "Open new windows in a new tab instead". Messing with global prefs is probably frowned upon, but since this is Disable Tabs, everything to do with tabs should be fair game.
// This *sidesteps* but does not solve or really deal with at all the problem (bug?) that windows.on('open') doesn't trigger for new windows created by <a target="_blank"> links.
config.set('browser.link.open_newwindow', 3);

// The meat of disabletabs: catch and rewrite new tab -> new window
tabs.on('open', function(tab) {
	if(tab.window.tabs.length > 1) {
		// Quirk: this is *not* triggered on opening a new window, only on opening a second tab in that window
		// which means that we could assume this code is running in an unwanted new tab
		// but I don't trust assuming that: it seems like the correct API is that every new page triggers a tabs.open
		
		let original_window = tab.window;
		tab.detach();
		
		// and focus the new window, if "when I open a link in a new tab, switch to it immediately"
		if(!config.get('browser.tabs.loadInBackground')) {
			tab.on('ready', function() { tab.activate(); });
		} else {
			// bah, this doesn't work, at least not under i3.
			// Q: this should be the same as viewFor(original_window).focus(). Is it?
			original_window.activate();
		}
	}
});

windows.on('open', remove_tabbar);
windows.on('activate', remove_tabbar); // defensive coding

// the first windows spawned (those before the extension loads?) don't trigger the 'open' event, at least on Firefox 44.
// so when we boot, pretend to trigger windows.on('open', remove_tabbar) for those windows we miss.
// TODO: can I literally just manually trigger the open event, maybe? The SDK must let me inject events, right?

for(let w of windows) {
	remove_tabbar(w);
}

// if there are any windows with tabs when the extension is enabled (e.g. this will happen on first install) then they will get lost
// unless we spin them out to their own tabs
// we can't undo this when we unlo
detach_all_tabs();


