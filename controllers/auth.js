
const connection = require('../connection')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const cookie = require('cookie-parser')
const { request } = require('express')
const url = require('url')

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE
})


exports.register = (req,res) => {

    

    
    const {name, email, password, cpassword } = req.body;
    
    db.query('SELECT email FROM users WHERE email = ?', [email], async (error,result) => {
        if(error)
        {
            console.log(error);
        }

        if(result.length > 0)
        {
            return res.render('register', {
                message: 'Email has been already registered'
            })
            
        }
        else if( password !== cpassword)
        {
            return res.render('register', {
                message: 'Password do not match'
            })   
        }


        let hashedpassword = await bcrypt.hash(password, 8);
        //console.log("hashed password" +hashedpassword)
        db.query("INSERT into users set ?", {name: name, email: email, password: hashedpassword}, (error,result) => {
            if(error)
            {
                return res.render('register', {
                    message: 'There is some problem adding this user. please contact support@erpschool.com'
                })
            }
            else
            {
                console.log(result.insertId);
                res.send("User registered successfully.")
            }
        })
    });

    



}

exports.login = async (req,res) => {

    // console.log(req.body);

    const {email, password } = req.body;
    let hashedpassword = await bcrypt.hash(password, 8);

    // console.log(hashedpassword);
    
    db.query('SELECT * FROM users WHERE email = ?', [email], async (error,result) => {
        //console.log(result);
        if(error)
        {
            return res.render('login', {
                message: error.message
            })
        }
        if(result.length !== 1)
        {
            return res.render('login', {
                message: 'Login is invalid.'
            })
            
        }

        if(await bcrypt.compare(password, result[0].password))
        {
            return res.render('login', {
                message: 'Password incorrect.'
            })
        }

        const id = result[0].id;
        const role = result[0].role;

        const token = jwt.sign({ id },process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        const cookieOptions = {
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            httpOnly: true
        }

        
        
        res.cookie('jwt', token, cookieOptions);
        res.cookie('role', role);

        db.query("INSERT into appsessions set ?", {uid: id, auth: token}, (error,result) => {
            if(error)
            {
                res.send("Session can not be set for this user please login again.");
            }
            else{
                console.log("Session started");
               

                res.status(200).redirect(url.format({
                    pathname: "../dashboard"
                }));
               
            }
        })


        
        //res.send("Login successful");
       


        
    //     //console.log("hashed password" +hashedpassword)
    //     db.query("INSERT into users set ?", {name: name, email: email, password: hashedpassword}, (error,result) => {
    //         if(error)
    //         {
    //             return res.render('register', {
    //                 message: 'There is some problem adding this user. please contact support@erpschool.com'
    //             })
    //         }
    //         else
    //         {
    //             console.log(result.insertId);
    //             res.send("User registered successfully.")
    //         }
    //     })
     });



}


exports.checkLogin = async (req,res) => {
    if(req.headers && req.headers.cookie)
    {
    const cookieToken = req.cookies['jwt'];
    db.query("SELECT uid from appsessions where auth=?", [cookieToken], (error,result) => {
        if(error)
        {
            console.log(error)
        }
        else if( result.length > 1)
        {
            console.log("Duplicate session found.")
        }
        else{
            const userId = result[0].uid
            db.query("SELECT * FROM users where id=?", [userId], (error,result) => {
                let userData = result[0];
                let role = result[0].role;
                if(role === 'S')
                {
                res.render('dashboard', { data : userData, id: userId });
                }
                else
                {
                res.render('adashboard', { data : userData, id: userId });
                }
            });
        }
    })
    }
    else{
        res.status('403').redirect('/');
    }

}

exports.logout = async (req,res) => {
    
    res.cookie('jwt', {}, {maxAge: -1});
    res.cookie('role', {}, {maxAge: -1});
    res.redirect('/')

}

exports.add = async (req,res) => {
   
    const cookieToken = req.cookies['jwt'];
    if(cookieToken)
    {
        res.render('layouts/adduser');
    }
    else{
        res.redirect('/');
    }
}

exports.view = async (req,res) => {
    const cookieToken = req.cookies['jwt'];
    if(cookieToken)
    {
        res.render('layouts/viewuser');
    }
    else{
        res.redirect('/');
    }
}

exports.outletadd = async (req,res) => {
    const cookieToken = req.cookies['jwt'];
    if(cookieToken)
    {
        res.render('layouts/outletadd',{module: "Outlet", outlet: true});
    }
    else{
        res.redirect('/');
    }
}

exports.outletview = async (req,res) => {
    const cookieToken = req.cookies['jwt'];
    if(cookieToken)
    {
        res.render('layouts/outletview',{module: "Outlet", outlet:true});
    }
    else{
        res.redirect('/');
    }
}

exports.staffadd = async (req,res) => {
    const cookieToken = req.cookies['jwt'];
    if(cookieToken)
    {
        res.render('layouts/adduser',{module: "Staff",staff: true});
    }
    else{
        res.redirect('/');
    }
}

exports.staffview = async (req,res) => {
    const cookieToken = req.cookies['jwt'];
    if(cookieToken)
    {
        res.render('layouts/outletview',{module: "Staff", staff: true});
    }
    else{
        res.redirect('/');
    }
}

exports.customeradd = async (req,res) => {
    const cookieToken = req.cookies['jwt'];
    if(cookieToken)
    {
        res.render('layouts/outletadd',{module: "Customer", customer:true});
    }
    else{
        res.redirect('/');
    }
}

exports.customerview = async (req,res) => {
    const cookieToken = req.cookies['jwt'];
    if(cookieToken)
    {
        res.render('layouts/outletview',{module: "Customer", customer: true});
    }
    else{
        res.redirect('/');
    }
}

exports.driveradd = async (req,res) => {
    const cookieToken = req.cookies['jwt'];
    if(cookieToken)
    {
        res.render('layouts/outletadd',{module: "Driver", driver:true});
    }
    else{
        res.redirect('/');
    }
}

exports.driverview = async (req,res) => {
    const cookieToken = req.cookies['jwt'];
    if(cookieToken)
    {
        res.render('layouts/outletview',{module: "Driver", driver: true});
    }
    else{
        res.redirect('/');
    }
}

exports.itemcategoryadd = async (req,res) => {
    const cookieToken = req.cookies['jwt'];
    if(cookieToken)
    {
        res.render('layouts/outletadd',{module: "Item Category", itemcategory: true});
    }
    else{
        res.redirect('/');
    }
}

exports.itemcategoryview = async (req,res) => {
    const cookieToken = req.cookies['jwt'];
    if(cookieToken)
    {
        res.render('layouts/outletview',{module: "Item Category", itemcategory: true});
    }
    else{
        res.redirect('/');
    }
}

exports.weighttypesadd = async (req,res) => {
    const cookieToken = req.cookies['jwt'];
    if(cookieToken)
    {
        res.render('layouts/outletadd',{module: "Weight Types", weighttypes:true});
    }
    else{
        res.redirect('/');
    }
}

exports.weighttypesview = async (req,res) => {
    const cookieToken = req.cookies['jwt'];
    if(cookieToken)
    {
        res.render('layouts/outletview',{module: "Weight Types", weighttypes:true});
    }
    else{
        res.redirect('/');
    }
}

exports.locationadd = async (req,res) => {
    const cookieToken = req.cookies['jwt'];
    if(cookieToken)
    {
        res.render('layouts/outletadd',{module: "Location", location: true});
    }
    else{
        res.redirect('/');
    }
}

exports.locationview = async (req,res) => {
    const cookieToken = req.cookies['jwt'];
    if(cookieToken)
    {
        res.render('layouts/outletview',{module: "Location", location: true});
    }
    else{
        res.redirect('/');
    }
}

exports.itemadd = async (req,res) => {
    const cookieToken = req.cookies['jwt'];
    if(cookieToken)
    {
        res.render('layouts/outletadd',{module: "Item", item: true});
    }
    else{
        res.redirect('/');
    }
}

exports.itemview = async (req,res) => {
    const cookieToken = req.cookies['jwt'];
    if(cookieToken)
    {
        res.render('layouts/outletview',{module: "Item", item:true});
    }
    else{
        res.redirect('/');
    }
}



exports.reportview = async (req,res) => {
    const cookieToken = req.cookies['jwt'];
    if(cookieToken)
    {
        res.render('layouts/outletview',{module: "Report"});
    }
    else{
        res.redirect('/');
    }
}




exports.tableData = async (req,res) => {
    let data = {
        "total": 800,
        "totalNotFiltered": 800,
        "rows": [{
            "id": 0,
            "name": "darshak shah",
            "mobile": "1234578",
            "location": "India",
            "Action": ""

        }]
    };

    res.send(data);
}