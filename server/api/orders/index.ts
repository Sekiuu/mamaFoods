import { getPrismaClient } from '../../utils/prisma'
import { getQuery, readBody } from 'h3'

export type OrderResponse = {
  id: number
  customer_name: string | null
  customer_phone: string | null
  customer_address: string | null
  customer_note: string | null
  items: string | null
  total_price: string | null
  status: string | null
  create_at: Date | null
}

const prisma = getPrismaClient()

export default defineEventHandler(async (event) => {
  if (event.req.method === 'GET') {
    const query = getQuery(event)
    const idsParam = Array.isArray(query.ids) ? query.ids[0] : query.ids

    if (idsParam) {
      const ids = (idsParam as string)
        .split(',')
        .map((value: string) => parseInt(value, 10))
        .filter((id: number) => !Number.isNaN(id))

      return prisma.orders.findMany({
        where: {
          id: { in: ids },
        },
        orderBy: {
          id: 'desc',
        },
      })
    }

    return prisma.orders.findMany({
      orderBy: {
        id: 'desc',
      },
    })
  }

  if (event.req.method === 'POST') {
    const body = await readBody(event)

    if (!body.items || !body.customer_name || !body.customer_phone || !body.customer_address) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required order fields',
      })
    }

    const order = await prisma.orders.create({
      data: {
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        customer_address: body.customer_address,
        customer_note: body.customer_note || '',
        items: typeof body.items === 'string' ? body.items : JSON.stringify(body.items),
        total_price: String(body.total_price ?? '0'),
        status: body.status || 'pending',
        create_at: new Date(),
      },
    })

    return order
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed',
  })
})
