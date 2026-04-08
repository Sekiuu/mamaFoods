import { getPrismaClient } from '../../utils/prisma'

const prisma = getPrismaClient()

export default defineEventHandler(async (event) => {
    if (event.req.method === "GET") {
        // Get all foods
        try {
            const foods = await prisma.foods.findMany();
            return foods;
        } catch (error) {
            throw createError({
                statusCode: 500,
                statusMessage: "Failed to fetch foods",
            });
        }
    }

    if (event.req.method === "POST") {
        // Create a new food
        try {
            const body = await readBody(event);
            const newFood = await prisma.foods.create({
                data: {
                    name: body.name,
                    price: body.price,
                    description: body.description,
                    icon: body.icon,
                    last_edit: new Date(),
                },
            });
            return newFood;
        } catch (error) {
            throw createError({
                statusCode: 400,
                statusMessage: "Failed to create food",
            });
        }
    }
});
