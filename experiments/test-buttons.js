// test-buttons.js
/* adding buttons to the Firefox toolbar seems to be one of the fastest ways to just scratch out demo code
   because you can't use the Scratchpad or Console --- those run in the page context, and can't talk to the SDK or XUL
 */ 

const { ActionButton } = require("sdk/ui/button/action");

const { introspect } = require("experiments/introspect.js");

ActionButton({
  id: "tearofftabtab-button",
  label: "Tear Off Current Tab",
  icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAACUElEQVQ4jaWTTWtTURCGjzc33CCpbVKN4kexC9EUY1Hov+iqPyDrbgtuCrViKUERqsWVguBGQaW4UiKiaEVxoShFGgnuBMUqNW3zce49Z+ZxUWtwoRR8YXbzPswM7xj+JgVEiXGsYVknxgII4Ltt5p8AB8RArOAUVQfqQJNtAFA8QgvF6i9PR1Dt0KbVBTjncM4hIni/OZv3HsRB+wvefiP2LcQnJIkQe49FEJFNQLPZZHh4mEwmQyqVoqenh3K5TGvlK1dOlageH+HG4DFar1/S0A6Lr99xdN8QxWKRXC6HGR0dJZvNMjk5Sb1ep1gskk6nuTo/D+/ec7dvkBdhP9cKeX7UXxEZQ2/YRxRFLC8vY+bm5qhUKnjvsdYyPj5OFEWcnTnHujiS5TfcPDbAw50h9w7u5f7UadLZFLVaDRHBiGzuY61lbGyMXC5HoVBgrbGGWAW/TvvxHR7s7udFKs/1oyfZ+PSRTqeDqm7eoFqtEoYhmUyG2dlZVJU4iREfI/WP3Nt9iMUdu7jdf5Anly5i0oaVlRWazSZmYWGBIAiIoohyucz09DQTExPMnJli9dlT5vcM8Kh3gFsHDuNqb9mb7yXMRBhjWFpawpRKJVKpFMYYgiAgDEOCIOD81BkunBjh8pEhKqUhGkvP6bQ/U//wgUP5/YRhSDabxbTbbVQV5xyq2q0kgR8NdOM7JKuo/Y5qggqIdPvMlnkrQCKCquJFsOrxeHAJxA48eFU6Xv4EqOpv41YqnQirqliv4MEmQtN7RBSs7wL+/gvb038DfgJnyUabbHzUbQAAAABJRU5ErkJggg==",
  onClick: function() {
    const { getMostRecentBrowserWindow } = require("sdk/window/utils");
    getMostRecentBrowserWindow().gBrowser.replaceTabWithWindow(getMostRecentBrowserWindow().gBrowser.selectedTab);
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



