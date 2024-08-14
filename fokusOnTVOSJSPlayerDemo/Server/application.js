//# sourceURL=application.js

//
//  application.js
//
//  Created by Vladimir Sánchez Mondeja .
//

/*
 * This file provides an example skeletal stub for the server-side implementation
 * of a TVML application.
 *
 * A javascript file such as this should be provided at the tvBootURL that is
 * configured in the AppDelegate of the TVML application. Note that  the various
 * javascript functions here are referenced by name in the AppDelegate. This skeletal
 * implementation shows the basic entry points that you will want to handle
 * application lifecycle events.
 */

/**
 * @description The onLaunch callback is invoked after the application JavaScript
 * has been parsed into a JavaScript context. The handler is passed an object
 * that contains options passed in for launch. These options are defined in the
 * swift or objective-c client code. Options can be used to communicate to
 * your JavaScript code that data and as well as state information, like if the
 * the app is being launched in the background.
 *
 * The location attribute is automatically added to the object and represents
 * the URL that was used to retrieve the application JavaScript.
 */



/**
 Function called when the TVML application launch
 @param options {Obj}
*/

App.onLaunch = function (options) {
    console.log("[TVMLApp] onLaunch");
    tvOSApp.initialize(options.BASEURL);
}

/**
 Function called when the TVML application get active
*/
App.onWillResignActive = function () {
    console.log("[TVMLApp] onWillResignActive");
}

/**
 Function called when the TVML application enter background mode
*/

App.onDidEnterBackground = function () {
    console.log("[TVMLApp] onDidEnterBackground");
}

/**
 Function called when the TVML application enter foreground mode
*/

App.onWillEnterForeground = function () {
    console.log("[TVMLApp] onWillEnterForeground");

}

/**
 Function called when the TVML application become active
*/

App.onDidBecomeActive = function () {
    console.log("[TVMLApp] onDidBecomeActive");
}


/// ------------------------------------------------------------------------------------------------------------------////
/// -------------------------------TVMLJS App Helper functions -------------------------------------------------------////
/// ------------------------------------------------------------------------------------------------------------------////


var tvOSApp = {


    hostUrl: null,
    certificateUrl: null,
    licenseUrl: null,

    initialize: function (hostUrl) {
        this.hostUrl = hostUrl;
        this._setup();
    },

    _setup: function () {
        this.loadingDocument();

        const baseUrl = this.hostUrl;

        this.fetchData(baseUrl + "/Config/settings.json")
            .then((data) => {

                this.certificateUrl = data.certificateUrl;
                this.licenseUrl = data.licenseUrl;
                this.authToken = data.authToken;

                //Initialize Fairplay Engine 
                fairPlayNagraEngine.initialize(this.certificateUrl, this.licenseUrl);
                fairPlayNagraEngine.setup();

                // Load the channels and build the UI
                this.fetchData(baseUrl + "/Config/channels.json")
                    .then((data) => {
                        if (data && data.subscription) {
                            let nextDocument = this.collectionDocument(data.subscription);
                            this.pushDocument(nextDocument, getActiveDocument());

                        }
                    })
                    .catch((err) => {
                        console.error(err);
                    });

            })
            .catch((err) => {
                console.error(err);
            });

    },


    /**
     * Create a loading template in your application.js file so it appears when loading information from your sever
    * @returns {Document}
    */

    loadingDocument: function () {

        var template = '<document><loadingTemplate><activityIndicator><text>Loading</text></activityIndicator></loadingTemplate></document>';
        var templateParser = new DOMParser();
        var parsedTemplate = templateParser.parseFromString(template, "application/xml");
        navigationDocument.pushDocument(parsedTemplate);
        return parsedTemplate;

    },

    /**
    * Create a stack template in your application.js file containing a collection of elements.
    * @returns {Document}
    */
    collectionDocument: function (channels) {

        var buildLookUpItems = function (baseUrl) {
            var itemlookupIcon = baseUrl + "/Templates/images/play.jpg"
            var items = '';
            channels.forEach(channel => {
                items += '<lockup onselect="tvOSApp.onChannelSelected(' + channel.id + ')"><img src="' + itemlookupIcon + '" width="300" height="250" /> <title>' + channel.shortName + '</title></lockup>';
            });
            return items;
        };

        var template = '<document><stackTemplate><collectionList><grid><section>' + buildLookUpItems(this.hostUrl) + '</section></grid></collectionList></stackTemplate></document>';
        var templateParser = new DOMParser();
        var parsedTemplate = templateParser.parseFromString(template, "application/xml");
        return parsedTemplate;

    },

    /**
     * Replace the current TVML document with the new document. 
     * In this case, you want to replace the loading  document so that users don't see the loading document when backing out of the current document. Instead they go to the original document.
     * @param {Document} nextPage 
     * @param {Document} activePage 
    */
    pushDocument: function (nextPage, activePage) {
        navigationDocument.replaceDocument(nextPage, activePage);
    },

    /**
    *  Fetch the data objects from a local json url provided and parsed
    * @param {String} url 
    * @returns {Promise(JSON)}
    */
    fetchData: function (url) {
        return new Promise((resolve, reject) => {
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.setRequestHeader("Accept", "application/json");

            request.addEventListener("load", result => {
                resolve(JSON.parse(result.target.response));
            });

            request.addEventListener("error", reject);
            request.send();
        });
    },

    /**
    *  Fetch encrypted stream from the backend corresponded to the channel ID 
    * @param {*} channelID 
    * @returns {Promise(JSON)}
    */
    fetchStream: function (channelId) {

        return new Promise((resolve, reject) => {
            var request = new XMLHttpRequest();
            request.open("GET", "https://portal.tv.telenor.se/client-portal/auth/rs/channels/" + channelId + "/play?um=-1&tag=MAIN", true);
            request.setRequestHeader("Accept", "application/json");
            request.setRequestHeader("Authorization", this.authToken);
            request.setRequestHeader("X-Device-Model", "APPLE_TV_1.0.0");
            request.setRequestHeader("X-DATE_AS_LONG", "true");
            request.setRequestHeader("X-Playback-Session-Id", "03:00:00:13:07:3b");

            request.addEventListener("load", result => {
                resolve(JSON.parse(result.target.response));
            });
            request.addEventListener("error", reject);
            request.send();
        });
    },

    /**
    * Event fired when a channel is selected from the look up collection grid. 
    * @param {Int} channelId 
    * @returns {Promise(JSON)}
    */
    onChannelSelected: function (channelId) {
        console.log("[TVMLApp] onChannelSelected " + channelId);

        this.fetchStream(channelId)
            .then((response) => {
                if (response && (response.streams && response.streams instanceof Array)) {
                    const streamObj = response.streams[0];
                    var drmToken = '';
                    if (streamObj && streamObj.tokenKey && (response.tokenResult && response.tokenResult.tokens)) {
                        drmToken = response.tokenResult.tokens[streamObj.tokenKey] || "";
                    }
                    mediaPlayerHandler.initialize();
                    mediaPlayerHandler.startStream(streamObj, drmToken);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }

};



/// ------------------------------------------------------------------------------------------------------------------////
/// -------------------------------TVMLJS MediaPlayerHandler helper functions ----------------------------------------////
/// ------------------------------------------------------------------------------------------------------------------////


var mediaPlayerHandler = {

    player: null,


    initialize: function () {
        this._handleStateDidChangeBound = this._handleStateDidChange.bind(this);
        this._createPlayer();
    },

    /**
     * Create a new player instance and detroy if there is old instance running.
     */
    _createPlayer: function () {
        if (this.player) {
            // Destroy the old player if it excites.
            this._destroyPlayer();
        }
        this.player = new Player();
        this.player.addEventListener("stateDidChange", this._handleStateDidChangeBound);
    },

    /**
     * Destroy the current player instance 
     */
    _destroyPlayer: function () {

        this.player.removeEventListener("stateDidChange", this._handleStateDidChangeBound);
        this.player = null;

    },


    /**
  * An event that indicates the state of the player has changed.
  * begin - initial state after play() has been invoked on the player
  * loading - the stream is loading
  * playing - the stream is playing
  * paused - the stream is paused
  * end - the player was dismissed
  * scanning - fast forward/rewind
  * https://developer.apple.com/documentation/tvmljs/player/1627390-statedidchange
  * @param state {duration, elapsedTime, oldState, state, target, timeStamp, type}
  * @private
  */
    _handleStateDidChange: function (state) {
        var newState = state.state;
        console.log("[TVMLApp] mediaPlayerHandler handleStateDidChange to state: " + newState);
       
        // begin, end, loading, playing, paused, scanning
        switch (newState) {
            case "begin":
                break;
            case "end":
                break;
            case "loading":
                break;
            case "playing":
                break;
            case "paused":
                break;
            case "scanning":
                break

        }
    },

    /**
   * Create the mediaItem and prepare the Player to start playing the encrypted stream 
   * @param {Obj} streamObject 
   * @param {String} drmToken  
   */
    startStream: function (streamObject, drmToken) {
        console.log("[TVMLApp] mediaPlayerHandler starting stream: " + streamObject.url + "of type:" + streamObject.assetType);

        const mediaItem = fairPlayNagraEngine.buildMediaItem("video", streamObject.url, drmToken);

        if (!this.player.playlist) {
            this.player.playlist = new Playlist();
        }

        this.player.playlist.push(mediaItem);
        if (this.player.playlist.length > 1) {
            // If the playlist already contains mediaItem that we need to play the next item.
            this.player.next();
        }

        this.player.play();
        this.player.present();
    }

};

/// ------------------------------------------------------------------------------------------------------------------////
/// -------------------------------TVMLJS MediaPlayerEngine helper functions ----------------------------------------////
/// ------------------------------------------------------------------------------------------------------------------////

var fairPlayNagraEngine = {

    /**
     * Public certificate of the operator used for decoding streams. Fetched from the operators domain.
     * Base64 encoded Uint8Array.
     */
    certificate: undefined,

    /**
     * Public drmToken been sent as a upFrontToken to request the 
     */
    drmToken: undefined,

    /**
     * URL from where the operators certificate should be fetched.
     */
    certificateURL: "",

    /**
     * URL from where license keys should be requested.
     */
    licenseURL: "",



    initialize: function (certificateURL, licenseURL) {
        if (!certificateURL || !licenseURL) {
            const errorMsg = "Certificate and license acquiring URL must be supplied to initializer of MediaEngineFairPlay"
            console.error(errorMsg)
            throw new Error(errorMsg)
        }

        this.certificateURL = certificateURL;
        this.licenseURL = licenseURL;
    },

    setup: function () {
        console.log("========== SETUP FAIRPLAY ENGINE ==========")
        this._loadRemoteCertificate(
            this._remoteCertificateLoaded.bind(this), // onSuccess
            this._remoteCertificateFailed.bind(this) // onFailure
        )
    },

    _loadRemoteCertificate: function (onSuccess, onFailure) {
        const request = new XMLHttpRequest()
        request.open("GET", this.certificateURL, true)
        request.responseType = "arraybuffer"
        request.setRequestHeader("Pragma", "Cache-Control: no-cache")
        request.setRequestHeader("Cache-Control", "max-age=0")
        request.addEventListener("load", onSuccess, false)
        request.addEventListener("error", onFailure, false)

        request.send()
    },

    /**
    * Success handler for loading the certificate.
    * @param event
    * @private
    */
    _remoteCertificateLoaded: function (event) {
        console.log("========= FairPlay certificate successfully loaded ==========")
        const certificate = new Uint8Array(event.target.response);
        this.certificate = this._base64EncodeUint8Array(certificate);
    },

    /**
     * Error handler for loading the certificate.
     * @param event
     * @private
     */
    _remoteCertificateFailed: function (event) {
        console.warn("========= Failed to load FairPlay certificate ==========");
    },

    buildMediaItem: function (mediaType, streamURL, token) {
        console.log("========== BUILD FAIRPLAY MEDIA ITEM ========== -- " + mediaType + ", " + streamURL + ", " + token);

        this.drmToken = token;

        var mediaItem = new MediaItem(mediaType, streamURL);
        mediaItem.loadCertificate = this._loadMediaItemCertificate.bind(this);
        mediaItem.loadAssetID = this._loadMediaItemAssetID.bind(this);
        mediaItem.loadKey = this._loadMediaItemKey.bind(this);

        return mediaItem;
    },

    /**
    * A callback function used to load the security certificate for an item. The callback is automatically invoked
    * by the MediaItem before playback begins.
    * @param url - encryption key url for the asset that is about to be played.
    * @param callback - must be called with the certificate that was retrieved, or with null as the first parameter. The second parameter is error.
    * @private
    */
    _loadMediaItemCertificate: function (url, callback) {
        console.log("========== loadCertificate ========== -- " + url)
        if (!this.certificate) {
            callback(null, "Playback certificate could not be retrieved")
            return
        }
        callback(this.certificate)
    },


    /**
    * A callback function used to load the asset identifier for an item.
    *
    * See: https://developer.apple.com/documentation/tvmljs/mediaitem/1627392-loadassetid
    * @param url - encryption key url for the asset that is about to be played.
    * @param callback - must be called with the asset identifier that was retrieved, or with null as the first parameter. The second parameter is error.
    * @private
    */
    _loadMediaItemAssetID: function (url, callback) {
        console.log("========== loadAssetID ========== -- " + url)
        const skd = url.replace("skd://", "").replace(/\?.*/, "") // remove skd:// and any extra parameters

        console.log("SKD: " + skd);
        callback(skd);
    },

    /**
     * A callback function used to load the asset media item key for an item.
     * @param {*} url 
     * @param {*} requestData 
     * @param {*} callback 
     */

    _loadMediaItemKey: function (url, requestData, callback) {
        console.log("========== loadKey ========== -- " + url);

        const req = new XMLHttpRequest();
        req.responseType = "text";
        req.callback = callback;

        req.addEventListener("load", this._ckcLoaded);
        req.addEventListener("error", this._ckcFailed);

        req.open("POST", this.licenseURL, true);

        req.setRequestHeader("PreAuthorization", this.drmToken);
        req.setRequestHeader("Content-Type", "application/base64");

        req.send(requestData);
    },

    /**
   * Extract CKC message from the response and pass it to the callback to begin playback of encrypted content.
   * @private
   */
    _ckcLoaded: function (event) {
        try {
            const request = event.target,
                callback = request.callback,
                ckc = JSON.parse(request.responseText);

            callback(ckc.CkcMessage);
        } catch (ex) {
            console.warn("========== FAILED TO PARSE CKC RESPONSE ==========", ex)
        }
    },

    _ckcFailed: function (event) {
        console.warn("========== LOADING CKC FROM LICENSE SERVER FAILED ==========")
        try {
            const request = event.target,
                callback = request.callback;
            callback(undefined, undefined, "Failed to load CKC")
        } catch (ex) {

        }
    },
    /**
    * Base64 encode a Uint8Array.
    * @param input - Uint8Array to encode.
    * @returns {string} - base64 encoded array.
    * @private
    */
    _base64EncodeUint8Array: function (input) {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            output = "",
            chr1, chr2, chr3, enc1, enc2, enc3, enc4,
            i = 0;

        while (i < input.length) {
            chr1 = input[i++];
            chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index
            chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                keyStr.charAt(enc3) + keyStr.charAt(enc4);
        }
        return output;
    }

};






