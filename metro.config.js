const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {wrapWithReanimatedMetroConfig} = require('react-native-reanimated/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {};

// First get the default config
const defaultConfig = getDefaultConfig(__dirname);

// Then merge it with your custom config
const mergedConfig = mergeConfig(defaultConfig, config);

// Finally, wrap it with Reanimated's metro config
module.exports = wrapWithReanimatedMetroConfig(mergedConfig);
