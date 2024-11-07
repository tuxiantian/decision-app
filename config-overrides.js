module.exports = function override(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "assert": require.resolve("assert/"), // 添加 assert 的 polyfill
      "constants": require.resolve("constants-browserify"),
      "crypto": require.resolve("constants-browserify"),
      "buffer": require.resolve("buffer/"),
    };
    return config;
  };
  