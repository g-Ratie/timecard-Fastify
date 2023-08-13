import { FastifyPluginAsync } from 'fastify'
import { prismaClient } from '../utils/prismaClient'
import { getUserIdFromUserName } from '../utils/getGithubId'

const id: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get<{ Params: { id: string } }>('/github/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    //数字の方のIDを取得
    const userGithubId = await getUserIdFromUserName(request.params.id)
    if (typeof userGithubId !== 'number') {
      reply.code(404).send({ message: 'User not found' })
      return
    }
    const user = await prismaClient.users.findFirst({
      where: {
        user_github_id: String(userGithubId),
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
