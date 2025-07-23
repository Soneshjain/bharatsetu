# BharatSetu Design System Documentation

## 🎨 **Complete CSS Architecture & Design System**

### **Overview**
BharatSetu now uses a comprehensive design system with CSS variables, standardized components, and a modular architecture that ensures consistency across the entire website.

---

## **📁 File Structure**

### **1. `base.css` - Design System Foundation**
**Purpose**: Complete design system with CSS variables, standardized components, and utility classes.
**Contents**:
- **CSS Variables (Design Tokens)**: Colors, typography, spacing, shadows, transitions
- **Typography System**: Manrope for headings, Cambay for body text
- **Button System**: Primary, secondary, success, warning, error, ghost variants
- **Form System**: Standardized inputs, validation, error handling
- **Component System**: Cards, alerts, badges
- **Utility Classes**: Display, spacing, typography, colors
- **Responsive Utilities**: Mobile-first responsive design

### **2. `main.css` - Homepage Specific Styles**
**Purpose**: Homepage-specific styles using the design system variables.
**Contents**:
- **Layout & Container**: Grid systems and responsive containers
- **Navbar**: Transparent/scrolled states, mobile menu
- **Hero Section**: Gradient backgrounds, animations
- **Sections**: Problems, consultants, schemes
- **Footer**: Responsive footer layout
- **Mobile Responsive**: Comprehensive mobile optimizations

### **3. Page-Specific CSS Files**
**Purpose**: Styles specific to individual pages or components.
**Files**:
- `eligibility-questionnaire.css` - Eligibility checker styles
- `auth.css` - Authentication pages
- `auth-flow.css` - Auth flow styles
- `company-form.css` - Company registration forms
- `dashboard.css` - Dashboard styles
- `profile.css` - User profile styles
- `scheme-detail.css` - Individual scheme pages

---

## **🎯 Design System Components**

### **CSS Variables (Design Tokens)**
```css
:root {
    /* Colors */
    --primary-blue: #1fa2ff;
    --primary-blue-dark: #0fd9d6;
    --gray-50: #f9fafb;
    --gray-900: #111827;
    
    /* Typography */
    --font-primary: 'Manrope', sans-serif;
    --font-secondary: 'Cambay', sans-serif;
    --text-base: 1rem;
    --font-bold: 700;
    
    /* Spacing */
    --space-4: 1rem;
    --space-6: 1.5rem;
    
    /* Shadows */
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    
    /* Transitions */
    --transition-normal: 300ms ease-in-out;
}
```

### **Typography System**
- **Headings**: Manrope font, bold weights (800-900)
- **Body Text**: Cambay font, normal weights (300-400)
- **Consistent Sizing**: 21px grid system
- **Responsive**: Mobile-optimized font sizes

### **Button System**
```css
.btn {
    /* Base button styles */
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius-lg);
    font-family: var(--font-primary);
    font-weight: var(--font-semibold);
    transition: all var(--transition-normal);
}

.btn--primary {
    background: var(--gradient-primary);
    color: var(--white);
}

.btn--secondary {
    background: rgba(255, 255, 255, 0.1);
    color: var(--white);
    backdrop-filter: blur(10px);
}
```

### **Form System**
```css
.form__input,
.form__textarea,
.form__select {
    width: 100%;
    padding: var(--space-3) var(--space-4);
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-lg);
    font-family: var(--font-secondary);
    transition: all var(--transition-fast);
}

.form__input:focus {
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 3px rgba(31, 162, 255, 0.1);
}

.form__error {
    color: var(--error);
    font-size: var(--text-sm);
    margin-top: var(--space-1);
}
```

---

## **📱 Responsive Design System**

### **Breakpoints**
- **Mobile**: `max-width: 768px`
- **Tablet**: `min-width: 769px` and `max-width: 1024px`
- **Desktop**: `min-width: 1025px`

### **Mobile-First Approach**
```css
/* Base styles (mobile) */
.btn {
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-sm);
}

/* Desktop styles */
@media (min-width: 768px) {
    .btn {
        padding: var(--space-3) var(--space-6);
        font-size: var(--text-base);
    }
}
```

---

## **🔧 CSS Loading Order**
```html
<!-- 1. Design System (Foundation) -->
<link rel="stylesheet" href="css/base.css">

<!-- 2. Page-Specific CSS (Overrides) -->
<link rel="stylesheet" href="css/main.css">
<link rel="stylesheet" href="css/eligibility-questionnaire.css">
<!-- ... other page-specific files -->
```

---

## **✅ Design System Rules**

### **DO:**
1. **Use CSS Variables**: Always use design tokens for colors, spacing, fonts
2. **Follow Typography Hierarchy**: Use defined heading sizes and weights
3. **Maintain Consistency**: Use standardized button and form styles
4. **Mobile-First**: Write mobile styles first, then enhance for desktop
5. **Use Utility Classes**: Leverage existing utility classes for common patterns
6. **Document Changes**: Update this README when adding new components

### **DON'T:**
1. **Hardcode Values**: Never use hardcoded colors, fonts, or spacing
2. **Override Base Styles**: Don't redefine `.btn`, `.form__input` in page-specific files
3. **Use !important**: Use more specific selectors instead
4. **Create Inconsistent Components**: Always follow the design system patterns
5. **Forget Mobile**: Always include mobile responsive styles
6. **Duplicate Styles**: Check existing styles before adding new ones

---

## **🎨 Color System**

### **Primary Colors**
- **Primary Blue**: `#1fa2ff` - Main brand color
- **Primary Blue Dark**: `#0fd9d6` - Hover states
- **Secondary Blue**: `#3182ce` - Secondary actions

### **Neutral Colors**
- **Gray Scale**: `--gray-50` to `--gray-900` for text and backgrounds
- **White**: `#ffffff` for backgrounds and text on dark surfaces

### **Semantic Colors**
- **Success**: `#10b981` - Positive actions
- **Warning**: `#f59e0b` - Caution states
- **Error**: `#ef4444` - Error states
- **Info**: `#3b82f6` - Information states

---

## **📐 Spacing System**

### **Base Unit**: 4px (0.25rem)
- **Space 1**: 4px
- **Space 2**: 8px
- **Space 3**: 12px
- **Space 4**: 16px
- **Space 6**: 24px
- **Space 8**: 32px
- **Space 12**: 48px
- **Space 16**: 64px

---

## **🔤 Typography System**

### **Font Families**
- **Primary**: Manrope (Headings, Buttons, UI Elements)
- **Secondary**: Cambay (Body Text, Forms, Content)

### **Font Sizes**
- **Text XS**: 12px (0.75rem)
- **Text SM**: 14px (0.875rem)
- **Text Base**: 16px (1rem)
- **Text LG**: 18px (1.125rem)
- **Text XL**: 20px (1.25rem)
- **Text 2XL**: 24px (1.5rem)
- **Text 3XL**: 30px (1.875rem)
- **Text 4XL**: 36px (2.25rem)
- **Text 5XL**: 48px (3rem)
- **Text 6XL**: 60px (3.75rem)

### **Font Weights**
- **Light**: 300
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700
- **Extrabold**: 800
- **Black**: 900

---

## **🎯 Component Guidelines**

### **Adding New Components**
1. **Check Existing**: Look for similar components in the design system
2. **Use Variables**: Use CSS variables for all values
3. **Follow Patterns**: Match existing component structure
4. **Include Responsive**: Add mobile styles
5. **Document**: Update this README with new components

### **Component Structure**
```css
.component {
    /* Layout */
    display: flex;
    align-items: center;
    gap: var(--space-4);
    
    /* Spacing */
    padding: var(--space-6);
    margin-bottom: var(--space-6);
    
    /* Typography */
    font-family: var(--font-primary);
    font-size: var(--text-base);
    font-weight: var(--font-semibold);
    
    /* Colors */
    color: var(--gray-900);
    background: var(--white);
    
    /* Effects */
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    transition: all var(--transition-normal);
}

.component:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}
```

---

## **🚀 Performance Optimizations**

### **CSS Optimization**
- **Minified**: All CSS files are minified for production
- **Critical CSS**: Inline critical styles for above-the-fold content
- **Lazy Loading**: Non-critical CSS loaded asynchronously
- **Tree Shaking**: Remove unused CSS in production

### **Best Practices**
- **Specificity**: Use specific selectors to avoid conflicts
- **Efficiency**: Minimize CSS selector complexity
- **Maintainability**: Use BEM methodology for class naming
- **Performance**: Avoid expensive CSS properties (box-shadow, filter)

---

## **🔍 Troubleshooting**

### **Common Issues**

#### **Styles Not Applying**
1. Check CSS loading order (base.css must load first)
2. Verify CSS variable names are correct
3. Check for conflicting selectors
4. Ensure proper specificity

#### **Mobile Styles Not Working**
1. Verify media query syntax
2. Check viewport meta tag
3. Ensure mobile-first approach
4. Test on actual devices

#### **Performance Issues**
1. Minimize CSS file size
2. Use efficient selectors
3. Avoid expensive properties
4. Implement critical CSS

### **Debugging Tools**
- **Browser DevTools**: Inspect element styles
- **CSS Validator**: Check for syntax errors
- **Performance Profiler**: Monitor CSS performance
- **Mobile Testing**: Test on various devices

---

## **📚 Maintenance**

### **Regular Tasks**
- **Monthly Audits**: Check for duplicate or unused styles
- **Performance Reviews**: Monitor CSS file sizes and loading times
- **Accessibility Checks**: Ensure proper contrast ratios and focus states
- **Cross-Browser Testing**: Verify compatibility across browsers

### **Documentation Updates**
- **New Components**: Document when adding new design system components
- **Variable Changes**: Update when modifying CSS variables
- **Breaking Changes**: Document any breaking changes to the design system

---

## **🎉 Benefits of This System**

### **Consistency**
- **Unified Design**: All components follow the same design language
- **Predictable Behavior**: Standardized interactions and animations
- **Brand Cohesion**: Consistent color and typography usage

### **Efficiency**
- **Rapid Development**: Reusable components and utilities
- **Reduced Maintenance**: Centralized design tokens
- **Better Performance**: Optimized CSS structure

### **Scalability**
- **Easy Expansion**: Simple to add new components
- **Team Collaboration**: Clear guidelines for developers
- **Future-Proof**: Flexible system that grows with the project

---

## **📞 Support**

For questions about the design system:
1. Check this documentation first
2. Review existing components for patterns
3. Consult the CSS variables in `base.css`
4. Test changes across different screen sizes

**Remember**: The design system is the foundation of BharatSetu's visual identity. Always follow these guidelines to maintain consistency and quality across the entire website. 