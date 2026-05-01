import { supabase } from '../lib/supabaseClient'

// GET — query the view to include current job data
// RLS enforces ACTIVE-only for USER; service filter is belt-and-suspenders
export async function getEmployees(userType) {
  let query = supabase
    .from('employee_current_job')
    .select('*')

  if (userType === 'USER') {
    query = query.eq('record_status', 'ACTIVE')
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// ADD
export async function addEmployee(employeeData, currentUser) {
  const { data, error } = await supabase
    .from('employee')
    .insert([{
      ...employeeData,
      record_status: 'ACTIVE',
      stamp: `Added by ${currentUser.email} on ${new Date().toISOString()}`
    }])
    .select()

  if (error) throw error
  return data
}

// UPDATE
export async function updateEmployee(empno, updates, currentUser) {
  const { data, error } = await supabase
    .from('employee')
    .update({
      ...updates,
      stamp: `Edited by ${currentUser.email} on ${new Date().toISOString()}`
    })
    .eq('empno', empno)
    .select()

  if (error) throw error
  return data
}

// SOFT DELETE — cascade to jobHistory is handled by DB trigger (M3 PR-03)
export async function softDeleteEmployee(empno, currentUser) {
  const { data, error } = await supabase
    .from('employee')
    .update({
      record_status: 'INACTIVE',
      stamp: `Deleted by ${currentUser.email} on ${new Date().toISOString()}`
    })
    .eq('empno', empno)
    .select()

  if (error) throw error
  return data
}

// RECOVER — cascade restore to jobHistory is handled by DB trigger (M3 PR-03)
export async function recoverEmployee(empno, currentUser) {
  const { data, error } = await supabase
    .from('employee')
    .update({
      record_status: 'ACTIVE',
      stamp: `Recovered by ${currentUser.email} on ${new Date().toISOString()}`
    })
    .eq('empno', empno)
    .select()

  if (error) throw error
  return data
}