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


function checkUrl(a, b) {

   chrome.storage.sync.get(['traps', 'target', 'timeWindow', 'lastVisit', 'revisitBlock', 'paused'], function ({ traps = [], target, timeWindow, lastVisit = {}, revisitBlock, paused }) {
      if (paused) return

      var date = new Date();
      var minutes = date.getMinutes();
      var hours = date.getHours();
      var result = (60 * hours) + minutes;

      // console.log({ lastVisit })

      if (null !== b) {
         for (var c = traps, f = 0; f < c.length; f++) {
            var g = new RegExp(c[f], "i");
            if (g.test(b)) {
               if (result >= timeWindow[0] && result <= timeWindow[1]) {
                  block(a, b, target)
               }
               else if (revisitBlock) { // limit to every 30 sec
                  const lastVisitData = new Date((lastVisit[b] || 0))
                  const timeDiff = (date - lastVisitData) / 60000 // get minitues

                  // console.log({ timeDiff })

                  if (timeDiff <= 30) {
                     block(a, b, target)
                  } else {
                     const newLastVisit = { ...lastVisit }
                     newLastVisit[b] = (new Date()).getTime()
                     chrome.storage.sync.set({ lastVisit: newLastVisit }, function () {
                        /*eslint-enable no-undef*/
                     })
                  }

               }
            }
         }
      }
   })

}

function block(a, b, target) {
   chrome.tabs.update(a, {
      url: 'https://' + target
   })
}



chrome.tabs.onUpdated.addListener((tabId, obj, tab) => {
   if (obj.url) {
      checkUrl(tabId, new URL(tab.url).hostname)
   }
})





// var listener


// chrome.storage.onChanged.addListener(function (changes, namespace) {
//    // console.log({ changes, namespace })
//    chrome.storage.sync.get(['traps', 'target', 'timeWindow', 'lastVisit'], function (data) {
//       /*eslint-enable no-undef*/
//       console.log("AAA")
//       if (chrome.webRequest.onBeforeRequest.hasListener(listener)) {
//          console.log("BBB")
//          chrome.webRequest.onBeforeRequest.removeListener(listener);
//          listener = null
//       }
//       console.log("CCC")

//       listener = (details) => {
//          // TODO check time
//          console.log({ details })
//          console.log({ data })
//          const lastVisit = (data.lastVisit ? data.lastVisit[details.url] : 0) || 0
//          const lastVisitData = new Date(lastVisit)
//          var date = new Date();
//          var minutes = date.getMinutes();
//          var hours = date.getHours();
//          var result = (60 * hours) + minutes;

//          const timeDiff = (date - lastVisitData) / 60000 // get minitues
//          console.log({ timeDiff })

//          if (timeDiff <= 1) {
//             console.log("HERE 1111111")
//             return { redirectUrl: `http://${data.target}` };
//          } else {
//             const newLastVisit = { ...data.lastVisit }
//             newLastVisit[details.url] = (new Date()).getTime()
//             chrome.storage.sync.set({ lastVisit: newLastVisit }, function () {
//                /*eslint-enable no-undef*/
//             })
//          }

//          if (result >= data.timeWindow[0] && result <= data.timeWindow[1]) {
//             console.log("HERE 22222222")
//             return { redirectUrl: `http://${data.target}` };
//          }
//       }

//       console.log("adding lis")
//       chrome.webRequest.onBeforeRequest.addListener(
//          listener,
//          {
//             urls: data.traps.map(t => `*://*.${t}/`),
//             types: ["main_frame"]
//          },
//          ["blocking"]
//       );
//       chrome.webRequest.handlerBehaviorChanged();

//    })

// });
