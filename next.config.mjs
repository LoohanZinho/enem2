/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Desativar o ESLint durante o build, pois já o executamos separadamente
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
