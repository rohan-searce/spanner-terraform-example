'user strict';
const {Spanner} = require('@google-cloud/spanner');
// Creates Spanner client
const spanner = new Spanner({projectId: process.env.PROJECTID,});
// Initialize Spanner instance
const instance = spanner.instance(process.env.INSTANCE);  
// Environment variable assigned here
const databaseId = process.env.DATABASE;
// Initialize database
const database = instance.database(databaseId,{
    idlesAfter: 10,
    keepAlive: 30,
    labels: {},
    max: 500,
    maxIdle: 1,
    min: 100
});
database.createSession();
module.exports = database;
