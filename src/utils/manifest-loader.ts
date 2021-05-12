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
import * as json5 from 'json5';

// From https://github.com/TypeStrong/ts-loader/blob/main/src/interfaces.ts
interface WebpackLoaderContext {
  emitFile(name: string, content: string): void;
}

interface IconSet {
  [key: string]: string;
}

export default function (this: WebpackLoaderContext, source: string): string {
  const p = require('../../package.json');

  const manifest5 = json5.parse(source);

  const sizes = ['16', '32', '48', '128'];
  manifest5.icons = sizes.reduce((result: IconSet, size: string) => {
    result[size] = manifest5.icons.replace('{size}', size);
    return result;
  }, {});

  manifest5.action['default_icon'] = manifest5.icons;

  const result = JSON.stringify(
    Object.assign(manifest5, {
      version: p.version,
      description: p.description,
      name: p.name
        .split('-')
        .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' '),
    }),
    null,
    2
  );

  this.emitFile('manifest.json', result);
  return source;
}