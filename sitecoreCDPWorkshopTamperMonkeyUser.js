// ==UserScript==
// @name Sitecore CDP Workshop
// @namespace http://tampermonkey.net/
// @version 0.2
// @description Generic Load Sitecore CDP Tampermonkey scripts
// @author Sumith Damodaran
// @match https://*scug.co.uk/*
// @grant  none
// ==/UserScript==

(function() {
    'use strict';
    // *********************************
    // CONSTS
    // *********************************
    const SITECORECDP_CLIENT_KEY = "";
    const SITECORECDP_CLIENT_SECRET = "";
    const SITECORECDP_REST_API_BASIC_AUTH = ""
    const SITECORECDP_POINT_OF_SALE = "default2";
    const SITECORECDP_API_TARGET = "https://api.boxever.com/v1.2"; //  do not change
    const SITECORECDP_WEB_FLOW_TARGET = "https://d35vb5cccm4xzp.cloudfront.net"; //  do not change
    const SITECORECDP_JS_LIB_SRC = "https://d1mj578wat5n4o.cloudfront.net/boxever-1.4.1.min.js"; //  do not change
    const SITECORECDP_COOKIE_DOMAIN = '*.scug.co.uk'; //replace TLD with your client/prospect
    const IDENTITY_EMAIL = "sumith.damodaran@sitecore.com"; // must be unique, ideally under your control
    const IDENTITY_FNAME = "Sumith"; // have some fun with this
    const IDENTITY_LNAME = "Damodaran"; // ditto
    const IDENTITY_PHONE = "123456789"; // eventually this will be used for omnichannel
    const DATE_OF_BIRTH = "1990-01-01T00:00:00.000Z";
    const GENDER = "male";
    const CURRENCY = "EUR";
    const ORDER_ID = "TestWorkshopOrder";

    //Script settings
    const SEND_VIEW_EVENT = true;

    // *********************************
    // INIT
    // *********************************
    // Define the Boxever queue
    var _boxeverq = _boxeverq || [];

    window._boxever_settings = {
        client_key: SITECORECDP_CLIENT_KEY,
        target: SITECORECDP_API_TARGET,
        pointOfSale: SITECORECDP_POINT_OF_SALE,
        cookie_domain: SITECORECDP_COOKIE_DOMAIN,
        web_flow_target: SITECORECDP_WEB_FLOW_TARGET,
        web_flow_config: { async: false, defer: false } // Customize the async and defer script loading attributes
    };

    loadScCdpLib();
    if (SEND_VIEW_EVENT) {
        delayUntilBrowserIdIsAvailable(View);
    }

    function loadScCdpLib(callback) {
        console.log('Sitecore CDP Tampermonkey script - loadScCdpLib');
        var scriptElement = document.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.src = SITECORECDP_JS_LIB_SRC;
        scriptElement.async = false;
        document.head.appendChild(scriptElement);
    }

    function delayUntilBrowserIdIsAvailable(functionToDelay) {
        if (window.Boxever == null || window.Boxever == undefined || window.Boxever === "undefined" || window.Boxever.getID() === "anonymous") {
            const timeToWaitInMilliseconds = 300;
            console.log('Sitecore CDP browserId is not yet available. Waiting ${timeToWaitInMilliseconds}ms before retrying.');
            window.setTimeout(delayUntilBrowserIdIsAvailable, timeToWaitInMilliseconds, functionToDelay);
        } else {
            functionToDelay();
        }
    }



    // *********************************
    // CDP
    // *********************************
    function View() {
        console.log('Sitecore CDP Tampermonkey script - send ViewEvent');
        //  _boxeverq.push(function() {

        var viewEvent = {
            "browser_id": Boxever.getID(),
            "channel": "WEB",
            "type": "VIEW",
            "language": "EN",
            "currency": CURRENCY,
            "page": window.location.pathname + window.location.search,
            "pos": SITECORECDP_POINT_OF_SALE,
            "session_data": {
                "uri": window.location.pathname
            }
        };

        Boxever.eventCreate(viewEvent, function(data) {}, 'json');
        console.log('Sitecore CDP Tampermonkey script - viewevent sent');

        var identityEvent = {
            "browser_id": Boxever.getID(),
            "channel": "WEB",
            "type": "IDENTITY",
            "language": "EN",
            "currency": CURRENCY,
            "page": window.location.pathname + window.location.search,
            "pos": SITECORECDP_POINT_OF_SALE,
            "browser_id": Boxever.getID(),
            "email": IDENTITY_EMAIL,
            "title": "Mr",
            "firstname": IDENTITY_FNAME,
            "lastname":IDENTITY_LNAME,
            "gender": "male",
            "dob": DATE_OF_BIRTH,
            "identifiers": [{
                "provider": "BXLP",
                "id": IDENTITY_EMAIL
            }]
        };

        Boxever.eventCreate(identityEvent, function(data) {}, 'json');
        console.log('Sitecore CDP Tampermonkey script - identityEvent sent');

        var addProductEvent = {
            "browser_id": Boxever.getID(),
            "channel": "WEB",
            "type": "ADD",
            "language": "EN",
            "currency": CURRENCY,
            "page": window.location.pathname + window.location.search,
            "pos": SITECORECDP_POINT_OF_SALE,
            "browser_id": Boxever.getID(),
            "product":{
                "type":"OTHER",
                "item_id":"EVT_MANCHESTER",
                "name":"Manchester User Group May 2022",
                "quantity":1,
                "price":100.00,
                "productId":"EVT_MANCHESTER",
                "currency":CURRENCY,
            }
        };

        Boxever.eventCreate(addProductEvent, function(data) {
            var confirmEvent = {
                "browser_id": Boxever.getID(),
                "channel": "WEB",
                "type": "CONFIRM",
                "language": "EN",
                "currency": CURRENCY,
                "page": window.location.pathname + window.location.search,
                "pos": SITECORECDP_POINT_OF_SALE,
                "browser_id": Boxever.getID(),
                "product": [{
                    "item_id": "EVT_MANCHESTER"
                }  ]
            };

            Boxever.eventCreate(confirmEvent, function(data) {
                var checkoutEvent = {
                    "browser_id": Boxever.getID(),
                    "channel": "WEB",
                    "type": "CHECKOUT",
                    "language": "EN",
                    "currency": CURRENCY,
                    "page": window.location.pathname + window.location.search,
                    "pos": SITECORECDP_POINT_OF_SALE,
                    "browser_id": Boxever.getID(),
                    "reference_id":"EVT_MANCHESTER_ORDER_1",
                    "status":"PURCHASED"
                };

                Boxever.eventCreate(checkoutEvent, function(data) { }, 'json');
                console.log('Sitecore CDP Tampermonkey script - checkoutEvent sent');

            }, 'json');
            console.log('Sitecore CDP Tampermonkey script - confirmEvent sent');
        }, 'json');
        console.log('Sitecore CDP Tampermonkey script - addProductEvent sent');

        //  });
        var nestedLisanchor = document.querySelectorAll('nav > ul > li > a'),
            i = 0,
            len = nestedLisanchor.length;

        for (; i < len; i++) nestedLisanchor[i].addEventListener('click', function(event) {

            var customEvent = {
                "browser_id": Boxever.getID(),
                "channel": "WEB",
                "type": "NAV_CLICK",
                "language": "EN",
                "currency": CURRENCY,
                "page": window.location.pathname + window.location.search,
                "pos": SITECORECDP_POINT_OF_SALE,
            };
            // Invoke event create
            // (<event msg>, <callback function>, <format>)
            Boxever.eventCreate(customEvent, function(data){}, 'json');

        });

    }
    // *********************************
})();
