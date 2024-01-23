const express = require("express");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");

const favoriteRouter = express.Router();

favoriteRouter
    .route("/")
    
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate("user")
            .populate("campsites")
            .then((favorites) => 
                res.status(200).json(favorites))
            .catch((err) => next(err));
    })
    
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
        .then(favorite => {
            if (favorite) {
                req.body.forEach(fav => {
                    if (!favorite.campsites.includes(fav._id)) {
                        favorite.campsites.push(fav._id)
                    }
                });
                favorite.save()
                    .then(favorite => res.status(200).json(favorite))
                    .catch(err => next(err))
            } else {
                Favorite.create({ user: req.user._id })
                    .then(favorite => {
                        req.body.forEach(fav => {
                            if (!favorite.campsites.includes(fav._id)) {
                                favorite.campsites.push(fav._id)
                            }
                        });
                        favorite.save()
                            .then(favorite => res.status(200).json(favorite))
                            .catch(err => next(err))
                    })
                    .catch(err => next(err));
            }
        })
        .catch(err => next(err));
    })

    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.status(403).end("PUT operation not supported")
    })
    
    .delete(
        cors.corsWithOptions,
        authenticate.verifyUser,
        (req, res, next) => {
        Favorite.findOneAndDelete({users: req.user._id})
        .then(favorite => {
            if(favorite){
                res.status(200).json(favorite)
            } else {
                res.status(200).end("You do not have any favorites to delete.");
            }
        })
        .catch(err => next(err))
    })

favoriteRouter
    .route("/:campsiteId")
    
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
            res.status(403).end("GET operation not supported");
    })
    
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
        .then(favorite => {
            if (favorite) {
                if(!favorite.campsites.includes(req.params.campsiteId)) {
                    favorite.campsites.push(req.params.campsiteId);
                    favorite.save()
                    .then(favorite => res.status(200).json(favorite))
                    .catch(err => next(err))
                } else {
                    res.status(200).end("That campsite is already in the list of favorites!");
                }
            } else {
                Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId] })
                .then(favorite => res.status(200).json(favorite))
                .catch(err => next(err));
            }
        })
        .catch(err => next(err));
    })      
    
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
            res.status(403).end("PUT operation not supported");
    })
    
    .delete(
        cors.corsWithOptions,
        authenticate.verifyUser,
        (req, res, next) => {
        Favorite.findOne({user: req.user._id})
        .then(favorite => {
            if (favorite) {
                const index = favorite.campsites.indexOf(req.params.campsiteId);
                if (index >= 0) {
                    favorite.campsites.splice(index, 1)
                }
                favorite.save()
                .then(favorite => res.status(200).json(favorite))
                .catch(err => next(err))
            }else{
                res.status(200).end('You do not have any favorites to delete.')
        }
    })
    .catch(err => next(err))
});

module.exports = favoriteRouter;