/**
 * Metro configuration for Expo with path aliases.
 */
const { getDefaultConfig } = require('expo/metro-config');
const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.extraNodeModules = {
  '@': require('path').resolve(__dirname, 'src'),
};

defaultConfig.watchFolders = [require('path').resolve(__dirname, 'src')];

module.exports = defaultConfig;
