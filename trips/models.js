'use strict'

const mongoose = require('mongoose');

const placeSchema = mongoose.Schema({
    name: {type: String, required: true},
    address: String,
    notes: {type: String}
});

const packingSchema = mongoose.Schema({
    item: String,
    packed: Boolean
});

const tripSchema = mongoose.Schema({
    name: {type: String, required: true},
    destination: {type: String, required: true},
    savedPlaces: [placeSchema],
    packingList: [packingSchema],
    dates: {
        start: {type: Date, required: true},
        end: {type: Date, required: true}
    },
    username: String
});

placeSchema.methods.serialize = function(){
    return {
        id: this._id,
        name: this.name,
        address: this.address,
        notes: this.notes
    }
}

packingSchema.methods.serialize = function(){
    return {
        id: this._id,
        item: this.item,
        packed: this.packed
    }
}

tripSchema.methods.serialize = function(){
    return {
        id: this._id,
        name: this.name,
        destination: this.destination,
        savedPlaces: this.savedPlaces.map(place => place.serialize()),
        packingList: this.packingList.map(item => item.serialize()),
        dates: this.dates
    }
}

const Trip =  mongoose.model('Trip', tripSchema);

module.exports = {Trip};