'use strict';

const express = require('express');
const {User} = require('./models');
const {createAuthToken} = require('../auth');
const router = express.Router();


router.post('/', (req, res) => {
    const requiredFields = ['username', 'password'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField){
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }

    const nonStringField = requiredFields.find(
        field => field in req.body && typeof req.body[field] !== 'string');

    if (nonStringField){
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect field type: expected string',
            location: nonStringField
        });
    }

    const nonTrimmedField = requiredFields.find(
        field => req.body[field].trim() !== req.body[field]);

    if (nonTrimmedField){
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Cannot start or end with whitespace',
            location: nonTrimmedField
        });
    }

    const sizedFields = {
        username: {min: 2},
        password: {min: 8, max: 72}
    };

    const tooSmallField = Object.keys(sizedFields).find(field => 
        'min' in sizedFields[field] && req.body[field].length < sizedFields[field].min);

    const tooLargeField = Object.keys(sizedFields).find(field => 
        'max' in sizedFields[field] && req.body[field].length > sizedFields[field].max);

    if (tooSmallField || tooLargeField){
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: tooSmallField 
                ? `${tooSmallField} must be at least ${sizedFields[tooSmallField].min} characters`
                : `${tooLargeField} must be at most ${sizedFields[tooLargeField].max} characters`,
            location: tooSmallField || tooLargeField
        });
    }

    let {username, password} = req.body;

    return User.find({username}, null)
    .then(entry => {
        if (entry.length > 0){
            //There is an existing user in database
            return Promise.reject({
                code: 422,
                reason: 'ValidationError',
                message: 'Username already taken',
                location: 'username'
            });
        }
        //No existing user. Proceeds to hash the password
        return User.hashPassword(password);
    })
    .then(hash => User.create({username, password: hash}))
    .then(user => {
        const serializedUser = user.serialize();
        serializedUser.authToken = createAuthToken(serializedUser);
        return res.status(201).json(serializedUser);
    })
    .catch(err => {
        if (err.reason === 'ValidationError'){
            return res.status(err.code).json(err);
        }
        console.log(err);
        res.status(500).json({code: 500, message: 'Internal server error'});
    });
});

module.exports = {router};

