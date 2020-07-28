require("dotenv").config()
const express = require("express")
const router = express.Router()
const gravatar = require("gravatar")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const passport = require("passport")
//load user model
const User = require("../../models/User")
//load category model
const Category = require("../../models/Category")



//TODO: organize routes using 'controllers'
//FIXME: change test routes to actual routes


// test users
router.get("/test", function (req, res) {
    User.find(
        {},
    ).then( results => {
        res.json(results)
    })

    // User.find(
    //     {},
    //     function(err, foundUsers) {
    //         if (err) {
    //             console.log("error in user test route", err)
    //         } else {
    //             User.getFriends(foundUsers, function (err, friendships) {
    //                 if (err) {
    //                     console.log("error in get friends test route", err)
    //                 } else {
    //                     res.json(friendships)
    //                 }
    //             })
    //         }
    //     }) 
    // )
    // res.json({ msg: "Users endpoint working" })
    
})


router.post("/register", function (req, res) {
    User.findOne({ email: req.body.email }).then(user => {

        if (user) {
            return res.status(400).json({ email: "email exits" })
        } else {
            const avatar = gravatar.url(req.body.email, {
                s: "200",
                r: "pg",
                d: "mm",
            })
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                avatar,
            })
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) { 
                        throw err
                    }
                    newUser.password = hash
                    newUser.save().then(user => res.json(user)).catch(err => console.log(err))
                })
            })
        }
    })
})

router.post("/login", function (req, res) {
    const email = req.body.email
    const password = req.body.password

    User.findOne({ email }).then(user => {
        if (!user) {
            return res.status(400).json({ email: "user not found" })
        }
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                const payload = { id: user.id, name: user.name, avatar: user.avatar }
                jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
                    res.json({ success: true, token: "bearer" + token })
                })
            } else {
                return res.status(400).json({ password: "password is incorrect" })
            }
        })
    })
})

//test friend request
//add a friend
router.post('/friendrequest', function (req, res) {
    User.requestFriend(req.body.userA, req.body.userB, function(err) { 
        if(err){
            console.log(err)
        } else {
            res.redirect('/api/users/test')
        }
    })
})
//show friend
router.get('/friendrequest/:userId', function (req, res) {
    User.find(
        {}, function(err, allUsers) {
            if (err) {
                console.log(err)
            } else {
                User.findById(req.params.userId, function(err, foundUser) {
                    if (err) {
                        console.log(err)
                    } else {
                        User.getFriends(foundUser, function (err, friendships) {
                            if (err) {
                                console.log(err)
                            } else {
                                res.json(friendships)
                            }
                        })
                    }
                })
            }
        }
    )
})


//test categories
router.get("/test/categories", function (req, res) {
    res.json({ msg: "categories is working"})
})

router.post("/test/categories", function (req, res) {
    const newCategory = new Category({
        name: req.body.name
    })

    newCategory.save()
        .then(category => res.json(category))
        .catch(err => console.log(err))
})


module.exports = router 