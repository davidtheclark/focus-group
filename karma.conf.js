module.exports = function(config) {
  config.set({
    basePath: '.',
    browsers: ['Chrome'],
    frameworks: [
      'browserify',
      'mocha',
    ],
    files: ['test/**/*.js'],
    preprocessors: {
      'test/**/*.js': ['browserify'],
    },
    browserify: {
      debug: true,
    },
    autoWatch: true,
  });
};
