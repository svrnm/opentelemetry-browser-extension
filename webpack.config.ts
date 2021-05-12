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
import * as path from 'path';
// eslint-disable-next-line node/no-unpublished-import
import * as HtmlWebpackPlugin from 'html-webpack-plugin';

module.exports = {
  entry: {
    common: './src/common/index.ts',
    popup: './src/popup/index.tsx',
    options: './src/options/index.ts',
    instrumentation: './src/instrumentation/index.ts',
    background: './src/background/index.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['popup'],
      inject: 'head',
      template: 'src/template.html',
      filename: 'popup.html',
    }),
    new HtmlWebpackPlugin({
      chunks: ['options'],
      inject: 'head',
      template: 'src/template.html',
      filename: 'options.html',
    }),
  ],
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /manifest.json5$/,
        use: ['null-loader', path.resolve('src/utils/manifest-loader.ts')],
      },
      {
        test: /\.(jpe?g|png|webp)$/i,
        use: [
          // We are not going to use any of the images for real, throw away all output
          'null-loader',
          {
            loader: 'responsive-loader',
            options: {
              sizes: [16, 32, 48, 128],
              outputPath: 'icons/',
              name: '[name]_[width].[ext]',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};