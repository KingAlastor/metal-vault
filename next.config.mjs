/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'f4.bcbits.com' },
      { hostname: 'yt3.ggpht.com' },
      { hostname: 'i.ytimg.com' },
      { hostname: 'i.scdn.co' },
    ],
  },
};

export default nextConfig;
