
const {User} = require("../models/user");
// const getUserParams = body => {
//         return {
//             firstName: body.firstName,
//             lastName: body.lastName,
//             email: body.email,
//             accountName: body.accountName,
//             password: body.password,
//         };
//     };

module.exports = {
    index: (req, res, next) => {
        User.find()
            .then(users => {
                res.locals.users = users;
                next();
            })
            .catch(error => {
                console.log(`Error fetching users: ${error.message}`);
                next(error);
            });
    },

    indexView: (req, res) => {
        res.render("users/index");
    },

    new: (req, res) => {
        res.render("users/new");
    },

    // An User is created when user authenticated first time
    // create: (req, res, next) => {
    //     //if (req.skip) next();
    //     let newUser = new User(getUserParams(req.body));
    //     User.register(newUser, req.body.password, (error, user) => {
    //         if (user) {
    //             req.flash("success", `${user.fullName}'s account created successfully!`);
    //             res.locals.redirect = "/users";
    //             next();
    //         } else {
    //             req.flash("error", `Failed to create user account because: ${error.message}.`);
    //             res.locals.redirect = "/users/new";
    //             next();
    //         }
    //     });
    // },

    redirectView: (req, res, next) => {
        let redirectPath = res.locals.redirect;
        if (redirectPath) res.redirect(redirectPath);
        else next();
    },

    show: (req, res, next) => {
        let userId = req.params.id;
        User.findById(userId)
            .then(user => {
                res.locals.user = user;
                next();
            })
            .catch(error => {
                console.log(`Error fetching user by ID: ${error.message}`);
                next(error);
            });
    },

    showView: (req, res) => {
        res.render("users/show");
    },

    edit: (req, res, next) => {
        let userId = req.params.id;
        User.findById(userId)
            .then(user => {
                res.render("users/edit", {
                    user: user
                });
            })
            .catch(error => {
                console.log(`Error fetching user by ID: ${error.message}`);
                next(error);
            });
    },

    update: (req, res, next) => {
        let userId = req.params.id,
            userParams = {
                name: {
                    first: req.body.first,
                    last: req.body.last
                },
                email: req.body.email,
                password: req.body.password,
                zipCode: req.body.zipCode
            };
        User.findByIdAndUpdate(userId, {
            $set: userParams
        })
            .then(user => {
                res.locals.redirect = `/users/${userId}`;
                res.locals.user = user;
                next();
            })
            .catch(error => {
                console.log(`Error updating user by ID: ${error.message}`);
                next(error);
            });
    },

    delete: (req, res, next) => {
        let userId = req.params.id;
        User.findByIdAndRemove(userId)
            .then(() => {
                res.locals.redirect = "/users";
                next();
            })
            .catch(error => {
                console.log(`Error deleting user by ID: ${error.message}`);
                next();
            });
    },
    
    
    // validate: (req, res, next) => {
    //     req
    //         .sanitizeBody("email")
    //         .normalizeEmail({
    //             all_lowercase: true
    //         })
    //         .trim();
    //     req.check("email", "Email is invalid").isEmail();

    //     req.check("password", "Password cannot be empty").notEmpty();

    //     req.getValidationResult().then(error => {
    //         if (!error.isEmpty()) {
    //             let messages = error.array().map(e => e.msg);
    //             req.skip = true;
    //             req.flash("error", messages.join(" and "));
    //             res.locals.redirect = "/users/new";
    //             next();
    //         } else {
    //             next();
    //         }
    //     });
    // },

    logout: (req, res, next) => {
        req.logout();
        req.flash("success", "You have been logged out!");
        res.locals.redirect = "/";
        next();
    }
};