const webpack = require('webpack');
const WorkBoxPlugin = require('workbox-webpack-plugin');

module.exports = function override(config) {
  config.resolve.fallback = { buffer: require.resolve('buffer') };

  config.plugins.forEach((plugin) => {
    if (plugin instanceof WorkBoxPlugin.InjectManifest) {
      plugin.config.maximumFileSizeToCacheInBytes = 50 * 1024 * 1024;
    }
  });

  config.plugins = [...config.plugins, new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] })];

  return config;
};
