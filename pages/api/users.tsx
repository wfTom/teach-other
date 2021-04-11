// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ObjectID } from 'bson'
import { NextApiRequest, NextApiResponse } from 'next'

import connect from '../../utils/database'

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
  if (req.method === 'POST') {
    const {
      name,
      email,
      cellphone,
      teacher,
      courses,
      available_hours,
      available_locations
    }: {
      name: string
      email: string
      cellphone: string
      teacher: boolean
      courses: string[]
      available_hours: Record<string, number[]>
      available_locations: string[]
    } = req.body

    if (!teacher) {
      if (!name || !email || !cellphone) {
        res.status(400).json({ error: 'Missing body parameter' })
        return
      }
    } else if (teacher) {
      if (
        !name ||
        !email ||
        !cellphone ||
        !courses ||
        !available_hours ||
        !available_locations
      ) {
        res.status(400).json({ error: 'Missing body parameter' })
        return
      }
    }

    const { db } = await connect()

    //check if email exists
    const lowerCaseEmail = email.toLowerCase()
    const emailExists = await db
      .collection('users')
      .findOne({ email: lowerCaseEmail })
    if (emailExists) {
      res.status(400).json({ error: `E-mail ${lowerCaseEmail} already exists` })
      return
    }

    const response = await db.collection('users').insertOne({
      name,
      email: lowerCaseEmail,
      cellphone,
      teacher,
      coins: 100,
      courses: courses || [],
      available_hours: available_hours || {},
      available_locations: available_locations || [],
      reviews: [],
      appointments: []
    })

    res.status(200).json(response.ops[0])
    //* Show User Profile
  } else if (req.method === 'GET') {
    const { _id } = req.body

    if (!_id) {
      res.status(400).json({ error: 'Missing _id on request body' })
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
