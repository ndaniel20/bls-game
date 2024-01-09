const fs = require('fs');
const crypto = require('crypto');
const teamTactics = JSON.parse(fs.readFileSync(`src/data/tactics.json`, 'utf-8'))
var database = JSON.parse(fs.readFileSync(`src/data/database.json`, 'utf-8'))
var seasons = require("./src/backend/season.js")
var dataSets = Object.values(database).flat().reduce((result, currentArray) => result.concat(currentArray), []);
var basePrice = calculateBasePrice();

module.exports = {
    createCrypto: function (length) {
        const bytes = crypto.randomBytes(Math.ceil(length / 2));
        const hexString = bytes.toString('hex');
        return hexString.slice(0, length);
    },
    findPlayer: function (id) {
        var player = dataSets.find(e => e.id === id)
        return player
    },
    calculatePrice: function (id, bonus) {
        if (!bonus) bonus = 0
        var player = dataSets.find(e => e.id === id)
        var inGameStats = Object.values(player.stats).map(e=>parseInt(e)).reduce((a, b) => a + b) + (3 * (bonus + 1))
        var price = basePrice[parseInt(player.rating) + Math.floor(parseFloat(bonus))]
        var pCt = Math.round((Math.min(inGameStats/1000, 0.50) * 100) + 50)
        price = (price * 0.9) + (basePrice[pCt] * 0.1)

        return Math.round(price);
    },
    verifyTactics: function (tactics){
        for (let t in tactics){
            if (t == "formation" && !["343", "433", "442", "532", "541", "3142", "3421", "4141", "4231", "41212"].includes(tactics[t])) tactics.formation = "433"
            if (t == "height" && !(tactics[t] >= 0 && 101 > tactics[t])) tactics.height = 50
            if (t == "length" && !(tactics[t] >= 0 && 101 > tactics[t])) tactics.length = 50
            if (t == "width" && !(tactics[t] >= 0 && 101 > tactics[t])) tactics.width = 50
            if (t == "pressing" && !["Balanced Pressure", "Constant Pressure", "Drop Back"].includes(tactics[t])) tactics.pressing = "Balanced Pressure"
            if (t == "marking" && !["Zonal Marking", "Man Marking"].includes(tactics[t])) tactics.marking = "Zonal Marking"
            if (t == "timeWasting" && ![true, false].includes(tactics[t])) tactics.timeWasting = false
            if (t == "offsideTrap" && ![true, false].includes(tactics[t])) tactics.offsideTrap = true
            if (t == "offensiveStyle" && !["Possession", "Direct Passing", "Wing Play", "Long Ball"].includes(tactics[t])) tactics.offensiveStyle = "Possession"
            if (t == "transition" && !["Slow", "Medium", "Fast"].includes(tactics[t])) tactics.transition = "Medium"
            if (t == "corners" && !(tactics[t] >= 5 && 11 > tactics[t])) tactics.corners = 8
            if (t == "fullbacks" && !["Inverted Wing-Back", "Wing-Back", "Full-Back", "Defensive Full-Back"].includes(tactics[t])) tactics.fullbacks = "Full-Back"
        }
        return tactics
    },
    filterLeagueTeams: function (list, num){
        var obj = {}
        for (var x in list){
            if (list[x].league == num) obj[x] = list[x]
        }
        return obj
    },
    generateFixtures: function (clubs) {
        const fixtures = [];
        clubs = shuffleArray(clubs)
        for (let matchday = 1; matchday <= (clubs.length-1) * 2; matchday++) {
            const roundFixtures = [];
            for (let i = 0; i < clubs.length / 2; i++) {
                const homeTeam = clubs[i];
                const awayTeam = clubs[clubs.length - 1 - i];
                if (matchday % 2 == 0) roundFixtures.push([homeTeam, awayTeam]);
                else roundFixtures.push([awayTeam, homeTeam]);
            }
            fixtures.push(roundFixtures);
            
            clubs.splice(1, 0, clubs.pop());
        }
        return fixtures
    },
    generateTournament: function (clubs) {
        const fixtures = [];
        for (let i = 0; i < 6; i++){
            const roundFixtures = [];
            for (let n = 0; n < 8; n++){
                var c = n * 4
                var t1 = c, t2 = c+1, t3 = c+2, t4 = c+3
                var pendilum = [[t3, t1, t2, t4], [t4, t3, t1, t2], [t1, t4, t3, t2], [t4, t1, t2, t3], [t3, t4, t2, t1], [t1, t3, t4, t2]]
                pendilum = pendilum[i]
                roundFixtures.push([clubs[pendilum[0]], clubs[pendilum[1]]])
                roundFixtures.push([clubs[pendilum[2]], clubs[pendilum[3]]])
            }
            fixtures.push(roundFixtures);
        }
        return fixtures
    },
    simulateMatch: async function (name1, name2, res, pause, leg){
        return new Promise(resolve => {
            var game = seasons.setOneTeam(name1, name2, res, pause, leg)
            resolve(game);
        });
    },
    simulateNPCs: function (name1, name2, leg){
        var game = seasons.setTwoTeams(name1, name2, leg)

        return game
    },
    displayWinners: function(fixtures){
        var list = []
        for (let x = 0; x < fixtures.length; x++){
            var goals = fixtures[x][2].goals
            if (goals[0] > goals[1]) list.push(fixtures[x][0])
            if (goals[0] < goals[1]) list.push(fixtures[x][1])
        }
        return list
    },
    findStage: function(fixtures){
        var pos = 0
        var isWinner = false
        for (let i = 0; i < fixtures.length; i++){
            var fixture = fixtures[i]
            var isFound = false
            for (let x = 0; x < fixture.length; x++){
                var team1 = fixture[x][0]
                var team2 = fixture[x][1]
                var scores = fixture[x][2].goals
                if (team1.includes("*") || team2.includes("*")) isFound = true
                if (i == fixtures.length - 1){
                    if (team1.includes("*") && scores[0] > scores[1]) isWinner = true
                    if (team2.includes("*") && scores[1] > scores[0]) isWinner = true
                }
            }
            if (isFound) pos += 1
        }
        return [pos, isWinner]
    },
    displayGroups: function(fixtures){
        var chunks = this.splitArrayIntoChunks(fixtures[0], 2)
        var winners = []
        for (var i = 0; i < chunks.length; i++){
          var filteredTeam = chunks[i].flat(1)
          var result = this.organizeTable(fixtures, filteredTeam)
          winners.push(Object.keys(result).slice(0, 2))
        }
        return winners
    },
    gameAward: function(game, side){
        //add multiplier
        var opp = 1 - side
        var GF = game.goals[side]
        var GA = game.goals[opp]
        var goalAmount = GF * 30
        var outcome = GF > GA ? 600 : GF < GA ? 0 : 200
        var cleansheets = game.cleansheets[side].length > 0 ? 100 : 0
        var totalRatings = game.matchRatings[side].filter(e=>e[1]).map(e=>parseFloat(e[1])).sort((a, b) => b - a).slice(0, 11).reduce((a, b) => a + b)/11
        var totalRating = Math.max(Math.round((0.1+1.2*totalRatings)*100) - 800, 0)
        var prize = outcome + goalAmount + cleansheets + totalRating
        return prize
    },
    splitArrayIntoChunks: function(array, chunkSize) {
        return Array.from({ length: Math.ceil(array.length / chunkSize) }, (_, index) =>
          array.slice(index * chunkSize, index * chunkSize + chunkSize)
        );
    },
    createGroupStage: function(){
        var completeGroup = null
        var maxX = 0
        while (!completeGroup && maxX < 50){
            maxX++
            var pot1 = ["Manchester City", "Sevilla", "FC Barcelona", "Napoli", "FC Bayern", "Paris Saint-Germain", "Benfica", "Feyenoord"]
            var pot2 = ["Real Madrid", "Manchester United", "Inter Milan", "Borussia Dortmund", "Atletico Madrid", "RB Leipzig", "FC Porto", "Arsenal"]
            var pot3 = ["Shakhtar", "FC RB Salzburg", "AC Milan", "Lazio", "Slavia Prague", "Braga", "Rangers", "Dinamo Zagreb"]
            var pot4 = ["Union Berlin", "Newcastle United", "RC Lens", "Celtic", "Real Sociedad", "Galatasaray", "Young Boys", "FC Kobenhavn"]
            var arr = [pot1, pot2, pot3, pot4]
            var groups = [[],[],[],[],[],[],[],[]]
            for (let p in arr){
                var pot = arr[p]
                for (var i = 0; i < 8; i++){
                    var leagues = groups[i].map(e=>teamTactics[e]?.league)
                    var options = pot.filter(e=>!leagues.includes(teamTactics[e].league))
                    var team = shuffleArray(options)[0]
                    groups[i].push(team)
                    pot.splice(pot.indexOf(team), 1)
                }
            }
            if (groups.some(e=>e.includes(undefined))) completeGroup = null
            else completeGroup = groups
        }
        return completeGroup
    },
    drawRoundOf16: function(draw){
        var groupedDraw = [];
        var maxX = 0
        while (groupedDraw.length < 8 && maxX < 50){
            maxX++
            groupedDraw = [];
            var data = shuffleArray(draw).flat(1).map((e, n)=>({club: e, country: teamTactics[e] ? teamTactics[e].league : e, last_positions: n % 2 == 0 ? 1 : 2, group: ["A", "A", "B", "B", "C", "C", "D", "D", "E", "E", "F", "F", "G", "G", "H", "H"][n]}))
            let drawingResult = []
            for (let i = 0;i < data.length;i++) {
                for (let j = 0;j < data.length;j++) {
                    const cIndex = data[i]
                    const againstIndex = data[j]
                    if (againstIndex.club !== cIndex.club && againstIndex.country !== cIndex.country && againstIndex.group !== cIndex.group && againstIndex.last_positions !== cIndex.last_positions) {
                    const drawOne = drawingResult.map(c => c.club).indexOf(againstIndex.club)
                    const drawTwo = drawingResult.map(c => c.club).indexOf(cIndex.club)
                    if (drawOne === -1 && drawTwo === -1) {
                        cIndex.last_positions > againstIndex.last_positions ? drawingResult.push(cIndex, againstIndex) : drawingResult.push(againstIndex, cIndex)
                    }
                    }
                }
            }
            var gamesDrawn = drawingResult.map(e=>e.club)
            for (let i = 0; i < gamesDrawn.length; i += 2) {
                groupedDraw.push([gamesDrawn[i], gamesDrawn[i + 1]]);
            }
        }
        return groupedDraw
    },
    drawKnockout: function(draw){
        var newDraw = shuffleArray(draw)
        var games = []
        for (var i = 0; i < newDraw.length; i += 2){
            games.push([newDraw[i], newDraw[i + 1]])
        }
        return games
    },
    organizeTable: function(fixtures, filteredTeams){
        var table = {}
        for (var i = 0; i < fixtures.length; i++){
            var matchdayGames = fixtures[i]
            for (var g = 0; g < matchdayGames.length; g++){
                var game = matchdayGames[g]
                var team1 = game[0]
                var team2 = game[1]
                var stats = game[2]
                if (filteredTeams && !(filteredTeams.includes(team1) || filteredTeams.includes(team2))) continue;
                if (!table[team1]) table[team1] = {played: 0, loss: 0, draw: 0, win: 0, ga: 0, gf: 0, points: 0}
                if (!table[team2]) table[team2] = {played: 0, loss: 0, draw: 0, win: 0, ga: 0, gf: 0, points: 0}
                if (stats){
                    var result = stats.goals
                    if (result[0] > result[1]){
                        table[team1].points += 3
                        table[team1].win += 1
                        table[team2].loss += 1
                    }
                    if (result[0] < result[1]){
                        table[team1].loss += 1
                        table[team2].points += 3
                        table[team2].win += 1
                    }
                    if (result[0] == result[1]){
                        table[team1].draw += 1
                        table[team1].points += 1
                        table[team2].draw += 1
                        table[team2].points += 1
                    }
        
                    table[team1].gf += result[0]
                    table[team1].ga += result[1]
                    table[team2].gf += result[1]
                    table[team2].ga += result[0]
                    table[team1].played += 1 
                    table[team2].played += 1 
                }
            }

        }
        const teamEntries = Object.entries(table).sort((a, b) => {
            if (b[1].points == a[1].points) return (b[1].gf - b[1].ga) - (a[1].gf - a[1].ga)
            return b[1].points - a[1].points
        });
        const sortedTeams = Object.fromEntries(teamEntries);

        return sortedTeams
    }
}


function calculateBasePrice () {
    var r = 50
    var inGameRating = 369
    var lastPrice = 200
    var price = 0
    var obj = {}
    
    for (var i = 0; i < 50; i++){
        price = lastPrice + (lastPrice/4.5)
        lastPrice = price
        obj[r + i] = Math.floor(price)
    }
    return obj
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
