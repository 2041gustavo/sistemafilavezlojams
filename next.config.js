/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NODE_ENV: process.env.NODE_ENV
  }
}

// Desabilitar telemetria externamente
if (process.env.NEXT_TELEMETRY_DISABLED !== '1') {
  process.env.NEXT_TELEMETRY_DISABLED = '1';
}

module.exports = nextConfig 