/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // The live homepage is the V6 design. Temporary (307) so "/" can later serve V6 directly.
  // Browsers keep the #fragment, so "/#contact" lands on "/v6#contact".
  async redirects() {
    return [{ source: "/", destination: "/v6", permanent: false }];
  },
};

export default nextConfig;
