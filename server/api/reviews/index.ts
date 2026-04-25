const prisma = getPrismaClient()
export default defineEventHandler(async (event) => {
  if (event.req.method === 'POST') {
    try {
      const body = await readBody(event)
      const { rating, comment, order_id, reviewer_role } = body

      if (!rating || !order_id || !reviewer_role) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Missing required fields',
        })
      }

      const review = await prisma.reviews.create({
        data: {
          rating,
          comment,
          order_id,
          reviewer_role,
          create_at: new Date(),
        },
      })
      console.log("SERVER : Created review with data:", review)
      return review
    } catch (error) {
      console.error(error)
      throw createError({
        statusCode: 400,
        statusMessage: 'Failed to submit review',
      })
    }
  }
})
