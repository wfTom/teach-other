// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ObjectID } from 'bson'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/client'

import connect from '../../utils/database'

interface User {
  name: string
  email: string
  cellphone: string
  teacher: boolean
  coins: number
  courses: string[]
  available_hours: Record<string, number[]>
  available_locations: string[]
  reviews: Record<string, unknown>[]
  appointments: { date: string }[]
  _id: string
}

interface ErrorResponseType {
  error: string
}

interface SuccessResponseType {
  date: string
  teacher_name: string
  teacher_id: string
  student_name: string
  student_id: string
  course: string
  location: string
  appointment_link: string
}

export default async (
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponseType | SuccessResponseType>
): Promise<void> => {
  if (req.method === 'POST') {
    // const session = await getSession({ req })
    // if (!session) {
    //   res.status(400).json({ error: 'Please log in first' })
    //   return
    // }

    const {
      date,
      teacher_name,
      teacher_id,
      student_name,
      student_id,
      course,
      location,
      appointment_link
    }: {
      date: string
      teacher_name: string
      teacher_id: string
      student_name: string
      student_id: string
      course: string
      location: string
      appointment_link: string
    } = req.body

    if (
      !date ||
      !teacher_name ||
      !teacher_id ||
      !student_name ||
      !student_id ||
      !course ||
      !location ||
      !appointment_link
    ) {
      res.status(400).json({ error: 'Missing body parameter' })
      return
    }

    //check if teacher_id or student_id is invalid
    let testTeacherID: ObjectID
    let testStudentID: ObjectID
    try {
      testTeacherID = new ObjectID(teacher_id)
      testStudentID = new ObjectID(student_id)
    } catch {
      res.status(400).json({ error: 'Wrong ObjectID' })
      return
    }

    const parseDate = new Date(date)
    const now = new Date()
    const today = {
      day: now.getDate(),
      month: now.getMonth(),
      year: now.getFullYear
    }
    const fullDate = {
      day: parseDate.getDate(),
      month: parseDate.getMonth(),
      year: parseDate.getFullYear
    }

    //check if request date is on the past
    if (
      fullDate.year < today.year ||
      fullDate.month < today.month ||
      fullDate.day < today.day
    ) {
      res.status(400).json({
        error: "You can't create appointments on the past"
      })
      return
    }

    const { db } = await connect()

    //check if teacher and student exists
    const teacherExists: User = await db
      .collection('users')
      .findOne({ _id: testTeacherID })
    if (!teacherExists) {
      res.status(400).json({
        error: `Teacher ${teacher_name} with id ${teacher_id} does not exist`
      })
      return
    }

    const studentExists: User = await db
      .collection('users')
      .findOne({ _id: testStudentID })
    if (!studentExists) {
      res.status(400).json({
        error: `Student ${student_name} with id ${student_id} does not exist`
      })
      return
    }

    //check if students have enough coins
    if (studentExists.coins === 0) {
      res
        .status(400)
        .json({ error: `Student ${student_name} does not have enough coins` })
    }

    //check if requested day/hour is available for the teacher
    const weekDays = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday'
    ]
    const requestDay = weekDays[parseDate.getDay()]
    const requestHour = parseDate.getUTCHours() - 3
    if (!teacherExists.available_hours[requestDay]?.includes(requestHour)) {
      res.status(400).json({
        error: `Teacher ${teacher_name} is not available at ${requestDay} ${requestHour}:00`
      })
      return
    }

    //check if teacher already have an appointment on the request day of the month
    teacherExists.appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.date)

      if (appointmentDate.getTime() === parseDate.getTime()) {
        res.status(400).json({
          error: `Teacher ${teacher_name} already have an appointment at ${appointmentDate.getDate()}/${
            appointmentDate.getMonth() + 1
          }/${appointmentDate.getFullYear()} ${
            appointmentDate.getUTCHours() - 3
          }:00`
        })
        return
      }
    })

    //create appointment object
    const appointment = {
      date,
      teacher_name,
      teacher_id,
      student_name,
      student_id,
      course,
      location,
      appointment_link: appointment_link || ''
    }
    await db
      .collection('users')
      .updateOne(
        { _id: new ObjectID(teacher_id) },
        { $push: { appointments: appointment }, $inc: { coins: 1 } }
      )
    await db
      .collection('users')
      .updateOne(
        { _id: new ObjectID(student_id) },
        { $push: { appointments: appointment }, $inc: { coins: -1 } }
      )
    res.status(200).json(appointment)
  } else if (req.method === 'GET') {
    //! Mudar
    // const {
    //   date,
    //   teacher_name,
    //   teacher_id,
    //   student_name,
    //   student_id,
    //   course,
    //   location,
    //   appointment_link
    // } = req.body
    // if (
    //   !date ||
    //   !teacher_name ||
    //   !teacher_id ||
    //   !student_name ||
    //   !student_id ||
    //   !course ||
    //   !location ||
    //   !appointment_link
    // ) {
    //   res.status(400).json({ error: 'Missing body parameter' })
    //   return
    // }
    // const { db } = await connect()
    // const teacherExists = await db
    //   .collection('users')
    //   .find({ _id: new ObjectID(teacher_id) })
    //   .toArray()
    // if (!teacherExists) {
    //   res.status(400).json({
    //     error: `Teacher ${teacher_name} with id ${teacher_id} does not exist`
    //   })
    //   return
    // }
    // const studentExists = await db
    //   .collection('users')
    //   .find({ _id: new ObjectID(student_id) })
    //   .toArray()
    // if (!studentExists) {
    //   res.status(400).json({
    //     error: `Student ${student_name} with id ${student_id} does not exist`
    //   })
    //   return
    // }
    // const appointment = {
    //   date,
    //   teacher_name,
    //   teacher_id,
    //   student_name,
    //   student_id,
    //   course,
    //   location,
    //   appointment_link: appointment_link || ''
    // }
    // await db
    //   .collection('users')
    //   .updateOne(
    //     { _id: new ObjectID(teacher_id) },
    //     { $push: { appointments: appointment } }
    //   )
    // await db
    //   .collection('users')
    //   .updateOne(
    //     { _id: new ObjectID(student_id) },
    //     { $push: { appointments: appointment } }
    //   )
    // res.status(200).json(appointment)
  } else {
    res.status(400).json({ error: 'Wrong request method' })
  }
}
