/**
 * ADMIN FEATURE - Overview
 *
 * This feature provides administrative functionality for managing users:
 *  - Create new admin users via CreateUserPage
 *  - Edit existing admin users via EditUserPage
 *  - View detailed user information via UserDetailsPage
 *  - Browse all admin users via UsersPage
 *
 * Data Flow:
 *   Form â†’ Server Actions (firestoreService) â†’ Firestore
 */

export * from './pages/AdminUsersPage';
export * from './hooks/useAdmins';
export * from './types';
export * from './schemas';
