/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { hostname: 'f4.bcbits.com' },
      { hostname: 'yt3.ggpht.com' },
      { hostname: 'i.ytimg.com' },
      { hostname: 'i.scdn.co' },
      { hostname: 'lh3.googleusercontent.com' },
    ],
  },
  compiler: {
    styledComponents: true,
  },
  productionBrowserSourceMaps: true, 
};

export default nextConfig;
