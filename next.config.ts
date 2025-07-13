// next.config.js
const nextConfig = {
  reactStrictMode: true,
  api: {
    bodyParser: {
      sizeLimit: '50mb', // لو بترفع فيديوهات أكبر
    },
  },
};

module.exports = nextConfig;
