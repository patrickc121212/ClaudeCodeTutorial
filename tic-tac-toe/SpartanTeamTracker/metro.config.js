const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for path aliases
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@': `${__dirname}/src`,
  '@/components': `${__dirname}/src/components`,
  '@/screens': `${__dirname}/src/screens`,
  '@/services': `${__dirname}/src/services`,
  '@/store': `${__dirname}/src/store`,
  '@/utils': `${__dirname}/src/utils`,
  '@/types': `${__dirname}/src/types`,
};

// Add support for TypeScript
config.resolver.sourceExts.push('ts', 'tsx');

module.exports = config;