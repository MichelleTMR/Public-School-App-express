const Pool = require('pg').Pool
const tokenManager = require('./token-manager.js')
require('dotenv').config()

const pool = new Pool({
    user: 'mmunozruiz',
    host: 'localhost',
    database: 'publicschool',
    password: process.env.PASSWORD,
    port: 5432
})

async function login(req, res) {
    const email = req.body.email
    const password = req.body.password

    try {
        const results = await pool.query('SELECT * FROM users WHERE email = $1 AND password =$2', [email, password])
        if (!results.rows.length) {
            throw new Error("Username or password is invalid")
        }
        //do loging stuff with our JWT
        const token = tokenManager.generateAccessToken(results.rows[0].id)
        const userRoles = await getUserRoles(results.rows[0].id)
        const userProfile = await getParentProfile(results.rows[0].id)

        return res.status(200).json({
            token,
            userRoles,
            userProfile,
        })
    } catch (error) {
        // instead return a 401
        // return res.status(401).send()
        console.log(error)
        // throw new Error(error.message)
    }
}

async function getUserRoles(userid) {
    try {
        const results = await pool.query('SELECT role_id, student_id FROM userroles WHERE user_id = $1', [userid])
        return results.rows
    } catch (error) {
        throw error
    }
}

async function getParentProfile(userid) {
    try {
        const results = await pool.query('SELECT name, birthdate, phone_number, address, profile_image FROM parent WHERE user_id = $1', [userid])
        console.log(results.rows)
        return results.rows[0]
    } catch (error) {
        throw error
    }
}


//STUDENT INFORMATION

async function getStudents(req, res) {
    //getting the query parameter values out of the url string
    let students = req.query.studentId

    let studentInformation = []

    try {
        //[1 , 2]
        for (let i = 0; i < students.length; i++) {
            //getting student information our of the students table for each id in the for loop
            const results = await pool.query('SELECT * FROM students WHERE student_id = $1', [students[i]])
            if (!results.rows.length) {
                throw new Error("error")
            }

            //results.row[0] is the current student info from student table
            const currentStudent = results.rows[0]

            //executing query in the schools table to get the school information for the current student's school_id
            const school = await getSchool(results.rows[0].school_id)

            //executing a query in the buses table to get the bus information for the current student's bus_id
            const bus = await getBus(results.rows[0].bus_id)

            //We want to format the data in a way that is readable and easy to use when it gets to our front end.
            //Creating a new student object and using the data from our queries to build this new object
            let student = {
                student_id: currentStudent.student_id, //
                student_name: currentStudent.student_name,
                grade: currentStudent.grade,
                student_birthdate: currentStudent.student_birthdate,
                age: currentStudent.age,
                student_picture: currentStudent.student_picture,
                school: school,
                bus: bus
            }

            //push the student to an array
            studentInformation.push(student)

        }
        
        return res.status(200).json(studentInformation)
    } catch (error) {
        console.log(error)
    }
}

async function getSchool(id) {
    try {
        const results = await pool.query('SELECT * FROM schools WHERE school_id = $1', [id])
        return results.rows[0]
    } catch (error) {
        throw error
    }
}

async function getBus(id) {
    try {
        const results = await pool.query('SELECT * FROM buses WHERE buses_id = $1', [id])
        return results.rows[0]
    } catch (error) {
        throw error
    }
}

module.exports = {
    login,
    getStudents,
}
