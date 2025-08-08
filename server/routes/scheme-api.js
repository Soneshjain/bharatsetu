const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();

// Database connection
const dbPath = path.join(__dirname, '../database/schemes.db');
const db = new sqlite3.Database(dbPath);

// Helper function to run queries
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Database query error:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Helper function to run single row queries
function queryOne(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                console.error('Database query error:', err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// Helper function to run insert/update queries
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                console.error('Database run error:', err);
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
}

// 1. Get all schemes (mounted at /api/schemes)
router.get('/', async (req, res) => {
    try {
        const schemes = await query(`
            SELECT 
                s.*,
                GROUP_CONCAT(DISTINCT scm.category_id) as categories
            FROM schemes s
            LEFT JOIN scheme_category_mapping scm ON s.scheme_id = scm.scheme_id
            GROUP BY s.scheme_id
            ORDER BY s.scheme_type, s.scheme_name
        `);

        // Parse eligibility criteria JSON
        const formattedSchemes = schemes.map(scheme => ({
            ...scheme,
            eligibility_criteria: JSON.parse(scheme.eligibility_criteria),
            categories: scheme.categories ? scheme.categories.split(',') : []
        }));

        res.json({
            success: true,
            data: formattedSchemes
        });
    } catch (error) {
        console.error('Error fetching schemes:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch schemes'
        });
    }
});

// 2. Get scheme statistics (define before :schemeId to avoid shadowing)
router.get('/:schemeId/stats', async (req, res) => {
    try {
        const { schemeId } = req.params;

        const stats = await queryOne(`
            SELECT 
                COUNT(*) as total_applications,
                COUNT(CASE WHEN status_id = 'approved' THEN 1 END) as approved_applications,
                COUNT(CASE WHEN status_id = 'rejected' THEN 1 END) as rejected_applications,
                COUNT(CASE WHEN status_id = 'under_review' THEN 1 END) as pending_applications
            FROM user_applications 
            WHERE scheme_id = ?
        `, [schemeId]);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching scheme statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch scheme statistics'
        });
    }
});

// 3. Get scheme by ID
router.get('/:schemeId', async (req, res) => {
    try {
        const { schemeId } = req.params;

        // Get scheme details
        const scheme = await queryOne(`
            SELECT 
                s.*,
                GROUP_CONCAT(DISTINCT scm.category_id) as categories
            FROM schemes s
            LEFT JOIN scheme_category_mapping scm ON s.scheme_id = scm.scheme_id
            WHERE s.scheme_id = ?
            GROUP BY s.scheme_id
        `, [schemeId]);

        if (!scheme) {
            return res.status(404).json({
                success: false,
                error: 'Scheme not found'
            });
        }

        // Get required documents
        const documents = await query(`
            SELECT * FROM required_documents 
            WHERE scheme_id = ? 
            ORDER BY mandatory DESC, document_name
        `, [schemeId]);

        // Get forms
        const forms = await query(`
            SELECT * FROM forms 
            WHERE scheme_id = ? 
            ORDER BY form_type, form_name
        `, [schemeId]);

        // Get form fields for each form
        const formsWithFields = await Promise.all(forms.map(async (form) => {
            const fields = await query(`
                SELECT * FROM form_fields 
                WHERE form_id = ? 
                ORDER BY field_order, field_name
            `, [form.form_id]);

            return {
                ...form,
                fields: fields.map(field => ({
                    ...field,
                    options: field.options ? JSON.parse(field.options) : null,
                    validation_rules: field.validation_rules ? JSON.parse(field.validation_rules) : null
                }))
            };
        }));

        // Parse eligibility criteria JSON
        const formattedScheme = {
            ...scheme,
            eligibility_criteria: JSON.parse(scheme.eligibility_criteria),
            categories: scheme.categories ? scheme.categories.split(',') : [],
            required_documents: documents,
            forms: formsWithFields
        };

        res.json({
            success: true,
            data: formattedScheme
        });
    } catch (error) {
        console.error('Error fetching scheme:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch scheme'
        });
    }
});

// 4. Get schemes by type
router.get('/type/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const schemes = await query(`
            SELECT 
                s.*,
                GROUP_CONCAT(DISTINCT scm.category_id) as categories
            FROM schemes s
            LEFT JOIN scheme_category_mapping scm ON s.scheme_id = scm.scheme_id
            WHERE s.scheme_type = ?
            GROUP BY s.scheme_id
            ORDER BY s.scheme_name
        `, [type]);

        const formattedSchemes = schemes.map(scheme => ({
            ...scheme,
            eligibility_criteria: JSON.parse(scheme.eligibility_criteria),
            categories: scheme.categories ? scheme.categories.split(',') : []
        }));

        res.json({
            success: true,
            data: formattedSchemes
        });
    } catch (error) {
        console.error('Error fetching schemes by type:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch schemes'
        });
    }
});

// 5. Get schemes by category
router.get('/category/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const schemes = await query(`
            SELECT 
                s.*,
                GROUP_CONCAT(DISTINCT scm.category_id) as categories
            FROM schemes s
            INNER JOIN scheme_category_mapping scm ON s.scheme_id = scm.scheme_id
            WHERE scm.category_id = ?
            GROUP BY s.scheme_id
            ORDER BY s.scheme_name
        `, [categoryId]);

        const formattedSchemes = schemes.map(scheme => ({
            ...scheme,
            eligibility_criteria: JSON.parse(scheme.eligibility_criteria),
            categories: scheme.categories ? scheme.categories.split(',') : []
        }));

        res.json({
            success: true,
            data: formattedSchemes
        });
    } catch (error) {
        console.error('Error fetching schemes by category:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch schemes'
        });
    }
});

// 6. Get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await query(`
            SELECT 
                c.*,
                COUNT(scm.scheme_id) as scheme_count
            FROM scheme_categories c
            LEFT JOIN scheme_category_mapping scm ON c.category_id = scm.category_id
            GROUP BY c.category_id
            ORDER BY c.parent_category_id, c.category_name
        `);

        // Organize into hierarchy
        const categoryMap = {};
        const rootCategories = [];

        categories.forEach(category => {
            categoryMap[category.category_id] = {
                ...category,
                children: []
            };
        });

        categories.forEach(category => {
            if (category.parent_category_id && categoryMap[category.parent_category_id]) {
                categoryMap[category.parent_category_id].children.push(categoryMap[category.category_id]);
            } else {
                rootCategories.push(categoryMap[category.category_id]);
            }
        });

        res.json({
            success: true,
            data: rootCategories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories'
        });
    }
});

// 7. Search schemes
router.get('/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const searchTerm = `%${query}%`;

        const schemes = await query(`
            SELECT 
                s.*,
                GROUP_CONCAT(DISTINCT scm.category_id) as categories
            FROM schemes s
            LEFT JOIN scheme_category_mapping scm ON s.scheme_id = scm.scheme_id
            WHERE s.scheme_name LIKE ? 
               OR s.objective LIKE ? 
               OR s.quantum_of_assistance LIKE ?
            GROUP BY s.scheme_id
            ORDER BY s.scheme_type, s.scheme_name
        `, [searchTerm, searchTerm, searchTerm]);

        const formattedSchemes = schemes.map(scheme => ({
            ...scheme,
            eligibility_criteria: JSON.parse(scheme.eligibility_criteria),
            categories: scheme.categories ? scheme.categories.split(',') : []
        }));

        res.json({
            success: true,
            data: formattedSchemes
        });
    } catch (error) {
        console.error('Error searching schemes:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search schemes'
        });
    }
});

// 8. Get application statuses
router.get('/application-statuses', async (req, res) => {
    try {
        const statuses = await query(`
            SELECT * FROM application_status 
            WHERE is_active = 1 
            ORDER BY status_name
        `);

        res.json({
            success: true,
            data: statuses
        });
    } catch (error) {
        console.error('Error fetching application statuses:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch application statuses'
        });
    }
});

// 9. Create user application
router.post('/applications', async (req, res) => {
    try {
        const { user_id, scheme_id, company_id, application_data } = req.body;

        // Validate required fields
        if (!user_id || !scheme_id || !company_id) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Create application
        const result = await run(`
            INSERT INTO user_applications (
                application_id, user_id, scheme_id, company_id, status_id, application_data
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
            `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user_id,
            scheme_id,
            company_id,
            'draft',
            JSON.stringify(application_data)
        ]);

        res.json({
            success: true,
            data: {
                application_id: result.id,
                message: 'Application created successfully'
            }
        });
    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create application'
        });
    }
});

// 10. Get user applications
router.get('/applications/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const applications = await query(`
            SELECT 
                ua.*,
                s.scheme_name,
                s.scheme_type,
                ast.status_name,
                ast.color_code
            FROM user_applications ua
            INNER JOIN schemes s ON ua.scheme_id = s.scheme_id
            INNER JOIN application_status ast ON ua.status_id = ast.status_id
            WHERE ua.user_id = ?
            ORDER BY ua.submitted_at DESC
        `, [userId]);

        const formattedApplications = applications.map(app => ({
            ...app,
            application_data: app.application_data ? JSON.parse(app.application_data) : {}
        }));

        res.json({
            success: true,
            data: formattedApplications
        });
    } catch (error) {
        console.error('Error fetching user applications:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch applications'
        });
    }
});

// 11. Update application status
router.put('/applications/:applicationId/status', async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status_id } = req.body;

        if (!status_id) {
            return res.status(400).json({
                success: false,
                error: 'Status ID is required'
            });
        }

        await run(`
            UPDATE user_applications 
            SET status_id = ?, updated_at = CURRENT_TIMESTAMP
            WHERE application_id = ?
        `, [status_id, applicationId]);

        res.json({
            success: true,
            message: 'Application status updated successfully'
        });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update application status'
        });
    }
});

// (stats route moved above)

module.exports = router; 