module.exports.about = function(req, res) {
    res.render('index', { title: 'about' });
};

module.exports.signin = function(req, res) {
    res.render('index', { title: 'signin' });
};