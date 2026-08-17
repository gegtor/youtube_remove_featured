// ==UserScript==
// @name         YouTube Remove Featured Banners
// @namespace    https://github.com/gegtor/youtube_remove_featured
// @version      1.0.0
// @description  Removes "YouTube featured" promotional banners and shelves (e.g. YouTube Premium ads) from the YouTube homepage.
// @author       gegtor
// @license      MIT
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @run-at       document-start
// @grant        none
// @updateURL    https://github.com/gegtor/youtube_remove_featured/releases/latest/download/youtube_remove_featured.user.js
// @downloadURL  https://github.com/gegtor/youtube_remove_featured/releases/latest/download/youtube_remove_featured.user.js
// ==/UserScript==

(function () {
    'use strict';

    var PROMOTED_BADGE_CLASS = 'ytBadgeShapePromoted';
    var FEATURED_BADGE_TEXT = 'YouTube featured';
    var CONTAINER_SELECTOR = [
        'ytd-statement-banner-renderer',
        'ytd-brand-video-shelf-renderer',
        'ytd-rich-shelf-renderer',
        'ytd-rich-section-renderer',
        'ytd-banner-promo-renderer'
    ].join(', ');

    function removeContainer(el) {
        var container = el.closest(CONTAINER_SELECTOR);
        if (!container) {
            return;
        }
        var section = container.closest('ytd-rich-section-renderer');
        if (section && section.parentNode) {
            section.parentNode.removeChild(section);
        } else if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }

    function scan() {
        var badges = document.querySelectorAll('badge-shape.' + PROMOTED_BADGE_CLASS);
        for (var i = 0; i < badges.length; i++) {
            removeContainer(badges[i]);
        }

        var badgeTexts = document.querySelectorAll('.ytBadgeShapeText');
        for (var j = 0; j < badgeTexts.length; j++) {
            if (badgeTexts[j].textContent.trim() === FEATURED_BADGE_TEXT) {
                removeContainer(badgeTexts[j]);
            }
        }

        var banners = document.querySelectorAll('ytd-statement-banner-renderer');
        for (var k = 0; k < banners.length; k++) {
            var link = banners[k].querySelector('a[href*="/premium"], a[href*="/musicpremium"]');
            if (link) {
                removeContainer(banners[k]);
            }
        }
    }

    var pending = false;
    function scheduleScan() {
        if (pending) {
            return;
        }
        pending = true;
        setTimeout(function () {
            pending = false;
            scan();
        }, 200);
    }

    function observe() {
        var observer = new MutationObserver(scheduleScan);
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    document.addEventListener('yt-navigate-finish', scheduleScan);

    if (document.body) {
        observe();
        scan();
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            observe();
            scan();
        });
    }
})();
