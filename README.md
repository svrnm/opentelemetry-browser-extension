# OpenTelemetry Browser Extension

This browser extension allows you to inject [OpenTelemetry](https://opentelemetry.io/) instrumentation in any web page. It uses the [Web SDK](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-web) and can export data to Zipkin or an OpenTelemetry Collector.

**Note**: This software is still in an alpha stage, so it has a very reduced feature set and might not work in all circumstances. 
## Supported Environments

Right now this extension only supports chromium based browsers with support for manifest version 3. 

Support for other browser like firefox (and manifest version 2) will follow soon.
## Installation

Run the following in your shell to download and build the extension from source:

```shell
git clone https://github.com/svrnm/opentelemetry-browser-extension
cd opentelemetry-browser-extension
npm install
npm run compile
```

This will create a so called unpacked extension into the `build/` folder you now can load into your browser: 

* Open a new browser window and go to chrome://extensions
* Turn on "Developer Mode"
* Click on "Load unpacked" and select the `build/` folder containing the extension

If all goes well you should see the extension listed.

## Usage

When visiting a website, click on the extension icon, add an url filter that partially matches the current domain, e.g for `https://www.example.com/example.html` you can set "example" as value. Now, click on `save`, check the developer toolbar for spans being print to the console and being sent to your collector.
