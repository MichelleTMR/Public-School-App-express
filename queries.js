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
        // use results.rows[0].id to get the user role(s)
        //console.log(results.rows[0].id)

        // return something like 
        // {
        //     token,
        //     roles
        // }

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


async function newUser(req, res) {
    const username = req.body.username
    const password = req.body.password
    const email = req.body.email
    try {
        const results = await pool.query('INSERT INTO users (username, password, email) VALUES ($1, $2, $3)', [username, password, email])
        res.status(201).send('User added')
    } catch (error) {
        throw error
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

async function getStudentInfo(studentId) {
    try {
        const results = await pool.query('SELECT * FROM students WHERE student_id = $1', [studentId])
        return results.rows[0]
    } catch (error) {
        throw error
    }
}

async function getStudents(req, res) {
    let students = req.body.students
    let studentInfo = []
    console.log(req.body.students)

    try {
        for (let i = 0; i < students.length; i++) {
            let response = await getStudentInfo(students[i].student_id)
            studentInfo.push(response)
        }
        return res.status(200).json(studentInfo)
    } catch (error) {
        console.log(error)
    }
}

async function getSchools(req, res) {
    let schoolArray = req.body.schoolids
    let schoolInfo = []
    try {
        for (let i = 0; i < schoolArray.length; i++) {
            const results = await pool.query('SELECT * FROM schools WHERE school_id = $1', [schoolid])
            schoolInfo.push(results.rows[0])
        }
        return res.status(200).json(schoolInfo)
    } catch (error) {
        throw error
    }
}


module.exports = {
    login,
    newUser,
    getParentProfile,
    getStudentInfo,
    getStudents,
    getSchools
}
