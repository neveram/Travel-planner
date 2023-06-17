const express = require('express');
const router = express.Router();
const passport = require('passport');

const {Trip} = require('./models');
const jwtAuth = passport.authenticate('jwt', { session: false });

router.use(jwtAuth);

//get all trips
router.get('/', (req,res) => {
    Trip.find({username: req.user.username})
    .then(trips => {
        res.json({trips: trips.map(trip => trip.serialize())});
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Could not retrieve trips'})
    });
});

//get specific trip by id
router.get('/:id', (req, res) => {
    Trip.findById(req.params.id)
    .then(trip => {
        if(trip.username === req.user.username) return trip;
        else throw new Error();
    })
    .catch(() => res.status(404).json({error: 'trip not found'}))
    .then(trip => res.json(trip.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Could not find requested trip'})
    });
});

//get specific place by id
router.get('/:id/places/:placeId', (req, res) => {
    Trip.findById(req.params.id)
    .then(trip => {
        return trip.savedPlaces.id(req.params.placeId)
    })
    .then(currentPlace => res.json(currentPlace.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Could not find requested place'})
    })
})

//get specific packing list item by id
router.get('/:id/packingList/:listId', (req, res) => {
    Trip.findById(req.params.id)
    .then(trip => {
        return trip.packingList.id(req.params.listId)
    })
    .then(currentItem => res.json(currentItem.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Could not find requested place'})
    })
})

router.post('/', (req, res) => {
    const requiredFields = ['name', 'destination', 'dates'];
    for (let i = 0; i < requiredFields.length; i++){
        const field = requiredFields[i];
        if (!(field in req.body)){
            const message = `Missing '${field}' in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    const newPost = {
        name: req.body.name,
        destination: req.body.destination,
        savedPlaces: req.body.savedPlaces ? JSON.parse(JSON.stringify(req.body.savedPlaces)) : [],
        packingList: req.body.packingList ? JSON.parse(JSON.stringify(req.body.packingList)) : [],
        dates: {
            start: new Date(req.body.dates.start),
            end: new Date(req.body.dates.end)
        }
    };

    if (req.user) newPost.username = req.user.username;

    Trip.create(newPost)
    .then(trip => res.status(201).json(trip.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'New trip could not be saved.'});
    });
});

router.put('/:id', (req, res) => {
    if(!(req.params.id && req.body.id && req.params.id === req.body.id)){
        res.status(400).json({
            error: 'Request path id and request body id must match'
        });
    }

    const updated = {
        name: req.body.name,
        destination: req.body.destination,
        dates: {
            start: new Date(req.body.dates.start),
            end: new Date(req.body.dates.end)
        }
    };

    Trip.findByIdAndUpdate(req.params.id, { $set: updated}, {new: true} )
    .then(() => res.status(204).end())
    .catch(() => res.status(500).json({message: 'Trip details could not be updated'})
    );

});

router.post('/:id/places', (req,res) => {
    if ( !('name' in req.body) ){
        const message = `Missing 'name' in request body`;
        console.error(message);
        return res.status(400).send(message);
    }
    Trip.findById(req.params.id)
    .then(trip => {
        trip.savedPlaces.push(req.body);
        trip.save();
        return trip.savedPlaces[trip.savedPlaces.length -1];
    })
    .then(updatedPlace => res.status(201).json(updatedPlace.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Place details could not be saved'});
    });
});

router.put('/:id/places/:placeId', (req, res) => {
    Trip.findById(req.params.id)
    .then(trip => {
        if (trip && req.params.placeId && req.body.id && req.params.placeId === req.body.id){
            const editedPlace = trip.savedPlaces.id(req.params.placeId);
            editedPlace.name = req.body.name;
            editedPlace.address = req.body.address;
            editedPlace.notes = req.body.notes;
            trip.save();
            return trip.savedPlaces.id(req.body.id);
        }
        return res.status(404).json({message: 'Could not find trip id or place id'});
    })
    .then(updatedPlace => res.status(204).end())
    .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Place details could not be updated'});
    });
});

router.post('/:id/packingList', (req, res) => {
    if ( !('item' in req.body) ){
        const message = `Missing 'item name' in request body`;
        console.error(message);
        return res.status(400).send(message);
    }
    Trip.findById(req.params.id)
    .then(trip => {
        trip.packingList.push(req.body);
        trip.save();
        return trip.packingList[trip.packingList.length -1];
    })
    .then(updatedList => res.status(201).json(updatedList.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Packing list details could not be updated'});
    });
});

router.put('/:id/packingList/:listId', (req, res) => {
    Trip.findById(req.params.id)
    .then(trip => {
        if (trip && req.params.listId && req.body.id && req.params.listId === req.body.id){
            const editedList = trip.packingList.id(req.body.id);
            Object.keys(req.body).forEach(field => editedList[field] = req.body[field]);
            trip.save();
            return trip.packingList.id(req.body.id);
        }
        return res.status(404).json({message: 'Could not find trip id or item id'});
    })
    .then(() => res.status(204).end())
    .catch(err => {
        console.err(err);
        res.status(500).json({message: 'Trip details could not be updated'});
    });
});

router.delete('/:id', (req,res) => {
    Trip.findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(() => res.status(500).json({message: 'Could not delete the trip'}));
});

router.delete('/:id/places/:placeId', (req,res) => {
    Trip.findById(req.params.id)
    .then((trip) => {
        trip.savedPlaces.id(req.params.placeId).remove();
        trip.save();
    })
    .then(() => res.status(204).end())
    .catch(() => res.status(500).json({message: 'Could not delete the saved place'}));
});

router.delete('/:id/packingList/:listId', (req,res) => {
    Trip.findById(req.params.id)
    .then((trip) => {
        trip.packingList.id(req.params.listId).remove();
        trip.save();
    })
    .then(() => res.status(204).end())
    .catch(() => res.status(500).json({message: 'Could not delete the item'}));
});

module.exports = {router};