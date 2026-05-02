/**
 * navItems.js
 *
 * Single source of truth for sidebar navigation.
 *
 * allowedRoles: null  → visible to everyone (USER, ADMIN, SUPERADMIN)
 * allowedRoles: [...] → visible only when userRole is in the array
 *
 * The placeholder flag is removed from Deleted Items now that
 * the page is implemented (PR-04). Visibility is role-gated instead.
 */

export const navItems = [
  {
    label: 'Employees',
    path: '/employees',
    allowedRoles: null, // all roles
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142 3.999 3.999 0 1 1 5.123 0ZM10.5 5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z" />
      </svg>
    ),
  },
  {
    label: 'Job History',
    path: '/jobhistory',
    allowedRoles: null, // all roles
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25v-8.5C0 2.784.784 2 1.75 2ZM1.5 12.251c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V5.809L8.38 9.397a.75.75 0 0 1-.76 0L1.5 5.809v6.442Zm13-8.181v-.32a.25.25 0 0 0-.25-.25H1.75a.25.25 0 0 0-.25.25v.32L8 7.88Z" />
      </svg>
    ),
  },
  {
    label: 'Jobs',
    path: '/jobs',
    allowedRoles: ['ADMIN', 'SUPERADMIN'], // page-level guard is ADMIN+ (PR-03)
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.75A1.75 1.75 0 0 0 0 4.75v8.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H11v-.5A1.5 1.5 0 0 0 9.5 1h-3Zm0 1.5h3a.5.5 0 0 1 0 1H6.5a.5.5 0 0 1 0-1ZM1.75 4.5h12.5a.25.25 0 0 1 .25.25v3.002a14.98 14.98 0 0 1-7.996 2.304A14.98 14.98 0 0 1 1.5 7.752V4.75a.25.25 0 0 1 .25-.25Zm6.24 5.309A16.504 16.504 0 0 0 14.5 7.706v5.544a.25.25 0 0 1-.25.25H1.75a.25.25 0 0 1-.25-.25V7.706a16.474 16.474 0 0 0 6.49 2.103Z" />
      </svg>
    ),
  },
  {
    label: 'Departments',
    path: '/departments',
    allowedRoles: ['ADMIN', 'SUPERADMIN'], // DEPT_ADD/DEPT_EDIT are ADMIN+ actions
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1.5 14.25c0 .138.112.25.25.25H4v-1.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.25h2.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25v12.5ZM14 4.5h-2.25V3.75A1.75 1.75 0 0 0 10 2H2A1.75 1.75 0 0 0 .25 3.75v10.5c0 .966.784 1.75 1.75 1.75h11.5A1.75 1.75 0 0 0 15.25 14.25V6.25A1.75 1.75 0 0 0 13.5 4.5ZM13.75 14.25a.25.25 0 0 1-.25.25H11v-1.25a.75.75 0 0 0-.75-.75h-2.5a.75.75 0 0 0-.75.75v1.25H4v-4.5h9.75v4.5ZM4 8h1.5v1.5H4V8Zm4.25 0H9.5v1.5H8.25V8ZM4 5h1.5v1.5H4V5Zm4.25 0H9.5v1.5H8.25V5Z" />
      </svg>
    ),
  },
  {
    label: 'Admin',
    path: '/admin',
    allowedRoles: ['ADMIN', 'SUPERADMIN'],
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm4.879-2.773 4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215Z" />
      </svg>
    ),
  },
  {
    label: 'Deleted Items',
    path: '/deleted-items',
    allowedRoles: ['ADMIN', 'SUPERADMIN'],
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.576l-.66-6.6a.75.75 0 1 1 1.492-.149ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z" />
      </svg>
    ),
  },
]