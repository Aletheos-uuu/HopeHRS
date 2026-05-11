import { supabase } from '../lib/supabaseClient'

// GET — query the view to include current job data
// RLS enforces ACTIVE-only for USER; service filter is belt-and-suspenders
export async function getEmployees(userType) {
  let query = supabase
    .from('employee')         
    .select('empno, lastname, firstname, gender, hiredate, sepdate, record_status, stamp')
    .order('empno')

  if (userType === 'USER') {
    query = query.eq('record_status', 'ACTIVE')
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// ADD
export async function addEmployee(employeeData, currentUser) {
  const payload = {
    ...employeeData,
    record_status: 'ACTIVE',
    stamp: `ADD|${currentUser?.email ?? 'unknown'}|${new Date().toISOString().slice(0,10)}`
  }
  console.log('insert payload:', payload)  // add this
  
  const { data, error } = await supabase
    .from('employee')
    .insert([payload])
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
      stamp: `EDIT|${currentUser.email}|${new Date().toISOString().slice(0,10)}`
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
      stamp: `DELETE|${currentUser.email}|${new Date().toISOString().slice(0,10)}`
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
      stamp: `RECOVER|${currentUser.email}|${new Date().toISOString().slice(0,10)}`
    })
    .eq('empno', empno)
    .select()

  if (error) throw error
  return data
}