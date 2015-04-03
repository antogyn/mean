var request = require('request');

var port = process.env.PORT || '5000';
var hostname = process.env.IP || '0.0.0.0';

var apiOptions = {
  server : "http://" + hostname + ":" + port
};

if (process.env.NODE_ENV === 'production') {
  apiOptions.server = "https://antogyn-mean.herokuapp.com";
}

var _formatDistance = function(distance) {
    if (distance > 1) {
        return parseFloat(distance).toFixed(1) + 'km';
    } else {
        return parseInt(distance*1000, 10) + 'm';
    }
};

var renderHomepage = function(req, res, err, locations) {
    var errorMessage;
    if (err || !(locations instanceof Array)) {
        errorMessage = "API lookup error";
        locations = [];
    } else if (!locations.length) {
        errorMessage = "No places found nearby";
    }
    
    var i, n;
    for (i=0, n=locations.length; i<n; i++) {
        locations[i].distance = _formatDistance(locations[i].distance);
    }
    
    res.render('locations-list', {
        title: 'Home',
        locations: locations,
        errorMessage: errorMessage
    });
};

var renderLocationInfo = function(req, res, location) {
    res.render('location-info', {
        title: 'Location info',
        location: location,
    });
};

/* GET home page */
module.exports.homelist = function(req, res) {
    var requestOptions, path;
    path = '/api/locations';
    requestOptions = {
        url : apiOptions.server + path,
        method : "GET",
        json : {},
        qs : {
            lat : 48.811553,
            lng : 2.040610,
            maxdist : Infinity // everything
        }
    };
    request(
        requestOptions,
        function(err, response, body) {
            renderHomepage(req, res, err, body);
        }
    );
};

/* GET home page */
module.exports.locationInfo = function(req, res) {
    
    var requestOptions, path;
    path = '/api/locations/' + req.params.locationid;
    requestOptions = {
        url : apiOptions.server + path,
        method : "GET",
        json : {},
    };
    request(
        requestOptions,
        function(err, response, location) {
            if (response.statusCode === 200) {
                renderLocationInfo(req, res, location);
            } else {
                _showError(req, res, response.statusCode, err);
            }
        }
    );
};

/** todo : use globally */
var _showError = function(req, res, status, err) {
    var title, message;
    if (status === 404) {
        title = "404, page not found";
        message = "Looks like we can't find that page. Sorry.";
    } else {
        title = status + ", something's gone wrong";
        message = "Woops, something has gone wrong.";
    }
    res.status(status);
    res.render('bad-status', {
        title: title,
        message: message,
        error: err
    });
};

/* GET home page */
module.exports.addReview = function(req, res) {
    res.render('location-review-form', { title: 'Add review' });
};