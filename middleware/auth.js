// Block access if user is not logged in
exports.requireLogin = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/user/login');
    }
    next();
};

// Redirect logged-in users away from login and signup pages
exports.redirectIfLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    next();
};
