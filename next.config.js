const path = require('path');
const withPWAInit = require('next-pwa');
const withMDX = require('@next/mdx')();

/* const plaiceholder = require('@plaiceholder/next'); */

const withPWA = withPWAInit({
  dest: 'public',
  buildExcludes: ['app-build-manifest.json'],
  disable: process.env.NODE_ENV === 'development',
});

/* const generateAppDirEntry = (entry) => {
  const packagePath = require.resolve('next-pwa');
  const packageDirectory = path.dirname(packagePath);
  const registerJs = path.join(packageDirectory, 'register.js');

  return entry().then((entries) => {
    // Register SW on App directory, solution: https://github.com/shadowwalker/next-pwa/pull/427
    if (entries['main-app'] && !entries['main-app'].includes(registerJs)) {
      if (Array.isArray(entries['main-app'])) {
        entries['main-app'].unshift(registerJs);
      } else if (typeof entries['main-app'] === 'string') {
        entries['main-app'] = [registerJs, entries['main-app']];
      }
    }
    return entries;
  });
}; */

const nextConfig = {
  reactStrictMode: true,
  /* webpack: (config) => {
    config.resolve.fallback = { fs: false };

    const entry = generateAppDirEntry(config.entry);
    config.entry = () => entry;

    return config;
  }, */
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['s.ppy.sh', 'a.ppy.sh', 'i.ppy.sh'],
  },
  transpilePackages: ['react-haiku', '@plaiceholder/next'],
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
};

module.exports = withPWA(
  /* plaiceholder.withPlaiceholder( */ withMDX(nextConfig) /* ) */
);
