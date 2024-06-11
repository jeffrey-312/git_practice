/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login', //預設進入到LOGIN
        permanent: true,
      },
    ];
  },
};

export default nextConfig;