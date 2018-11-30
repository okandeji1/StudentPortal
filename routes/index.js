var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcrypt-nodejs');



/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Node App',
        message: 'Oh! What a wonderful morning it is',
        copyrightYear: new Date().getFullYear()
    });
});

module.exports = router;