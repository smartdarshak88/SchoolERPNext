const express = require('express')
const app = express();
const path = require('path')
const db = require('./connection')
const cookieParser = require('cookie-parser')
const exphbs = require('express-handlebars');


const publicDirectory = path.join(__dirname, "./public")
app.use(express.static(publicDirectory))

app.use(express.urlencoded({ extended: false}));
app.use(express.json());
app.use(cookieParser());

app.engine('hbs', exphbs({
    defaultLayout: '',
    extname: '.hbs'
}));
app.set('view engine', 'hbs');




//Define Routes

app.use('/', require('./routes/pages'))
app.use('/auth', require('./routes/auth'))
app.listen(80, () => {
    console.log("server is running on port 3400");
})
