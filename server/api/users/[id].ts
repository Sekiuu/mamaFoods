import { hash } from '@node-rs/argon2'
import { getPrismaClient } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const prisma = getPrismaClient()
  const id = parseInt(getRouterParam(event, 'id') || '0', 10)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user id',
    })
  }

  if (event.req.method === 'GET') {
    const user = await prisma.users.findUnique({
      where: { id },
      select: { id: true, name: true, create_at: true },
    })

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    return user
  }

  if (event.req.method === 'PUT') {
    const body = await readBody(event)
    const name = typeof body?.name === 'string' ? body.name.trim() : undefined
    const password = typeof body?.password === 'string' ? body.password : undefined

    try {
      const data: { name?: string; password?: string } = {}
      if (name) data.name = name
      if (password && password.length > 0) data.password = await hash(password)

      const updated = await prisma.users.update({
        where: { id },
        data,
        select: { id: true, name: true, create_at: true },
      })
      return updated
    } catch {
      throw createError({
        statusCode: 400,
        statusMessage: 'Failed to update user',
      })
    }
  }

  if (event.req.method === 'DELETE') {
    try {
      await prisma.users.delete({ where: { id } })
      return { message: 'User deleted successfully' }
    } catch {
      throw createError({
        statusCode: 400,
        statusMessage: 'Failed to delete user',
      })
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed',
  })
})

