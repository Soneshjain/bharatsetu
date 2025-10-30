// Configuration for different environments
const config = {
  development: {
    BACKEND_URL: 'http://localhost:8001',
    SHEETDB_URL: 'https://sheetdb.io/api/v1/g3zex9jzcawob'
  },
  production: {
    BACKEND_URL: 'https://rajivkchawla.com/api', // Use nginx proxy route
    SHEETDB_URL: 'https://sheetdb.io/api/v1/g3zex9jzcawob'
  }
}

// Get current environment
const isProduction = process.env.NODE_ENV === 'production'
const currentConfig = isProduction ? config.production : config.development

export default currentConfig
