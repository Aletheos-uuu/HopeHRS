import { supabase } from '../lib/supabaseClient'

export async function getDepts(userType) {
  let query = supabase
    .from('department')
    .select('*')
    .order('deptcode', { ascending: true })

  if (userType === 'USER') query = query.eq('record_status', 'ACTIVE')

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function addDept(deptData, currentUser) {
  const { data, error } = await supabase
    .from('department')
    .insert([{
      ...deptData,
      record_status: 'ACTIVE',
      stamp: `Added by ${currentUser.email} on ${new Date().toISOString()}`
    }])
    .select()

  if (error) throw error
  return data
}

export async function updateDept(deptCode, updates, currentUser) {
  const { data, error } = await supabase
    .from('department')
    .update({
      ...updates,
      stamp: `Edited by ${currentUser.email} on ${new Date().toISOString()}`
    })
    .eq('deptcode', deptCode)
    .select()

  if (error) throw error
  return data
}

export async function softDeleteDept(deptCode, currentUser) {
  const { data, error } = await supabase
    .from('department')
    .update({
      record_status: 'INACTIVE',
      stamp: `Deleted by ${currentUser.email} on ${new Date().toISOString()}`
    })
    .eq('deptcode', deptCode)
    .select()

  if (error) throw error
  return data
}

export async function recoverDept(deptCode, currentUser) {
  const { data, error } = await supabase
    .from('department')
    .update({
      record_status: 'ACTIVE',
      stamp: `Recovered by ${currentUser.email} on ${new Date().toISOString()}`
    })
    .eq('deptcode', deptCode)
    .select()

  if (error) throw error
  return data
}