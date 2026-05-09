import { supabase } from '../lib/supabaseClient'

/**
 * adminService.js
 *
 * Service layer for the Admin Module (Adm_Mod).
 * All three functions are SUPERADMIN-only operations; the RLS policies
 * on the `user` table enforce this at the database level as well.
 *
 * RULE: No hard deletes. Deactivation sets record_status = 'INACTIVE'.
 * RULE: SUPERADMIN rows are never touched — guarded here AND in RLS.
 *
 * Stamp format: "<ACTION> <userId> <ISO timestamp>"
 * e.g. "DEACTIVATED user3 2025-09-01T10:22:00.000Z"
 */

function makeStamp(action, byUserId) {
  return `${action} ${byUserId} ${new Date().toISOString()}`
}

/**
 * Fetch all users.
 * Returns every row from the `user` table including SUPERADMIN rows
 * (so the UI can render them as disabled/locked).
 * Columns: userId, username, firstname, lastname, email, user_type, record_status
 */
export async function getUsers() {
  const { data, error } = await supabase
    .from('user')
    .select('userId, username, firstname, lastname, email, user_type, record_status')
    .order('user_type', { ascending: true })
    .order('username', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Activate a user account (set record_status = 'ACTIVE').
 *
 * @param {string} targetUserId  - userId of the account to activate
 * @param {string} byUserId      - userId of the SUPERADMIN performing the action (for stamp)
 * @throws if the target is a SUPERADMIN row (guard at service layer before DB call)
 * @throws if Supabase returns an error
 */
export async function activateUser(targetUserId, byUserId, targetUserType) {
  if (targetUserType === 'SUPERADMIN') {
    throw new Error('SUPERADMIN accounts cannot be modified.')
  }

  const { error } = await supabase
    .from('user')
    .update({
      record_status: 'ACTIVE',
      stamp: makeStamp('ACTIVATED', byUserId),
    })
    .eq('userId', targetUserId)
    .neq('user_type', 'SUPERADMIN') // belt-and-suspenders; RLS is the real guard

  if (error) throw error
}

/**
 * Deactivate a user account (set record_status = 'INACTIVE').
 * This is a soft-deactivation — the user row is never deleted.
 * A deactivated user cannot log in (login guard checks record_status).
 *
 * @param {string} targetUserId    - userId of the account to deactivate
 * @param {string} byUserId        - userId of the SUPERADMIN performing the action
 * @param {string} targetUserType  - user_type of the target (guard check)
 * @throws if the target is a SUPERADMIN row
 */
export async function deactivateUser(targetUserId, byUserId, targetUserType) {
  if (targetUserType === 'SUPERADMIN') {
    throw new Error('SUPERADMIN accounts cannot be modified.')
  }

  const { error } = await supabase
    .from('user')
    .update({
      record_status: 'INACTIVE',
      stamp: makeStamp('DEACTIVATED', byUserId),
    })
    .eq('userId', targetUserId)
    .neq('user_type', 'SUPERADMIN')

  if (error) throw error
}