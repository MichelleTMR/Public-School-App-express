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

//student profile
app.get('/students', tokenManager.authenicateToken, queries.getStudents)

app.listen(3000)
console.log("Express app is running!")
