// from http://stackoverflow.com/questions/26268297/how-to-programmatically-move-a-tab-to-another-window-in-a-firefox-addon-sdk-exte/33847868#33847868
// doesn't seem to work on FF44: gBrowser is undefined.

var Tab = require("sdk/tabs/tab").Tab;

Tab.prototype.setWindow = function (window, index) {
    var tab = this;
    var oldWindow = tab.window;
    if ( oldWindow !== window ) {
        // We have to use lower-level API here
        var Ci      = require('chrome').Ci;
        var viewFor = require("sdk/view/core").viewFor;

        var aTab = viewFor(tab);
        var aWin = viewFor(window);
        var gBrowser = aWin.gBrowser;
        if(gBrowser === undefined) { throw "missing gBrowser; perhaps you passed the wrong type of window object"; }

        // Get tab properties
        var isSelected = oldWindow.activeTab == tab;
        var isPinned   = aTab.pinned;

        // Log for debugging:
        var tabId = tab.id;
        console.log('setWindow', {index, isSelected, isPinned, tab, tabId});

        // Create a placeholder-tab on destination windows
        var newTab = gBrowser.addTab('about:newtab');
        newTab.linkedBrowser.webNavigation.stop(Ci.nsIWebNavigation.STOP_ALL); // we don't need this tab anyways

        // If index specified, move placeholder-tab to desired index
        if ( index != undefined ) {
            var length = gBrowser.tabContainer.childElementCount;
            if ( index < 0 ) index = length - index;
            if( 0 <= index && index < length ) {
                gBrowser.moveTabTo(newTab, index);
            }
        }
        // Copy tab properties to placeholder-tab
        if ( isPinned ) {
            gBrowser.pinTab(newTab);
        }

        // For some reason this doesn't seem to work :-(
        if ( isSelected ) {
            gBrowser.selectedTab = newTab;
        }

        // Swap tabs and remove placeholder-tab
        gBrowser.swapBrowsersAndCloseOther(newTab, aTab);
    }
};
