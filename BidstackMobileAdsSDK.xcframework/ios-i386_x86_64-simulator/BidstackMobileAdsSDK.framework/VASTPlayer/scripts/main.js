'use strict';

/**
 * Event handlers for necessary VPAID 2.0 events specified here:
 * https://www.iab.com/wp-content/uploads/2015/06/VPAID_2_0_Final_04-10-2012.pdf
 */

var vastUrl = "https://server-dev.bsde.cc/vast/wrapper/SZEIHIwHlFiIqhUS/aHR0cHM6Ly9wYnMuMzYweWllbGQuY29tL2d2YXN0P3A9MjI2Mzc5NjAmZ2Rwcl9jb25zZW50PUNQVGZQbXVQVGZQbXVDbEFCQkVOQjlDZ0FBQUFBQUFBQUNpUUlmd0FBUV9nQUFBQS5ZQUFBQUFBQUFBQSZnZHByPTEmc3RvcmV1cmw9aHR0cHMlM0ElMkYlMkZhcHBzLmFwcGxlLmNvbSUyRnVzJTJGYXBwJTJGaW5maW5pdGUtbWF6ZSUyRmlkMTQ2NzkwMDY0MCZidW5kbGU9MTQ2NzkwMDY0MCZtaW5kdXJhdGlvbj01Jm1heGR1cmF0aW9uPTIwMCZpZmE9MDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwJnVhPU1vemlsbGElMkY1LjArJTI4aVBob25lJTNCK0NQVStpUGhvbmUrT1MrMTVfNCtsaWtlK01hYytPUytYJTI5K0FwcGxlV2ViS2l0JTJGNjA1LjEuMTUrJTI4S0hUTUwlMkMrbGlrZStHZWNrbyUyOStNb2JpbGUlMkYxNUUxNDgmaXA9MTc4LjEyOC4xNjIuMjM1Jm9zPWlPUyZtb2RlbD1pUGhvbmUxNCUyQzMmYXBwbmFtZT1JbmZpbml0ZStNYXplJmxtdD0xJm9zdj0xNS40JmNhcnJpZXI9dW5rbm93biZiaWRmbG9vcj0wLjAxJmJpZGZsb29yY3VyPVVTRA==";

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
var useInconCloseTimeout = true;

function ShowCloseButton() {
    
    iconClose.style.display = 'inline-block';
}

iconClose.addEventListener('click', (e) => {
   
   e.stopPropagation();
   player.stopAd();
   
   webkitEvent("ad-user-close");
});

player.once('ready', () => {
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
});

player.once('AdLoaded', () => {
    console.log('AdLoaded');
    
    webkitEvent("ad-did-load");
});

player.once('AdStarted', () => {
    console.log('AdStarted');
    
    if (useInconCloseTimeout) {
    
        setTimeout(() => {
            
            ShowCloseButton();
        }, iconCloseTimeout);
    }
    
    webkitEvent("ad-did-start");
});

player.once('AdStopped', () => {

    
    iconClose.style.display = 'none';

    console.log('AdStopped');
    
    webkitEvent("ad-did-stop");
});

player.once('AdVideoStart', () => {

    console.log('AdVideoStart');
    
    webkitEvent("video-did-start");
});

player.once('AdVideoComplete', () => {
   
    player.pauseAd();
    
    ShowCloseButton();
    
    console.log('AdVideoComplete');
    
    webkitEvent("video-did-completed");
});

player.on('AdClickThru', (clickThroughUrl, trackingId, playerHandles) => {
    
    console.log('AdClickThru', clickThroughUrl, trackingId, playerHandles);
    console.log('ClickThroug', player.vast.ads[0].creatives[0].videoClicks.clickThrough);
    
    var url = player.vast.ads[0].creatives[0].videoClicks.clickThrough;
    
    webkitEvent( "ad-did-click-through", url);
});

player.once('AdImpression', () => {
 
    console.log('AdImpression');
    
    webkitEvent("ad-impression");
});

player.on('AdError', (errorMessage) => {
   
    webkitEvent("ad-error?message", errorMessage);
});

function AdPlay(isRewardedVideo) {
    
    useInconCloseTimeout = !isRewardedVideo;
    
    player.startAd();
}

function AdLoad(url){
        
    player.load(url).then((a) => {
        
    }).catch((errorMessage) => {
        
        webkitEvent("ad-did-load-error", "Internal Error");
        console.log("AdLoadError", errorMessage);
    });
}

function AdPause() {
    
    player.pauseAd();
}

function AdResume() {
    
    player.resumeAd();
}
