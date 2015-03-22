module.exports = function(app) {
    app.use(require('./main'));
    app.use(require('./locations'));
};