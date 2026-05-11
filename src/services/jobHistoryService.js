import { supabase } from '../lib/supabaseClient'

export async function getJobHistory(empNo, userType) {
  let query = supabase
    .from('jobhistory')
    .select('*')
    .eq('empno', empNo)
    .order('effdate', { ascending: false })

  if (userType === 'USER') {
    query = query.eq('record_status', 'ACTIVE')
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function addJobHistory(jobHistoryData, currentUser) {
  const { data, error } = await supabase
    .from('jobhistory')
    .insert([{
      ...jobHistoryData,
      record_status: 'ACTIVE',
      stamp: `Added by ${currentUser.email} on ${new Date().toISOString()}`
    }])
    .select()
  if (error) throw error
  return data
}

export async function updateJobHistory(empNo, jobCode, effDate, updates, currentUser) {
  const { data, error } = await supabase
    .from('jobhistory')
    .update({
      ...updates,
      stamp: `Edited by ${currentUser.email} on ${new Date().toISOString()}`
    })
    .eq('empno', empNo)
    .eq('jobcode', jobCode)
    .eq('effdate', effDate)
    .select()
  if (error) throw error
  return data
}

export async function softDeleteJobHistory(empNo, jobCode, effDate, currentUser) {
  const { data, error } = await supabase
    .from('jobhistory')
    .update({
      record_status: 'INACTIVE',
      stamp: `Deleted by ${currentUser.email} on ${new Date().toISOString()}`
    })
    .eq('empno', empNo)
    .eq('jobcode', jobCode)
    .eq('effdate', effDate)
    .select()
  if (error) throw error
  return data
}

export async function recoverJobHistory(empNo, jobCode, effDate, currentUser) {
  const { data, error } = await supabase
    .from('jobhistory')
    .update({
      record_status: 'ACTIVE',
      stamp: `Recovered by ${currentUser.email} on ${new Date().toISOString()}`
    })
    .eq('empno', empNo)
    .eq('jobcode', jobCode)
    .eq('effdate', effDate)
    .select()
  if (error) throw error
  return data
}