import { supabase } from '../lib/supabaseClient'

// GET — USER sees only ACTIVE, ADMIN/SUPERADMIN sees all
export async function getEmployees(userType) {
  let query = supabase
    .from('employee')
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
  if (error) throw error
  return data
}

// SOFT DELETE — also cascades to jobHistory
export async function softDeleteEmployee(empno, currentUser) {
  const stamp = `Deleted by ${currentUser.email} on ${new Date().toISOString()}`

  // Cascade: set all jobHistory rows for this employee to INACTIVE
  const { error: jhError } = await supabase
    .from('jobHistory')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('empNo', empno)
  if (jhError) throw jhError

  // Then soft delete the employee
  const { data, error } = await supabase
    .from('employee')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('empno', empno)
  if (error) throw error
  return data
}

// RECOVER — also cascades jobHistory back to ACTIVE
export async function recoverEmployee(empno, currentUser) {
  const stamp = `Recovered by ${currentUser.email} on ${new Date().toISOString()}`

  // Cascade restore: set all jobHistory rows for this employee back to ACTIVE
  const { error: jhError } = await supabase
    .from('jobHistory')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('empNo', empno)
  if (jhError) throw jhError

  // Then recover the employee
  const { data, error } = await supabase
    .from('employee')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('empno', empno)
  if (error) throw error
  return data
}