const express = require('express')
const path = require('path')
const router = express.Router();
const authController = require('../controllers/auth.js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const cookie = require('cookie-parser')

router.get('/', (req,res) => {
    if(req.cookies['jwt'])
    {
        const auth = true;
        res.render('index',{auth: auth});
    }
    else{
        res.render('index');
    }
    
    
});
router.get('/login', (req,res) => {
    if(req.cookies['jwt'])
    {
        res.redirect('dashboard');
    }
    res.render('login');
});

router.get('/register', (req,res) => {
    if(req.cookies['jwt'])
    {
        res.redirect('dashboard');
    }
    res.render('register');
});

router.get('/dashboard', authController.checkLogin);
router.get('/logout', authController.logout);
router.get('/merchant/add', authController.add);
router.get('/merchant/view', authController.view);
router.get('/outlet/add', authController.outletadd);
router.get('/outlet/view', authController.outletview);
router.get('/staff/add', authController.staffadd);
router.get('/staff/view', authController.staffview);
router.get('/customer/add', authController.customeradd);
router.get('/customer/view', authController.customerview);
router.get('/driver/add', authController.driveradd);
router.get('/driver/view', authController.driverview);
router.get('/itemcategory/add', authController.itemcategoryadd);
router.get('/itemcategory/view', authController.itemcategoryview);
router.get('/weighttypes/add', authController.weighttypesadd);
router.get('/weighttypes/view', authController.weighttypesview);
router.get('/location/add', authController.locationadd);
router.get('/location/view', authController.locationview);
router.get('/item/add', authController.itemadd);
router.get('/item/view', authController.itemview);
router.get('/data', authController.tableData);
router.get('/report/view', authController.reportview);
module.exports = router;