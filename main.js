// app/routes.js
module.exports = function(app, passport) {

        // =====================================
        // HOME PAGE (with login links) ========
        // =====================================
        app.get('/', function(req, res, next) {
            // const user = [{
            //     name: '',
            //     email: '',
            //     password: '',
            //     address: '',
            //     phone: '',
            // }]
            res.render('index', {
                title: 'Node App',
                message: 'Oh! What a wonderful morning it is',
                copyrightYear: new Date().getFullYear()
            });
        });

        // =====================================
        // LOGIN ===============================
        // =====================================
        // show the login form
        app.get('/about', function(req, res, next) {
            res.render('about', {
                title: 'Node App',
                message: 'This is the about page',
                copyrightYear: new Date().getFullYear()
            });
        });
    },
    // route middleware to make sure a user is logged in
    function isLoggedIn(req, res, next) {

        // if user is authenticated in the session, carry on 
        if (req.isAuthenticated())
            return next();

        // if they aren't redirect them to the home page
        res.redirect('/');
    }