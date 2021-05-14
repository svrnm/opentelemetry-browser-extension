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
import {
  AppType,
  ExporterType,
  PlaceholderValue,
  PopupProps,
  PopupState,
} from '../types';
import { styles } from './styles';
import {
  AppBar,
  Button,
  CssBaseline,
  withStyles,
  Paper,
  Toolbar,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Divider,
  Switch,
  Link,
  FormGroup,
  FormHelperText,
} from '@material-ui/core';
import { capitalCase } from 'change-case';
import { loadFromStorage } from '../utils/storage';

const packageJson = require('../../package.json');

class App extends React.Component<PopupProps, PopupState> {
  constructor(props: PopupProps) {
    super(props);

    this.state = {
      settings: props.settings,
    };

    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleSaveSettings = this.handleSaveSettings.bind(this);
  }

  handleFilterChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState(state => {
      state.settings.urlFilter = event.target.value;
      return state;
    });
  }

  handleUrlChange(
    name: ExporterType.ZIPKIN | ExporterType.COLLECTOR_TRACE,
    value: string
  ) {
    this.setState(state => {
      state.settings.exporters[name].url = value;
      return state;
    });
  }

  toggleExporter(name: ExporterType) {
    this.setState(state => {
      state.settings.exporters[name].enabled = !state.settings.exporters[name]
        .enabled;
      return state;
    });
  }

  async handleSaveSettings() {
    chrome.storage.local.set(
      {
        settings: this.state.settings,
      },
      async () => {
        if (this.props.app === 'popup') {
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
      }
    );
  }

  render() {
    const { urlFilter, exporters } = this.state.settings;

    const classes = this.props.classes;

    return (
      <React.Fragment>
        <CssBaseline />
        <AppBar position="absolute" color="default" className={classes.appBar}>
          <Toolbar>
            {this.props.app === AppType.OPTIONS ? (
              <Typography variant="h6" color="inherit" noWrap>
                {capitalCase(packageJson.name)} ({packageJson.version})
              </Typography>
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={this.handleSaveSettings}
              >
                Save &amp; Reload
              </Button>
            )}
          </Toolbar>
        </AppBar>
        <main className={classes.layout}>
          <Paper className={classes.paper}>
            <Typography
              component="h1"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Injection Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  id="urlFilter"
                  label="URL Filter"
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  value={urlFilter}
                  onChange={this.handleFilterChange}
                  helperText='Injection is only applied if the URL contains the given filter. Use "*" to match every URL.'
                />
              </Grid>
            </Grid>
          </Paper>
          <Paper className={classes.paper}>
            <Typography
              component="h1"
              variant="h6"
              color="primary"
              gutterBottom
            >
              Exporter Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={exporters[ExporterType.CONSOLE].enabled}
                        onChange={() =>
                          this.toggleExporter(ExporterType.CONSOLE)
                        }
                      ></Switch>
                    }
                    label="Console"
                  />
                  <FormHelperText>
                    Toggle to enable{' '}
                    <Link
                      href="https://www.npmjs.com/package/@opentelemetry/tracing"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ConsoleExporter
                    </Link>
                  </FormHelperText>
                </FormGroup>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={exporters[ExporterType.ZIPKIN].enabled}
                        onChange={() =>
                          this.toggleExporter(ExporterType.ZIPKIN)
                        }
                      ></Switch>
                    }
                    label="Zipkin"
                  />
                  <FormHelperText>
                    Toggle to enable{' '}
                    <Link
                      href="https://www.npmjs.com/package/@opentelemetry/exporter-zipkin"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ZipkinExporter
                    </Link>
                  </FormHelperText>
                </FormGroup>
              </Grid>
              <Grid item xs={12} md={9}>
                <TextField
                  label="Zipkin URL"
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  helperText="Endpoint URL for zipkin, default is http://localhost:9411/api/v2/spans"
                  placeholder={PlaceholderValue.ZIPKIN_URL}
                  value={exporters[ExporterType.ZIPKIN].url}
                  onChange={event =>
                    this.handleUrlChange(
                      ExporterType.ZIPKIN,
                      event.target.value
                    )
                  }
                />
              </Grid>
              <Divider />
              <Grid item xs={12} md={3}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={
                          exporters[ExporterType.COLLECTOR_TRACE].enabled
                        }
                        onChange={() =>
                          this.toggleExporter(ExporterType.COLLECTOR_TRACE)
                        }
                      ></Switch>
                    }
                    label="OTel Collector"
                  />
                  <FormHelperText>
                    Toggle to enable{' '}
                    <Link
                      href="https://www.npmjs.com/package/@opentelemetry/exporter-collector"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      CollectorTraceExporter
                    </Link>
                  </FormHelperText>
                </FormGroup>
              </Grid>
              <Grid item xs={12} md={9}>
                <TextField
                  label="Collector Trace URL"
                  fullWidth
                  variant="outlined"
                  margin="dense"
                  helperText="Endpoint URL of the collector, default is http://localhost:55681/v1/trace"
                  placeholder={PlaceholderValue.COLLECTOR_TRACE_URL}
                  value={exporters[ExporterType.COLLECTOR_TRACE].url}
                  onChange={event =>
                    this.handleUrlChange(
                      ExporterType.COLLECTOR_TRACE,
                      event.target.value
                    )
                  }
                />
              </Grid>
            </Grid>
          </Paper>
          <Paper className={classes.paper}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={this.handleSaveSettings}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </main>
      </React.Fragment>
    );
  }
}

loadFromStorage()
  .then(storage => {
    const app = window.location.pathname.startsWith('/options.html')
      ? AppType.OPTIONS
      : AppType.POPUP;

    const StyledApp = withStyles(styles)(App);

    ReactDOM.render(
      <StyledApp settings={storage.settings} app={app} />,
      document.getElementById('root')
    );
  })
  .catch(error => {
    // eslint-disable-next-line no-console
    console.error(error);
  });
