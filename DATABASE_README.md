# BharatSetu Database System

## Overview

BharatSetu now includes a comprehensive database system for managing MSME schemes, applications, and user data. The system uses SQLite for data storage and provides RESTful APIs for frontend integration.

## Database Architecture

### Core Tables

1. **`schemes`** - Main scheme information
   - `scheme_id` (Primary Key) - Unique identifier
   - `scheme_name` - Name of the scheme
   - `scheme_type` - Haryana State or National
   - `quantum_of_assistance` - Description of assistance
   - `max_benefit_amount` - Maximum benefit amount
   - `benefit_percentage` - Percentage benefit (if applicable)
   - `eligibility_criteria` - Eligibility requirements
   - `competent_authority` - Government authority
   - `application_deadline` - Application deadline
   - `status` - Active/Inactive

2. **`required_documents`** - Document requirements
   - `document_id` (Primary Key)
   - `scheme_id` (Foreign Key)
   - `document_name` - Name of required document
   - `document_category` - Category (Identity, Business, Financial, etc.)
   - `is_mandatory` - Whether document is mandatory
   - `description` - Document description

3. **`forms`** - Application forms
   - `form_id` (Primary Key)
   - `scheme_id` (Foreign Key)
   - `form_name` - Form name
   - `form_type` - Type of form
   - `is_active` - Whether form is active

4. **`form_fields`** - Form field definitions
   - `field_id` (Primary Key)
   - `form_id` (Foreign Key)
   - `field_name` - Field name
   - `field_type` - Input type (text, email, number, select, etc.)
   - `field_label` - Display label
   - `required` - Whether field is required
   - `validation_rules` - JSON validation rules
   - `options` - JSON options for select fields

5. **`scheme_categories`** - Scheme categorization
   - `category_id` (Primary Key)
   - `category_name` - Category name
   - `parent_category_id` - Parent category (for hierarchy)
   - `description` - Category description

6. **`application_status`** - Application status tracking
   - `status_id` (Primary Key)
   - `status_name` - Status name
   - `description` - Status description
   - `color` - UI color code

7. **`user_applications`** - User application records
   - `application_id` (Primary Key)
   - `user_id` (Foreign Key)
   - `scheme_id` (Foreign Key)
   - `form_data` - JSON form data
   - `status_id` (Foreign Key)
   - `submitted_at` - Submission timestamp
   - `updated_at` - Last update timestamp

8. **`application_documents`** - Uploaded documents
   - `document_id` (Primary Key)
   - `application_id` (Foreign Key)
   - `required_document_id` (Foreign Key)
   - `file_path` - File storage path
   - `uploaded_at` - Upload timestamp
   - `status` - Document status

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize Database

```bash
# Initialize database and seed with data
npm run init-db

# Or run setup (init + start server)
npm run setup
```

### 3. Start Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## API Endpoints

### Scheme Management

- `GET /api/schemes` - Get all schemes
- `GET /api/schemes/:id` - Get scheme by ID
- `GET /api/schemes/type/:type` - Get schemes by type (Haryana State/National)
- `GET /api/schemes/category/:catId` - Get schemes by category
- `GET /api/schemes/search/:query` - Search schemes

### Categories & Status

- `GET /api/categories` - Get all categories
- `GET /api/application-statuses` - Get application statuses

### Applications

- `POST /api/applications` - Create new application
- `GET /api/applications/user/:userId` - Get user applications
- `PUT /api/applications/:id/status` - Update application status

### Statistics

- `GET /api/schemes/:id/stats` - Get scheme statistics

## Frontend Integration

### Include Scheme Service

```html
<script src="/js/scheme-service.js"></script>
```

### Basic Usage

```javascript
// Get all schemes
const schemes = await schemeService.getAllSchemes();

// Get scheme by ID
const scheme = await schemeService.getSchemeById('electricity-duty-reimbursement');

// Search schemes
const results = await schemeService.searchSchemes('electricity');

// Create application
const application = await schemeService.createApplication({
    scheme_id: 'electricity-duty-reimbursement',
    form_data: { /* form data */ },
    documents: []
});
```

### Eligibility Checking

```javascript
// Check eligibility for a scheme
const eligibility = await schemeService.checkEligibility('scheme-id', {
    msmeRegistration: true,
    udyamRegistration: true,
    gstRegistration: true,
    location: 'Haryana'
});

if (eligibility.eligible) {
    console.log('User is eligible!');
} else {
    console.log('Missing requirements:', eligibility.missingRequirements);
}
```

### Benefit Calculation

```javascript
// Calculate potential benefit
const benefit = schemeService.calculateBenefit(scheme, {
    annualElectricityBill: 100000,
    propertyValue: 5000000,
    connectedLoad: 100
});
```

## Database Files

- `database/schemes.db` - SQLite database file
- `database/seed-schemes.js` - Data seeding script
- `server/scheme-api.js` - API routes
- `js/scheme-service.js` - Frontend service

## Data Structure

### Scheme Data Example

```json
{
  "scheme_id": "electricity-duty-reimbursement",
  "scheme_name": "Electricity Duty Reimbursement",
  "scheme_type": "Haryana State",
  "quantum_of_assistance": "100% reimbursement of electricity duty for 7 years",
  "max_benefit_amount": 5000000,
  "benefit_percentage": null,
  "eligibility_criteria": "New industrial units in Haryana",
  "competent_authority": "Haryana State Industrial and Infrastructure Development Corporation",
  "application_deadline": "2024-12-31",
  "status": "active"
}
```

### Form Field Example

```json
{
  "field_id": 1,
  "form_id": 1,
  "field_name": "company_name",
  "field_type": "text",
  "field_label": "Company Name",
  "required": true,
  "validation_rules": {
    "min_length": 2,
    "max_length": 100
  },
  "options": null
}
```

## Security Features

- **Authentication**: JWT-based authentication required for application endpoints
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Server-side validation for all form data
- **SQL Injection Protection**: Parameterized queries
- **CORS**: Configured for secure cross-origin requests

## Performance Optimizations

- **Database Indexes**: Optimized indexes on frequently queried columns
- **Connection Pooling**: Efficient database connection management
- **Caching**: Scheme data caching for better performance
- **Pagination**: Large result sets are paginated

## Monitoring & Analytics

- **Application Tracking**: Complete application lifecycle monitoring
- **User Analytics**: Scheme popularity and usage statistics
- **Performance Metrics**: API response times and error rates
- **Document Tracking**: Upload and verification status tracking

## Future Enhancements

1. **Document Upload**: File upload functionality for required documents
2. **Email Notifications**: Application status update notifications
3. **Dashboard Analytics**: Admin dashboard with scheme statistics
4. **Bulk Operations**: Bulk application processing
5. **API Versioning**: Versioned API endpoints for backward compatibility
6. **Export Functionality**: Export applications and reports
7. **Integration APIs**: Integration with government portals

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure SQLite is installed
   - Check file permissions for database directory
   - Verify database path in configuration

2. **API Authentication Error**
   - Check JWT token in localStorage
   - Verify token expiration
   - Ensure proper Authorization header

3. **Form Validation Error**
   - Check required field values
   - Verify data types match field types
   - Review validation rules in database

### Debug Mode

Enable debug logging by setting environment variable:
```bash
DEBUG=true npm start
```

## Support

For technical support or questions about the database system, please refer to the main project documentation or create an issue in the project repository. 