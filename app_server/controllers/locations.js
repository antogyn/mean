/* GET home page */
module.exports.homelist = function(req, res) {
    res.render('locations-list', {
        title: 'Home',
        locations: [{
            name: 'My place',
            address: 'localhost',
            rating: 5,
            facilities: ['Everything'],
            distance:'0m'
        },{
            name: 'Random place',
            address: '25 rue des Pommiers, 78330, Fontenay-le-Fleury',
            rating: 3,
            facilities: ['Coffee','Food','Free wifi'],
            distance:'500m'
        }]
    
    });
};

/* GET home page */
module.exports.locationInfo = function(req, res) {
    res.render('location-info', { title: 'Location info' });
};

/* GET home page */
module.exports.addReview = function(req, res) {
    res.render('location-review-form', { title: 'Add review' });
};