import { getPrismaClient } from '../../utils/prisma'

const prisma = getPrismaClient()

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '0', 10)
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid order id',
    })
  }

  if (event.req.method === 'GET') {
    const order = await prisma.orders.findUnique({
      where: { id },
    })

    if (!order) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Order not found',
      })
    }
    return order
  }

  if (event.req.method === 'PUT') {
    const body = await readBody(event)

    if (!body.status) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required status field',
      })
    }

    try {
      const updatedOrder = await prisma.orders.update({
        where: { id },
        data: {
          ...body,
        },
      })
      return updatedOrder
    } catch (error) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Failed to update order',
      })
    }
  }

  if (event.req.method === 'DELETE') {
    try {
      await prisma.orders.delete({
        where: { id },
      })
      return { success: true }
    } catch (error) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Failed to delete order',
      })
    }
  }
})
