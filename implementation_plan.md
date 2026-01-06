# Implementation Plan - Premium Login/Signup Homepage

## Goal
Create a visually stunning, premium quality login/signup homepage using HTML, Vanilla CSS, and JavaScript. The design will focus on modern aesthetics like glassmorphism, smooth transitions, and a vibrant color palette.

## Technology Stack
- **HTML5**: Semantic structure.
- **CSS3**: Vanilla CSS with Flexbox/Grid, CSS Variables, and Animations.
- **JavaScript**: Minimal DOM manipulation for toggling between Login and Signup states.

## Design Specification
- **Background**: Rich, dynamic gradient or generated abstract background.
- **Card Style**: Glassmorphism (backdrop-filter: blur) with subtle borders and shadows.
- **Typography**: 'Poppins' and 'Inter' from Google Fonts for a clean, modern look.
- **Interactions**:
    - Smooth sway/slide transitions between Login and Signup modes.
    - Hover effects on inputs and buttons.
    - Floating background elements (orbs/shapes).

## File Structure
- `index.html`: Main structure.
- `dashboard.html`: Main application interface (SPA style).
- `styles.css`: Styles for the Landing/Auth page.
- `dashboard.css`: Styles for the Dashboard application.
- `script.js`: Logic for form toggling and Auth redirection.
- `app.js`: Core application logic (Routing, Data Management, UI updates).

## Step-by-Step Implementation

### Phase 1: Authentication (Completed)
1.  **Setup**: Create empty files.
2.  **HTML Structure**: Build the containers for the forms (Login and Signup). Include SEO meta tags.
3.  **Styling (Foundation)**: Define CSS variables (colors, fonts). Reset styles.
4.  **Styling (Layout & Glassmorphism)**: specific styles for the central container and background.
5.  **Styling (Components)**: Inputs, Buttons, Links (Terms, Privacy).
6.  **Interactivity**: JS methods to toggle `active` classes for switching forms.
7.  **Refinement**: precise animations and responsive checks.

### Phase 2: User Dashboard Application
1.  **Dashboard Skeleton (`dashboard.html`)**:
    - Sidebar Navigation (Overview, Income, Expenses, Reports, Settings, Logout).
    - Main Content Area (Dynamic Sections).
    - Mobile Responsive Toggle.
2.  **Dashboard Styling (`dashboard.css`)**:
    - Consistent Glassmorphism theme.
    - Card Layouts for stats (Total Income, Expense, Balance).
    - Data Tables for logs.
    - Modal Styles for "Add Transaction" forms.
3.  **Core Logic (`app.js`)**:
    - **State Management**: Use `localStorage` to save transactions and user settings.
    - **Navigation**: Function to switch active views (Overview vs Income vs Reports) without reloading.
    - **Data Operations**: `addTransaction()`, `deleteTransaction()`, `calculateStats()`.
    - **Charts**: Integration with Chart.js for visual reports.
4.  **Feature Implementation**:
    - **Overview**: Display summary cards and Recent Transactions list.
    - **Income/Expense**: Forms to add data, List view with Delete option.
    - **Reports**: Canvas elements for charts. Download Report button implementation (mock/csv).
    - **Settings**: Profile form and helpers.
    - **Logout**: clear session (simulated) and redirect to `index.html`.
