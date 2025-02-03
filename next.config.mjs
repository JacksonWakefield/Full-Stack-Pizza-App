/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
    assetPrefix: process.env.NODE_ENV === 'production' ? '/full-stack-pizza-app/' : '',
};

export default nextConfig;