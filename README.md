Disable Tabs
=============

DisableTabs is a simple extension that completely excises the tabs feature from Firefox.

[tabbed](http://tools.suckless.org/tabbed/) and tiling window managers in general add the tab feature popularized by Firefox into the core UI of your system. But this makes actually using Firefox under them really irritating, especially with Mozilla [really wanting to push the tab ubermensch](https://support.mozilla.org/en-US/questions/968331). This disables this feature so that each Firefox is a single page, like [surf](http://surf.suckless.org/), but still allowing full access to Firefox features and add-ons.

Development
---

Note: This repo does **NOT** rely on global install of [`jpm`](https://github.com/mozilla/jpm). It's installed locally.

- `npm install` - Install all dependencies
- `npm start` - Run the extension on Firefox (stable) with a new temporary profile
- `npm run package` - Package the extension into an XPI file


License
---

[MPL 2.0](https://www.mozilla.org/MPL/2.0/).

Based on @cheeaun's [maxtabs](https://github.com/cheeaun/max-tabs) and @Chris000001's [hide tab bar](https://addons.mozilla.org/en-US/firefox/addon/hide-tab-bar-with-one-tab/)
