import { supabase } from '../lib/supabaseClient'

// GET — filtered by empNo, USER sees only ACTIVE rows
export async function getJobHistory(empNo, userType) {
  let query = supabase
    .from('jobHistory')
    .select('*')
    .eq('empNo', empNo)
    .order('effDate', { ascending: false })

  if (userType === 'USER') {
    query = query.eq('record_status', 'ACTIVE')
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// ADD
export async function addJobHistory(jobHistoryData, currentUser) {
  const { data, error } = await supabase
    .from('jobHistory')
    .insert([{
      ...jobHistoryData,
      record_status: 'ACTIVE',
      stamp: `Added by ${currentUser.email} on ${new Date().toISOString()}`
    }])
    .select()
  if (error) throw error
  return data
}

// UPDATE
export async function updateJobHistory(empNo, jobCode, effDate, updates, currentUser) {
  const { data, error } = await supabase
    .from('jobHistory')
    .update({
      ...updates,
      stamp: `Edited by ${currentUser.email} on ${new Date().toISOString()}`
    })
    .eq('empNo', empNo)
    .eq('jobCode', jobCode)
    .eq('effDate', effDate)
    .select()
  if (error) throw error
  return data
}

// SOFT DELETE — single row only, does NOT affect employee
export async function softDeleteJobHistory(empNo, jobCode, effDate, currentUser) {
  const { data, error } = await supabase
    .from('jobHistory')
    .update({
      record_status: 'INACTIVE',
      stamp: `Deleted by ${currentUser.email} on ${new Date().toISOString()}`
    })
    .eq('empNo', empNo)
    .eq('jobCode', jobCode)
    .eq('effDate', effDate)
    .select()
  if (error) throw error
  return data
}

// RECOVER
export async function recoverJobHistory(empNo, jobCode, effDate, currentUser) {
  const { data, error } = await supabase
    .from('jobHistory')
    .update({
      record_status: 'ACTIVE',
      stamp: `Recovered by ${currentUser.email} on ${new Date().toISOString()}`
    })
    .eq('empNo', empNo)
    .eq('jobCode', jobCode)
    .eq('effDate', effDate)
    .select()
  if (error) throw error
  return data
}