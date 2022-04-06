'use strict';

/**
 * Event handlers for necessary VPAID 2.0 events specified here:
 * https://www.iab.com/wp-content/uploads/2015/06/VPAID_2_0_Final_04-10-2012.pdf
 */

var VAST_PLAYER_VERSION = "1.0.1";

// create player instance
var player = new VASTPlayer(document.getElementById('ad-container'));

function webkitEvent(eventName, param) {

    var msg = {

        eventName: eventName,
        eventParams: param
    };

    if (window.webkit !== undefined) {

        window.webkit.messageHandlers.ISBidstackAdapterListener.postMessage(msg);
    } else if (window.appInterface !== undefined) {

        window.appInterface.postMessage(msg);

    } else {

        console.log("Log event: " + eventName + "\nCaptured, but not handled. (Mobile devices only)");
    }
}

var iconCloseTimeout = 5000;
var iconClose = document.querySelector('.icon-close');
var useIconCloseTimeout = true;
var isAndroid = false;

function AdPlay(isRewardedVideo) {
    useIconCloseTimeout = !isRewardedVideo;

    if (isAndroid) {
        PlayerJSInterface.logMessage("main.js calling AdPlay()");
    }

    player.startAd();
}

function AdLoad(url){
    player.load(url).then(function(a) {
        if (isAndroid) {
            PlayerJSInterface.logMessage("main.js player.load(adUrl) callback");
        }
    }).catch(function(errorMessage) {
        console.log("AdLoadError", errorMessage);

        if (isAndroid) {
            PlayerJSInterface.onAdLoadError(errorMessage);
        } else {
            webkitEvent("ad-did-load-error", "Internal Error");
        }
    });
}

function AdPause() {
    player.pauseAd();
}

function AdResume() {
    player.resumeAd();
}

function ShowCloseButton() {
    iconClose.style.display = 'inline-block';
}

function SetIsAndroid(mIsAndroid) {
    isAndroid = mIsAndroid;
}

iconClose.addEventListener('click', function(e) {
    e.stopPropagation();
    player.stopAd();
    if (!isAndroid) {
        webkitEvent("ad-user-close");
    }
});

player.once('ready', function() {
    console.log('Player ready');
    /**
     * Volume needs to be set to 0, otherwise the ad won't autoplay and player throws an exception
     * See more here: https://developer.chrome.com/blog/autoplay/.
     */

    var videoTag = document.querySelector('#ad-container video');

    if (videoTag) {

        //Allows to play in a container
        videoTag.setAttribute('playsinline', '');

        //Legacy, should be removed
        videoTag.removeAttribute('webkit-playsinline');
    }

    player.adVolume = 0;
    console.warn('Volume set to 0 to allow auto-play in browsers: https://developer.chrome.com/blog/autoplay/.');
    if (isAndroid) {
        PlayerJSInterface.onPlayerReady();
    }
});

player.once('AdLoaded', function() {
    console.log('AdLoaded');

    if (isAndroid) {
        PlayerJSInterface.onAdLoaded();
    } else {
        webkitEvent("ad-did-load");
    }
});

player.once('AdStarted', function() {
    console.log('AdStarted');

    if (useIconCloseTimeout) {
        setTimeout(function() {
            ShowCloseButton();
        }, iconCloseTimeout);
    }

    if (isAndroid) {
        PlayerJSInterface.onAdStarted();
    } else {
        webkitEvent("ad-did-start");
    }
});

player.once('AdStopped', function() {
    iconClose.style.display = 'none';

    console.log('AdStopped');

    if (isAndroid) {
        PlayerJSInterface.onAdStopped();
    } else {
        webkitEvent("ad-did-stop");
    }
});

player.once('AdVideoStart', function() {
    console.log('AdVideoStart');

    player.adVolume = 1;

    if (isAndroid) {
        PlayerJSInterface.onAdVideoStart();
    } else {
        webkitEvent("video-did-start");
    }
});

player.once('AdVideoComplete', function() {
    player.pauseAd();
    ShowCloseButton();
    console.log('AdVideoComplete');
    if (isAndroid) {
        PlayerJSInterface.onAdVideoComplete();
    } else {
        webkitEvent("video-did-completed");
    }
});

player.on('AdClickThru', function(clickThroughUrl, trackingId, playerHandles) {

    console.log('AdClickThru', clickThroughUrl, trackingId, playerHandles);
    console.log('ClickThrough', player.vast.ads[0].creatives[0].videoClicks.clickThrough);

    var url = player.vast.ads[0].creatives[0].videoClicks.clickThrough;

    if (isAndroid) {
        PlayerJSInterface.onAdClickThru();
    } else {
        webkitEvent( "ad-did-click-through", url);
    }
});

player.once('AdImpression', function() {
    console.log('AdImpression');

    if (isAndroid) {
        PlayerJSInterface.onAdImpression();
    } else {
        webkitEvent("ad-impression");
    }
});

player.on('AdError', function(errorMessage) {
    console.log('AdError', errorMessage);

    if (isAndroid) {
        PlayerJSInterface.onAdError(errorMessage);
    } else {
        webkitEvent("ad-error?message", errorMessage);
    }
});