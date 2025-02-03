/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  assetPrefix: isProd ? '/Full-Stack-Pizza-App/' : '',
  basePath: isProd ? '/Full-Stack-Pizza-App' : '',
};

export default nextConfig;