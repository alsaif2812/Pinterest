var express = require('express');
var router = express.Router();
const passport = require('passport');
const userModel = require('./users');
const postModel = require('./post');
const upload = require('./multer');


const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));


router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(404).send('No files were uploaded.');
  }
  res.send('file uploaded successfully!');
});


router.get('/feed', function (req, res, next) {
  res.render('feed');
});
router.get('/login', function (req, res, next) {
  res.render('login', { error: req.flash('error') });
});
router.get('/profile', isLoggedInd, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  res.render("profile", { user })
});
router.post('/register', function (req, res, next) {
  const { username, email, fullname } = req.body;
  const userData = new userModel({ username, email, fullname });
  userModel.register(userData, req.body.password)
    .then(function () {
      passport.authenticate("local"), req, res, function () {
        res.redirect("/profile")
      }
    })
});

router.post('/login', passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true
}), function (req, res, next) {
});

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });

})

function isLoggedInd(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}
module.exports = router;
