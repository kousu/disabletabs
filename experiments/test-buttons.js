// test-buttons.js
/* adding buttons to the Firefox toolbar seems to be one of the fastest ways to just scratch out demo code
   because you can't use the Scratchpad or Console --- those run in the page context, and can't talk to the SDK or XUL
 */ 

const { ActionButton } = require("sdk/ui/button/action");

const { introspect } = require("experiments/introspect.js");

const { modelFor } = require("sdk/model/core");
const { viewFor } = require("sdk/view/core");

var browserWindows = require("sdk/windows").browserWindows;

ActionButton({
  id: "tearofftabtab-button",
  label: "Tear Off Current Tab",
  icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACUElEQVQ4jaWTTWtTURCGjzc33CCpbVKN4kexC9EUY1Hov+iqPyDrbgtuCrViKUERqsWVguBGQaW4UiKiaEVxoShFGgnuBMUqNW3zce49Z+ZxUWtwoRR8YXbzPswM7xj+JgVEiXGsYVknxgII4Ltt5p8AB8RArOAUVQfqQJNtAFA8QgvF6i9PR1Dt0KbVBTjncM4hIni/OZv3HsRB+wvefiP2LcQnJIkQe49FEJFNQLPZZHh4mEwmQyqVoqenh3K5TGvlK1dOlageH+HG4DFar1/S0A6Lr99xdN8QxWKRXC6HGR0dJZvNMjk5Sb1ep1gskk6nuTo/D+/ec7dvkBdhP9cKeX7UXxEZQ2/YRxRFLC8vY+bm5qhUKnjvsdYyPj5OFEWcnTnHujiS5TfcPDbAw50h9w7u5f7UadLZFLVaDRHBiGzuY61lbGyMXC5HoVBgrbGGWAW/TvvxHR7s7udFKs/1oyfZ+PSRTqeDqm7eoFqtEoYhmUyG2dlZVJU4iREfI/WP3Nt9iMUdu7jdf5Anly5i0oaVlRWazSZmYWGBIAiIoohyucz09DQTExPMnJli9dlT5vcM8Kh3gFsHDuNqb9mb7yXMRBhjWFpawpRKJVKpFMYYgiAgDEOCIOD81BkunBjh8pEhKqUhGkvP6bQ/U//wgUP5/YRhSDabxbTbbVQV5xyq2q0kgR8NdOM7JKuo/Y5qggqIdPvMlnkrQCKCquJFsOrxeHAJxA48eFU6Xv4EqOpv41YqnQirqliv4MEmQtN7RBSs7wL+/gvb038DfgJnyUabbHzUbQAAAABJRU5ErkJggg==",
  onClick: function() {
    const { getMostRecentBrowserWindow } = require("sdk/window/utils");
    getMostRecentBrowserWindow().gBrowser.replaceTabWithWindow(getMostRecentBrowserWindow().gBrowser.selectedTab);
  }
});


/* screwing around with trying to implement @DUzun's setWindow() functionality */
/* I read gBrowser.addTab() to get a feel for how things work internally. It unfortunately assumes it's given a URI,
   and then spawns a new browser and tab object on that. It can't simply *take* an existing tab (because why would you want to do that, pleb?)
   There's code in it to skip loading, but it's kludgey and meant for supporting preloading tabs (to save time);
   yet buried in all that cruft is one verrry interesting line:
   > this.tabContainer.appendChild(tab) // which is just an HTML DOM method, because remember Firefox is written in DOM.
   It turns out this line is everything you need to actually attach a viewFor(tab) to a viewFor(window)
   
   This test (which of course only works if you disable the disabling of tabs in index.js, whoops) moves the selected tab to the last created window
   It turns out that Firefox is smart: it only allows one instance of each tab to exist in any tabContainer (at least, Firefox 44 is smart like this)
 */
ActionButton({
  id: "movetab-button",
  label: "Move",
  icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACUElEQVQ4jaWTTWtTURCGjzc33CCpbVKN4kexC9EUY1Hov+iqPyDrbgtuCrViKUERqsWVguBGQaW4UiKiaEVxoShFGgnuBMUqNW3zce49Z+ZxUWtwoRR8YXbzPswM7xj+JgVEiXGsYVknxgII4Ltt5p8AB8RArOAUVQfqQJNtAFA8QgvF6i9PR1Dt0KbVBTjncM4hIni/OZv3HsRB+wvefiP2LcQnJIkQe49FEJFNQLPZZHh4mEwmQyqVoqenh3K5TGvlK1dOlageH+HG4DFar1/S0A6Lr99xdN8QxWKRXC6HGR0dJZvNMjk5Sb1ep1gskk6nuTo/D+/ec7dvkBdhP9cKeX7UXxEZQ2/YRxRFLC8vY+bm5qhUKnjvsdYyPj5OFEWcnTnHujiS5TfcPDbAw50h9w7u5f7UadLZFLVaDRHBiGzuY61lbGyMXC5HoVBgrbGGWAW/TvvxHR7s7udFKs/1oyfZ+PSRTqeDqm7eoFqtEoYhmUyG2dlZVJU4iREfI/WP3Nt9iMUdu7jdf5Anly5i0oaVlRWazSZmYWGBIAiIoohyucz09DQTExPMnJli9dlT5vcM8Kh3gFsHDuNqb9mb7yXMRBhjWFpawpRKJVKpFMYYgiAgDEOCIOD81BkunBjh8pEhKqUhGkvP6bQ/U//wgUP5/YRhSDabxbTbbVQV5xyq2q0kgR8NdOM7JKuo/Y5qggqIdPvMlnkrQCKCquJFsOrxeHAJxA48eFU6Xv4EqOpv41YqnQirqliv4MEmQtN7RBSs7wL+/gvb038DfgJnyUabbHzUbQAAAABJRU5ErkJggg==",
  onClick: function() {
    const { getMostRecentBrowserWindow } = require("sdk/window/utils");
/*
    // this code was attempting to *dupe* the tab: i.e. get multiple tabs
    // but it turns out Firefox has guards against that! Which is excellent because it means moving a tab is as simple as using a DOM attach command!
    let gBrowser = getMostRecentBrowserWindow().gBrowser;
    gBrowser.tabContainer.appendChild(gBrowser.selectedTab);
    gBrowser.tabContainer.appendChild(gBrowser.selectedTab);
    gBrowser.tabContainer.appendChild(gBrowser.selectedTab);

    gBrowser.tabContainer.updateVisibility();
    // Observation: this doesn't actually work: the ultimate effect is just to move selectedTab to be the last tab
    //              that's good, it means there's some sort of consistency checking going on...
*/
    
    // tear off the given tab and move it to another window? maybe?
    let thiswin = getMostRecentBrowserWindow();
    var lastwin = viewFor(browserWindows[browserWindows.length-1]);
    
    lastwin.gBrowser.tabContainer.appendChild(thiswin.gBrowser.selectedTab);
    
    thiswin.gBrowser.tabContainer.updateVisibility();
    lastwin.gBrowser.tabContainer.updateVisibility();
  }
});


ActionButton({
  id: "introspectgbrowser-button",
  label: "Inspect gBrowser for current window (see console output)",
  icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACUElEQVQ4jaWTTWtTURCGjzc33CCpbVKN4kexC9EUY1Hov+iqPyDrbgtuCrViKUERqsWVguBGQaW4UiKiaEVxoShFGgnuBMUqNW3zce49Z+ZxUWtwoRR8YXbzPswM7xj+JgVEiXGsYVknxgII4Ltt5p8AB8RArOAUVQfqQJNtAFA8QgvF6i9PR1Dt0KbVBTjncM4hIni/OZv3HsRB+wvefiP2LcQnJIkQe49FEJFNQLPZZHh4mEwmQyqVoqenh3K5TGvlK1dOlageH+HG4DFar1/S0A6Lr99xdN8QxWKRXC6HGR0dJZvNMjk5Sb1ep1gskk6nuTo/D+/ec7dvkBdhP9cKeX7UXxEZQ2/YRxRFLC8vY+bm5qhUKnjvsdYyPj5OFEWcnTnHujiS5TfcPDbAw50h9w7u5f7UadLZFLVaDRHBiGzuY61lbGyMXC5HoVBgrbGGWAW/TvvxHR7s7udFKs/1oyfZ+PSRTqeDqm7eoFqtEoYhmUyG2dlZVJU4iREfI/WP3Nt9iMUdu7jdf5Anly5i0oaVlRWazSZmYWGBIAiIoohyucz09DQTExPMnJli9dlT5vcM8Kh3gFsHDuNqb9mb7yXMRBhjWFpawpRKJVKpFMYYgiAgDEOCIOD81BkunBjh8pEhKqUhGkvP6bQ/U//wgUP5/YRhSDabxbTbbVQV5xyq2q0kgR8NdOM7JKuo/Y5qggqIdPvMlnkrQCKCquJFsOrxeHAJxA48eFU6Xv4EqOpv41YqnQirqliv4MEmQtN7RBSs7wL+/gvb038DfgJnyUabbHzUbQAAAABJRU5ErkJggg==",
  onClick: function() {
    const { getMostRecentBrowserWindow } = require("sdk/window/utils");
    introspect(getMostRecentBrowserWindow().gBrowser);
  }
});



