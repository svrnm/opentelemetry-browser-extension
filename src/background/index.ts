/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { loadFromStorage } from '../utils/storage';

/* eslint-disable no-console */

// the following two 'require' are here for webpack.
require('../manifest.json5');
require('../icons/otel-logo.png');

chrome.tabs.onUpdated.addListener(
  (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
    if (changeInfo.status !== 'loading') {
      return;
    }

    chrome.tabs.get(tabId, (tab: chrome.tabs.Tab) => {
      loadFromStorage()
        .then(({ settings: { urlFilter } }) => {
          if (
            urlFilter !== '' &&
            tab.url &&
            (urlFilter === '*' || tab.url.includes(urlFilter))
          ) {
            console.log(`[otel-extension] ${tab.url} includes ${urlFilter}`);
            chrome.scripting.executeScript(
              {
                target: {
                  allFrames: true,
                  tabId,
                },
                function: () => {
                  chrome.storage.local.get('settings', ({ settings }) => {
                    const script = chrome.runtime.getURL('instrumentation.js');
                    console.log(
                      '[otel-extension] injecting instrumentation.js'
                    );
                    const tag = document.createElement('script');
                    tag.setAttribute('src', script);
                    tag.setAttribute('id', 'open-telemetry-instrumentation');
                    // Config is based via this data attribute, since CSP might not allow inline script tags, so this is more robust.
                    tag.setAttribute('data-config', JSON.stringify(settings));
                    document.head.appendChild(tag);
                  });
                  return 1;
                },
              },
              () => {
                console.log('[otel-extension] instrumentation.js injected');
                chrome.action.setBadgeText({
                  tabId,
                  text: 'on',
                });
              }
            );
          } else {
            console.log(
              `[otel-extension] ${tab.url} does not include ${urlFilter}`
            );
          }
        })
        .catch(() => {});
    });
  }
);
