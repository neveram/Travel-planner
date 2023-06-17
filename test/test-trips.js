'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');

const {Trip} = require('../trips');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

const expect = chai.expect;

chai.use(chaiHttp);

let user = {
    username: null,
    authToken: null
}

function seedTripData(){
    console.info('seeding trip data');
    const seedData = [];

    for (let i=1; i<=3; i++){
        seedData.push(generateTripData());
    }
    return Trip.insertMany(seedData);
}

function generatePlaceData(num){
    const places = [];
    for (let i = 0; i < num; i++){
        places.push({
            name: faker.random.words(),
            address: `${faker.address.streetAddress()} ${faker.address.streetName()}, ${faker.address.zipCode()}`,
            notes: faker.random.words()
        });
    }
    return places;
}

function generatePackingListData(num){
    const list = [];
    for (let i = 0; i < num; i++){
        list.push({
            item: faker.random.word,
            packed: faker.random.boolean()
        });
    }
    return list;
}

function generateTripData(){
    //generate a random number of place entries from 1 to 5
    const placeNum = Math.floor(Math.random() * 5) + 1;
    //generate a random number of packing list entries from 1 to 10
    const listNum = Math.floor(Math.random() * 10) + 1;
    return {
        username: user.username,
        name: faker.random.words(),
        destination: `${faker.address.city()}, ${faker.address.country()}`,
        savedPlaces: generatePlaceData(placeNum),
        packingList: generatePackingListData(listNum),
        dates: {
            start: faker.date.recent(),
            end: faker.date.future()
        }
    }
}

function tearDownDb(){
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}


describe('Trip API resource', function(){
    const username = 'testUser';
    const password = 'testPass123';

    before(function(){
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function (){
        //create a user and save the authToken
        return chai.request(app)
        .post('/api/users')
        .send({username, password})
        .then(response => {
            user.username = response.body.username;
            user.authToken = response.body.authToken;
        })
        .then(() => {
            return seedTripData();
        });
    });

    afterEach(function (){
        return tearDownDb();
    });

    after(function(){
        return closeServer();
    });

    describe('GET endpoint', function(){
        it('should return all existing trips', function(){
            let res;
            return chai.request(app)
            .get('/api/trips')
            .set('Authorization', `Bearer ${user.authToken}`)
            .then(function(_res){
                res = _res;
                expect(res).to.have.status(200);
                expect(res.body.trips).to.have.lengthOf.at.least(1);
                return Trip.count();
            })
            .then(function(count){
                expect(res.body.trips).to.have.lengthOf(count);
            });
        });

        it('should return trips with the right fields', function(){
            let resTrip;
            return chai.request(app)
            .get('/api/trips')
            .set('Authorization', `Bearer ${user.authToken}`)
            .then(function(res){
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.trips).to.be.an('array');

                res.body.trips.forEach(function(trip){
                    expect(trip).to.be.an('object');
                    expect(trip).to.include.keys('id', 'name', 'destination', 'savedPlaces', 'packingList', 'dates');
                })
                resTrip = res.body.trips[0];
                return Trip.findById(resTrip.id);
            })
            .then(function(trip){
                expect(resTrip.id).to.equal(trip.id);
                expect(resTrip.name).to.equal(trip.name);
                expect(resTrip.destination).to.equal(trip.destination);
                expect(resTrip.savedPlaces).to.have.lengthOf(trip.savedPlaces.length);
                expect(resTrip.packingList).to.have.lengthOf(trip.packingList.length);
                expect(new Date(resTrip.dates.start).toDateString()).to.equal(trip.dates.start.toDateString());
                expect(new Date(resTrip.dates.end).toDateString()).to.equal(trip.dates.end.toDateString());
            });
        });

    }); 

    describe('GET by id endpoint', function(){
        it('should return the requested trip', function(){
            let resTrip;
            return Trip.findOne()
            .then(function(trip){
                resTrip = trip;

                return chai.request(app)
                .get(`/api/trips/${resTrip.id}`)
                .set('Authorization', `Bearer ${user.authToken}`)
            })
            .then(function(res){
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res).to.be.an('object');
                expect(res.body.id).to.equal(resTrip.id);
                expect(res.body.name).to.equal(resTrip.name)
                expect(res.body.destination).to.equal(resTrip.destination);   
                expect(res.body.savedPlaces).to.have.lengthOf(resTrip.savedPlaces.length);
                expect(res.body.packingList).to.have.lengthOf(resTrip.packingList.length);
                expect(new Date(res.body.dates.start).toDateString()).to.equal(resTrip.dates.start.toDateString());
                expect(new Date(res.body.dates.end).toDateString()).to.equal(resTrip.dates.end.toDateString());         
            });
        });
    });

    describe('GET by place id endpoint', function(){
        it('should return the requested place', function(){
            let trip;
            let currentPlace;
            return Trip.findOne()
            .then(function(_trip){
                trip = _trip;
                currentPlace = trip.savedPlaces[0];
                return chai.request(app)
                .get(`/api/trips/${trip.id}/places/${currentPlace.id}`)
                .set('Authorization', `Bearer ${user.authToken}`)
            })
            .then(function(res){
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res).to.be.an('object');
                expect(res.body.name).to.equal(currentPlace.name);
                expect(res.body.address).to.equal(currentPlace.address);
                expect(res.body.notes).to.equal(currentPlace.notes);
            });
        });
    });

    describe('GET by packing item id endpoint', function(){
        it('should return the requested item', function(){
            let trip;
            let currentItem;
            return Trip.findOne()
            .then(function(_trip){
                trip = _trip;
                currentItem = trip.packingList[0];
                return chai.request(app)
                .get(`/api/trips/${trip.id}/packingList/${currentItem.id}`)
                .set('Authorization', `Bearer ${user.authToken}`)
            })
            .then(function(res){
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res).to.be.an('object');
                expect(res.body.item).to.equal(currentItem.item);
                expect(res.body.packed).to.equal(currentItem.packed);
            });
        });
    });

    describe('POST endpoint', function(){
        it('should add a new trip', function(){
            const newTrip = generateTripData();

            return chai.request(app)
            .post('/api/trips')
            .set('Authorization', `Bearer ${user.authToken}`)
            .send(newTrip)
            .then(function(res){
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.be.an('object');
                expect(res.body).to.include.keys('id', 'name', 'destination', 'savedPlaces', 'packingList', 'dates');
                expect(res.body.id).to.be.a('string');
                expect(res.body.name).to.equal(newTrip.name);
                expect(res.body.destination).to.equal(newTrip.destination);
                expect(res.body.savedPlaces).to.have.lengthOf(newTrip.savedPlaces.length);
                expect(res.body.packingList).to.have.lengthOf(newTrip.packingList.length);
                expect(new Date(res.body.dates.start).toDateString()).to.equal(newTrip.dates.start.toDateString());
                expect(new Date(res.body.dates.end).toDateString()).to.equal(newTrip.dates.end.toDateString());

            });
        });
    });

    describe('PUT endpoint', function(){
        it('should update existing trip details', function(){
            //TODO: test dates here too.
            const updateData = {
                "name": 'Summer Vacation',
                "destination": 'Rome, Italy',
                "dates": {
                    "start": 1544208420943,
                    "end": 1544208420955
                }
            };

            return Trip.findOne()
            .then(function(trip){
                updateData.id = trip.id;
                
                return chai.request(app)
                .put(`/api/trips/${updateData.id}`)
                .set('Authorization', `Bearer ${user.authToken}`)
                .send(updateData);
            })
            .then(function(res){
                expect(res).to.have.status(204);

                return Trip.findById(updateData.id);
            })
            .then(function(trip){
                expect(trip.name).to.equal(updateData.name);
                expect(trip.destination).to.equal(updateData.destination);
                expect((trip.dates.start).toDateString()).to.equal(new Date(updateData.dates.start).toDateString());
                expect((trip.dates.end).toDateString()).to.equal(new Date(updateData.dates.end).toDateString());
            });
        });
    });
    
    describe('POST endpoint for /trips/:id/places', function(){

        it('should add a new place in saved places', function(){
            const newData = {
                "name": "New Museum",
                "address": "456 Museum Way, Fancy Town, 12345",
                "type": "Museum"
            };

            //picks any trip to add a new place onto
            return Trip.findOne()
            .then(function(trip){
                return chai.request(app)
                .post(`/api/trips/${trip.id}/places`)
                .set('Authorization', `Bearer ${user.authToken}`)
                .send(newData);
            })
            .then(function(res){
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body.name).to.equal(newData.name);
                expect(res.body.address).to.equal(newData.address);
                expect(res.body.notes).to.equal(newData.notes);
            });
        });
    })

    describe('PUT endpoint for /trips/:id/places/:placeId', function(){
        it('should update for changes in saved places', function(){
            let tripId;
            const updateData = {
                "name": "New Bistro",
                "address": "123 Main Street, Fancy Court, 10101",
                "type": "Restaurant"
            };

            return Trip.findOne()
            .then(function(trip){
                tripId = trip.id;
                //set the place id to the first place in the database trip
                updateData.id = trip.savedPlaces[0].id;

                return chai.request(app)
                .put(`/api/trips/${tripId}/places/${updateData.id}`)
                .set('Authorization', `Bearer ${user.authToken}`)
                .send(updateData);
            })
            .then(function(res){
                expect(res).to.have.status(204);

                return Trip.findById(tripId);
            })
            .then(function(trip){
                expect(trip.savedPlaces[0].id).to.equal(updateData.id);
                expect(trip.savedPlaces[0].name).to.equal(updateData.name);
                expect(trip.savedPlaces[0].address).to.equal(updateData.address);
                expect(trip.savedPlaces[0].notes).to.equal(updateData.notes);
            });
        });
    });

    describe('POST endpoint for /trips/:id/packingList', function(){    
        it('should add a new item in packingList', function(){
            const newData = {
                    "item": "passport",
                    "packed": false
            };

            return Trip.findOne()
            .then(function(trip){
                return chai.request(app)
                .post(`/api/trips/${trip.id}/packingList`)
                .set('Authorization', `Bearer ${user.authToken}`)
                .send(newData);
            })
            .then(function(res){
                expect(res).to.have.status(201);
                expect(res.body.item).to.equal(newData.item);
                expect(res.body.packed).to.equal(newData.packed);
            });
        });
    });

    describe('PUT endpoint for /trips/:id/packingList/:listId', function(){
        it('should update for changes in packing list', function(){
            let tripId;
            const updateData = {
                "item": "Allergy medicine",
                "packed": true
            };

            return Trip.findOne()
            .then(function(trip){
                tripId = trip.id;
                //set the packinglist id to the first place in the database trip
                updateData.id = trip.packingList[0].id;

                return chai.request(app)
                .put(`/api/trips/${tripId}/packingList/${updateData.id}`)
                .set('Authorization', `Bearer ${user.authToken}`)
                .send(updateData);
            })
            .then(function(res){
                expect(res).to.have.status(204);
                
                return Trip.findById(tripId);
            })
            .then(function(trip){
                expect(trip.packingList[0].item).to.equal(updateData.item);
                expect(trip.packingList[0].packed).to.equal(updateData.packed);
            });
        });
        
    });

    
    describe('DELETE endpoint', function(){
        it('should delete a trip by id', function(){
            let trip;

            return Trip.findOne()
            .then(function(_trip){
                trip = _trip;
                return chai.request(app)
                .delete(`/api/trips/${trip.id}`)
                .set('Authorization', `Bearer ${user.authToken}`);
            })
            .then(function(res){
                expect(res).to.have.status(204);
                return Trip.findById(trip.id);
            })
            .then(function(tripResult){
                expect(tripResult).to.be.null;
            });
        });
    });

    describe('DELETE endpoint for /api/trips/:id/places/:placeId', function(){
        it('should delete a place by id', function(){
            let trip;
            let placeId;
            return Trip.findOne()
            .then(function(_trip){
                trip = _trip;
                placeId = trip.savedPlaces[0].id;
                return chai.request(app)
                .delete(`/api/trips/${trip.id}/places/${placeId}`)
                .set('Authorization', `Bearer ${user.authToken}`);
            })
            .then(function(res){
                expect(res).to.have.status(204);
                return Trip.findById(trip.id);
            })
            .then(returnedTrip => {
                return returnedTrip.savedPlaces.id(placeId);
            })
            .then(function(returnedPlace){
                expect(returnedPlace).to.be.null;
            });
        });
    });

    // describe('DELETE endpoint for /api/trips/:id/packingList', function(){
    //     it.only('should delete all items in the packing list', function(){
    //         let tripId;
    //         return Trip.findOne()
    //         .then(function(trip){
    //             tripId = trip.id;
    //             return chai.request(app)
    //             .delete(`/api/trips/${tripId}/packingList`);
    //         })
    //         .then(function(res){
    //             expect(res).to.have.status(204);
    //             return Trip.findById(tripId);
    //         })
    //         .then(function(returnedTrip){
    //             expect(returnedTrip.packingList).to.be.an('array').that.is.empty;
    //         })
    //     })
    // })

    describe('DELETE endpoint for /api/trips/:id/packingList/:listId', function(){
        it('should delete a packing list item by id', function(){
            let trip;
            let listId;
            return Trip.findOne()
            .then(function(_trip){
                trip = _trip;
                listId = trip.packingList[0].id;
                return chai.request(app)
                .delete(`/api/trips/${trip.id}/packingList/${listId}`)
                .set('Authorization', `Bearer ${user.authToken}`);;
            })
            .then(function(res){
                expect(res).to.have.status(204);
                return Trip.findById(trip.id);
            })
            .then(returnedTrip => returnedTrip.packingList.id(listId))
            .then(function(returnedList){
                expect(returnedList).to.be.null;
            });
        });
    });

})