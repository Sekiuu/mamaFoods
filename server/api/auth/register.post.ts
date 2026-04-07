import { hash } from '@node-rs/argon2'

export default defineEventHandler(async (event) => {
  const prisma = getPrismaClient()
  const { name, password } = await readBody(event)

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

  if (user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'User already exists.'
    })
  }

  // Create the user
  const newUser = await prisma.users.create({
    data: {
      name,
      password: await hash(password),
      create_at: new Date(),
    }
  })

  // Set session
  await setUserSession(event, {
    user: {
      id: newUser.id,
      name: newUser.name
    }
  })

  return { success: true }
})