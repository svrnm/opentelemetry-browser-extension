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
import * as React from 'react';
import * as ReactDOM from 'react-dom';

interface PopupProps {
  settings: {
    [key: string]: string;
  };
}

interface PopupState {
  urlFilter: string;
}

class Popup extends React.Component<PopupProps, PopupState> {
  constructor(props: PopupProps) {
    super(props);

    this.state = {
      urlFilter: props.settings.urlFilter,
    };

    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleSaveSettings = this.handleSaveSettings.bind(this);
  }

  handleFilterChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      urlFilter: event.target.value,
    });
  }

  async handleSaveSettings() {
    chrome.storage.local.set(
      {
        urlFilter: this.state.urlFilter,
      },
      async () => {
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        const tabId = Number(tabs[0].id);

        chrome.scripting.executeScript({
          target: {
            tabId,
          },
          function: () => {
            window.location.reload();
          },
        });
      }
    );
  }

  render() {
    return (
      <div>
        URL Filter (contains, use '*' for every URL)
        <input
          type="text"
          value={this.state.urlFilter}
          onChange={this.handleFilterChange}
        />
        <button onClick={this.handleSaveSettings}>Save</button>
      </div>
    );
  }
}

chrome.storage.local.get(
  {
    urlFilter: '',
  },
  settings => {
    ReactDOM.render(
      <Popup settings={settings} />,
      document.getElementById('root')
    );
  }
);
