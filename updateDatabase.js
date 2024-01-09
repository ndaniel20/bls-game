const fs = require('fs')
const Database = require("./connect.js")
const db = require('./mongoDB.js')
const DBclass = new Database(); 
DBclass.connect()

async function dataSet(){
    const database = JSON.parse(fs.readFileSync('src/data/database.json', 'utf8'));
    const clubs = JSON.parse(fs.readFileSync('src/data/clubs.json', 'utf8'));
    const tactics = JSON.parse(fs.readFileSync('src/data/tactics.json', 'utf8'));
    await db.setDatabase(database);
    await db.setConfigurations(tactics);
    await db.setClubs(clubs);
    console.log("All team players added to the database")

    process.exit(1)
}

dataSet();