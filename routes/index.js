const router = require("express").Router();

const authRoutes = require("./auth-routes");
//const adminRoutes = require("./admin-route");

router.use("/auth", authRoutes);
//router.use("/admin", adminRoutes);

router.get('/register', (req, res) => {
    res.render('register'); // This should match the name of your .ejs file
});

router.get('/login', (req, res) => {
    res.render('login'); // This should match the name of your .ejs file
});

router.get('/verify', (req, res) => {
    res.render('verificationForm', { errorMessage: null }); // This should match the name of your .ejs file
});

router.get('/dashboard', (req, res) => {
    res.render('dashboard', { errorMessage: null }); // This should match the name of your .ejs file
});

router.get('/widgets', (req, res) => {
    res.render('widgets', { errorMessage: null }); // This should match the name of your .ejs file
});

router.get('/tables', (req, res) => {
    res.render('tables', { errorMessage: null }); // This should match the name of your .ejs file
});

router.get('/settings', (req, res) => {
    res.render('settings', { errorMessage: null }); // This should match the name of your .ejs file
});

router.get('/project', (req, res) => {
    res.render('project', { errorMessage: null }); // This should match the name of your .ejs file
});

router.get('/price', (req, res) => {
    res.render('price', { errorMessage: null }); // This should match the name of your .ejs file
});

router.get('/media-gallery', (req, res) => {
    res.render('media_gallery', { errorMessage: null }); // This should match the name of your .ejs file
});

router.get('/map', (req, res) => {
    res.render('map', { errorMessage: null }); // This should match the name of your .ejs file
});

router.get('/invoice', (req, res) => {
    res.render('invoice', { errorMessage: null }); // This should match the name of your .ejs file
});

router.get('/index', (req, res) => {
    res.render('index', { errorMessage: null }); // This should match the name of your .ejs file
});

router.get('/icons', (req, res) => {
    res.render('icons', { errorMessage: null }); // This should match the name of your .ejs file
});

router.get('/general-elements', (req, res) => {
    res.render('general_elements', { errorMessage: null }); // This should match the name of your .ejs file
});

router.get('/email', (req, res) => {
    res.render('email', { errorMessage: null }); // This should match the name of your .ejs file
});

router.get('/dashboard-2', (req, res) => {
    res.render('dashboard_2', { errorMessage: null }); // This should match the name of your .ejs file
});

router.get('/contact', (req, res) => {
    res.render('contact', { errorMessage: null }); // This should match the name of your .ejs file
});

router.get('/charts', (req, res) => {
    res.render('charts', { errorMessage: null }); // This should match the name of your .ejs file
});

router.get('/calendar', (req, res) => {
    res.render('calendar', { errorMessage: null }); // This should match the name of your .ejs file
});

router.get('/profile', (req, res) => {
    res.render('profile', { errorMessage: null }); // This should match the name of your .ejs file
});

router.get('/404_error', (req, res) => {
    res.render('404_error', { errorMessage: null }); // This should match the name of your .ejs file
});

module.exports = router;
