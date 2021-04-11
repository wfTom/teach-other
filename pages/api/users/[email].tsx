// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ObjectID } from 'bson'
import { NextApiRequest, NextApiResponse } from 'next'

import connect from '../../../utils/database'

interface ErrorResponseType {
  error: string
}

interface SuccessResponseType {
  _id: string
  name: string
  email: string
  cellphone: string
  coins: Int16Array
  teacher: boolean
  courses: string[]
  available_hours: object
  available_locations: string[]
  reviews: object[]
  appointments: object[]
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponseType | SuccessResponseType>
): Promise<void> => {
  if (req.method === 'GET') {
    const id = req.query.id as string

    if (!id) {
      res.status(400).json({ error: 'Missing id on request body' })
      return
    }

    let _id: ObjectID
    try {
      _id = new ObjectID(id)
    } catch {
      res.status(400).json({ error: 'Missing teacher id on request body' })
      return
    }

    const { db } = await connect()
    const response = await db
      .collection('users')
      .findOne({ _id: new ObjectID(_id) })

    if (!response) {
      res.status(400).json({ error: 'User not found' })
      return
    }

    res.status(200).json(response)
  } else {
    res.status(400).json({ error: 'Wrong request method' })
  }
}
