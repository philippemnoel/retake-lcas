// next.config.mjs

/**
 * Next.js configuration.
 */

/**
 * @type {import('next').NextConfig}
 */

const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    BOM_EMBED_ID: process.env.BOM_EMBED_ID,
    MATERIALS_EMBED_ID: process.env.MATERIALS_EMBED_ID,
    BOM_LIST_EMBED_ID: process.env.BOM_LIST_EMBED_ID,
    SUPPLIERS_EMBED_ID: process.env.SUPPLIERS_EMBED_ID,
    TYPEFORM_TOKEN: process.env.TYPEFORM_TOKEN,
    BASE_URL: process.env.AUTH0_BASE_URL,
    RETAKE_ENV: process.env.RETAKE_ENV,
    EMISSIONS_WEBHOOK_API_KEY: process.env.EMISSIONS_WEBHOOK_API_KEY,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default config
