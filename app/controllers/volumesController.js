const {Volume} = require('../models/volume');


module.exports = {
    index: (req, res, next) => {
        Volume.find()
            .then(volumes => {
                res.locals.volumes = volumes;
                next();
            })
            .catch(error => {
                console.log(`Error fetching users: ${error.message}`);
                next(error);
            });
    }, 
    indexView: (req, res) => {
        res.render("volumes/index");
    },
    
    integrateWithGoogle: (req, res, next) => {
        
    },

    create: (req, res, next) => {
        if (req.skip) next();
        let newUser = new User(getUserParams(req.body));
        User.register(newUser, req.body.password, (error, user) => {
            if (user) {
                req.flash("success", `${user.fullName}'s account created successfully!`);
                res.locals.redirect = "/users";
                next();
            } else {
                req.flash("error", `Failed to create user account because: ${error.message}.`);
                res.locals.redirect = "/users/new";
                next();
            }
        });
    }, 

    redirectView: (req, res, next) => {
        let redirectPath = res.locals.redirect;
        if (redirectPath) res.redirect(redirectPath);
        else next();
    }, 
    
    show: (req, res, next) => {
        let volumeId = req.params.id;
        Volume.findById(volumeId)
            .then(volume => {
                res.locals.volume = volume;
                next();
            })
            .catch(error => {
                console.log(`Error fetching user by ID: ${error.message}`);
                next(error);
            });
    },
    
    showView: (req, res) => {
        res.render("volumes/show");
    },

    edit: (req, res, next) => {
        let volumeId = req.params.id;
        Volume.findById(volumeId)
            .then(volume => {
                res.render("volumes/edit", {
                    volume: volume
                });
            })
            .catch(error => {
                console.log(`Error fetching user by ID: ${error.message}`);
                next(error);
            });
    },

    update: (req, res, next) => {
        let volumeId = req.params.id,
            volumeParams = {
                name: {
                    first: req.body.first,
                    last: req.body.last
                },
                email: req.body.email,
                password: req.body.password,
                zipCode: req.body.zipCode
            };
        Volume.findByIdAndUpdate(volumeId, {
            $set: volumeParams
        })
            .then(volume => {
                res.locals.redirect = `/volumes/${volumeId}`;
                res.locals.volume = volume;
                next();
            })
            .catch(error => {
                console.log(`Error updating user by ID: ${error.message}`);
                next(error);
            });
    },

    delete: (req, res, next) => {
        let volumeId = req.params.id;
        User.findByIdAndRemove(volumeId)
            .then(() => {
                res.locals.redirect = "/volumes";
                next();
            })
            .catch(error => {
                console.log(`Error deleting user by ID: ${error.message}`);
                next();
            });
    }, 

}