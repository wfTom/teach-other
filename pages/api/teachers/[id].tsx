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
  available_hours: Record<string, number[]>
  available_locations: string[]
  reviews: Record<string, unknown>[]
  appointments: Record<string, unknown>[]
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponseType | SuccessResponseType[]>
): Promise<void> => {
  if (req.method === 'POST') {
    //! Mudar
    // const {
    //   name,
    //   email,
    //   cellphone,
    //   teacher,
    //   courses,
    //   available_hours,
    //   available_locations
    // } = req.body
    // if (!teacher) {
    //   if (!name || !email || !cellphone) {
    //     res.status(400).json({ error: 'Missing body parameter' })
    //     return
    //   }
    // } else if (teacher) {
    //   if (
    //     !name ||
    //     !email ||
    //     !cellphone ||
    //     !courses ||
    //     !available_hours ||
    //     !available_locations
    //   ) {
    //     res.status(400).json({ error: 'Missing body parameter' })
    //     return
    //   }
    // } // else {
    // const { db } = await connect()
    // const response = await db.collection('users').insertOne({
    //   name,
    //   email,
    //   cellphone,
    //   teacher,
    //   coins: 1,
    //   courses: courses || [],
    //   available_hours: available_hours || {},
    //   available_locations: available_locations || [],
    //   reviews: [],
    //   appointments: []
    // })
    // res.status(200).json(response.ops[0])
    // }
  } else if (req.method === 'GET') {
    const id = req.query.id as string

    if (!id) {
      res.status(400).json({ error: 'Missing courses name on request body' })
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
    const response = await db.collection('users').findOne({ _id })

    if (!response) {
      res.status(400).json({ error: `Teacher with id ${_id} not found` })
      return
    }

    res.status(200).json(response)
  } else {
    res.status(400).json({ error: 'Wrong request method' })
  }
}
