/** @type {import('next').NextConfig} */
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },
};

export default nextConfig;