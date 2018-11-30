var express = require('express');
var router = express.Router();

/* GET home page. */
// router.get('/', function(req, res, next) {
//     res.render('index', {
//         title: 'Node App',
//         message: 'Oh! What a wonderful morning it is',
//         copyrightYear: new Date().getFullYear()
//     });
// });

// router.get('/about', function(req, res, next) {
router.get('/', function(req, res, next) {
    res.render('about', {
        title: 'Node App',
        message: 'This is the about page',
        copyrightYear: new Date().getFullYear()
    });
});

module.exports = router;