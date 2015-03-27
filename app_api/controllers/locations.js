var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

/** geoNear works with radians */
var theEarth = (function(){
    var _earthRadius = 6371;
    var getDistanceFromRads = function(rads) {
        return parseFloat(rads * _earthRadius);
    };
    var getRadsFromDistance = function(distance) {
        return parseFloat(distance / _earthRadius);
    };
    return {
        getDistanceFromRads : getDistanceFromRads,
        getRadsFromDistance : getRadsFromDistance
    };
})();

var sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

var getLocationsFromGeo = function(results) {
    var locations = [];
    results.forEach(function(doc) {
        /**
         * everything included for now
         * 
        locations.push({
            // doc.dis = radians, doc.obj = result
            distance: theEarth.getDistanceFromRads(doc.dis),
            name: doc.obj.name,
            address: doc.obj.address,
            rating: doc.obj.rating,
            facilities: doc.obj.facilities,
            _id: doc.obj._id
        });
        */
        doc.distance = theEarth.getDistanceFromRads(doc.dis);
        locations.push(doc);
    });
    return locations;
};

var doAddReview = function(req, res, location) {
    if (!location) {
        sendJsonResponse(res, 404, {
            "message": "location not found"
        });
        return;
    }
    location.reviews.push({
        author: {
            displayName: req.body.author
        },
        rating: req.body.rating,
        reviewText: req.body.reviewText
    });
    location.save(function(err, location) {
        var thisReview;
        if (err) {
            sendJsonResponse(res, 400, err);
        } else {
            updateAverageRating(location._id);
            thisReview = location.reviews[location.reviews.length - 1];
            sendJsonResponse(res, 201, thisReview);
        }
    });
};

var updateAverageRating = function(locationid) {
    Loc
        .findById(locationid)
            .select('rating reviews')
            .exec(
                function(err, location) {
                if (!err) {
                    doSetAverageRating(location);
                }
            });
};

var doSetAverageRating = function(location) {
    var i, reviewCount, ratingAverage, ratingTotal;
    if (location.reviews && location.reviews.length > 0) {
        reviewCount = location.reviews.length;
        ratingTotal = 0;
        for (i = 0; i < reviewCount; i++) {
            ratingTotal = ratingTotal + location.reviews[i].rating;
        }
        ratingAverage = parseInt(ratingTotal / reviewCount, 10);
        location.rating = ratingAverage;
        location.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Average rating updated to", ratingAverage);
            }
        });
    }
};

var fillLocationFromRequest = function(req, location) {
    location.name = req.body.name;
    location.address = req.body.address;
    location.facilities = req.body.facilities.split(",");
    location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
    location.openingTimes = [{
        days: req.body.days1,
        opening: req.body.opening1,
        closing: req.body.closing1,
        closed: req.body.closed1,
    }, {
        days: req.body.days2,
        opening: req.body.opening2,
        closing: req.body.closing2,
        closed: req.body.closed2,
    }];
    return location;
}


/******************************************************/


/**
 * 
 * @param {Object} req
 * @param {string} req.query.lng required
 * @param {string} req.query.lat required
 * @param {string} req.query.maxdist default 20
 * @param {Object} res
 */
module.exports.locationsListByDistance = function(req, res) {
    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);
    var maxdist = parseFloat(req.query.maxdist) || 20;
    
    if ((!lng && lng !== 0) || (!lat && lat !== 0)) {
        sendJsonResponse(res, 404, {
            "message": "lng and lat query parameters are required"
        });
        return;
    }
    
    var point = {
        type: "Point",
        coordinates: [lng, lat]
    };
    var geoOptions = {
        spherical: true,
        num: 18,
        maxDistance: theEarth.getRadsFromDistance(maxdist)
    };
    Loc.geoNear(point, geoOptions, function(err, results, stats) {
        if (err) {
            sendJsonResponse(res, 404, err);
            return;
        }
        sendJsonResponse(res, 200, getLocationsFromGeo(results));
    });
};

/**
 * TODO : fix openingTimes
 */
module.exports.locationsCreate = function(req, res) {
    console.log(req.body);
    Loc.create(fillLocationFromRequest(req, {}), function(err, location) {
        if (err) {
            sendJsonResponse(res, 400, err);
        } else {
            sendJsonResponse(res, 201, location);
        }
    });
};

module.exports.locationsReadOne = function(req, res) {
    if (req.params && req.params.locationid) {
        Loc
            .findById(req.params.locationid)
            .exec(function(err, location) {
                if (!location) {
                    sendJsonResponse(res, 404, "location not found");
                    return;
                } else if (err) {
                    sendJsonResponse(res, 404, err);
                    return;
                } else {
                    sendJsonResponse(res, 200, location);
                }
            });
    } else {
        sendJsonResponse(res, 404, {
            "message": "No locationid in request"
        });
    }
};

module.exports.locationsUpdateOne = function(req, res) {
    if (!req.params.locationid) {
        sendJsonResponse(res, 404, {
            "message": "Not found, locationid is required"
        });
    return;
    }
    Loc
        .findById(req.params.locationid)
        .select('-reviews -rating')
        .exec(
            function(err, location) {
            if (!location) {
                sendJsonResponse(res, 404, {
                    "message": "locationid not found"
                });
                return;
            } else if (err) {
                sendJsonResponse(res, 400, err);
                return;
            }
            location = fillLocationFromRequest(req, location);
            location.save(function(err, location) {
                if (err) {
                    sendJsonResponse(res, 404, err);
                } else {
                    sendJsonResponse(res, 200, location);
                }
            });
        }
    );
};

module.exports.locationsDeleteOne = function(req, res) {
    var locationid = req.params.locationid;
    if (locationid) {
        Loc
            .findByIdAndRemove(locationid)
            .exec(
            function(err, location) {
                if (err) {
                    console.log(err);
                    sendJsonResponse(res, 404, err);
                    return;
                }
                console.log("Location id " + locationid + " deleted");
                sendJsonResponse(res, 204, null);
            });
    } else {
        sendJsonResponse(res, 404, {
            "message": "No locationid"
        });
    }
};

module.exports.reviewsCreate = function(req, res) {
    var locationid = req.params.locationid;
    if (locationid) {
        Loc
            .findById(locationid)
            .select('reviews')
            .exec(
                function(err, location) {
                    if (err) {
                        sendJsonResponse(res, 400, err);
                    } else {
                        doAddReview(req, res, location);
                    }
                }
            );
    } else {
        sendJsonResponse(res, 404, {
            "message": "Not found, locationid required"
        });
    }
};

module.exports.reviewsReadOne = function(req, res) {
    if (req.params && req.params.locationid && req.params.reviewid) {
        Loc
            .findById(req.params.locationid)
            .select('name reviews')
            .exec(
                function(err, location) {
                    var response, review;
                    if (!location) {
                        sendJsonResponse(res, 404, {
                            "message": "location not found"
                        });
                        return;
                    } else if (err) {
                        sendJsonResponse(res, 400, err);
                        return;
                    }
                    if (location.reviews && location.reviews.length > 0) {
                        review = location.reviews.id(req.params.reviewid);
                        if (!review) {
                            sendJsonResponse(res, 404, {
                                "message": "review not found"
                            });
                        } else {
                            response = {
                                location : {
                                    name : location.name,
                                    _id : req.params.locationid
                                },
                                review : review
                            };
                            sendJsonResponse(res, 200, response);
                        }
                    } else {
                        sendJsonResponse(res, 404, {
                            "message": "This location has no review"
                        });
                    }
                }
            );
    } else {
        sendJsonResponse(res, 404, {
            "message": "Not found, locationid and reviewid are both required"
        });
    }
};

module.exports.reviewsUpdateOne = function(req, res) {

};

module.exports.reviewsDeleteOne = function(req, res) {

};


