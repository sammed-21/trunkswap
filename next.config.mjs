/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cryptologos.cc",
        pathname: "/logos/**",
      },
      {
        protocol: "https",
        hostname: "cons.llamao.fi",
        pathname: "/icons/chains",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com/",
        pathname: "/logos/**",
      },
    ],
  },
};

export default nextConfig;
