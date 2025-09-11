/** @type {import('next').NextConfig} */
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com;
  style-src 'self' 'unsafe-inline' https://accounts.google.com;
  img-src 'self' https://www.metal-vault.com blob: data: lh3.googleusercontent.com f4.bcbits.com i.ytimg.com i.scdn.co platform-lookaside.fbsbx.com;
  font-src 'self' https://accounts.google.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  frame-src 'self' https://accounts.google.com;
  connect-src 'self' https://accounts.google.com;
  upgrade-insecure-requests;
`;

const nextConfig = {
  images: {
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