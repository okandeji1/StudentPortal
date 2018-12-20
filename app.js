var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
// var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var expressFlash = require('express-flash');
var expressSession = require('express-session');
var passport = require('passport');
var Strategy = require('passport-local');
var config = require('./config/database');
var bcrypt = require('bcryptjs');
var ejs = require('ejs');
var mongoose = require('mongoose');
// var routes = require('./routes/index');
var app = express();
var swal = require('sweetalert');
var multer = require('multer');
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
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
});

app.use(require('connect-flash')());
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// app.configure(function() {
//     app.use(express.cookieParser('keyboard cat'));
//     app.use(express.session({ cookie: { maxAge: 60000 } }));
//     app.use(flash());
// });
// Custom flash middleware -- from Ethan Brown's book, 'Web Development with Node & Express'
// app.use(function(req, res, next) {
//     // if there's a flash message in the session request, make it available in the response, then delete it
//     res.locals.sessionFlash = req.session.sessionFlash;
//     delete req.session.sessionFlash;
//     next();
// });

// Route that creates a flash message using the express-flash module
// app.all('/express-flash', function(req, res) {
//     req.flash('success', 'This is a flash message using the express-flash module.');
//     res.redirect(301, '/');
// });

// Route that creates a flash message using custom middleware
// app.all('/session-flash', function(req, res) {
//     req.session.sessionFlash = {
//         type: 'success',
//         message: 'This is a flash message using custom middleware and express-session.'
//     }
//     res.redirect(301, '/');
// });


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


app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
    req.flash("error", "Please login");
    // res.redirect('/login')
})


app.get('/', function(req, res, next) {
    res.render('index', {
        expressFlash: req.flash('success'),
        sessionFlash: res.locals.sessionFlash,
        title: 'Node App',
        message: 'Oh! What a wonderful morning it is',
        copyrightYear: new Date().getFullYear()
    });
});

// Edit User Data

// app.get('/edit/:id', async(req, res) => {
//     try {
//         let editUser = await User.findById({ _id: req.params.id })
//             // console.log(editUser)
//     } catch (error) {
//         res.status(500)
//     }
// });

// app.put('/edit/:id', async(req, res) => {
//     try {
//         let editUser = await User.findByIdAndUpdate({
//             _id: req.params.id
//         }, req.body);
//         console.log(editUser)
//     } catch (error) {
//         res.send(500)
//     }
// })

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
        copyrightYear: new Date().getFullYear()
    });
});

// Display User Data in User Profile Page

app.get('/profile', (req, res, next) => {
    let user = req.user;
    // console.log(user.photo);
    // return;
    User.findOne(user, (err, user) => {
        if (err) {
            console.log(err)
        }
        // console.log(user)
    })
    res.render('profile', { user });
});

// =====================================
// UPDATE PROFILE =================
// =====================================

app.get('/update', function(req, res, next) {
    User.findById({ _id: req.session.user._id })
        .exec(function(err, user) {
            if (err) {
                return next(err);
            } else {
                // console.log(user)
                // return false
                return res.render('update', {
                    user: user
                });
            }
        });
});

// =====================================
// PROCESS UPDATE PROFILE=======================
// =====================================
// process the update profile form

app.post('/update', function(req, res) {
    User.update({ _id: req.session.user._id }, {
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address
    }, function(err) {
        if (err) {
            console.log(err);
        } else {
            // console.log(req.session.user);
            // return false
            // req.flash('Profile Updated Successfully' + req.body.username);
            // res.send('Good Job');
            res.redirect('/profile')
        }
    });
    // res.render('profile', {
    //     user: req.user // get the user out of session and pass to template
    // });
});

// Get Login Page

app.get('/login', function(req, res, next) {
    res.render('login', {
        expressFlash: req.flash(),
        sessionFlash: res.locals.sessionFlash,
        copyrightYear: new Date().getFullYear()
    });
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
                req.flash("No user found")
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

// Image Upload
var imageName;
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/images/')
    },
    filename: function(req, file, cb) {
        // imageName = cb(null, file.fieldname + '-' + Date.now() + '.jpg')
        imageName = Date.now() + path.extname(file.originalname);

        cb(null, imageName); // Appending extension
    }
})

var upload = multer({ storage: storage })


// User Registration process

app.post('/dashboard', upload.single('photo'), (req, res, next) => {
    console.log(filename);
    return false

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
    let photo = imageName;

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
        console.log(errors);
        res.render('login', {
            // errors: req.flash('danger', 'Please fill the form properly'),
            // message: req.flash('success', 'You are registered and can now login')
        })
    } else {

        const newUser = req.body;
        const password = req.body.password;
        delete newUser.password;
        newUser.photo = imageName;
        // console.log(newUser);
        // return false

        User.register(new User(newUser), password,
            (err, newUsers) => {
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





// // Edit User Data

// app.get('/edit', function(req, res) {
//     res.render('edit', {
//         user: req.user
//     });
// });

// app.put('/admin/edit', function(req, res) {
//     User.update({ _id: req.user.id }, {
//         username: req.body.username,
//         address: req.body.address
//     }, function(err, users) {
//         if (err) throw err;
//         else res.redirect('/admin' + req.user.id);
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