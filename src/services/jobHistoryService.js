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
      stamp: `ADD|${currentUser?.email ?? 'unknown'}|${new Date().toISOString().slice(0,10)}`
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
      stamp: `ADD|${currentUser?.email ?? 'unknown'}|${new Date().toISOString().slice(0,10)}`
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
      stamp: `ADD|${currentUser?.email ?? 'unknown'}|${new Date().toISOString().slice(0,10)}`
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
      stamp: `ADD|${currentUser?.email ?? 'unknown'}|${new Date().toISOString().slice(0,10)}`
    })
    .eq('empno', empNo)
    .eq('jobcode', jobCode)
    .eq('effdate', effDate)
    .select()
  if (error) throw error
  return data
}