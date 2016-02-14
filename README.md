Disable Tabs
=============

DisableTabs is a simple extension that completely excises the tabs feature from Firefox.

[tabbed](http://tools.suckless.org/tabbed/) and tiling window managers in general add the tab feature popularized by Firefox into the core UI of your system. But this makes actually using Firefox under them really irritating, especially with Mozilla [really wanting to push the tab ubermensch](https://support.mozilla.org/en-US/questions/968331). This disables this feature so that each Firefox is a single page, like [surf](http://surf.suckless.org/), but still allowing full access to Firefox features and add-ons.

Development
---

Note: This repo does **NOT** rely on global install of [`jpm`](https://github.com/mozilla/jpm). It's installed locally.

- `npm install` - Install all dependencies
- `npm start` - Run the extension on Firefox (stable) with a new temporary profile
- `npm run package` - Package the extension into an XPI file. -- CAREFUL: this just zips the current directory, so any scrap temp files will get packaged too. Run `git clean -x` before this.
- `firefox *xpi` - install the package into Firefox
- `npm run sign` - Get the package signed

See also:

* [Addon SDK documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/SDK)

### Testing

For extensions, `console.log()` goes straight to stdout, but this means you need to `killall firefox` before you try to run it under Firefox.
It might be easier to use the [notifications API](https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/notifications).

### Signing

For Firefox 46+, extensions require signing to be installed, even for testing.
They will be signed if uploaded to addons.mozilla.org -- once they've been manually reviewed by humans,
or you can automate it if you get an API key from https://addons.mozilla.org/en-US/developers/addon/api/key/.

It is not clear to me if it is possible to self-sign with a manually installed CA, or if you *must* use Mozilla's root key.
It seems that Mozilla's [plan](https://wiki.mozilla.org/Addons/Extension_Signing) is for Firefox to fragment into user and developer editions:
 * the former requiring signatures,
 * the latter with extra options, in particular `xpinstall.signatures.required`
but they also allow [automated signing](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm#jpm_sign),
but only for extensions which aren't on addons.mozilla.org(??) --- so you can sign and host an extension on your own server and Firefox will happily accept it??

Anyway, this all sounds very not DIY friendly, though I suppose I can't fault them since the web is a dangerous place.

TODO
----

* [ ] The Double Download Bug

License
---

[MPL 2.0](https://www.mozilla.org/MPL/2.0/).

Based on @cheeaun's [maxtabs](https://github.com/cheeaun/max-tabs) and @Chris000001's [hide tab bar](https://addons.mozilla.org/en-US/firefox/addon/hide-tab-bar-with-one-tab/)
