
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ يتجاوز أخطاء ESLint أثناء البناء
  },
};

module.exports = nextConfig;

