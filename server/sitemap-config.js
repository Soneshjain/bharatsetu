// Sitemap configuration: explicit per-page mapping and default folder-based rules

module.exports = {
  // Explicit page mappings (locPath → priority/changefreq)
  // Use current paths in the app after reorganization
  pageMap: {
    '/': { priority: 1.0, changefreq: 'weekly' },
    // Main pages (paths are now root-based)
    '/user-dashboard.html': { priority: 0.8, changefreq: 'weekly' },
    '/add-new-company.html': { priority: 0.7, changefreq: 'monthly' },
    '/check-eligibility.html': { priority: 0.9, changefreq: 'monthly' },

    // Haryana State Schemes
    '/schemes/haryana-electricity-duty-reimbursement-100-percent.html': { priority: 0.8, changefreq: 'monthly' },
    '/schemes/haryana-stamp-duty-refund-on-land-purchase-or-lease.html': { priority: 0.8, changefreq: 'monthly' },
    '/schemes/haryana-power-tariff-subsidy-micro-small.html': { priority: 0.8, changefreq: 'monthly' },
    '/schemes/haryana-padma-cluster-development.html': { priority: 0.7, changefreq: 'monthly' },
    '/schemes/haryana-startup-policy-benefits.html': { priority: 0.7, changefreq: 'monthly' },

    // National MSME Schemes
    '/schemes/national-testing-and-measuring-equipment-subsidy.html': { priority: 0.7, changefreq: 'monthly' },
    '/schemes/national-zero-defect-production-quality-certification-support.html': { priority: 0.7, changefreq: 'monthly' },
    '/schemes/national-technology-adoption-support-up-to-1cr.html': { priority: 0.7, changefreq: 'monthly' },
    '/schemes/national-quality-certifications-multiple-up-to-6l.html': { priority: 0.7, changefreq: 'monthly' },
    '/schemes/national-productivity-improvement-lean-tools-support.html': { priority: 0.7, changefreq: 'monthly' },
    '/schemes/national-barcode-implementation-support-up-to-80-percent.html': { priority: 0.7, changefreq: 'monthly' },
    '/schemes/national-patent-filing-support-domestic-international.html': { priority: 0.7, changefreq: 'monthly' },
    '/schemes/national-design-centre-establishment-support-up-to-40l.html': { priority: 0.7, changefreq: 'monthly' },
    '/schemes/national-exhibition-support-domestic-and-foreign.html': { priority: 0.7, changefreq: 'monthly' },
    '/schemes/national-sme-exchange-support.html': { priority: 0.7, changefreq: 'monthly' },
  },

  // Default fallbacks by path pattern (first match wins)
  defaultRules: [
    { pattern: /^\/$/, priority: 1.0, changefreq: 'weekly' },
    { pattern: /^\/user-dashboard\.html$/, priority: 0.8, changefreq: 'weekly' },
    { pattern: /^\/check-eligibility\.html$/, priority: 0.9, changefreq: 'monthly' },
    { pattern: /^\/add-new-company\.html$/, priority: 0.7, changefreq: 'monthly' },
    { pattern: /^\/schemes\/haryana-electricity-duty-reimbursement/, priority: 0.8, changefreq: 'monthly' },
    { pattern: /^\/schemes\/haryana-stamp-duty-refund/, priority: 0.8, changefreq: 'monthly' },
    { pattern: /^\/schemes\/haryana-power-tariff-subsidy/, priority: 0.8, changefreq: 'monthly' },
    { pattern: /^\/schemes\/haryana-/, priority: 0.7, changefreq: 'monthly' },
    { pattern: /^\/schemes\/national-/, priority: 0.7, changefreq: 'monthly' },
    { pattern: /.*/, priority: 0.5, changefreq: 'monthly' },
  ],
};


