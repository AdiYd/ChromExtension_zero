const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = {
  entry: './scripts/content.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new Dotenv()
  ],
  mode: 'production'
};