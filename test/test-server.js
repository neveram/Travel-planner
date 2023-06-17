'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Trip API resource', function(){

    before(function(){
        return runServer(TEST_DATABASE_URL);
    });

    after(function(){
        return closeServer();
    });

    describe('Index Page', function(){
        it('should return index page for the root url', function(){
            return chai.request(app)
            .get('/')
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.html;
            })
        })
    });

    describe('Nonexistent Page', function(){
        it('should return 404 Not Found', function(){
            return chai.request(app)
            .get('/doesntexist')
            .then(function(res) {
                expect(res).to.have.status(404);
                expect(res.body.message).to.equal('Not Found');
            })
        })
    });
})