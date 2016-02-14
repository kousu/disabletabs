var title = require('./package.json').title;
var { ActionButton } = require('sdk/ui/button/action');
var simplePrefs = require('sdk/simple-prefs');
var _ = require('sdk/l10n').get;
var windows = require('sdk/windows');
var tabs = require('sdk/tabs');
var notifications = require('sdk/notifications');
var { setTimeout } = require('sdk/timers');
var privateBrowsing = require('sdk/private-browsing');

exports.main = function(){
	var maxTabs = simplePrefs.prefs.maxTabs;
	var max = (maxTabs > 1) ? maxTabs : 10; // Max at least 2 tabs please
	var maxPrivateBrowsing = simplePrefs.prefs.maxPrivateBrowsing;

	var button = ActionButton({
		id: 'max-tabs-button',
	  label: title,
		icon: './icon.svg',
		disabled: true
	});

	var updateButton = function(win, tabsLen){
		if (win == 'window') tabsLen = windows.browserWindows.activeWindow.tabs.length;
		button.state(win, {
			label: title + ' - ' + tabsLen + '/' + max,
			badge: (tabsLen > 99) ? '99+' : tabsLen,
			badgeColor: "black";
		});
	};
	var updateAllButtons = function(){
		for (let window of windows.browserWindows){
			updateButton(window, window.tabs.length);
		}
	};
	updateAllButtons();

	simplePrefs.on('maxTabs', function(){
		var maxTabs = simplePrefs.prefs.maxTabs;
		max = (maxTabs > 1) ? maxTabs : 10;
		updateAllButtons();
	});
	simplePrefs.on('maxPrivateBrowsing', function(){
		maxPrivateBrowsing = simplePrefs.prefs.maxPrivateBrowsing;
	});

	tabs.on('open', function(tab){
		var window = tab.window;
		// setTimeout is needed because window.tabs.length value seems to update *slower*
		setTimeout(function(){
			var tabsLen = window.tabs.length;
			if (tabsLen <= max || (privateBrowsing.isPrivate(window) && !maxPrivateBrowsing)){
				updateButton(window, tabsLen);
			} else {
				tab.close();
				notifications.notify({
					title: title,
					text: _('not_open_max_tabs', max)
				});
			}
		}, 1);
	});

	var updateOnClose = function(tab){
		var window = tab.window;
		setTimeout(function(){
			updateButton(window, window.tabs.length);
		}, 1);
	};
	tabs.on('close', updateOnClose);
	tabs.on('activate', updateOnClose);
};
