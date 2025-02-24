/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true
}

// Desabilitar telemetria externamente
if (process.env.NEXT_TELEMETRY_DISABLED !== '1') {
  process.env.NEXT_TELEMETRY_DISABLED = '1';
}

module.exports = nextConfig