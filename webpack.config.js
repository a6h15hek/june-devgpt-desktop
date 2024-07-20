const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');
const fs = require('fs');
const os = require('os');

// Load environment variables from .env.prod
const env = dotenv.config({ path: './.env.prod' }).parsed || {};

// Function to set environment variables
function setEnvironmentVariables() {
  const homeDir = os.homedir();
  const juneFilePath = path.join(homeDir, '.june');

  console.info(`User home directory: ${homeDir}`);
  console.info(`Checking if .june file exists at: ${juneFilePath}`);

  if (fs.existsSync(juneFilePath)) {
    console.info(".june file found. Reading file content...");
    const fileContent = fs.readFileSync(juneFilePath, 'utf-8');
    const lines = fileContent.split('\n');

    lines.forEach(line => {
      const [name, value] = line.trim().split('=');
      if (name && value) {
        env[name] = value;
      }
    });
  } else {
    console.error(".june file not found.");
  }
}

// Set environment variables
setEnvironmentVariables();

// Convert environment variables to a format Webpack can use
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next] || undefined);
  return prev;
}, {});

const config = {
  mode: 'development',
  entry: './views/index.js',
  devtool: false,
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js'
  },
  devServer: {
    port: 4000, // set your desired port here
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@root': path.resolve(__dirname, '.'),
      '@connector': path.resolve(__dirname, 'connector'),
      '@services': path.resolve(__dirname, 'services'),
      '@scripts': path.resolve(__dirname, 'scripts'),
      '@utils': path.resolve(__dirname, 'utils'),
      '@static': path.resolve(__dirname, 'static'),
    }
  },
  module: {
    rules: [
      {
        test: /.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'views/public', 'index.html')
    }),
    new webpack.DefinePlugin(envKeys)
  ]
};

module.exports = config;
