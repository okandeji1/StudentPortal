const express = require('express');
const path = require('path');
const favicon = require('static-favicon');
// const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const expressSession = require('express-session');
const passport = require('passport');
// require('./config/passport')(passport); // pass passport for configuration
const Strategy = require('passport-local');
const config = require('./config/database');
const bcrypt = require('bcryptjs');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const routes = require('./routes/index');
// const users = require('./routes/users');
const app = express();
const swal = require('sweetalert');
const multer = require('multer');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('./public'));
app.use('/static', express.static(path.join(__dirname, './public')));
app.use(favicon());
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser('secretString'));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true, cookie: { maxAge: 60000 } }));
app.use(require('connect-flash')());
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
});

// Creating database connection

mongoose.connect(config.database);

let db = mongoose.connection;

//  Check for connection

db.once('open', function() {
    console.log("Database connected!");
});

//  Check for db connection error

db.on('error', console.error.bind(console, 'connection error:'));

// Bring in model

let User = require('./models/user');
passport.use(new Strategy(User.authenticate()));
passport.serializeUser(User.serializeUser(function(user, done) {
    done(null, user.id)
}, ));
passport.deserializeUser(User.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
}));

// app.use(function(req, res, next) {
//     if (req.session.user == undefined) {
//         return res.render('login', { title: 'Hello - Please Login To Your Account' });
//     } else {
//         next();
//     }
// });

app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
    req.flash("error", "Please login");
    // res.redirect('/login')
})


app.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Node App',
        message: 'Oh! What a wonderful morning it is',
        copyrightYear: new Date().getFullYear()
    });
});

// Edit User Data

app.get('/edit/:id', async(req, res) => {
    try {
        let editUser = await User.findById({ _id: req.params.id })
            // console.log(editUser)
    } catch (error) {
        res.status(500)
    }
});

app.put('/edit/:id', async(req, res) => {
    try {
        let editUser = await User.findByIdAndUpdate({
            _id: req.params.id
        }, req.body);
        console.log(editUser)
    } catch (error) {
        res.send(500)
    }
})

// app.param('id', function(req, res, next, id) {
//     User.findById(id, function(err, doc) {
//         if (err) res.json(err);
//         else {
//             req.user._id = doc;
//             next();
//         }
//     });
// });

// app.put('/edit/:id', function(req, res) {
//     user.findByIdAndUpdate({ id: editUser }, {
//         name: req.body.name,
//         age: req.body.age
//     }, function(err, editUser) {
//         if (err) res.json(err);
//         else {
//             console.log(docs);
//             res.redirect('/admin/edit/' + editUser);
//         }
//     });
// });

// app.get(':id/edit', function(req, res) {
//     res.render('edit');
// });

// Display all user in the admin page

app.get('/admin', function(req, res, next) {
    User.find({}, function(err, users) {
        if (err)
            return done(err);

        if (users) {
            // console.log("Users count : " + users.length);
            // res.render('admin', {
            // usersArray: users
            // });
            res.render('admin', {
                title: 'Node App',
                message: 'Admin Page',
                usersArray: users,
                copyrightYear: new Date().getFullYear()
            });
        }
    });
});

app.get('/dashboard', function(req, res, next) {
    let user = req.user;
    User.findOne(user, (err, user) => {
        if (err) {
            console.log(err)
        }
        // console.log(user._id)
    })
    res.render('dashboard', {
        title: 'Node App',
        message: 'Welcome To Your Portal',
        error: req.flash("error", "Something went wrong"),
        copyrightYear: new Date().getFullYear()
    });
});

// Display User Data in User Profile Page

app.get('/profile', (req, res, next) => {
    let user = req.user;
    // console.log(user);
    // return;
    User.findOne(user, (err, user) => {
        if (err) {
            console.log(err)
            req.flash("error", "Something went wrong");
            swal("Something went wrong")
        }
        // console.log(user)
    })
    res.render('profile', { user });
});


app.get('/login', function(req, res, next) {
    res.render('login', {
        // errors: req.flash('danger', 'Please fill the form properly'),
        // message: req.flash('success', 'You are registered and can now login'),
        copyrightYear: new Date().getFullYear()
    });
});



// User Registration process

app.post('/dashboard', (req, res, next) => {
    // console.log(req.body.email);
    let matric = req.body.matric;
    let username = req.body.name;
    let email = req.body.username;
    let password = req.body.password;
    let password2 = req.body.password2;
    let phone = req.body.phone;
    let faculty = req.body.faculty;
    let department = req.body.department;
    let programme = req.body.programme;
    let level = req.body.level;
    let address = req.body.address;
    let photo = req.body.photo;

    req.checkBody('matric', 'Matric is required').notEmpty();
    req.checkBody('username', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Password do not match').equals(req.body.password);
    req.checkBody('phone', 'Phone is required').notEmpty();
    req.checkBody('faculty', 'Faculty is required').notEmpty();
    req.checkBody('department', 'Department is required').notEmpty();
    req.checkBody('programme', 'Programme is required').notEmpty();
    req.checkBody('level', 'Level is required').notEmpty();
    req.checkBody('address', 'Address is required').notEmpty();
    // req.checkBody('photo', 'Photo is required').notEmpty();

    let errors = req.validationErrors();

    if (errors) {
        res.render('login', {
            errors: req.flash('danger', 'Please fill the form properly'),
            message: req.flash('success', 'You are registered and can now login')
        })
    } else {

        const newUser = req.body;
        const password = req.body.password;
        delete newUser.password;
        // console.log(newUser);
        // console.log(password);
        // return false;
        User.register(new User(newUser), password,
            (err, newUsers) => {

                // console.log(newUsers);

                if (err) {
                    console.log(err);
                } else {
                    req.flash('Successfully Signed Up!  Nice to meet you' + req.body.username)
                    swal("Successfully Signed Up!  Nice to meet you" + req.body.username)
                    res.redirect('/login');

                }
            });

    }


});

// User Login
app.post('/login', passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: true,
        // successRedirect: '/dashboard'
    }),
    async(req, res, next) => {

        let query = { username: req.body.username };
        let user = User.findOne(query, (err, user) => {
            if (err) throw err;
            if (!user) {
                return done(null, false, { message: 'No user found' });
                swal("No user found")
            } else {
                req.session.user = user;
                req.session.save((err) => {
                    if (err) {
                        return next(err);
                    } else {
                        // res.send(user)
                        res.redirect('/dashboard')

                    }
                })

            } // console.log(req.body);
        })
    });

// User Logout Session

app.get('/logout', (req, res, next) => {
    req.logout();
    req.flash('success', 'You are logged out')
    req.session.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/login');
    });
});



// // Edit User Data

// app.post('/edit', (req, res) => {
//     let user = {};
//     user.username = req.body.username;
//     user.email = req.body.email;
//     user.phone = req.body.phone;
//     user.address = req.body.addresss;
//     user.photo = req.body.photo

//     let query = { user }

//     User.findOneAndUpdate(query, user, (err) => {
//         if (err) {
//             console.log(err);
//             return;
//         } else {
//             res.redirect('/admin')
//             req.flash("message", "User successfully updated");
//         }
//     })
// })



// app.get('/edit', function(req, res) {
//     res.render('edit');
// });

// app.put('/admin', function(req, res) {
//     User.update({ _id: req.params.id }, {
//         username: req.body.username,
//         address: req.body.address
//     }, function(err, users) {
//         if (err) throw err;
//         else res.redirect('/admin' + req.params.id);
//     });
// });

// app.param('id', function(req, res, next, id) {
//     user.findById(id, function(err, users) {
//         if (err) throw err;
//         else {
//             req.user._id = users;
//             console.log(req.user_id)
//             next();
//         }
//     });
// });



// // catch 404 and forwarding to error handler
// app.use(function(req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

// /// error handlers

// // development error handler
// // will print stacktrace
// if (app.get('env') === 'development') {
//     app.use(function(err, req, res, next) {
//         res.status(err.status || 500);
//         res.render('error', {
//             message: err.message,
//             error: err
//         });
//     });
// }

// // production error handler
// // no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//         message: err.message,
//         error: {}
//     });
// });



app.listen(4000, () => {
    console.log('Server is on and listening on 4000');
});


module.exports = app;