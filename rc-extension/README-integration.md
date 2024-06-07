# Ranking server integration mode

This is how to use the extension to develop your ranking server.

## Production mode operation

When installed from the Chrome web store, the extension runs in production mode. It will:

1. Re-rank content
2. Log scientific data to firebase
3. Onboard users when they install it
4. Give users surveys

## Integration mode operation

If you are reading this, your extension was probably packaged in integration mode. In this mode, it will:

1. Re-rank content
2. Log ranking request and response data to the browser console.

To see the data, open the console and load your favorite social media site (Command-Option-J or Control-Shift-J). You may need to scroll the page a little to get the data to load.

### Installing

1. Open the extensions panel in chrome (or visit `chrome://extensions`).
2. Turn on the "Developer Mode" switch at the upper right.
3. Click "Load unpacked" and navigate to the folder that this file is in.
4. Click "select". The extension should install, and you should see a card for it in the extensions panel.

It will almost certainly be annoying when you're not actively using it for development. To disable, you can click the little switch on the lower right of the card.

### Running a ranker

We expect that you'll have a ranking service running on `http://localhost:8000` if you'd like to perform ranking. Otherwise we will log only the `RankingRequest` part of the transaction, but not the response.

If you need to connect to a different development host, building an ssh tunnel is probably the most expedient way.
