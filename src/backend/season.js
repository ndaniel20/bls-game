const fs = require('fs');
var formations = JSON.parse(fs.readFileSync(`src/data/formations.json`, 'utf-8'))
var tactics = JSON.parse(fs.readFileSync(`src/data/tactics.json`, 'utf-8'))
var simulation = require("./simulation.js")
const databaseData = JSON.parse(fs.readFileSync(`src/data/database.json`, 'utf-8'))
const flatDatabase = Object.values(databaseData).flat()
var clubsList = JSON.parse(fs.readFileSync(`src/data/clubs.json`, 'utf-8'))
var cacheTeams = {}

module.exports = {
    setOneTeam: function(n1, n2, res, pause, leg){
        const dataSets1 = flatDatabase.reduce((result, currentArray) => result.concat(JSON.parse(JSON.stringify(currentArray))), []);
        const dataSets2 = flatDatabase.reduce((result, currentArray) => result.concat(JSON.parse(JSON.stringify(currentArray))), []);
        var names = [Array.isArray(n1)? n1[1].name : n1, Array.isArray(n2) ? n2[1].name : n2]
        var logos = [Array.isArray(n1) ? n1[1].logo : `https://img.fminside.net/logos/normal/${tactics[n1].id}.png`, Array.isArray(n2) ? n2[1].logo :`https://img.fminside.net/logos/normal/${tactics[n2].id}.png`]
        var tactic1 = Array.isArray(n1) ? n1[1] : tactics[n1].tactics
        var tactic2 = Array.isArray(n2) ? n2[1] : tactics[n2].tactics
        var stadium = Array.isArray(n1) ? n1[1].stadium : clubsList.find(c=>c.name == n1)?.stadiumURL
        var formation1 = tactic1.formation
        var formation2 = tactic2.formation
        var players1 = Array.isArray(n1) ? n1[1].startingXI.map(e=>e.id) : buildTeam(n1, formation1, dataSets1.filter(e=>e.club == n1))
        var players2 = Array.isArray(n2) ? n2[1].startingXI.map(e=>e.id) : buildTeam(n2, formation2, dataSets2.filter(e=>e.club == n2))
        var sub1 = Array.isArray(n1) ? n1[0].map(e=>e.id).filter(e=>!players1.includes(e)) : buildBench(dataSets1.filter(e=>e.club == n1), players1)
        var sub2 = Array.isArray(n2) ? n2[0].map(e=>e.id).filter(e=>!players2.includes(e)) : buildBench(dataSets2.filter(e=>e.club == n2), players2)
        var team1 = Array.isArray(n1) ? players1.map(e=>updatePotStats(dataSets1.find(p=>e == p.id), n1[0].find(a=>a.id == e)?.potInc)) : players1.map(e=>dataSets1.find(p=>e == p.id))
        var team2 = Array.isArray(n2) ? players2.map(e=>updatePotStats(dataSets2.find(p=>e == p.id), n2[0].find(a=>a.id == e)?.potInc)) : players2.map(e=>dataSets2.find(p=>e == p.id))
        var bench1 = sub1.map(e=>dataSets1.find(p=>e == p.id))
        var bench2 = sub2.map(e=>dataSets2.find(p=>e == p.id))
        var chemistry1 = 88
        var chemistry2 = 78

        if (leg) var game = simulation.startMatch(names, logos, stadium, formation1, formation2, team1, team2, bench1, bench2, tactic1, tactic2, true, res, pause, leg)
        else var game = simulation.startMatch(names, logos, stadium, formation1, formation2, team1, team2, bench1, bench2, tactic1, tactic2, true, res, pause)
        return game
    },
    setTwoTeams: function(name1, name2, leg){
        var cache1 = cacheTeams[name1] ??= {}
        var cache2 = cacheTeams[name2] ??= {}
        const dataSets1 = flatDatabase.filter(e=>e.club == name1).reduce((result, currentArray) => result.concat(JSON.parse(JSON.stringify(currentArray))), [])
        const dataSets2 = flatDatabase.filter(e=>e.club == name2).reduce((result, currentArray) => result.concat(JSON.parse(JSON.stringify(currentArray))), [])  
        var names = [name1, name2]
        var logos = [`https://img.fminside.net/logos/normal/${tactics[name1].id}.png`, `https://img.fminside.net/logos/normal/${tactics[name2].id}.png`]
        var tactic1 = tactics[name1].tactics
        var tactic2 = tactics[name2].tactics
        var formation1 = tactic1.formation
        var formation2 = tactic2.formation
        var players1 = cache1.team ? cache1.team : buildTeam(name1, formation1, dataSets1)
        var players2 = cache2.team ? cache2.team : buildTeam(name2, formation2, dataSets2)
        var sub1 = cache1.bench ? cache1.bench : buildBench(dataSets1, players1)
        var sub2 = cache2.bench ? cache2.bench : buildBench(dataSets2, players2)   
        cache1.team = players1
        cache1.bench = sub1
        cache2.team = players2
        cache2.bench = sub2
        var team1 = players1.map(e=>dataSets1.find(p=>e == p.id))
        var team2 = players2.map(e=>dataSets2.find(p=>e == p.id))
        var bench1 = sub1.map(e=>dataSets1.find(p=>e == p.id))
        var bench2 = sub2.map(e=>dataSets2.find(p=>e == p.id))
        var stadium = clubsList.find(c=>c.name == name1)?.stadiumURL
        var chemistry1 = 88
        var chemistry2 = 78

        if (leg) var game = simulation.startMatch(names, logos, stadium, formation1, formation2, team1, team2, bench1, bench2, tactic1, tactic2, false, undefined, undefined, leg)
        else var game = simulation.startMatch(names, logos, stadium, formation1, formation2, team1, team2, bench1, bench2, tactic1, tactic2, false, undefined, undefined)
        return game
    }
}

function buildTeam(name, form, data){
    var club = JSON.parse(JSON.stringify(data))
    var formation = formations[form]
    var arr = [[],[],[],[], []]
    var ratings = [0, 0, 0, 0, 0]
    for (var i = 0; i < 11; i++){
        var pos = formation[i][2]
        var alt = getAlternates(formation[i][2])
        var players = [...club].filter(e=>!arr[0].includes(e.id))
        .sort((a, b)=> addUpAlts(alt, b, pos) - addUpAlts(alt, a, pos))[0]
        ratings[0] += players.inGameRating
        arr[0][i] = players.id
    }
    for (var i = 10; i >= 0; i--){
        var pos = formation[i][2]
        var alt = getAlternates(formation[i][2])
        var players = [...club].filter(e=>!arr[1].includes(e.id))
        .sort((a, b)=> addUpAlts(alt, b, pos) - addUpAlts(alt, a, pos))[0]
        ratings[1] += players.inGameRating
        arr[1][i] = players.id
    }
    for (i of [5, 6, 7, 8, 9, 10, 0, 1, 2, 3, 4]){
        var pos = formation[i][2]
        var alt = getAlternates(formation[i][2])
        var players = [...club].filter(e=>!arr[2].includes(e.id))
        .sort((a, b)=> addUpAlts(alt, b, pos) - addUpAlts(alt, a, pos))[0]
        ratings[2] += players.inGameRating
        arr[2][i] = players.id
    }
    for (i of [6, 5, 4, 3, 2, 1, 0, 7, 8, 9, 10]){
        var pos = formation[i][2]
        var alt = getAlternates(formation[i][2])
        var players = [...club].filter(e=>!arr[3].includes(e.id))
        .sort((a, b)=> addUpAlts(alt, b, pos) - addUpAlts(alt, a, pos))[0]
        ratings[3] += players.inGameRating
        arr[3][i] = players.id
    }
    for (i of [1, 4, 8, 9, 10, 0, 3, 6, 2, 5, 7]){
        var pos = formation[i][2]
        var alt = getAlternates(formation[i][2])
        var players = [...club].filter(e=>!arr[4].includes(e.id))
        .sort((a, b)=> addUpAlts(alt, b, pos) - addUpAlts(alt, a, pos))[0]
        ratings[4] += players.inGameRating
        arr[4][i] = players.id
    }

    var largestElement = Math.max(...ratings); // Get the largest element in the array
    var largestIndex = ratings.indexOf(largestElement);
    var chosenArr = arr[largestIndex]

    return chosenArr
}

function getAlternates(pos){
    if (pos == "ST") return ["finishing", "heading", "penalty", "work rate"]
    if (pos == "LW" || pos == "RW") return ["dribbling", "pace", "flair", "work rate"]
    if (pos == "AM") return ["technique", "vision", "long shots", "work rate"]
    if (pos == "LM" || pos == "RM") return ["balance", "crossing", "acceleration", "work rate"]
    if (pos == "CM") return ["passing", "agility", "decisions", "work rate"]
    if (pos == "DM") return ["positioning", "marking", "passing", "work rate"]
    if (pos == "LWB" || pos == "RWB" || pos == "LB" || pos == "RB") return ["positioning", "crossing", "tackling", "work rate"]
    if (pos == "CB") return ["tackling", "marking", "strength", "work rate"]
    if (pos == "GK") return [""]
}

function addUpAlts(alt, player, position){
    var a = alt.map(e=>parseInt(player.stats[e])).filter(e=>e)
    if (a.length == 0) a = [0]
    a = player.secondaryPositions.includes(position) ? Math.min(Math.max(a.reduce((x, y)=>x + y), 62)/68, 1) : Math.min(a.reduce((x, y)=>x + y)/68, 1)
    if (player.primaryPositions.includes(position)) a = 1
    else if (!player.secondaryPositions.includes(position)) a -= 0.2
    player.inGameRating = player.rating * a
    return player.rating * a
}

function buildBench(data, XI){
    var formation = ["GK", "CB", "CB", "LB", "RB", "DM", "CM", "AM", "LW", "RW", "ST", "ST"]
    var club = data.filter(e=>!XI.includes(e.id))
    var arr = []
    for (var i = 0; i < formation.length; i++){
        var pos = formation[i]
        var alt = getAlternates(pos)
        var players = [...club].filter(e=>!arr.includes(e.id))
        .sort((a, b)=> addUpAlts(alt, b, pos) - addUpAlts(alt, a, pos))[0]
        if (!players) continue;
        arr.push(players.id)
    }

    return arr
}

function updatePotStats(player, n){
    if (!n) return player
    var num = Math.floor(parseInt(n))
    var stats = player.stats
    const entries = Object.entries(stats);
    entries.sort((a, b) => a[1] - b[1]);
    
    const numberOfArrays = 9;
    const newArray = Array.from({ length: numberOfArrays }, () => []);

    const batchSize = Math.ceil(entries.length / numberOfArrays);

    for (let i = 0; i < entries.length; i++) {
        const index = Math.floor(i / batchSize);
        newArray[index].push(entries[i][0]);
    }
    
    for (var i = 0; num >= i; i++){
        var c = (i % numberOfArrays)
        newArray[c].forEach(e=>{
            if (stats[e] >= 20) return;
            stats[e] = (parseInt(stats[e]) + 1).toString()
        })
    }

    player.stats = stats
    player.rating = (parseInt(player.rating) + num).toString()
    return player
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////