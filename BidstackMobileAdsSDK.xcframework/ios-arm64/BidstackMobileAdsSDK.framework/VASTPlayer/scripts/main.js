'use strict';

var adContainer = document.getElementById('ad-container');
var adsManager = new adserve.tv.AdsManager(adContainer);
var isAdPaused = false;
var iconCloseTimeout = 5000;
var iconClose = document.querySelector('.icon-close');
var useIconCloseTimeout = true;
var isAndroid = false;

function SetIsAndroid(mIsAndroid) {
    isAndroid = mIsAndroid;
}

function RequestAd(vastUrl, isRewarded) {
    useIconCloseTimeout = !isRewarded;
    adsManager.requestAds(vastUrl, {
        vastLoadTimeout: 7500,
        loadVideoTimeout: 7500
    });
}

function PlayAd() {
    try {
        adsManager.start();
    } catch (adError) {
        if (isAndroid) {
            PlayerJSInterface.onAdError("AdsManager could not be started. " + adError.toString(), adError.stack);
        }
        console.log("AdsManager could not be started");
    }
}

function Mute() {
    adContainer.querySelector("video").muted = true;
}

function UnMute() {
    adContainer.querySelector("video").muted = false;
}

function PauseAd() {
    adsManager.pause();
}

function ResumeAd() {
    adsManager.resume();
}

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

function ShowCloseButton() {
    iconClose.style.display = 'inline-block';
}

iconClose.addEventListener('click', function(e) {
    e.stopPropagation();
    adsManager.stop()
    if (isAndroid) {
        PlayerJSInterface.onPlayerUserClose();
    } else {
        webkitEvent("ad-user-close");
    }
});

// Overwrite function that destroys player after video finished
adsManager.destroy = function() {
    if (!isAdPaused) {
        this.pause();
    }

    // Stop and clear timeouts, intervals
    this.stopVASTMediaLoadTimeout();
    this.stopVPAIDProgress();

    if(this._isVPAID) {
        // Unsubscribe for VPAID events
        console.log('unsubscribe for VPAID events');
        this.removeCallbacksForCreative(this._creativeEventCallbacks);
        this.removeCreativeAsset();
    }

    // Reset global variables to default values
    this._nextQuartileIndex = 0;

    this._isVPAID = false;

    this._hasLoaded = false;
    this._hasError = false;
    this._hasImpression = false;
    this._hasStarted = false;

    this._ad = null;
    this._creative = null;
    this._mediaFile = null;
    this._vpaidCreative = null;
}

console.log('AdsManager version is', adsManager.getVersion());

// Subscribe for events
adsManager.addEventListener('AdError', function(adError) {
    console.log('AdError', adError);

    if (isAndroid) {
        PlayerJSInterface.onAdError(adError.toString(), adError.stack);
    } else {
        webkitEvent("ad-error?message", adError);
    }
});

adsManager.addEventListener('AdsManagerLoaded', function() {
    console.log('AdsManagerLoaded');

    try {
        adsManager.init('100%', '100%', 'normal');

        if (isAndroid) {
            PlayerJSInterface.onAdsManagerLoaded();
        } else {
            webkitEvent( "ad-did-player-ready");
        }
    } catch (adError) {
        console.log("AdsManager could not initialize ad");
    }
});

adsManager.addEventListener('AdLoaded', function(adEvent) {
    console.log('AdLoaded > ad type is', adEvent.type);

    if (isAndroid) {
        PlayerJSInterface.onAdLoaded();
    } else {
        webkitEvent("ad-did-load");
    }
});

adsManager.addEventListener('AdStarted', function() {
    console.log('AdStarted');

    if (isAndroid) {
        PlayerJSInterface.onAdStarted();
    } else {
        webkitEvent("ad-did-start");
    }
});

adsManager.addEventListener('AdVolumeChange', function() {
    console.log('AdVolumeChange', adsManager.getVolume());

    if (isAndroid) {
        PlayerJSInterface.onAdVolumeChange(adsManager.getVolume());
    } else {
        webkitEvent('ad-volume-change', adsManager.getVolume());
    }
});

adsManager.addEventListener('AdVideoStart', function() {
    console.log('AdVideoStart');
    adsManager.setVolume(1)

    if (useIconCloseTimeout) {
        setTimeout(function() {
            ShowCloseButton();
        }, iconCloseTimeout);
    }

    if (isAndroid) {
        PlayerJSInterface.onAdVideoStart();
    } else {
        webkitEvent("video-did-start");
    }
});

adsManager.addEventListener('AdImpression', function() {
    console.log('AdImpression');

    if (isAndroid) {
        PlayerJSInterface.onAdImpression();
    } else {
        webkitEvent("ad-impression");
    }
});

adsManager.addEventListener('AdVideoFirstQuartile', function() {
    console.log('AdVideoFirstQuartile');

    if (isAndroid) {
        PlayerJSInterface.onAdVideoFirstQuartile();
    } else {
        webkitEvent('ad-video-first-quartile');
    }
});

adsManager.addEventListener('AdVideoMidpoint', function() {
    console.log('AdVideoMidpoint');

    if (isAndroid) {
        PlayerJSInterface.onAdVideoMidpoint();
    } else {
        webkitEvent('ad-video-midpoint');
    }
});

adsManager.addEventListener('AdVideoThirdQuartile', function() {
    console.log('AdVideoThirdQuartile');

    if (isAndroid) {
        PlayerJSInterface.onAdVideoThirdQuartile();
    } else {
        webkitEvent('ad-video-third-quartile');
    }
});

adsManager.addEventListener('AdPaused', function() {
    console.log('AdPaused');
    if (isAndroid) {
        PlayerJSInterface.onAdPaused();
    } else {
        webkitEvent("ad-did-paused");
    }
    isAdPaused = true;
});

adsManager.addEventListener('AdPlaying', function() {
    console.log('AdPlaying');
    if (isAndroid) {
        PlayerJSInterface.onAdPlaying();
    } else {
        webkitEvent("ad-did-playing");
    }
    isAdPaused = false;
});

adsManager.addEventListener('AdVideoComplete', function () {
    console.log('AdVideoComplete');
    ShowCloseButton();

    if (isAndroid) {
        PlayerJSInterface.onAdVideoComplete();
    } else {
        webkitEvent("video-did-completed");
    }
});

adsManager.addEventListener('AdStopped', function () {
    console.log('AdStopped');

    if (isAndroid) {
        PlayerJSInterface.onAdStopped();
    } else {
        webkitEvent("ad-did-stop");
    }
});

adsManager.addEventListener('AdClickThru', function(url, id) {
    console.log('AdClickThru', url, id);

    if (isAndroid) {
        PlayerJSInterface.onAdClickThru();
    } else {
        webkitEvent( "ad-did-click-through", url);
    }
});

adsManager.addEventListener('AllAdsCompleted', function () {
    console.log('AllAdsCompleted');

    if (isAndroid) {
        PlayerJSInterface.onAllAdsCompleted();
    } else {
        webkitEvent( "ad-did-all-ads-completed");
    }
});
