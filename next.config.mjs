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
    return [
      { source: "/", destination: "/v6", permanent: false },
      // The single job page moved to /job/<serial> when listings came from WordPress.
      { source: "/job", destination: "/jobs", permanent: true },
      // WordPress sends a nadlanist's "View" to /profile?as=<slug>; plain /profile stays the member's own page.
      {
        source: "/profile",
        has: [{ type: "query", key: "as", value: "(?<slug>.+)" }],
        destination: "/nadlanist/:slug",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
