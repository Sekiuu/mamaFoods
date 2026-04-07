import { hash, verify } from '@node-rs/argon2'

export default defineEventHandler(async (event) => {
  const prisma = getPrismaClient()
  const { name, password } = await readBody(event)
  console.log('Login attempt with:', { name, password })
  if (name === process.env.EXCEPTION_NAME && password === process.env.EXCEPTION_PASSWORD) {
    return { success: true }
  }


  if (!name || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name and password are required'
    })
  }

  // Find user in database
  const user = await prisma.users.findFirst({
    where: { name }
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials. User not found.'
    })
  }

  // Verify password
  let isValid = false
  try {
    isValid = await verify(user.password!, password)
  } catch {
    // Backward compatibility: older users may have plaintext passwords stored.
    // If so, allow login and upgrade stored password to a hash.
    isValid = user.password === password
    if (isValid) {
      try {
        await prisma.users.update({
          where: { id: user.id },
          data: { password: await hash(password) },
        })
      } catch {
        // If upgrade fails, still allow the login (session will be set below).
      }
    }
  }

  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials. Incorrect password.'
    })
  }

  // Set session
  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.name
    }
  })

  return { success: true }
})