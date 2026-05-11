import { supabase } from '../lib/supabaseClient'

export async function getJobs(userType) {
  let query = supabase
    .from('job')
    .select('*')
    .order('jobcode', { ascending: true })

  if (userType === 'USER') query = query.eq('record_status', 'ACTIVE')

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function addJob(jobData, currentUser) {
  const { data, error } = await supabase
    .from('job')
    .insert([{
      ...jobData,
      record_status: 'ACTIVE',
      stamp: `Added by ${currentUser.email} on ${new Date().toISOString()}`
    }])
    .select()

  if (error) throw error
  return data
}

export async function updateJob(jobCode, updates, currentUser) {
  const { data, error } = await supabase
    .from('job')
    .update({
      ...updates,
      stamp: `Edited by ${currentUser.email} on ${new Date().toISOString()}`
    })
    .eq('jobcode', jobCode)
    .select()

  if (error) throw error
  return data
}

export async function softDeleteJob(jobCode, currentUser) {
  const { data, error } = await supabase
    .from('job')
    .update({
      record_status: 'INACTIVE',
      stamp: `Deleted by ${currentUser.email} on ${new Date().toISOString()}`
    })
    .eq('jobcode', jobCode)
    .select()

  if (error) throw error
  return data
}

export async function recoverJob(jobCode, currentUser) {
  const { data, error } = await supabase
    .from('job')
    .update({
      record_status: 'ACTIVE',
      stamp: `Recovered by ${currentUser.email} on ${new Date().toISOString()}`
    })
    .eq('jobcode', jobCode)
    .select()

  if (error) throw error
  return data
}