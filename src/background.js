// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.browserAction.onClicked.addListener(() => {
   chrome.runtime.openOptionsPage(() => console.log('options page opened'))
})

chrome.runtime.onInstalled.addListener(function () {
   chrome.runtime.openOptionsPage(() => console.log('options page opened'))
});

let listener


chrome.storage.onChanged.addListener(function (changes, namespace) {
   // console.log({ changes, namespace })
   chrome.storage.sync.get(['traps', 'target', 'timeWindow'], function (data) {
      /*eslint-enable no-undef*/
      if (listener) {
         chrome.webRequest.onBeforeRequest.removeListener(listener);
      }
      listener = (details) => {
         // TODO check time
         var date = new Date();
         var minutes = date.getMinutes();
         var hours = date.getHours();
         var result = (60 * hours) + minutes;

         console.log({ result })
         if (result >= data.timeWindow[0] && result <= data.timeWindow[1]) {
            return { redirectUrl: `http://${data.target}` };
         }
      }
      chrome.webRequest.onBeforeRequest.addListener(
         listener,
         {
            urls: data.traps.map(t => `*://*.${t}/*`),
            types: ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
         },
         ["blocking"]
      );
      chrome.webRequest.handlerBehaviorChanged();
   })

});
