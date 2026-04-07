import {prisma} from "../../../prisma/db";
export default defineEventHandler(async (event) => {
    const id = parseInt(getRouterParam(event, "id") || "0");
    if (event.req.method === "GET") {
        // Get a single food by id
        try {
            const food = await prisma.foods.findUnique({
                where: { id },
            });
            if (!food) {
                throw createError({
                    statusCode: 404,
                    statusMessage: "Food not found",
                });
            }
            return food;
        } catch (error) {
            throw createError({
                statusCode: 500,
                statusMessage: "Failed to fetch food",
            });
        }
    }

    if (event.req.method === "PUT") {
        // Update a food
        try {
            const body = await readBody(event);
            const updatedFood = await prisma.foods.update({
                where: { id },
                data: {
                    name: body.name || undefined,
                    price: body.price || undefined,
                    description: body.description || undefined,
                    icon: body.icon || undefined,
                    last_edit: new Date(),
                },
            });
            return updatedFood;
        } catch (error) {
            throw createError({
                statusCode: 400,
                statusMessage: "Failed to update food",
            });
        }
    }

    if (event.req.method === "DELETE") {
        // Delete a food
        try {
            await prisma.foods.delete({
                where: { id },
            });
            return { message: "Food deleted successfully" };
        } catch (error) {
            throw createError({
                statusCode: 400,
                statusMessage: "Failed to delete food",
            });
        }
    }
});
