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
  async redirects() {
    return [
      // The V6 homepage now renders at "/" (app/page.tsx). Old /v6 links keep working.
      { source: "/v6", destination: "/", permanent: true },
      // Mock-ups of the locked state from before login existed. The real pages now lock themselves
      // for non-members (collaboration and nadlanist pages); the jobs board stays open to all.
      { source: "/collaborations-locked", destination: "/collaborations", permanent: true },
      { source: "/jobs-locked", destination: "/jobs", permanent: true },
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
