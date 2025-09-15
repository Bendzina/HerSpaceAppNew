module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Keep Worklets plugin last
      'react-native-worklets/plugin',
    ],
  };
};
