import { PrismaClient } from '@prisma/client'
import { FastifyPluginAsync } from 'fastify'
const prisma = new PrismaClient()

const id: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{ Params: { id: string } }>('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    let totalTime = 0
    const userDiscordId = request.params.id 
    const user = await prisma.users.findFirst({
      where: {
        user_discord_id: BigInt(userDiscordId),
      },
    });
    if (user === null) {
      reply.code(404).send({ message: 'User not found' })
      return
    }
    const id = user?.user_id
    const alldata = await prisma.daily_records.findMany({
      where: {
        user_id: id,
      },
    });
    alldata.forEach((data) => {
      if (data.check_out !== null) {
        totalTime += data.check_out.getTime() - data.check_in.getTime()
      }
    })
    totalTime = Math.floor(totalTime / 1000 / 60 / 60)
    return { totalTime }
  })
}

export default id;
