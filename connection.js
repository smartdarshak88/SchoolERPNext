const mysql = require('mysql')
const env = require('dotenv')

env.config({
    path: './.env'
})

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE
})


db.connect( (error) => {
    if(error) {
        console.log("Database could not connected"+error)
    }
    else{
        console.log("DB connected");
    }
})

module.exports = db;