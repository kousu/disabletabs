Disable Tabs
=============

DisableTabs is a simple extension that excises the tabs feature from Firefox.

Firefox is a pretty good browser with modern features, a good selection of addons and excellent history search.
But under [tabbed](http://tools.suckless.org/tabbed/) or any other tiling-style window manager that makes tabs an OS service, it is irritating.
Mozilla [really wants you to use tabs](https://support.mozilla.org/en-US/questions/968331),
but luckily they also have a [flexible extension API](https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/tabs) which we can use to counteract them.
Installing it makes browsing tab-less like [surf](http://surf.suckless.org/), without needing to abandon useful addons like [uMatrix](https://github.com/gorhill/uMatrix/), [HttpsEverywhere](https://www.eff.org/https-everywhere) and [NoScript](https://noscript.net/).

Download
---

(published version coming Real Soon Now, 'soons I work out the kinks and get it through AMO security review).

You can also build and install it yourself.

Development
---

First install mozilla's packaging manager [`jpm`](https://github.com/mozilla/jpm), and `make` if you don't already have that. If `jpm`'s not in your system package manager, you need to bootstrap it from `npm`, which you should be able to find in your package manager:
```
$ sudo apt-get install npm  #adapt as necessary to your OS
$ sudo npm install --global jpm
```

Then:
- `make test` - Run the extension on Firefox (stable) with a new temporary profile, and with `console.log()` directed to stdout.
- `make package` - Package the extension into an XPI file.
 - When packaging, be aware of the [`.jpmignore`](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm#Using_.jpmignore_to_ignore_files) file: don't publish passwords or test code!
- `make signed` - Package and sign the extension into an XPI file. Requires [AMO](https://addons.mozilla.org) credentials in `api_secret.txt`.
- To install, tell Firefox to open it: `firefox disable_tabs-1.3.0-fx.xpi`
 - Firefox is picky about this: it won't accept this as a `file://` URL, it won't accept it if you paste the path into the address bar, and it won't accept it if there's `../`s in the path. It will accept it from `http://localhost:8000/` but you need to whitelist localhost first(TODO: confirm this).




### Signing

For Firefox 46+, extensions will require signing to be installed.
They will be signed if uploaded to addons.mozilla.org -- once they've been manually reviewed by humans,
or you can automate it if you get an API key from https://addons.mozilla.org/en-US/developers/addon/api/key/.

If you use `jpm run` then you do not need your extension signed.
If you have Developer Firefox and set `xpinstall.signatures.required = false` in `about:config`, you do not need your extension signed.
It is not clear to me if it is possible to self-sign with a manually installed CA, or if you *must* use Mozilla's root key.
It seems that Mozilla's [plan](https://wiki.mozilla.org/Addons/Extension_Signing) is for Firefox to fragment into user and developer editions:
 * the former requiring signatures,
 * the latter with secret toggle off
but they also allow [automated signing](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm#jpm_sign),
but only for extensions which aren't on addons.mozilla.org(??) --- so you can sign and host an extension on your own server and Firefox will happily accept it??

Anyway, this all sounds very not DIY friendly, though I suppose I can't fault them since the web is a dangerous place.

To use `npm run sign` you need to get an account at AMO, generate an API key, and paste the "key" (i.e. the API account name) into package.json and the "secret" (i.e. the password) into `./api_secret.txt`.

Everytime you sign it you need to bump the version number: AMO remembers every version it signs, forever. So watch your language (i.e. don't swear in C++ or cuss in ALGOL).

### References

* [Addon SDK documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/SDK)
  * [Notifications](https://developer.mozilla.org/en-US/Add-ons/SDK/High-Level_APIs/notifications)
  * 


TODO
----

* [?] At boot the tab bar displays for a couple seconds because main() doesn't run fast enough. Is there anything I can do about this?
* [ ] Sometimes the tabbar reappears --- it seems to last until the new tab's 'ready' handler fires at least.
* [ ] On init, detach all tabs -- otherwise enabling/installing the extension during an active session can lead to lost tabs
* [x] The Double Download Bug
  - Because .ready doesn't fire until after it's downloaded a page, we are downloading pages twice
* [x?] It's possible to press ctrl-t really fast and spawn lots of tabs which never get caught by the extension
* [ ] Need a new logo
* [ ] Check compatibility with multiprocess Firefox; our package.json claims compatibility, but we use the low level API, but we only use it a little bit
* [ ] BUG: window.on('open') doesn't get called in some cases
  * These cases are apparently entirely when there's a target= attribute set
  * Workaround: set "Open new windows in a new tab instead" off (i.e. browser.link.open_newwindow = 3)
  * This is an SDK bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1248724
* [x] BUG: sometimes pages go blank and don't come back -- though the tab-group pane (ctrl-shift-e) still displays their content
  * Is it as simple as an uncaught exception? One that, since it's crashing in the XUL layer, snipes the whole page?
  * It's reliably triggered by "Search <engine> for <linktext>" in the context menu
* [ ] See if it's possible to `display: none` the menu, context, and preference items that reference tabs as well
* [?] Read browser.tabs.loadInBackground (aka "When I open a link in a new tab, switch to it immediately") and replicate it by window.activate()
  * - then distribute documentation on how to no_focus in i3 and other tiling window managers so that *only* those winodws have this behaviour
  * I think I did this, but it doesn't work on my system. Maybe i3 is overriding .focus() events?

License
---

[MPL 2.0](https://www.mozilla.org/MPL/2.0/).

Based on @cheeaun's [maxtabs](https://github.com/cheeaun/max-tabs) and @Chris000001's [hide tab bar](https://addons.mozilla.org/en-US/firefox/addon/hide-tab-bar-with-one-tab/). Thanks to @noitidart for [XUL help](https://discourse.mozilla-community.org/t/tear-off-tab-with-sdk/7085).


Alternatives
---

* [Tab Killer](https://addons.mozilla.org/en-US/firefox/addon/tab-killer) -- unmaintained since 2007
