import { prisma } from "@/lib/prisma";



export const find = {

    byId: async (id: string) => {
        try {
            const result = await prisma.user.findUnique({
                where: { id }
            });
            return [null, result];
        } catch (error) {
            return [error, null];
        }
    },

    byEmail: async (email: string) => {
        try {
            const result = await prisma.user.findUnique({
                where: { email }
            });
            return [null, result];
        } catch (error) {
            return [error, null];
        }
    }

}