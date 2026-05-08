// Admin Module API — Sprint 3, M1 PR-01
// Handles user management for ADMIN and SUPERADMIN.
// RULE: No operation (activate, deactivate, rights edit) may target a SUPERADMIN row.
//       Enforced at both the service layer (guard clause) and at the DB layer (RLS).

import { supabase } from '../supabaseClient';
import { makeStamp } from '../utils/stamp';

/**
 * Fetch all users for the User Management page.
 * Returns all columns except password-related fields.
 * SUPERADMIN rows are included in the list so they can be displayed
 * (with buttons disabled in the UI by M4), but no mutations are allowed on them.
 *
 * @returns {Promise<Array>} Array of user rows ordered by user_type then username.
 */
export async function getUsers() {
  const { data, error } = await supabase
    .from('user')
    .select('userId, username, firstName, lastName, email, user_type, record_status, stamp')
    .order('user_type')
    .order('username');

  if (error) {
    console.error('[adminService] getUsers error:', error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Activate a user account (set record_status = 'ACTIVE').
 * Blocked if the target user is a SUPERADMIN — returns an error object.
 *
 * @param {string} targetUserId - userId of the account to activate.
 * @param {string} actorUserId  - userId of the ADMIN/SUPERADMIN performing the action.
 * @returns {Promise<{error: string|null}>}
 */
export async function activateUser(targetUserId, actorUserId) {
  // --- Service-layer SUPERADMIN guard ---
  const { data: targetRow, error: fetchError } = await supabase
    .from('user')
    .select('user_type')
    .eq('userId', targetUserId)
    .single();

  if (fetchError) {
    console.error('[adminService] activateUser fetch error:', fetchError.message);
    return { error: fetchError.message };
  }

  if (targetRow?.user_type === 'SUPERADMIN') {
    return { error: 'SUPERADMIN accounts cannot be modified.' };
  }
  // --- End guard ---

  const stamp = makeStamp('ACTIVATED', actorUserId);

  const { error } = await supabase
    .from('user')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('userId', targetUserId);

  if (error) {
    console.error('[adminService] activateUser update error:', error.message);
  }

  return { error: error?.message ?? null };
}

/**
 * Deactivate a user account (set record_status = 'INACTIVE').
 * Blocked if the target user is a SUPERADMIN — returns an error object.
 *
 * @param {string} targetUserId - userId of the account to deactivate.
 * @param {string} actorUserId  - userId of the ADMIN/SUPERADMIN performing the action.
 * @returns {Promise<{error: string|null}>}
 */
export async function deactivateUser(targetUserId, actorUserId) {
  // --- Service-layer SUPERADMIN guard ---
  const { data: targetRow, error: fetchError } = await supabase
    .from('user')
    .select('user_type')
    .eq('userId', targetUserId)
    .single();

  if (fetchError) {
    console.error('[adminService] deactivateUser fetch error:', fetchError.message);
    return { error: fetchError.message };
  }

  if (targetRow?.user_type === 'SUPERADMIN') {
    return { error: 'SUPERADMIN accounts cannot be modified.' };
  }
  // --- End guard ---

  const stamp = makeStamp('DEACTIVATED', actorUserId);

  const { error } = await supabase
    .from('user')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('userId', targetUserId);

  if (error) {
    console.error('[adminService] deactivateUser update error:', error.message);
  }

  return { error: error?.message ?? null };
}