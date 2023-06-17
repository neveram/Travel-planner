'use strict'

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb+srv://shravaniparsi26:shravaniparsi26@cluster0.kxgrxvx.mongodb.net/?retryWrites=true&w=majority';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb+srv://shravaniparsi26:shravaniparsi26@cluster0.kxgrxvx.mongodb.net/?retryWrites=true&w=majority';
exports.PORT = process.env.PORT || 8080; 
exports.JWT_SECRET = 'secret';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';