const withFlowbiteReact = require("flowbite-react/plugin/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/pets',
        destination: 'http://43.201.147.104/aipet/api/v1/pets'
      },
      {
        source: '/api/auth/login',
        destination: 'http://43.201.147.104/aipet/api/v1/auth/login'
      },
      {
        source: '/api/chat',
        destination: 'http://192.168.1.141:8084/api/chat'
      },
      {
        source: '/api/v1/chat',
        destination: 'http://192.168.1.141:8084/api/v1/chat'
      }
    ]
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
        ]
      }
    ]
  },
  // Add experimental features to ensure proper handling of API routes
  experimental: {
    serverActions: {},
  },
  // Allow development requests from local IP
  allowedDevOrigins: [
    'http://192.168.1.48:3000',
    'http://localhost:3000'
  ]
}

module.exports = withFlowbiteReact(nextConfig)