const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const app = express();
const PORT = 5500;
const Database = require("./connect.js")
const db = require('./mongoDB.js')
const indexFile = require("./index.js")
const DBclass = new Database(); 
DBclass.connect()
var database = JSON.parse(fs.readFileSync(`src/data/database.json`, 'utf-8'))
const teamTactics = JSON.parse(fs.readFileSync(`src/data/tactics.json`, 'utf-8'))
var leaguesName = ["LaLiga", "Premier League", "Serie A", "Ligue 1", "Bundesliga", "Champions League"]
var prizes = ["85,000", "105,000", "75,000", "50,000", "62,000", "120,000"]
//
app.use(express.static(__dirname));
app.use(express.json());
app.use(cookieParser());
var pause = {}


// Endpoint to collect userData
app.get('/get-userData', async (req, res) => {
  var token = req.headers.authorization
  var userData = await db.findElement(token)
  return res.status(200).json({ data: userData });
});

// Endpoint to check if admin
app.get('/fileNames', async (req, res) => {
  var files = fs.readdirSync("src/images");
  return res.status(200).json({ names: files });
});

app.post('/resume-game', async (req, res) => {
  var token = req.headers.authorization
  var body = req.body
  pause[token] = {isPaused: false, changes: body.changes, elapse: body.elapse}
  return res.status(200).json({paused: false})
});

app.post('/pause-game', async (req, res) => {
  var token = req.headers.authorization
  pause[token] = {isPaused: true}
  return res.status(200).json({paused: true})
});

app.get('/simulate-kickOff', async (req, res) => {
  const token = req.query.token;
  const opponent = req.query.opponent;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Authorization', token);
  if (!teamTactics[opponent]) return res.status(500).json({ error: 'No team found' });

  var userData = await db.findElement(token)
  var players = userData.players.filter(e=>e.inSquad)
  var tactics = userData.tactics
  if (tactics.startingXI.filter(e=>e).length < 11) return res.status(500).json({ error: 'Not enough players in XI' });
  tactics.name = userData.teamName + "*"
  tactics.logo = userData.teamLogo
  tactics.stadium = userData.stadiumURL
  delete pause[token]
  var rando = Math.floor(Math.random() * (100 - 1 + 1)) + 1;
  if (rando > 50) var specialGame = await indexFile.simulateMatch([players, tactics], opponent, [res, null], pause);
  else var specialGame = await indexFile.simulateMatch(opponent, [players, tactics], [res, null], pause);
  req.on('close', () => {
    delete pause[token]
  });
});

app.get('/simulate-myMatch', async (req, res) => {
  const token = req.query.token;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Authorization', token);

  var leagueInfo = await db.getSeason(token)
  var matchday = leagueInfo.matchday
  var fixtures = leagueInfo.fixtures
  var leagueName = leagueInfo.league
  var matchFixture = fixtures[matchday]
  if (!matchFixture) return res.status(500).json({ error: 'No more matches left' });
  var game = matchFixture.filter(e=>e.slice(0, 2).some(m=>m.includes("*")))[0]
  var userData = await db.findElement(token)
  var players = userData.players.filter(e=>e.inSquad)
  var tactics = userData.tactics
  if (tactics.startingXI.filter(e=>e).length < 11) return res.status(500).json({ error: 'Not enough players in XI' });
  tactics.name = userData.teamName + "*"
  tactics.logo = userData.teamLogo
  tactics.stadium = userData.stadiumURL
  var team1 = game ? game[0] : ""
  var team2 = game ? game[1] : ""
  delete pause[token]
  var side = team1.includes("*") ? 0 : 1
  var legGames = []
  if (leagueName == "Champions League" && [7, 9, 11, 12].includes(matchday)){
    var firstLeg = fixtures[matchday-1]
    legGames = firstLeg.map(e=>({homeTeam: e[1], scores: [e[2].goals[1], e[2].goals[0]]}))
    if (matchday == 12) legGames = [{homeTeam: fixtures[matchday][0][0], scores: [0, 0], isFinal: true}]
  }
  console.time("test1");
  var secondLeg = legGames.find(x=>team1 == x.homeTeam)
  if (team1.includes("*")) var specialGame = await indexFile.simulateMatch([players, tactics], team2, [res, null], pause, secondLeg);
  else if (team2.includes("*")) var specialGame = await indexFile.simulateMatch(team1, [players, tactics], [null, res], pause, secondLeg);
  console.timeEnd("test1");
  delete pause[token]
  if (specialGame && !specialGame.time.startsWith("FT")) return;
  var fixture = fixtures[matchday]

  console.time("test2");
  for (var i = 0; i < fixture.length; i++){
    var name1 = fixture[i][0]
    var name2 = fixture[i][1]
    var secondLeg = legGames.find(x=>name1 == x.homeTeam)
    if (name1.includes("*") || name2.includes("*")) var result = specialGame
    else var result = await indexFile.simulateNPCs(name1, name2, secondLeg)
    fixture[i][2] = result
  }
  console.timeEnd("test2");
  fixtures = await db.setFixture(token, matchday, fixture);
  matchday = await db.addMatchday(token);
  var output = specialGame ? indexFile.gameAward(specialGame, side) : 0
  if (!fixtures[matchday] && leagueName == "Champions League" && matchday < 13) {
    if (matchday < 8) {
      var winners = indexFile.displayGroups(fixtures)
      var games = indexFile.drawRoundOf16(winners)
    }
    else {
      var winners = indexFile.displayWinners(fixtures[matchday - 1])
      var games = indexFile.drawKnockout(winners)
    }
    var flippedGames = games.map(pair => [pair[1], pair[0]]);
    fixtures = await db.setFixture(token, matchday, games);
    if (matchday < 12) fixtures = await db.setFixture(token, matchday+1, flippedGames);
  }
  else if (!fixtures[matchday] && leagueName == "Champions League") {
    var indx = leaguesName.indexOf(leagueName)
    var prize = parseInt(prizes[indx].replace(/,/g, ''))
    var stage = indexFile.findStage(fixtures)
    var placement = stage[0]
    var isWinner = stage[1]
    var multiplier = 0
    if (placement <= 6) multiplier = 0.05
    else if (placement <= 8) multiplier = 0.15
    else if (placement <= 10) multiplier = 0.25
    else if (placement <= 12 && isWinner) multiplier = 1
    else if (placement <= 12) multiplier = 0.35
    output += (prize * multiplier)
  }
  else if (!fixtures[matchday]) {
    var indx = leaguesName.indexOf(leagueName)
    var prize = parseInt(prizes[indx].replace(/,/g, ''))
    var table = indexFile.organizeTable(fixtures)
    var position = Object.keys(table).findIndex(e=>e.includes("*"))
    var yp = position + 1
    output += parseInt((1/yp) * prize)
  }
  console.log(output)
  await db.addBalance(token, output)
  res.write(`data: ${JSON.stringify({done: true})}\n\n`)
  res.end()
});

// Endpoint to check season for user
app.get('/get-season', async (req, res) => {
  var token = req.headers.authorization
  var leagueInfo = await db.getSeason(token)
  return res.status(200).json(leagueInfo)
});

// Endpoint to check season for user
app.get('/get-coins', async (req, res) => {
  var token = req.headers.authorization
  var userData = await db.findElement(token)
  return res.status(200).json({ data: parseInt(userData.coins) });
});

// Endpoint to delete season for user
app.post('/delete-season', async (req, res) => {
  var token = req.headers.authorization
  await db.deleteSeason(token)
  return res.status(200).json({deleted: true})
});

// Endpoint to load season for user
app.post('/create-season', async (req, res) => {
  var token = req.headers.authorization
  var body = req.body
  var leagueName = body.league
  if (!leagueName) return res.status(500).json({ error: 'League not informed' });
  var teamName = await db.getTeamName(token)
  if (!teamName) return res.status(500).json({ error: 'You do not have a team name' });
  var leagueTeams = indexFile.filterLeagueTeams(teamTactics, leagueName)
  var teams = Object.keys(leagueTeams)
  if (teams.length < 1){
    var group = indexFile.createGroupStage();
    var teams = group.flat(1)
    var randomTeam = teams.filter(e=>!["Premier League", "LaLiga", "Serie A", "Bundesliga", "Ligue 1"].includes(teamTactics[e].league))
    randomTeam = randomTeam[Math.floor(Math.random()*randomTeam.length)];
    teams[teams.indexOf(randomTeam)] = `${teamName}*`
    var fixtures = indexFile.generateTournament(teams)
  }else{
    teams.pop()
    teams.push(`${teamName}*`)
    var fixtures = indexFile.generateFixtures(teams)
  }
  var info = { league: leagueName, matchday: 0, fixtures: fixtures}
  await db.setSeason(token, info)
  return res.status(200).json(info);
});

// Endpoint to add a player to team
app.post('/add-player', async (req, res) => {
  var token = req.headers.authorization
  var body = req.body
  var userData = await db.findElement(token)
  var player = userData.players.find(obj => obj.c == body.c);
  if (!player) return res.status(500).json({ error: 'Could not find player in userData' });
  if (userData.players.filter(e=>e.inSquad).map(e=>e.id).includes(body.id)) return res.status(500).json({ error: 'Cannot add duplicate' });
  player.inSquad = true
  await db.addPlayer(token, player.c)
  var squadPlayers = userData.players.filter(e=>e.inSquad)
  return res.status(200).json({ players: squadPlayers});
});

// Endpoint to remove a player from team
app.post('/remove-player', async (req, res) => {
  var token = req.headers.authorization
  var body = req.body
  var userData = await db.findElement(token)
  var player = userData.players.find(obj => obj.c == body.c);
  if (!player) return res.status(500).json({ error: 'Could not find player in userData' });
  var i2 = userData.tactics.startingXI.findIndex(obj => obj?.c == body.c)
  player.inSquad = false
  if (i2 >= 0) {
    userData.tactics.startingXI[i2] = null
    await db.kickPlayer(token, userData.tactics.startingXI)
  }
  await db.removePlayer(token, player.c)
  var squadPlayers = userData.players.filter(e=>e.inSquad)
  return res.status(200).json({ players: squadPlayers});
});

// Endpoint to buy a player
app.post('/buy-player', async (req, res) => {
  var token = req.headers.authorization
  var body = req.body
  var obj = {id: body.id, potInc: 0, c: indexFile.createCrypto(11), inSquad: false}
  var userData = await db.findElement(token)
  var price = indexFile.calculatePrice(body.id)
  if (userData.coins < price) return res.status(403).json({ error: "Cannot afford player" });
  await db.buyPlayer(token, obj)
  userData.players.push(obj)
  return res.status(200).json({ players: userData.players, value: price});
});

// Endpoint to sell a player
app.post('/sell-player', async (req, res) => {
  var token = req.headers.authorization
  var body = req.body
  var userData = await db.findElement(token)
  var i =  userData.players.findIndex(obj => obj.c == body.c && obj.potInc == body.potInc);
  if (i < 0) return res.status(500).json({ error: 'Could not find player in userData' });
  var i2 = userData.tactics.startingXI.findIndex(obj => obj?.c == body.c)
  var price = Math.floor(indexFile.calculatePrice(body.id, userData.players[i].potInc)/3)
  userData.players.splice(i, 1)
  if (i2 >= 0) {
    userData.tactics.startingXI[i2] = null
    await db.kickPlayer(token, userData.tactics.startingXI)
  }
  await db.setPlayers(token, userData.players)
  return res.status(200).json({ players: userData.players, value: price});
});

// Endpoint to upgrade a player
app.post('/upgrade-player', async (req, res) => {
  var token = req.headers.authorization
  var userData = await db.findElement(token)
  var body = req.body
  var player = userData.players.find(x=>x.c == body.c)
  if (!player) return res.status(500).json({ error: 'Could not find player in userData' });
  var oldPot = player.potInc
  var foundPlayer = indexFile.findPlayer(player.id)
  if (isNaN(body.perc)) return res.status(403).json({ error: 'Not a number' });
  var maxPot = (parseInt(foundPlayer.potential) - parseInt(foundPlayer.rating))
  if (body.perc > maxPot) body.perc = maxPot
  var diff = Math.ceil((body.perc - oldPot) * 100)
  if (userData.powerUps < diff) return res.status(403).json({ error: "Cannot afford boosts" });

  player.potInc = body.perc
  var players = userData.players
  await db.setPlayers(token, players)
  return res.status(200).json({ players: players, value: diff});
});

// Endpoint to update a player
app.patch('/update-tactics', async (req, res) => {
  var token = req.headers.authorization
  var tactics = req.body
  var userData = await db.findElement(token)
  var playerList = userData.players.map(e=>e.c)
  tactics.startingXI = tactics.startingXI.filter(e=>e == undefined || playerList.includes(e?.c))
  tactics = indexFile.verifyTactics(tactics)
  await db.setTactics(token, tactics)
  res.status(200).json({ tactics: tactics});
});

// Endpoint for updating the JSON file
app.patch('/update-json', async (req, res) => {
  var token = req.headers.authorization
  var userData = await db.findElement(token)
  if (!userData.isAdmin) return res.status(403).json({ error: 'Access denied. You do not have permission to access this resource.' });

  database = JSON.parse(fs.readFileSync(`src/data/database.json`, 'utf-8'))
  var player = req.body;
  var club = database[player.club]
  var indx = club.map(e=>e.id).indexOf(player.id)
  if (indx >= 0) database[player.club][indx] = player
  else return res.status(500).json({ error: 'Could not find player in Database' });

  fs.writeFile('src/data/database.json', `{\n${JSON.stringify(database).split(`}}],"`).join(`}}],\n"`).slice(1, -1)}\n}`, err => {
    if (err) {
      console.error('Error writing JSON file:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      console.log('JSON file updated successfully');
      res.status(200).json({ message: 'JSON file updated successfully' });
    }
  });
});

app.post('/authentication', async (req, res) => {
    var body = req.body
    var userName = body.username
    var passWord = body.password
    var token = await db.getAccount(userName, passWord)
    return res.status(200).json({token});
});

//load html files
app.get('/', (req, res) => {
  var login = req.cookies.login
  if (!login){
    res.sendFile(path.join(__dirname, 'login.html'));
  }
  else {
    res.sendFile(path.join(__dirname, 'game.html'));
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
