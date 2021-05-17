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

/* eslint-disable no-console */

// The following block is required to make 'window' available within the service worker, since opentelemetry-core getEnv() depends on it.
export type {};
interface MyServiceWorkerGlobalScope extends ServiceWorkerGlobalScope {
  window: unknown;
}
declare const self: MyServiceWorkerGlobalScope;
self.window = self;

import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web';

// the following two 'require' are here for webpack.
require('../manifest.json5');
require('../icons/otel-logo.png');

try {
  // eslint-disable-next-line no-global-assign
  // const tracing = require();

  chrome.tabs.onUpdated.addListener(
    (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (changeInfo.status !== 'loading') {
        return;
      }

      chrome.tabs.get(tabId, (tab: chrome.tabs.Tab) => {
        if (tab.url) {
          chrome.scripting.executeScript({
            target: {
              allFrames: true,
              tabId,
            },
            function: () => {
              chrome.storage.local.get('settings', ({ settings }) => {
                // Define label of badge.
                const urlFilter = settings.urlFilter;
                if (
                  urlFilter !== '' &&
                  (urlFilter === '*' ||
                    document.location.href.includes(urlFilter))
                ) {
                  console.log(
                    `[otel-extension] ${document.location.href} includes ${urlFilter}`
                  );
                  const script = chrome.runtime.getURL('instrumentation.js');
                  console.log('[otel-extension] injecting instrumentation.js');
                  const tag = document.createElement('script');
                  tag.setAttribute('src', script);
                  tag.setAttribute('id', 'open-telemetry-instrumentation');
                  // Config is based via this data attribute, since CSP might not allow inline script tags, so this is more robust.
                  tag.setAttribute('data-config', JSON.stringify(settings));
                  tag.setAttribute('data-extension-id', chrome.runtime.id);
                  document.head.appendChild(tag);

                  window.addEventListener('message', event => {
                    if (
                      event.data.type === 'OTEL_EXTENSION_SPANS' &&
                      event.data.extensionId === chrome.runtime.id
                    ) {
                      chrome.runtime.sendMessage(event.data);
                    }
                  });

                  console.log('[otel-extension] instrumentation.js injected');
                } else {
                  console.log(
                    `[otel-extension] ${document.location.href} does not include ${urlFilter}`
                  );
                }
              });
            },
          });
        }
      });
    }
  );

  chrome.runtime.onMessage.addListener((request, sender) => {
    if (
      request.type === 'OTEL_EXTENSION_SPANS' &&
      request.extensionId === chrome.runtime.id &&
      sender.id === chrome.runtime.id
    ) {
      const spans = JSON.parse(request.spans);
      const consoleExporter = new ConsoleSpanExporter();
      const provider = new WebTracerProvider();
      provider.addSpanProcessor(new SimpleSpanProcessor(consoleExporter));
      consoleExporter.export(spans, r => console.log(r));
    }
  });
} catch (e) {
  console.log(e);
}
