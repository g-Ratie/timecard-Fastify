import { FastifyPluginAsync } from 'fastify'
import { prismaClient } from '../utils/prismaClient'

const id: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{ Params: { id: string } }>('/discord/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const userDiscordId = request.params.id 
    const user = await prismaClient.users.findFirst({
      where: {
        user_discord_id: BigInt(userDiscordId),
      },
    });
    if (user === null) {
      reply.code(404).send({ message: 'User not found' })
      return
    }
    const id = user?.user_id
    const alldata = await prismaClient.daily_records.findMany({
      where: {
        user_id: id,
      },
    });
    let totalTime = 0
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
