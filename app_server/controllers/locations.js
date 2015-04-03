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

var getLocationInfo = function (req, res, callback) {
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
                callback(req, res, location);
            } else {
                _showError(req, res, response.statusCode, err);
            }
        }
    );
};

var renderLocationsList = function(req, res, err, locations) {
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

var renderLocationReviewForm = function(req, res, location) {
    res.render('location-review-form', {
        title: 'Review '+ location.name,
        location: location
    });
};

/**/
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
            renderLocationsList(req, res, err, body);
        }
    );
};

/**/
module.exports.locationInfo = function(req, res) {
    getLocationInfo(req, res, function(req, res, location) {
        renderLocationInfo(req, res, location);
    });
};

/**/
module.exports.addReview = function(req, res) {
    getLocationInfo(req, res, function(req, res, location) {
        renderLocationReviewForm(req, res, location);
    });
};

/**/
module.exports.doAddReview = function(req, res) {
    var requestOptions, path, locationid, postdata;
    locationid = req.params.locationid;
    path = "/api/locations/" + locationid + '/reviews';
    postdata = {
        author: req.body.name,
        rating: parseInt(req.body.rating, 10),
        reviewText: req.body.review
    };
    requestOptions = {
        url : apiOptions.server + path,
        method : "POST",
        json : postdata
    };
    request(
        requestOptions,
        function(err, response, body) {
            if (response.statusCode === 201) {
                res.redirect('/location/' + locationid);
            } else {
                _showError(req, res, response.statusCode);
            }
        }
    );
};