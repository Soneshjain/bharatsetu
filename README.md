# BharatSetu - MSME Eligibility Checker

A comprehensive platform for Indian MSMEs to check eligibility for government subsidies, grants, and incentives. Features Google OAuth authentication, database storage, and real-time eligibility checking for both Haryana state and national schemes.

## Features

- **Google OAuth Authentication**: Secure login with Google accounts
- **Database Storage**: SQLite database for storing user data, companies, and eligibility test results
- **Comprehensive Eligibility Engine**: Checks eligibility for 22+ Haryana schemes and 7+ national schemes
- **Real-time Benefit Calculation**: Calculates potential benefits with detailed breakdowns
- **User Dashboard**: Track eligibility tests and application history
- **Responsive Design**: Works on desktop and mobile devices

## Database Schema

### Tables

1. **users** - User authentication and profile data
2. **companies** - MSME company information and details
3. **eligibility_tests** - Stored eligibility test results and benefits
4. **scheme_applications** - Application tracking for schemes

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google OAuth credentials

### 1. Install Dependencies

```bash
cd projects/bharatsetu
npm install
```

### 2. Environment Configuration

Copy the environment example file and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_PATH=./bharatsetu.db

# Security
NODE_ENV=development
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Set application type to "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
7. Add authorized redirect URIs:
   - `http://localhost:3000`
8. Copy the Client ID and Client Secret to your `.env` file

### 4. Update Frontend Configuration

Edit `js/auth-service.js` and replace the Google Client ID:

```javascript
google.accounts.id.initialize({
    client_id: 'YOUR_ACTUAL_GOOGLE_CLIENT_ID', // Replace this
    callback: this.handleGoogleSignIn.bind(this)
});
```

### 5. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `GET /api/user/profile` - Get user profile

### Companies
- `GET /api/companies` - Get user's companies
- `POST /api/companies` - Create new company

### Eligibility Tests
- `POST /api/eligibility-tests` - Store eligibility test result
- `GET /api/eligibility-tests` - Get user's test history

### Applications
- `POST /api/applications` - Create scheme application
- `GET /api/applications` - Get user's applications

## Database Integration

The application automatically stores:

1. **User Data**: Google OAuth profile information
2. **Company Information**: MSME details, location, financial data
3. **Eligibility Test Results**: Complete test data and calculated benefits
4. **Application Tracking**: Scheme applications and status

## Eligibility Engine

The system includes comprehensive eligibility checking for:

### Haryana State Schemes (22+ schemes)
- Employment Generation Incentive
- Power Tariff Subsidy
- Testing Equipment Subsidy
- Technology Acquisition Support
- Patent Reimbursement
- Quality Certification Support
- Environment Compliance Support
- Energy & Water Conservation
- HSJUY (Haryana State Jute Units Yojana)
- HSIIDC Loans
- Rural Development Support
- State Mini Cluster
- Startup Policy Support

### National Schemes (7+ schemes)
- PMEGP (Prime Minister's Employment Generation Programme)
- PMMY (Pradhan Mantri MUDRA Yojana)
- CGTMSE (Credit Guarantee Fund Trust for Micro and Small Enterprises)
- CLCSS (Credit Linked Capital Subsidy Scheme)
- MSE-CDP (Micro and Small Enterprises - Cluster Development Programme)
- MSME Innovative Scheme
- ZED Certification

## File Structure

```
bharatsetu/
├── css/
│   ├── main.css
│   └── eligibility-questionnaire.css
├── js/
│   ├── auth-service.js          # Authentication service
│   ├── main.js                  # Main application logic
│   ├── eligibility-engine.js    # Eligibility checking engine
│   └── eligibility-questionnaire.js # Questionnaire interface
├── server.js                    # Express server with API endpoints
├── package.json                 # Dependencies and scripts
├── env.example                  # Environment variables template
├── index.html                   # Main application page
└── README.md                    # This file
```

## Development

### Adding New Schemes

1. Add scheme definition to `eligibility-engine.js`
2. Update eligibility logic in the engine
3. Add benefit calculation methods
4. Test with the questionnaire interface

### Database Migrations

The database is automatically initialized when the server starts. Tables are created if they don't exist.

### Security Features

- JWT token authentication
- Rate limiting on API endpoints
- Helmet.js security headers
- CORS configuration
- Input validation and sanitization

## Troubleshooting

### Common Issues

1. **Google OAuth not working**
   - Check Client ID configuration
   - Verify authorized origins in Google Console
   - Ensure HTTPS in production

2. **Database connection errors**
   - Check file permissions for database directory
   - Verify SQLite installation
   - Check database path in environment

3. **Authentication errors**
   - Verify JWT_SECRET in environment
   - Check token expiration settings
   - Clear browser localStorage if needed

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong JWT_SECRET
3. Configure proper CORS origins
4. Set up HTTPS with valid SSL certificate
5. Use a production database (PostgreSQL/MySQL recommended)
6. Set up proper logging and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License. 