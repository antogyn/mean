module.exports.about = function(req, res) {
    res.render('about', { title: 'About' });
};

module.exports.signin = function(req, res) {
    res.render('signin-index', { title: 'Sign in' });
};