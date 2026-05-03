import { supabase } from '../lib/supabaseClient'

// GET — USER sees only ACTIVE, ADMIN/SUPERADMIN sees all
export async function getJobs(userType) {
  let query = supabase
    .from('job')
    .select('*')
    .order('jobCode', { ascending: true })

  if (userType === 'USER') query = query.eq('record_status', 'ACTIVE')

  const { data, error } = await query
  if (error) throw error
  return data
}

// ADD
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

// UPDATE
export async function updateJob(jobCode, updates, currentUser) {
  const { data, error } = await supabase
    .from('job')
    .update({
      ...updates,
      stamp: `Edited by ${currentUser.email} on ${new Date().toISOString()}`
    })
    .eq('jobCode', jobCode)
    .select()

  if (error) throw error
  return data
}

// SOFT DELETE
export async function softDeleteJob(jobCode, currentUser) {
  const { data, error } = await supabase
    .from('job')
    .update({
      record_status: 'INACTIVE',
      stamp: `Deleted by ${currentUser.email} on ${new Date().toISOString()}`
    })
    .eq('jobCode', jobCode)
    .select()

  if (error) throw error
  return data
}

// RECOVER
export async function recoverJob(jobCode, currentUser) {
  const { data, error } = await supabase
    .from('job')
    .update({
      record_status: 'ACTIVE',
      stamp: `Recovered by ${currentUser.email} on ${new Date().toISOString()}`
    })
    .eq('jobCode', jobCode)
    .select()

  if (error) throw error
  return data
}