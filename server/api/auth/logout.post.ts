
export default defineEventHandler(async (event) => {
  try {
    console.log('logout')
    await clearUserSession(event)
    return { success: true }
  }
  catch {
    console.log('logout error')
    return { success: false }
  }
})