require('dotenv').config()
const express = require('express')
const queries = require('./queries')
const tokenManager = require('./token-manager.js')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()


//Express Config Autho/token
app.use(cors())
app.use(bodyParser.json())


app.get('/', (req, res) => {
    res.send("Hello World!")
})

//Login 
app.post('/login', queries.login)

//register a new user
app.post('/users', tokenManager.authenicateToken, queries.newUser)

//student profile
// COME BACK TO CHANGE TO GET WITH QUERY PARAMS
app.post('/students', tokenManager.authenicateToken, queries.getStudents)

//schoolinfo
app.post('/schools',tokenManager.authenicateToken, queries.getSchools)



app.listen(3000)
console.log("Express app is running!")
