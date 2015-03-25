var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

var sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.locationsListByDistance = function(req, res) {
    sendJsonResponse(res, 200, {"status" : "sucess"});
};

module.exports.locationsCreate = function(req, res) {
    sendJsonResponse(res, 200, {"status" : "sucess"});
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

};

module.exports.locationsDeleteOne = function(req, res) {

};

module.exports.reviewsCreate = function(req, res) {

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
                        
                        console.log(location);
                        console.log(review);
                        console.log(req.params.reviewid);
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


