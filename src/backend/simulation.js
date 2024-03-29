const fs = require('fs');
var formations = JSON.parse(fs.readFileSync(`src/data/formations.json`, 'utf-8'))

module.exports = {
    startMatch: async function(teams, logos, stadium, formation1, formation2, team1, team2, bench1, bench2, tactic1, tactic2, isControlled, res, pause, leg){
        
        var savedTeam1 = [...team1], savedBench1 = [...bench1]
        var savedTeam2 = [...team2], savedBench2 = [...bench2]
        var gameStats = {teams: teams, logos: logos, stadium: stadium, time: 0, startingXI: [[],[]], bench: [[],[]], formation: [formation1, formation2], goals: [0, 0], possession: [0, 0], shots: [[0, 0], [0, 0]], xG: [0, 0], fouls: [0, 0], offsides: [0, 0], corners: [0, 0], penalty: [], scorers: [[],[]], assists: [[],[]], cleansheets: [[],[]], matchRatings: [[],[]],subIn: [[], []], subOut: [[], []], _scorers: ["", ""], AET: false}
        var team1Concat = team1.concat(bench1)
        var team2Concat = team2.concat(bench2)
        team1Concat.forEach(e=>e.savedRating = e.rating)
        team2Concat.forEach(e=>e.savedRating = e.rating)
        gameStats.startingXI = [savedTeam1.map(e=>e.id), savedTeam2.map(e=>e.id)]
        gameStats.bench = [savedBench1.map(e=>e.id), savedBench2.map(e=>e.id)]
        var aggressiveScore1 = team1.map(e=>parseInt(e.stats.aggression)).reduce((a, b) => a + b)
        var aggressiveScore2 = team2.map(e=>parseInt(e.stats.aggression)).reduce((a, b) => a + b)
        var offsideTrap1 = tactic2.offsides ? 3 : 1.5
        var offsideTrap2 = tactic1.offsides ? 3 : 1.5
        var addedTime = 0
        if (tactic1.timeWasting || tactic2.timeWasting) addedTime += this.getRandomNumber(5, 8) 
        else addedTime += this.getRandomNumber(2, 5) 
        this.updateTeamEngine(formation1, formation2, team1, team2, tactic1, tactic2);
        var stamina1 = [...team1].filter(e=>e.position != "GK").sort((a, b) => (a.stats.stamina) - (b.stats.stamina)).slice(0, 5)
        var stamina2 = [...team2].filter(e=>e.position != "GK").sort((a, b) => this.getRandomNumber(0, a.stats.stamina) - this.getRandomNumber(0, b.stats.stamina)).slice(0, 5)
        var randoSubTime1 = [this.getRandomNumber(55, 90), this.getRandomNumber(55, 90), this.getRandomNumber(55, 90), this.getRandomNumber(55, 90), this.getRandomNumber(55, 90)]
        var randoSubTime2 = [this.getRandomNumber(55, 90), this.getRandomNumber(55, 90), this.getRandomNumber(55, 90), this.getRandomNumber(55, 90), this.getRandomNumber(55, 90)]
        if (leg) gameStats.goals = [leg.scores[0], leg.scores[1]]
        var isFinal = leg?.isFinal
        
        for (var x = 0; x < 90 + addedTime; x ++){
            //** CONTROLED **
            if (isControlled && res) {
                this.sendData(res, gameStats, savedTeam1, savedBench1, savedTeam2, savedBench2, team1, team2, bench1, bench2)
                var token1 = res[0]?.req.query.token
                var token2 = res[1]?.req.query.token
                var pObj1 = pause[token1]
                var pObj2 = pause[token2]
                var timeSlow = pObj1?.elapse >= 0 ? pObj1.elapse : pObj2?.elapse >= 0 ? pObj2.elapse : 3
                await this.delayMatch(500 * timeSlow)
                if (pObj1?.isPaused){
                    await this.pauseMatch(pause, token1)
                    var changes = pause[token1]?.changes
                    if (changes) {
                        let oldTeam = team1.map(e=>e.id);
                        [team1, bench1] = this.updateTeamLineup(changes, team1, bench1, team1Concat, savedBench1.map(e=>e.id)) 
                        var subIN = team1.filter(player => !oldTeam.includes(player.id)).map(e=>e.id);
                        var subOUT = oldTeam.filter(player => !team1.map(e=>e.id).includes(player))
                        bench1 = bench1.filter(e=>!subOUT.includes(e.id))
                        subIN.map(e=> gameStats.subIn[0].push([e, x + 1]))
                        subOUT.map(e=> gameStats.subOut[0].push([e, x + 1]))
                        tactic1 = this.verifyTactics(changes.tactics)
                        formation1 = tactic1.formation
                        gameStats.formation[0] = tactic1.formation
                    }
                    this.updateTeamEngine(formation1, formation2, team1, team2, tactic1, tactic2);
                }
                if (pObj2?.isPaused){
                    await this.pauseMatch(pause, token2)
                    var changes = pause[token2]?.changes
                    if (changes) {
                        let oldTeam = team2.map(e=>e.id);
                        [team2, bench2] = this.updateTeamLineup(changes, team2, bench2, team2Concat, savedBench2.map(e=>e.id)) 
                        var subIN = team2.filter(player => !oldTeam.includes(player.id)).map(e=>e.id);
                        var subOUT = oldTeam.filter(player => !team2.map(e=>e.id).includes(player))
                        bench2 = bench2.filter(e=>!subOUT.includes(e.id))
                        subIN.map(e=> gameStats.subIn[1].push([e, x + 1]))
                        subOUT.map(e=> gameStats.subOut[1].push([e, x + 1]))
                        tactic2 = this.verifyTactics(changes.tactics)
                        formation2 = tactic2.formation
                        gameStats.formation[1] = tactic2.formation
                    }
                    this.updateTeamEngine(formation1, formation2, team1, team2, tactic1, tactic2);
                }
            }
            // ** CONTROLLED **
            
            gameStats.time += 1
            //subs
            if (!teams[0].includes("*") &&randoSubTime1.includes(x) && bench1.filter(e=>e.primaryPositions[0] != "GK").length > 0){
                var p1 = this.subOutPlayer(stamina1[0], team1, bench1)
                this.updateTeamEngine(formation1, formation2, team1, team2, tactic1, tactic2);
                gameStats.subIn[0].push([p1.id, x + 1])
                gameStats.subOut[0].push([stamina1[0].id, x+1])
                stamina1.splice(0, 1)
            }
            if (!teams[1].includes("*") && randoSubTime2.includes(x) && bench2.filter(e=>e.primaryPositions[0] != "GK").length > 0){
                var p2 = this.subOutPlayer(stamina2[0], team2, bench2)
                this.updateTeamEngine(formation1, formation2, team1, team2, tactic1, tactic2);
                gameStats.subIn[1].push([p2.id, x + 1])
                gameStats.subOut[1].push([stamina2[0].id, x+1])
                stamina2.splice(0, 1)
            }
            //
            var ap1 = team1.map(e=>e.AP).reduce((a, b) => parseInt(a) + parseInt(b)) + (isFinal ? 0 : 10)
            var ap2 = team2.map(e=>e.AP).reduce((a, b) => parseInt(a) + parseInt(b)) - (isFinal ? 0 : 10)
            var dp1 = team1.map(e=>e.DP).reduce((a, b) => parseInt(a) + parseInt(b)) + (isFinal ? 0 : 10)
            var dp2 = team2.map(e=>e.DP).reduce((a, b) => parseInt(a) + parseInt(b)) - (isFinal ? 0 : 10)
            //possession
            var pos1 = this.calculatePossession(formation1, team1, tactic1)
            var pos2 = this.calculatePossession(formation2, team2, tactic2)
            var totalPos = this.adjustPossession(pos1, pos2)
            gameStats.possession[0] += totalPos[0]
            gameStats.possession[1] += totalPos[1] 
            //corner
            var cornerRando1 = this.getRandomNumber(0, 100) < 6
            var cornerRando2 = this.getRandomNumber(0, 100) < 6
            if (cornerRando1){
                gameStats.corners[0] += 1
            }
            if (cornerRando2){
                gameStats.corners[1] += 1
            }
            //shots and xG
            var p1 = tactic1.pressing == "Constant Pressure" ? -0.05 : tactic1.pressing == "Balanced Pressure" ? 0 : 0.05
            var p2 = tactic2.pressing == "Constant Pressure" ? -0.05 : tactic2.pressing == "Balanced Pressure" ? 0 : 0.05
            var pressureNum = (p1 + p2)/2
            var m1 = ap1 + dp1
            var m2 = ap2 + dp2
            var max1 = Math.round((30-0.015*m1)*100) //adjust gap between teams
            var max2 = Math.round((30-0.015*m2)*100) //home away advantage
            var rando1 = this.getRandomNumber(0, max1)
            var rando2 = this.getRandomNumber(0, max2)
            var relax = (gameStats.goals[0] >= 6 || gameStats.goals[1] >= 6) || (Math.abs(gameStats.goals[0] - gameStats.goals[1]) >= 5)
            var n = relax ? 3 : 2.5
            
            if (x > 75){
                if ((tactic1.timeWasting || tactic2.timeWasting) || relax) n = 3
                else n = 2
            }
            
            if (rando1 < rando2 && this.getRandomNumber(0, ap1)/n > this.getRandomNumber(0, dp2)) {
                gameStats.shots[0][0] += 1
                var offensivePlayers = [...team1].filter(e=>e.markers).sort((a, b) => (b.AP) - (a.AP))
                var scorers = []
                var assister = []
                for (var i = 0; i < offensivePlayers.length; i++){
                    var s = this.versusPlayers(offensivePlayers[i], team2, pressureNum)
                    assister.push([offensivePlayers[i], s[1]])
                    if (s[0]) scorers.push(offensivePlayers[i])
                }
                if (scorers.length > 0){
                    var goaler = []
                    var goalDiff = Math.max((gameStats.goals[0] - gameStats.goals[1]) * 2, -2)
                    var tallestPlayers = [...team1].filter(e=>e.position != "GK").sort((a, b) => parseInt(b.height.split(" ")[0]) - parseInt(a.height.split(" ")[0]))
                    for (var i = 0; i < scorers.length; i++){
                        var bool = this.shootOnGoal(scorers[i], team2[10], goalDiff, tactic1.width, false, gameStats.goals[0])
                        gameStats.shots[0][0] += 1
                        gameStats.shots[0][1] += 1
                        gameStats.xG[0] += bool[1]
                        if (bool[0]) goaler.push(scorers[i])
                    }
                    if (cornerRando1 && goaler.length == 0){
                        tallestPlayers = tallestPlayers.slice(0, this.calculateLikelihood(tactic1.corners, tactic2.corners))
                        for (var i = 0; i < tallestPlayers.length; i++){
                            var bool = this.shootOnGoal(tallestPlayers[i], team2[10], goalDiff, tactic1.width, true, gameStats.goals[0])
                            if (bool[0]) {
                                gameStats.shots[0][0] += 1
                                gameStats.shots[0][1] += 1
                                gameStats.xG[0] += bool[1]/2
                                goaler.push(tallestPlayers[i])
                            }
                        }
                    }
                    if (goaler.length > 0){
                        var scorer = goaler[0]
                        var bestPen = [...team1].filter(e=>e.position != "GK").sort((a, b) => parseInt(b.stats.penalty) - parseInt(a.stats.penalty))[0]
                        if (this.getRandomNumber(0, 100) <= (scorer.id == bestPen.id ? 12 : 6)){
                            if (this.getRandomNumber(0, 20) >= bestPen.stats.penalty) {
                                bestPen.playerRating -= bestPen.playerRating >= 8.6 ? 0.25 : 0.5
                                team2[10].playerRating += 0.35
                                gameStats._scorers[0] += `${bestPen.id} p. ${x + 1}' (miss)\n`
                            }
                            else{
                                bestPen.playerRating += bestPen.playerRating >= 8.6 ? 0.375 : 0.75
                                gameStats.goals[0] += 1
                                team2.filter(e=>e.position == "CB").forEach(e=>e.playerRating -= 0.2)
                                gameStats.scorers[0].push(bestPen.id)
                                gameStats._scorers[0] = this.displayScorers(gameStats._scorers[0], bestPen.id, x + 1, true)
                            }
                        }else{
                            var assist = this.sortAssistArray(assister.map(e=>[e[0], e[1]]).filter(e=>e[0].id != scorer.id))[0][0]
                            scorer.playerRating += scorer.playerRating >= 8.6 ? 0.375 : 0.75
                            assist.playerRating += assist.playerRating >= 8.6 ? 0.25 : 0.5
                            if (this.getRandomNumber(0, 100) <= 70) gameStats.assists[0].push(assist.id)
                            gameStats.goals[0] += 1
                            team2.filter(e=>e.position == "CB").forEach(e=>e.playerRating -= 0.2)
                            gameStats.scorers[0].push(scorer.id)
                            gameStats._scorers[0] = this.displayScorers(gameStats._scorers[0], scorer.id, x + 1)
                        }
                    }
                }
            }
            if (rando2 < rando1 && this.getRandomNumber(0, ap2)/n > this.getRandomNumber(0, dp1)) {
                gameStats.shots[1][0] += 1
                var offensivePlayers = [...team2].filter(e=>e.markers).sort((a, b) => (b.AP) - (a.AP))
                var scorers = []
                var assister = []
                for (var i = 0; i < offensivePlayers.length; i++){
                    var s = this.versusPlayers(offensivePlayers[i], team1, pressureNum)
                    assister.push([offensivePlayers[i], s[1]])
                    if (s[0]) scorers.push(offensivePlayers[i])
                }
                if (scorers.length > 0){
                    var goaler = []
                    var goalDiff = Math.max((gameStats.goals[1] - gameStats.goals[0]) * 2, -2)
                    var tallestPlayers = [...team2].filter(e=>e.position != "GK").sort((a, b) => parseInt(b.height.split(" ")[0]) - parseInt(a.height.split(" ")[0]))
                    for (var i = 0; i < scorers.length; i++){
                        var bool = this.shootOnGoal(scorers[i], team1[10], goalDiff, tactic2.width, false, gameStats.goals[1])
                        gameStats.shots[1][0] += 1
                        gameStats.shots[1][1] += 1
                        gameStats.xG[1] += bool[1]
                        if (bool[0]) goaler.push(scorers[i])
                    }
                    if (cornerRando2 && goaler.length == 0){
                        tallestPlayers = tallestPlayers.slice(0, this.calculateLikelihood(tactic2.corners, tactic1.corners))
                        for (var i = 0; i < tallestPlayers.length; i++){
                            var bool = this.shootOnGoal(tallestPlayers[i], team1[10], goalDiff, tactic2.width, true, gameStats.goals[1])
                            if (bool[0]) {
                                gameStats.shots[1][0] += 1
                                gameStats.shots[1][1] += 1
                                gameStats.xG[1] += bool[1]/2
                                goaler.push(tallestPlayers[i])
                            }
                        }
                    }
                    if (goaler.length > 0){
                        var scorer = goaler[0]
                        var bestPen = [...team2].filter(e=>e.position != "GK").sort((a, b) => parseInt(b.stats.penalty) - parseInt(a.stats.penalty))[0]
                        if (this.getRandomNumber(0, 100) <= (scorer.id == bestPen.id ? 12 : 6)){
                            if (this.getRandomNumber(0, 20) >= bestPen.stats.penalty) {
                                bestPen.playerRating -= bestPen.playerRating >= 8.6 ? 0.25 : 0.5
                                team1[10].playerRating += 0.35
                                gameStats._scorers[1] += `${bestPen.id} p. ${x + 1}' (miss)\n`
                            }
                            else{
                                bestPen.playerRating += bestPen.playerRating >= 8.6 ? 0.375 : 0.75
                                gameStats.goals[1] += 1
                                team1.filter(e=>e.position == "CB").forEach(e=>e.playerRating -= 0.2)
                                gameStats.scorers[1].push(bestPen.id)
                                gameStats._scorers[1] = this.displayScorers(gameStats._scorers[1], bestPen.id, x + 1, true)
                            }
                        }else{
                            var assist = this.sortAssistArray(assister.map(e=>[e[0], e[1]]).filter(e=>e[0].id != scorer.id))[0][0]
                            scorer.playerRating += bestPen.playerRating >= 8.6 ? 0.375 : 0.75
                            assist.playerRating += bestPen.playerRating >= 8.6 ? 0.25 : 0.5
                            if (this.getRandomNumber(0, 100) <= 70) gameStats.assists[1].push(assist.id)
                            gameStats.goals[1] += 1
                            team1.filter(e=>e.position == "CB").forEach(e=>e.playerRating -= 0.2)
                            gameStats.scorers[1].push(scorer.id)
                            gameStats._scorers[1] = this.displayScorers(gameStats._scorers[1], scorer.id, x + 1)
                        }
                    }
                }
            }
            //fouls
            if (this.getRandomNumber(0, 500) < Math.round((0.005 + 0.005*aggressiveScore1)*100)){
                gameStats.fouls[0] += 1
            }
            if (this.getRandomNumber(0, 500) < Math.round((0.005 + 0.005*aggressiveScore2)*100)){
                gameStats.fouls[1] += 1
            }
            //offsides
            if (this.getRandomNumber(0, 100) < offsideTrap1){
                gameStats.offsides[0] += 1
            }
            if (this.getRandomNumber(0, 100) < offsideTrap2){
                gameStats.offsides[1] += 1
            }
            savedTeam1.concat(savedBench1.filter(f=>!bench1.map(e=>e.id).includes(f.id))).forEach(e=>e.playerRating = Math.max(Math.min(e.playerRating, 9.9), 1.2))
            savedTeam2.concat(savedBench2.filter(f=>!bench2.map(e=>e.id).includes(f.id))).forEach(e=>e.playerRating = Math.max(Math.min(e.playerRating, 9.9), 1.2))

            //extra time
            if (x == 89 + addedTime && leg && gameStats.goals[0] == gameStats.goals[1] && !gameStats.AET){
                addedTime += (120 - x)
                gameStats.AET = true
            }
            //penalties
            if (x == 120 && leg && gameStats.goals[0] == gameStats.goals[1]){
                var pens = this.simulatePenalties(team1, team2)
                if (pens[0] > pens[1]) gameStats.goals[0] += 1
                if (pens[1] > pens[0]) gameStats.goals[1] += 1
                gameStats.penalty = pens
            }
        }
        if (res) {
            this.sendData(res, gameStats, savedTeam1, savedBench1, savedTeam2, savedBench2, team1, team2, bench1, bench2, true);
        }

        if (gameStats.goals[1] == 0) gameStats.cleansheets[0].push(savedTeam1[10].id)
        if (gameStats.goals[0] == 0) gameStats.cleansheets[1].push(savedTeam2[10].id)
        gameStats._scorers[0] = gameStats._scorers[0].split("\n").map(e=>this.findPlayerName(e.split(" ")[0], savedTeam1.concat(savedBench1)) + " " + e.split(" ").slice(1).join(" ")).join("\n").trim()
        gameStats._scorers[1] = gameStats._scorers[1].split("\n").map(e=>this.findPlayerName(e.split(" ")[0], savedTeam2.concat(savedBench2)) + " " + e.split(" ").slice(1).join(" ")).join("\n").trim()
        gameStats.possession[0] = Math.round(gameStats.possession[0]/(gameStats.time * 100) * 100) || 50
        gameStats.possession[1] = Math.round(gameStats.possession[1]/(gameStats.time * 100) * 100) || 50
        gameStats.matchRatings[0] = savedTeam1.concat(savedBench1).map(e=>[e.id, e.playerRating?.toFixed(1)])
        gameStats.matchRatings[1] = savedTeam2.concat(savedBench2).map(e=>[e.id, e.playerRating?.toFixed(1)])
        gameStats.startingXI = [team1.map(e=>e.id), team2.map(e=>e.id)]
        gameStats.bench = [bench1.map(e=>e.id), bench2.map(e=>e.id)]
        if (gameStats.penalty[0]) gameStats.time = `FT - AP (${gameStats.penalty[0]} - ${gameStats.penalty[1]})`
        else if (gameStats.AET) gameStats.time = "FT - AET"
        else  gameStats.time = "FT"
        return gameStats 
    },

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    findPlayer: function (id, team){
        var a = team.find(e=>e.id == id)
        return a
    },
    findPlayerName: function (id, team){
        var a = team.find(e=>e.id == id)
        if (!a) return "";
        return this.findFirstName(a.name)
    },
    findFirstName: function (name){
        var split = name.split(" ")
        if (split.length > 1) return split.slice(1).join(" ")
        else return name
    },
    displayScorers: function (str, id, time, isPen){
        var arr = str.split("\n")
        var found = false
        for (var i = 0; i < arr.length; i++){
            if (arr[i].includes(id) && !arr[i].includes("(miss)")) {
                if (isPen) arr[i] += ", p. " + time + "'"
                else arr[i] += ", " + time + "'"
                str = arr.join("\n")
                found = true
            }
        }
        if (found == false && isPen) str += `${id} p. ${time}'\n`
        else if (found == false) str += `${id} ${time}'\n`
        return str
    },
    getRandomNumber: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    convertPlayerPositions: function(arr, form, tactic){
        for (var i = 0; i < arr.length; i++){
            var h = form[ i]
            arr[i].position = h[2]
        }
        return arr
    },

    getInGamePosition: function(length, height, h){
        var depth = 100 - length
        var line = 100 - height
        var defaultZ = line * 0.45
        var y = h[1] + (((depth + 50) * ((550-h[1])/125))/2) + (defaultZ * 1.5)
        return y
    },

    calculatePossession: function(formation, team, tactic){
        var t1 = this.formationToPossession(formation)
        var t2 = this.teamToPossession(team, tactic)
        var t3 = this.tacticToPossession(tactic)

        return (t1 + t2 + t3)/3
    },

    formationToPossession: function(formation){
        if (formation == "41212") return this.getRandomNumber(60, 65)
        if (formation == "433") return this.getRandomNumber(57, 62)
        if (formation == "4231") return this.getRandomNumber(54, 59)
        if (formation == "3142") return this.getRandomNumber(51, 56)
        if (formation == "3421") return this.getRandomNumber(48, 53)
        if (formation == "343") return this.getRandomNumber(46, 51)
        if (formation == "4141") return this.getRandomNumber(43, 48)
        if (formation == "442") return this.getRandomNumber(40, 45)
        if (formation == "532") return this.getRandomNumber(37, 42)
        if (formation == "541") return this.getRandomNumber(34, 39)
    },

    teamToPossession: function(team, tactic){
        if (tactic.offensiveStyle == "Wing Play") var total = team.slice(0, -1).map(e=>(parseInt(e.stats.dribbling) + parseInt(e.stats.teamwork))/2).reduce((a, b) => a + b)
        else if (tactic.offensiveStyle == "Long Ball") var total = team.slice(0, -1).map(e=>(parseInt(e.stats.vision) + parseInt(e.stats.teamwork))/2).reduce((a, b) => a + b)
        else var total = team.slice(0, -1).map(e=>(parseInt(e.stats.passing) + parseInt(e.stats.teamwork))/2).reduce((a, b) => a + b)
        
        return total/2.20
    },

    tacticToPossession: function(tactic){
        var possession = ((tactic.height * 0.5) + tactic.length + tactic.width)/2.50
        if (tactic.timeWasting) possession = possession * 0.75
        if (tactic.offensiveStyle == "Possession") possession *= 1.2
        if (tactic.offensiveStyle == "Wing Play") possession *= 1
        if (tactic.offensiveStyle == "Direct Passing") possession *= 0.95
        if (tactic.offensiveStyle == "Long Ball") possession *= 0.8
        if (tactic.transition == "Slow") possession *= 1.2
        if (tactic.transition == "Fast") possession *= 0.8
        return possession
    },

    adjustPossession: function(number1, number2){
        const sum = number1 + number2;
        const percentage = Math.round((number1 / sum) * 100);
        var adjustedNumber1 = Math.floor((percentage / 100) * 100);
        adjustedNumber1 = this.getRandomNumber(adjustedNumber1 - 3, adjustedNumber1 + 3)
        var adjustedNumber2 = 100 - adjustedNumber1;
        return [adjustedNumber1, adjustedNumber2]
    }, 

    getFullPotential: function(player, style){
        var stats = player.stats
        var sum = 0
        var cases = []
        if (style == "Possession") cases = this.possessionStyle().map(e=>e.toLowerCase())//.map(e=>e.toLowerCase()), cases = fillArray(cases, cases.slice(0, 5))
        if (style == "Wing Play") cases = this.wingStyle().map(e=>e.toLowerCase())//.map(e=>e.toLowerCase()), cases = fillArray(cases, cases.slice(0, 3))
        if (style == "Long Ball") cases = this.longStyle().map(e=>e.toLowerCase())///.map(e=>e.toLowerCase()), cases = fillArray(cases, cases.slice(0, 2))
        if (style == "Direct Passing") cases = this.directStyle().map(e=>e.toLowerCase())//.map(e=>e.toLowerCase()), cases = fillArray(cases, cases.slice(0, 1))
        if (style.includes("Marking")) cases = this.markingStyle(style).map(e=>e.toLowerCase())
        
        for (let v of cases){
            sum += parseInt(stats[v])
        }
        if (style.includes("Man Marking")) var dif = (cases.length * 20) - 1
        else var dif = cases.length * 20

        sum = Math.floor((sum/dif) * 100)
        return sum
    },
    calculateLikelihood: function(corner1, corner2) {
        const weight1 = 0.6; 
        const weight2 = 0.4; 
        const likelihood = (corner1 * weight1) + (corner2 * weight2);
      
        return Math.round(likelihood);
    },
    calculateAttack: function(team, tactic, formation){
        team[10].AP = 0
        for (var i = 0; i < team.length - 1; i++){
            var n = (0.55 * this.getFullPotential(team[i], tactic.offensiveStyle)) + (0.45 * parseInt(team[i].rating))
            var h = formations[formation][i]
            var pts = this.getAveragePositions(team[i])
            var min = this.getInGamePosition(0, 0, h)
            var mix = this.getInGamePosition(tactic.length, tactic.height, h)
            var max = this.getInGamePosition(100, 100, h)
            var perc = ((mix - min) / (max - min))
            if (["LW", "ST", "RW", "AM", "CB"].includes(team[i].position)) perc = 0.5;
            var dist = this.getDistance(team[i].position, tactic.fullbacks, formation, perc)
            team[i].AP = Math.max(Math.floor(n * dist) + pts, 0)
        }
    },

    calculateDefence: function(team, tactic, formation){
        team[10].DP = 0
        for (var i = 0; i < team.length - 1; i++){
            var n = (0.55 * this.getFullPotential(team[i], tactic.marking)) + (0.45 * parseInt(team[i].rating))
            var h = formations[formation][i]
            var pts = this.getAveragePositions(team[i])
            var min = this.getInGamePosition(0, 0, h)
            var mix = this.getInGamePosition(tactic.length, tactic.height, h)
            var max = this.getInGamePosition(100, 100, h)
            var perc = ((mix - min) / (max - min))
            if (["LW", "ST", "RW", "AM", "CB"].includes(team[i].position)) perc = 0.5;
            var dist =  this.getDistance(team[i].position, tactic.fullbacks, formation, perc)
            team[i].DP = Math.max(Math.floor(n * (1 - dist)) + (-pts), 0)
        }
    },

    getDistance: function(pos, wingback, formation, dim){
        var obj = {}
        if (formation == "41212") obj = {"ST": 0.9, "AM": 0.8, "CM": 0.6, "DM": 0.4, "LB": 0.3, "RB": 0.3, "CB": 0.1, "GK": 0}
        if (formation == "433") obj = {"ST": 1, "LW": 0.85, "RW": 0.85, "CM": 0.55, "DM": 0.4, "LB": 0.3, "RB": 0.3, "CB": 0.1, "GK": 0}
        if (formation == "4231") obj = {"ST": 1, "LW": 0.8, "AM": 0.8, "RW": 0.8, "DM": 0.4, "LB": 0.3, "RB": 0.3, "CB": 0.1, "GK": 0}
        if (formation == "3142") obj = {"ST": 1, "LM": 0.7, "RM": 0.7, "CM": 0.55, "DM": 0.4, "CB": 0.1, "GK": 0}
        if (formation == "3421") obj = {"ST": 1, "AM": 0.85, "LM": 0.6, "RM": 0.6, "CM": 0.5, "CB": 0.1, "GK": 0}
        if (formation == "343") obj = {"ST": 1, "LW": 0.85, "RW": 0.85, "LM": 0.6, "RM": 0.6, "CM": 0.5, "CB": 0.1, "GK": 0}
        if (formation == "4141") obj = {"ST": 1, "LM": 0.75, "RM": 0.75, "CM": 0.65, "DM":  0.4, "LB": 0.3, "RB": 0.3, "CB": 0.1, "GK": 0}
        if (formation == "442") obj = {"ST": 0.9, "LM": 0.7, "RM": 0.7, "CM": 0.5, "LB": 0.3, "RB": 0.3, "CB": 0.1, "GK": 0}
        if (formation == "532") obj = {"ST": 0.95, "CM": 0.5, "LWB": 0.55, "RWB": 0.55, "CB": 0.1, "GK": 0}
        if (formation == "541") obj = {"ST": 1, "LM": 0.7, "RM": 0.7, "CM": 0.5, "LWB": 0.55, "RWB": 0.55, "CB": 0.1, "GK": 0}

        if (["LWB", "RWB", "RB", "LB"].includes(pos) && wingback.includes("Wing-Back")) obj[pos] += 0.15
        if (["LWB", "RWB", "RB", "LB"].includes(pos) && wingback.includes("Defensive")) obj[pos] -= 0.1
        return obj[pos] + ((-0.5 + dim)/10)
    },

    getAveragePositions: function(player){
        var point = 0
        var positions = player.primaryPositions
        for (var i = 1; i < 3; i ++){
            if (positions.includes("ST")) point += 4 / i
            if (positions.includes("LW") || positions.includes("RW")) point += 3 / i
            if (positions.includes("AM")) point += 2 / i
            if (positions.includes("LM") || positions.includes("RM")) point += 1 / i
            if (positions.includes("LWB") || positions.includes("RWB")) point -= 1 / i
            if (positions.includes("DM")) point -= 2 / i
            if (positions.includes("LB") || positions.includes("RB")) point -= 3 / i
            if (positions.includes("CB")) point -= 4 / i
            positions = player.secondaryPositions   
        }
        return point
    },

    possessionStyle: function(){ //Agility, Technique, Dribbling
        return ["Agility", "Technique", "Dribbling", "finishing", "long shots", "heading"]
    },

    directStyle: function(){ //Decisions, Teamwork, Passing
        return ["Decisions", "Acceleration", "Passing", "finishing", "long shots", "heading"]
    },

    longStyle: function(){ // Work Rate, Stamina, Vision
        return ["Work Rate", "Pace", "Vision", "finishing", "long shots", "heading"]
    },

    wingStyle: function(){ //Agility, Acceleration, Crossing
        return ["Agility", "Acceleration", "Pace", "finishing", "long shots", "heading"]
    },

    markingStyle: function(type){
        if (type == "Man Marking") return ["Strength", "Tackling", "Marking"]
        else return ["Strength", "Tackling", "Positioning"]
    },

    calculateDistance: function(player1, player2) {
        const xDiff = player1[0] - player2[0];
        return Math.sqrt(xDiff ** 2);
    },
    sortAssistArray: function (array){
        array.sort((a, b) => {
            const probabilityA = a[1];
            const probabilityB = b[1];
          
            const randomA = Math.random();
            const randomB = Math.random();
          
            const adjustedProbabilityA = probabilityA * randomA;
            const adjustedProbabilityB = probabilityB * randomB;
          
            return adjustedProbabilityB - adjustedProbabilityA;
          });

          return array
    },
    findMarkingPositions: function(side1, side2) {
        var list = [...side2]
        var finalArr = list.filter(e=>e[2] == "CB" || ["LB", "RB", "LWB", "RWB"].includes(e[2]) && side1[2] == "ST")
        var arr = list.filter(e=>!["CAM", "ST", "RW", "LW", "CB"].includes(e[2]))
        arr = arr.sort((a, b) => {
            return this.calculateDistance(side1, a) - this.calculateDistance(side1, b)
        })
        return finalArr.concat(arr).slice(0, 5)
    },

    findNearPlayers: function(side1, side2, home, away){
        for (var i = 0; i < 11; i++){
            var position = side1[i]
            var player = home[i]
            if (player.position == "GK" || player.position == "CB") {
                player.markers = undefined
                continue;
            }
            
            var markPos = this.findMarkingPositions(position, side2.slice(0, 10));
            player.markers = markPos.map(e=>away[side2.indexOf(e)].id)
        }
    },

    versusPlayers: function(player, opposition, press){
        var AP = player.AP
        var bool = true;
        var count = 0
        var markers = this.shuffleArray(player.markers)
        for (var i = 0; i < markers.length; i++){
            var marker = opposition.find(e => e.id == markers[i])
            var DP = marker.DP * (1 + (press * i)) //Drop back vs Pressure
            if (this.getRandomNumber(0, DP) > this.getRandomNumber(0, AP)) {
                player.playerRating -= 0.0375
                marker.playerRating += marker.playerRating >= 8.6 ? marker.DP/1200 : marker.DP/800
                return [false, count]
            }else{
                count++
                player.playerRating += player.playerRating >= 8.6 ? ((80 + player.DP)/2)/800 : ((80 + player.DP)/2)/400
                marker.playerRating -= marker.DP/(["LB", "LWB", "RB", "RWB"].includes(marker.position) ? 1200 : 800)
            }
        }
        if (bool) {
            player.playerRating += player.playerRating >= 8.6 ? 0.05 : 0.1
            return [true, count];
        }
    },

    shootOnGoal: function(player, goalkeeper, tax, width, isCorner, gA){
        var atrs = ["finishing", "long shots", "heading"]
        if (this.getRandomNumber(0, 100) > width) atrs.push("long shots")
        else atrs.push("heading")
        if (isCorner) atrs = ["jumping"]
        var atr = atrs[Math.floor(Math.random()*atrs.length)];

        var r1 = player.stats[atr]
        var r2 = goalkeeper.rating
        var max1 = Math.round((1.9-0.05*r1)*100) + (tax * 15)
        var max2 = Math.round((2.9-0.025*r2)*100)
        var rando1 = this.getRandomNumber(0, max1)
        var rando2 = this.getRandomNumber(0, max2)
        var xg = 1 - (rando1/(max1))
        if (rando1 < rando2) {
            goalkeeper.playerRating -= (1 - xg) + (gA/5)
            return [true, xg]
        }
        else {
            goalkeeper.playerRating += goalkeeper.playerRating >= 8.0 ? xg/3 : xg/1.5
            player.playerRating -= ["ST", "LW", "RW"].includes(player.position) ? xg : xg/2
            return [false, xg]
        }
    },
    subOutPlayer: function (player, team, bench){
        var subIn = this.findBestBench(bench, player.position)
        var ind1 = team.indexOf(player)
        var ind2 = bench.indexOf(subIn)
        team[ind1] = subIn
        bench.splice(ind2, 1)
        return subIn
    },
    findBestBench: function (bench, pos){
        if (pos == "ST") var alt = ["finishing", "heading", "penalty", "work rate"]
        if (pos == "LW" || pos == "RW") var alt =  ["dribbling", "pace", "flair", "work rate"]
        if (pos == "AM") var alt =  ["technique", "vision", "long shots", "work rate"]
        if (pos == "LM" || pos == "RM") var alt =  ["balance", "crossing", "acceleration", "work rate"]
        if (pos == "CM") var alt =  ["passing", "agility", "decisions", "work rate"]
        if (pos == "DM") var alt =  ["positioning", "marking", "passing", "work rate"]
        if (pos == "LWB" || pos == "RWB" || pos == "LB" || pos == "RB") var alt =  ["positioning", "crossing", "tackling", "work rate"]
        if (pos == "CB") var alt =  ["tackling", "marking", "strength", "work rate"]
        if (pos == "GK") var alt =  [""]

        var player = [...bench].filter(e=>e.primaryPositions[0] != "GK").sort((a, b)=> this.addUpAlts(alt, b, pos) - this.addUpAlts(alt, a, pos))[0]
        return player
    },
    addUpAlts: function (alt, player, position){
        var a = alt.map(e=>parseInt(player.stats[e])).filter(e=>e)
        if (a.length == 0) a = [0]
        a = player.secondaryPositions.includes(position) ? Math.min(Math.max(a.reduce((x, y)=>x + y), 62)/68, 1) : Math.min(a.reduce((x, y)=>x + y)/68, 1)
        if (player.primaryPositions.includes(position)) a = 1
        else if (!player.secondaryPositions.includes(position)) a -= 0.2
        return player.rating * a
    },
    checkAdaptibility: function(team){
        team.forEach(e=>{
            var pos = e.position
            if (pos == "ST") var alt = ["finishing", "heading", "penalty", "work rate"]
            if (pos == "LW" || pos == "RW") var alt = ["dribbling", "pace", "flair", "work rate"]
            if (pos == "AM") var alt = ["technique", "vision", "long shots", "work rate"]
            if (pos == "LM" || pos == "RM") var alt = ["balance", "crossing", "acceleration", "work rate"]
            if (pos == "CM") var alt = ["passing", "agility", "decisions", "work rate"]
            if (pos == "DM") var alt = ["positioning", "marking", "passing", "work rate"]
            if (pos == "LWB" || pos == "RWB" || pos == "LB" || pos == "RB") var alt = ["positioning", "crossing", "tackling", "work rate"]
            if (pos == "CB") var alt = ["tackling", "marking", "strength", "work rate"]
            if (pos == "GK") var alt = [""]

            e.rating = e.savedRating
            e.rating = this.addUpAlts(alt, e, pos)
        })
    },
    sendData: function (res, obj, savedTeam1, savedBench1, savedTeam2, savedBench2, team1, team2, bench1, bench2, isFT){
        var gameStats = JSON.parse(JSON.stringify(obj));
        gameStats._scorers[0] = gameStats._scorers[0].split("\n").map(e=>this.findPlayerName(e.split(" ")[0], savedTeam1.concat(savedBench1)) + " " + e.split(" ").slice(1).join(" ")).join("\n").trim()
        gameStats._scorers[1] = gameStats._scorers[1].split("\n").map(e=>this.findPlayerName(e.split(" ")[0], savedTeam2.concat(savedBench2)) + " " + e.split(" ").slice(1).join(" ")).join("\n").trim()
        gameStats.possession[0] = Math.round(gameStats.possession[0]/(gameStats.time * 100) * 100) || 50
        gameStats.possession[1] = Math.round(gameStats.possession[1]/(gameStats.time * 100) * 100) || 50
        gameStats.matchRatings[0] = savedTeam1.concat(savedBench1).map(e=>[e.id, e.playerRating?.toFixed(1)])
        gameStats.matchRatings[1] = savedTeam2.concat(savedBench2).map(e=>[e.id, e.playerRating?.toFixed(1)])
        gameStats.startingXI = [team1.map(e=>e.id), team2.map(e=>e.id)]
        gameStats.bench = [bench1.map(e=>e.id), bench2.map(e=>e.id)]
        if (isFT && gameStats.penalty[0]) gameStats.time = `FT - AP (${gameStats.penalty[0]} - ${gameStats.penalty[1]})`
        else if (isFT && gameStats.time == 120) gameStats.time = "FT - AET"
        else if (isFT) gameStats.time = "FT"
        res.filter(e=>e).forEach(r=>r.write(`data: ${JSON.stringify(gameStats)}\n\n`));
    },
    delayMatch: function (t){
        return new Promise(resolve => setTimeout(resolve, t));
    },
    pauseMatch: async function (p, t){
        if (p[t]?.isPaused){
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.pauseMatch(p, t);
        }
    },
    shuffleArray: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
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
    simulatePenalties: function(team1, team2){
        var penOrder1 = [...team1].filter(e=>e.position != "GK").sort((a, b) => parseInt(b.stats.penalty) - parseInt(a.stats.penalty)).slice(0,3)
        var penOrder2 = [...team2].filter(e=>e.position != "GK").sort((a, b) => parseInt(b.stats.penalty) - parseInt(a.stats.penalty)).slice(0,3)
        var penScores = [0, 0]
        var maxRounds = 5
        const filledCircle = "\u25CF"; 
        const emptyCircle = "\u25CB"; 
        for (var i = 0; i < maxRounds; i++){
            console.log("round: " + (i + 1))
            if (!penOrder1[i]) penOrder1 = penOrder1.concat(penOrder1)
            if (!penOrder2[i]) penOrder2 = penOrder2.concat(penOrder2)
            if (this.getRandomNumber(0, 20) < penOrder1[i].stats.penalty) penScores[0] += 1
            if (this.verifyPenaties(penScores, i, maxRounds, 0)) return penScores;
            if (this.getRandomNumber(0, 20) < penOrder2[i].stats.penalty) penScores[1] += 1
            if (this.verifyPenaties(penScores, i, maxRounds, 1)) return penScores;
            if ((i + 1) == maxRounds && penScores[0] == penScores[1]) maxRounds += 1
        }
        return penScores
    },
    verifyPenaties: function(scores, i, maxRounds, a){
        if (scores[0] > scores[1]){
            var projected = scores[1] + (maxRounds - (i + a))
            if (scores[0] > projected) return true
        }
        if (scores[1] > scores[0]){
            var projected = scores[0] + (maxRounds - (i + 1))
            if (scores[1] > projected) return true
        }
        return false
    },
    updateTeamLineup: function(changes, team, bench, teamConcat, savedBench){
        var startingXI = changes.startingXI
        var subs = changes.bench.filter(e=>savedBench.includes(e))
        var array1 = teamConcat.map(e=>e.id)
        var array2 = startingXI.concat(subs)
        var bool = array2.every(element => array1.includes(element));
        if (bool == false) return [team, bench]
        var newTeam = startingXI.map(e=>this.findPlayer(e, teamConcat))
        var newBench = subs.map(e=>this.findPlayer(e, teamConcat))
        return [newTeam, newBench]
    },
    updateTeamEngine: function(formation1, formation2, team1, team2, tactic1, tactic2){
        this.convertPlayerPositions(team1, formations[formation1], tactic1)
        this.convertPlayerPositions(team2, formations[formation2], tactic2)
        this.checkAdaptibility(team1)
        this.checkAdaptibility(team2)
        this.calculateAttack(team1, tactic1, formation1)
        this.calculateAttack(team2, tactic2, formation2)
        this.calculateDefence(team1, tactic1, formation1)
        this.calculateDefence(team2, tactic2, formation2)
        this.findNearPlayers(formations[formation1], formations[formation2], team1, team2)
        this.findNearPlayers(formations[formation2], formations[formation1], team2, team1)
        team1.filter(e=>!e.playerRating).forEach(e=>e.playerRating = e.primaryPositions.includes("GK") ? 6.5 : 6.0)
        team2.filter(e=>!e.playerRating).forEach(e=>e.playerRating = e.primaryPositions.includes("GK") ? 6.5 : 6.0)
    }
}