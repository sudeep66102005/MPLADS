/**
 * Next.js config.
 *
 * Configured for static export to GitHub Pages. The site is served from
 * https://<user>.github.io/<repo>/, i.e. under a sub-path, so `basePath` and
 * `assetPrefix` must be set or every asset and link 404s.
 *
 * `BASE_PATH` is injected by the GitHub Actions deploy workflow. Locally it is
 * unset, so `npm run dev` serves from "/" as normal.
 */

const basePath = process.env.BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a fully static site into ./out — no Node server needed, which is what
  // makes GitHub Pages hosting possible.
  output: "export",

  basePath,
  assetPrefix: basePath || undefined,

  // Static export has no image optimization server available.
  images: { unoptimized: true },

  // Emit directory-style URLs (/projects/ -> /projects/index.html) so that
  // static file hosting resolves routes without server rewrites.
  trailingSlash: true,

  reactStrictMode: true,

  // Expose the base path to client code that needs to build asset URLs.
  env: { NEXT_PUBLIC_BASE_PATH: basePath }
};

export default nextConfig;
