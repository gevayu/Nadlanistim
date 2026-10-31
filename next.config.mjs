/** @type {import('next').NextConfig} */
// Sent with every response. HSTS stays Vercel's own (max-age=63072000), so it is not repeated here.
// No CSP yet: the site loads Google Fonts and WordPress media, and a wrong policy blanks pages.
const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  // Form photos travel as data URLs inside server actions (app/forms/image.ts, up to 1600px). The 1MB default
  // is too small for them; 3MB stays under Vercel's 4.5MB request cap.
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
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
      // nadlanistim.vercel.app served the whole site a second time, open to search engines.
      {
        source: "/:path*",
        has: [{ type: "host", value: "nadlanistim.vercel.app" }],
        destination: "https://nadlanistim.yuvalgeva.com/:path*",
        permanent: true,
      },
      // The V6 homepage now renders at "/" (app/page.tsx). Old /v6 links keep working.
      { source: "/v6", destination: "/", permanent: true },
      // Mock-ups of the locked state from before login existed. The real pages now lock themselves
      // for non-members (collaboration and nadlanist pages); the jobs board stays open to all.
      { source: "/collaborations-locked", destination: "/collaborations", permanent: true },
      { source: "/jobs-locked", destination: "/jobs", permanent: true },
      // The single job page moved to /job/<serial> when listings came from WordPress.
      { source: "/job", destination: "/jobs", permanent: true },
      // Accounts are no longer opened on their own: new members go through the join page.
      { source: "/register", destination: "/join", permanent: true },
      // /posts never had a list page (only the legacy /posts/<slug> articles); the knowledge base is the list.
      { source: "/posts", destination: "/post-archive", permanent: true },
      // The personal area moved to /profile.
      { source: "/my-account", destination: "/profile", permanent: true },
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
