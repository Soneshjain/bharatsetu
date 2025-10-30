/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NODE_ENV === 'production' 
      ? '/api' 
      : 'http://localhost:8001',
    NEXT_PUBLIC_SHEETDB_URL: 'https://sheetdb.io/api/v1/g3zex9jzcawob'
  }
};

module.exports = nextConfig;
