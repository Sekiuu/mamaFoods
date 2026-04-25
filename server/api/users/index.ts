import { hash } from '@node-rs/argon2'

export default defineEventHandler(async (event) => {
  const prisma = getPrismaClient()

  if (event.req.method === 'GET') {
    try {
      return await prisma.users.findMany({
        select: {
          id: true,
          name: true,
          role: true,
          create_at: true,
        },
        orderBy: { id: 'desc' },
      })
    } catch {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch users',
      })
    }
  }

  if (event.req.method === 'POST') {
    const body = await readBody(event)
    const name = typeof body?.name === 'string' ? body.name.trim() : ''
    const password = typeof body?.password === 'string' ? body.password : ''
    const role = typeof body?.role === 'string' ? body.role : ''

    if (!name || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and password are required',
      })
    }

    const existing = await prisma.users.findFirst({ where: { name } })
    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User already exists',
      })
    }

    try {
      const passwordHash = await hash(password)
      return await prisma.users.create({
        data: {
          name,
          password: passwordHash,
          role : role,
          create_at: new Date(),
        },
        select: {
          id: true,
          name: true,
          create_at: true,
        },
      })
    } catch {
      throw createError({
        statusCode: 400,
        statusMessage: 'Failed to create user',
      })
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed',
  })
})

