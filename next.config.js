module.exports = {
  reactStrictMode: true,
  target: "serverless",
  images: {
    domains: ['s.ppy.sh', 'a.ppy.sh'],
    formats: ['image/avif', 'image/webp']
  },
}
