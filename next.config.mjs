/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
    output: 'export', 
    assetPrefix: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '',
};

export default nextConfig;