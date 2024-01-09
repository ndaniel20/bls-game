var indexFile = require("./index.js")
const fs = require('fs')
var season = require("./src/backend/season.js")
const teamTactics = JSON.parse(fs.readFileSync(`src/data/tactics.json`, 'utf-8'))

async function runSeason(){
    var leagueTeams = indexFile.filterLeagueTeams(teamTactics, "LaLiga")
    var teams = Object.keys(leagueTeams)
    var fixtures = indexFile.generateFixtures(teams);
    console.time("boy")
    for (var x = 0; x < fixtures.length; x++){
        var fixture = fixtures[x]
        for (var i = 0; i < fixture.length; i++){
            var name1 = fixture[i][0]
            var name2 = fixture[i][1]
            var result = await indexFile.simulateNPCs(name1, name2)
            fixture[i][2] = result
        }
        console.log(x)
    }
    console.timeEnd("boy")
    console.log("Done")
}

runSeason()