var isGameFinished;
var isEditing = false
var setInGameTime = 3 
var shapeTactics = {tempWidth: 0, tempDepth: 0, tempLine: 0}
var defensiveTactics = {tempPressure: null, tempMarking: null, tempWasting: null, tempOffside: null}
var offensiveTactics = {tempOffensive: null, tempTransition: null, tempCorner: null, tempFullBack: null}
var capturedArrays = []
var tempGameObj = {}
var inGameChanges = {}
//
var scoreLineGroup = new Konva.Group()
var inGameLineup1 = new Konva.Group()
var inGameLineup2 = new Konva.Group()
var inGameStatic = new Konva.Group()
var inGameFormation = new Konva.Group()
inGameLineup1.visible(false)
inGameLineup2.visible(false)
gameLayer.add(scoreLineGroup);
gameLayer.add(inGameStatic);
gameLayer.add(inGameLineup1);
gameLayer.add(inGameLineup2);
BLSLayer.add(gameLayer);

function createGame(gameObj){
    scoreLineGroup.destroyChildren()
    BLSLayer.children.filter(e=>e.visible() && e != gameLayer).forEach(e=>{
        capturedArrays.push(e)
        e.visible(false)
    })
    isGameFinished = gameObj.time.toString().startsWith("FT") ? true : false
    var side = gameObj.teams[0].includes("*") ? 1 : gameObj.teams[1].includes("*") ? 2 : 0

    var urlStadium = gameObj.stadium//clubsList.find(c=>c.name == gameObj.teams[0])?.stadiumURL
    coolRectangle(0, 0, 900, 700, "#6f816c", "black", 0, "#484848", scoreLineGroup)
    if (urlStadium) addImageToCanvas(urlStadium, 0, 0, 900, 700, scoreLineGroup, 0.15)
    addImageToCanvas(`paintBackground.png`, 0, 0, 900, 730, scoreLineGroup, 0.10)
    drawRectangle(0, 70, 0, "rgba(7, 28, 39, 0.7)", "", 900, 630, scoreLineGroup)
    //top bit
    drawRectangle(2, 2, 2, "black", "#061c21", 896, 70, scoreLineGroup)
    drawText(gameObj.time, 15, 10, "gray", "Gill Sans", 35, "left", "", "", 0, scoreLineGroup)
    drawRectangle(390, 0, 0, "#1e1e1e", "", 120, 71, scoreLineGroup)
    var scores = drawText(`${gameObj.scorers[0].length} - ${gameObj.scorers[1].length}`, 450, 20, "white", "Arial Black", 42, "center", "middle", "gray", 1.2, scoreLineGroup)
    var x1 = scores.x() - (scores.width()/2) - 30, x2 = scores.x() + (scores.width()/2) + 80
    addImageToCanvas(gameObj.logos[0], x1, 11, 50, 50, scoreLineGroup) 
    addImageToCanvas(gameObj.logos[1], x2, 11, 50, 50, scoreLineGroup) 
    //goals
    var scorers1 = gameObj._scorers[0].split("\n").filter(e=>e)
    var scorers2 = gameObj._scorers[1].split("\n").filter(e=>e)
    for (var i = 0; i < scorers1.length; i++){
        var y = 100 + (i * 50)
        var m = drawText(scorers1[i], 80, y + 3.5, "beige", "Trebuchet MS", 18, "left", "", "", 0, scoreLineGroup)
        if (scorers1[i]?.includes("(miss)")) m.opacity(0.5), addImageToCanvas("soccerMiss.png", 50, y, 25, 25, scoreLineGroup)
        else addImageToCanvas("soccerBall.png", 50, y, 25, 25, scoreLineGroup)
    }

    for (var i = 0; i < scorers2.length; i++){
        var y = 100 + (i * 50)
        var m = drawText(scorers2[i], 630, y + 3.5, "beige", "Trebuchet MS", 18, "left", "", "", 0, scoreLineGroup)
        if (scorers2[i]?.includes("(miss)")) m.opacity(0.5), addImageToCanvas("soccerMiss.png", 600, y, 25, 25, scoreLineGroup)
        else addImageToCanvas("soccerBall.png", 600, y, 25, 25, scoreLineGroup)
        m.width(270)
    }
    
    //stats
    var arr = [[25, 420, "Possession (%)", gameObj.possession], [25, 495, "Shots (On Target)", gameObj.shots], [25, 570, "xG", gameObj.xG], [475, 420, "Fouls", gameObj.fouls], [475, 495, "Offsides", gameObj.offsides], [475, 570, "Corners", gameObj.corners]]
    for (var i = 0; i < 6; i++){
        var x = arr[i][0]
        var y = arr[i][1]
        var name = arr[i][2]
        var stat = [...arr[i][3]]
        drawRectangle(x, y, 2, "#687581", "black", 400, 60, scoreLineGroup)
        drawRectangle(x + 1, y + 1, 0, "#004584", "", 55, 58, scoreLineGroup)
        drawRectangle((x + 345) - 1, y + 1, 0, "#004584", "", 55, 58, scoreLineGroup)
        drawText(name, (x + (x + 400))/2, (y + (y + 60))/2, "#0c343d", "Verdana", 26, "center", "center", "black", 1, scoreLineGroup)
        if (!stat) continue;
        if (stat[0].length > 1) stat[0] = `${stat[0][0]}(${stat[0][1]})`
        if (stat[1].length > 1) stat[1] = `${stat[1][0]}(${stat[1][1]})`
        if (name == "xG") stat[0] = stat[0].toFixed(1)
        if (name == "xG") stat[1] = stat[1].toFixed(1)
        drawText(stat[0], ((x + (x + 55))/2) + 1, (y + (y + 60))/2, "beige", "Optima", 18, "center", "center", "", 0, scoreLineGroup)
        drawText(stat[1], (((x + 345) + (x + 400))/2) - 1, (y + (y + 60))/2, "beige", "Optima", 18, "center", "center", "", 0, scoreLineGroup)
    }

    createMyLineup(gameObj, 0, side == 1)
    createMyLineup(gameObj, 1, side == 2)

    if (inGameStatic.children.length == 0){
        staticInGame(side)
        refreshTactics();
    }
}

function staticInGame(side){
    drawRectangle(0, 659, 2, "#0a282f", "#061c21", 900, 42, inGameStatic)
    addImageToCanvas("tacticBoard.png", 3, 663, 35, 35, inGameStatic)
    addImageToCanvas("tacticBoard.png", 862, 663, 35, 35, inGameStatic)
    var homeBtn = drawRectangle(0, 660, 0, "rgba(19, 79, 92, 0.55)", "", 40, 40, inGameStatic)
    var awayBtn = drawRectangle(860, 660, 0, "rgba(19, 79, 92, 0.55)", "", 40, 40, inGameStatic)

    var arrow = drawText("X", 875, 10, "gray", "Arial Black", 35, "center", "middle", "black", 0, inGameStatic)

    //time
    var plusMinusGroup = new Konva.Group()
    for (var i = 0; i < 5; i++){
        drawRectangle(410 + (i * 18), 664, 0.5, "#185f6f", "#124551", 10, 30, plusMinusGroup, 5)
    }
    inGameStatic.add(plusMinusGroup)
    var minus = drawText("-", 390, 681, "#185f6f", "Arial Black", 34, "right", "center", "", "", inGameStatic)
    var plus = drawText("+", 510, 683, "#185f6f", "Arial Black", 34, "left", "center", "", "", inGameStatic)

    addHover(arrow, ``)
    addHover(homeBtn, ``)
    addHover(awayBtn, ``)
    addHover(minus, ``)
    addHover(plus, ``)
    plusMinusGroup.children.forEach((e, n)=>e.opacity(n >= setInGameTime ? 0.5 : 1))

    if (!isGameFinished) resumeMatch({}, setInGameTime);
    minus.on('click', function() {
        if (setInGameTime == 1) return
        setInGameTime--
        plusMinusGroup.children.forEach((e, n)=>e.opacity(n >= setInGameTime ? 0.5 : 1))
        if (!isGameFinished) resumeMatch({}, setInGameTime);
    })

    plus.on('click', function() {
        if (setInGameTime == 5) return
        setInGameTime++
        plusMinusGroup.children.forEach((e, n)=>e.opacity(n >= setInGameTime ? 0.5 : 1))
        if (!isGameFinished) resumeMatch({}, setInGameTime);
    })

    arrow.on('click', function() {
        if (inGameLineup1.visible() == true) {
            inGameLineup1.visible(false);
            if (side != 1) return;
            inGameChanges.startingXI = tempGameObj.startingXI[side-1]
            inGameChanges.bench = tempGameObj.bench[side-1]
            var finalTactics = refreshTactics(tempGameObj.formation[side-1])
            inGameChanges.tactics = finalTactics
            if (!isGameFinished) resumeMatch(inGameChanges, setInGameTime);
        }
        else if (inGameLineup2.visible() == true) {
            inGameLineup2.visible(false);
            if (side != 2) return;
            inGameChanges.startingXI = tempGameObj.startingXI[side-1]
            inGameChanges.bench = tempGameObj.bench[side-1]
            var finalTactics = refreshTactics(tempGameObj.formation[side-1])
            inGameChanges.tactics = finalTactics
            if (!isGameFinished) resumeMatch(inGameChanges, setInGameTime);
        }
        else if (isGameFinished) {
            shapeTactics = {tempWidth: 0, tempDepth: 0, tempLine: 0}
            defensiveTactics = {tempPressure: null, tempMarking: null, tempWasting: null, tempOffside: null}
            offensiveTactics = {tempOffensive: null, tempTransition: null, tempCorner: null, tempFullBack: null}
            capturedArrays.forEach(e=>e.visible(true))
            capturedArrays = []
            gameLayer.children.forEach(e=>e.destroyChildren())
        }
    });

    homeBtn.on('click', function() {
        inGameLineup1.visible(true)
        if (!isGameFinished && side == 1) pauseMatch();
    });
    awayBtn.on('click', function() {
        inGameLineup2.visible(true)
        if (!isGameFinished && side == 2) pauseMatch();
    });
}

function createMyLineup(gameObj, n, isMyTeam){
    tempGameObj = gameObj
    var lineup = gameObj.matchRatings[n]
    var formation = gameObj.formation[n]
    var startingXI = gameObj.startingXI[n]
    var bench = gameObj.bench[n]
    var subIn = gameObj.subIn[n]
    var subOut = gameObj.subOut[n]
    var goals = gameObj.scorers[n]
    var asssists = gameObj.assists[n]
    var inGameLineup = [inGameLineup1, inGameLineup2][n]
    inGameLineup.destroyChildren();
    var squadInGame = new Konva.Group();
    inGameLineup.add(squadInGame)
    //add container 
    gradientRectangle(0, 70, 900, 630, "#6f816c", "", 0, "#484848", squadInGame)
    drawRectangle(0, 70, 0, "rgba(0, 0, 0, 0.5)", "black", 900, 630, squadInGame)
    drawRectangle(604, 99, 2, "purple", "black", 282, 30, squadInGame)
    drawText("Bench", 745, 116, "beige", "Verdana", 20, "center", "center", "black", 0.7, squadInGame)
    addImageToCanvas("pitch.png", 100, 70, 489, 630, squadInGame, 0.6, 15)
    //formation
    if (isMyTeam) {
        var form = addImageToCanvas("formationPreview.png", 510, 605, 50, 70, squadInGame, 0.5)
        addHover(form, "")
        form.on('click', function() {
            showInGameFormation(gameObj, n, inGameLineup);
        });
    }

    //add starting players
    var subbedInPlayers = subIn.map(e=>e[0])
    var positions = allFormations[formation]
    var potentialGroups = []
    let originalPositions = [];
    var playerGroups = []
    isEditing = false
    for (var i = 0; i < positions.length; i++) {
        var player = isMyTeam ? findSquadPlayer(startingXI[i], true) :findPlayer(startingXI[i])
        if (!player) player = findPlayer(startingXI[i])
        var position = positions[i];
        var playerId = player.id
        var rating = lineup.find(e=>e[0] == playerId) || [playerId, "6.0"]
        var squareColor = rating[1] ? ratingToColor(rating[1]) : "#999999"
        var track = 0
        var isSubIn = false

        var group = new Konva.Group();
        var rec = drawRectangle(position[0] + 79, position[1] + 50, 3, squareColor, "black", 50, 30, group, 10)
        drawText(rating[1] ? rating[1] : "N/A", 104 + position[0], position[1] + 67, "black", "Arial Black", 20, "center", "center", squareColor, 0.7, group)
        drawText(findFirstName(player.name), 106 + position[0], 91.5 + position[1], "rgba(0, 0, 0, 0.7)", "Impact", 18, "center", "middle", "black", 0, group)
        drawText(findFirstName(player.name), 104.5 + position[0], 90 + position[1], "yellow", "Impact", 18, "center", "middle", "black", 1.2, group)
        
        if (subbedInPlayers.includes(player.id)) {
            isSubIn = true
            drawText(`${subIn.filter(e=>e[0] == player.id)[0][1]}'`, position[0] + 79, position[1] + 28, "beige", "Arial Black", 13, "center", "", "black", 0.8, group)
            addImageToCanvas("subIn.png", position[0] + 69, position[1] + 40, 20, 20, group)
        }
        goals.filter(e=>e == player.id).forEach(e=>{
            addImageToCanvas("soccerGoal.png", position[0] + 119 + (track * 10), position[1] + 40, 20, 20, group)
            track++
        })
        asssists.filter(e=>e == player.id).forEach(e=>{
            addImageToCanvas("assistKick.png", position[0] + 119 + (track * 10), position[1] + 40, 20, 20, group)
            track++
        })
        squadInGame.add(group)
        playerGroups.push(group)
        if (isMyTeam) addHover(group, `select_player_${player.c}`)
        else addHover(group, `select_player_${playerId}`)
        if (!isMyTeam) continue;
        if (player.primaryPositions[0] == "GK") continue;
        potentialGroups.push(group)
        originalPositions.push({group: group, playerId: player.id, x: rec.x(), x1: (rec.x() + rec.width()), y: rec.y(), y1: (rec.y() + rec.height())})
        group.playerId = player.id

    }

    //side pannel
    var logos = ["formation.png", "tactics.png", "defence.png", "item1.png"]
    var list = []
    for (let gg = 0; gg < 4; gg++){
        let btnGroup = new Konva.Group()
        var rec = drawRectangle(1, 69.9 + (gg * 157.5), 2, "rgba(31, 89, 101, 1)", "black", 98, 157.5, btnGroup)
        addImageToCanvas(logos[gg], 12.5, 112.4 + (gg * 157.5), 75, 75, btnGroup, 0.75)
        squadInGame.add(btnGroup)
        if (gg != 0) btnGroup.opacity(0.5)
        addHover(btnGroup, "")
        list.push(btnGroup)

        btnGroup.on('click', function() {
            if (!isMyTeam) return;
            list.filter(e=>e.opacity() == 1 && e != btnGroup).forEach(e=>e.opacity(0.5))
            btnGroup.opacity(1)
            var tempGroup = new Konva.Group()
            tempGroup.temp = true
            inGameLineup.children.filter(e=>e.temp).forEach(e=>e.destroy())
            inGameLineup.add(tempGroup)
            if (gg == 0) createMyLineup(gameObj, n, tempGroup)
            if (gg == 1) shapeTactic(playerGroups, tempGroup)
            if (gg == 2) defenceTactic(0, tempGroup)
            if (gg == 3) attackTactic(0, tempGroup)
        });
    }

    var subbedOutPlayers = subOut.map(e=>e[0])        
    //add lists of bench
    var playerNameY = 130
    var playerNameWidth = 280
    var playerNameHeight = 35
    var playerNameMargin = 2;
    var losers = subbedOutPlayers.concat(bench)

    var subbedIn = 0;
    for (var i = 0; i < losers.length; i++) {
        var newPlayer = isMyTeam ? findSquadPlayer(losers[i], true) :findPlayer(losers[i])
        if (!newPlayer) newPlayer = findPlayer(startingXI[i])
        var playerName = newPlayer.name;
        var playerId = newPlayer.id;
        var playerPotInc = newPlayer.potInc
        var playerC = newPlayer.c
        var rating = lineup.find(e=>e[0] == playerId) || [playerId, "6.0"]
        var squareColor = rating[1] ? ratingToColor(rating[1]) : "#999999";
        var track = 0
        var isSubOut = false
        
        if (rating[1]) subbedIn += 1
        var group = new Konva.Group();
        var rec = drawRectangle(605, playerNameY, 4, "#85c2fa", "black", playerNameWidth, playerNameHeight, group);
        drawRectangle(615, playerNameY + 5, 0, squareColor, "black", 30, playerNameHeight - 10, group)
        drawText(rating[1] ? rating[1] : "N/A", 630, playerNameY + 11, "black", "Arial Black", 16, "center", "middle", squareColor, 0.7, group)
        var txt = drawText(playerName, 653, playerNameY + 11, "black", "Rockwell", 15, "left", "middle", "black", 0, group)

        if (subbedOutPlayers.includes(playerId)) {
            isSubOut = true;
            drawText(`${subOut.filter(e=>e[0] == playerId)[0][1]}'`, 870, playerNameY + 3, "black", "Trebuchet MS", 11, "center", "", "black", 0.3, group)
            addImageToCanvas("subOut.png", 860, playerNameY + 12, 20, 20, group)
        }
        goals.filter(e=>e == playerId).forEach(e=>{
            addImageToCanvas("soccerGoal.png", (txt.x() + txt.width()) + 5 + (track * 10), playerNameY + 7, 20, 20, group)
            track++
        })
        asssists.filter(e=>e == playerId).forEach(e=>{
            addImageToCanvas("assistKick.png", (txt.x() + txt.width()) + 5 + (track * 10), playerNameY + 7, 20, 20, group)
            track++
        })
        squadInGame.add(group)
        if (isMyTeam) addHover(group, `select_player_${playerC}`)
        else addHover(group, `select_player_${playerId}`)
        playerNameY += playerNameHeight + playerNameMargin;
        if (!isMyTeam) continue;
        if (subbedOutPlayers.length >= 5) continue
        if (isSubOut) continue;
        if (newPlayer.primaryPositions[0] == "GK") continue;

        potentialGroups.push(group)
        originalPositions.push({group: group, playerId: playerId, x: rec.x(), x1: (rec.x() + rec.width()), y: rec.y(), y1: (rec.y() + rec.height())})
        group.playerId = playerId
        
    }

    blurRectangle(100, 70, 35, 630, "rgba(0, 0, 0, 0.55)", "black", 0, "rgba(0, 0, 0, 0.0)", true, squadInGame, 15)
    blurRectangle(867, 70, 35, 630, "rgba(0, 0, 0, 0.0)", "black", 0, "rgba(0, 0, 0, 0.55)", false, squadInGame, 15)

    //drag players
    if (!isMyTeam) return;
    if (isGameFinished) return;
    if (subbedIn >= 5) return;
    if (isEditing) return
    var select;
    var selectedGroup;
    var dragImage;

    inGameLineup.on('mousedown', (event) => {
        var group = event.target?.parent
        if (!potentialGroups.includes(group)) return;
        selectedGroup = group
        var arr = inGameLineup.children
        var index = arr.indexOf(group)
        if (index !== -1) {
            arr.splice(index, 1); 
            arr.push(group); 
        }
        dragImage = addImageToCanvas(`https://img.fminside.net/facesfm24/${group.playerId}.png`, event.evt.clientX, event.evt.clientY, 70, 80, inGameLineup, 0.8)
    });

    inGameLineup.on('mousemove', (event) => {
        if (!selectedGroup) return;
        var pos = stage.getPointerPosition();
        var width = 50
        var height = 30
        var x = pos.x
        var y = pos.y
        dragImage.x(x + 10);
        dragImage.y(y + 10);
        
        var pos = originalPositions.find((e, n)=>{
            return (
                x >= e.x && x <= (e.x1 + width/5) && 
                y >= e.y && y <= (e.y1 + height/5)
            )
        })
        if (pos && pos.playerId != selectedGroup.playerId){
            if (select?.group) select.group.children[0].stroke("black")
            select = pos
            pos.group.children[0].stroke("white")
        }else{
            if (select?.group) select.group.children[0].stroke("black")
            select = null;
        }
    });

    inGameLineup.on('mouseup', (event) => {
        if (select){
            var starting1 = true
            var starting2 = true
            var i1 = startingXI.findIndex(e=>e == selectedGroup.playerId)
            if (i1 < 0) i1 = bench.findIndex(e=>e== selectedGroup.playerId), starting1 = false
            var i2 = startingXI.findIndex(e=>e == select.playerId)
            if (i2 < 0) i2 = bench.findIndex(e=>e == select.playerId), starting2 = false
            var p1 = startingXI.find(e=>e == selectedGroup.playerId) || bench.find(e=>e == selectedGroup.playerId)
            var p2 = startingXI.find(e=>e == select.playerId) || bench.find(e=>e == select.playerId);
            starting1 ? gameObj.startingXI[n][i1] = p2 : bench[i1] = p2;
            starting2 ? gameObj.startingXI[n][i2] = p1 : bench[i2] = p1;
            createMyLineup(gameObj, n, isMyTeam)
        }
        if (dragImage) dragImage.destroy();
        dragImage = null
        select = null;
        selectedGroup = null;
    });
      //});

}

function showInGameFormation(gameObj, n, inGameLineup) {
    inGameFormation.destroyChildren();
    var exitFormation = drawRectangle(0, 0, 0, "rgba(0, 0, 0, 0.7)", "black", stage.width(), stage.height(), inGameFormation)
    exitFormation.on('click', function() {
        inGameFormation.destroyChildren();
    });
    drawTrapezoid(360, 40, 175, 50, "#484848", "#25FB00", 2, inGameFormation)
    drawText("Formation", 376.5, 51.5, "rgba(0, 0, 0, 0.7)", "Optima", 32, "left", "middle", "black", 0.3, inGameFormation);
    drawText("Formation", 378, 50, "#25FB00", "Optima", 32, "left", "middle", "black", 0, inGameFormation);
    coolRectangle(10, 90, 880, 525, "#6f816c", "#25FB00", 2, "#484848", inGameFormation)
    var count = 0
    var yGap = 0

    var formations = Object.keys(allFormations)
    for (let c = 0; c < formations.length; c++) {
        var formation = formations[c]
        var group = new Konva.Group();
        var el1 = drawRectangle((count * 175) + 18, 100 + (yGap * 259), 4, "purple", "black", 165, 30)
        var el2 = drawPitch((count * 175) + 18, 100 + (yGap * 259) + 30, 165, 219, "#999999", "black", 4) //formation
        var el3 = drawText(formation.toString(), 18 + (count * 175) + 85, 100 + (yGap * 259) + 8, "beige", "monaco", 18, "center", "middle", null, null) //label
        var arr = allFormations[formation]
        var circles = []
        for (var i = 0; i < arr.length; i++){
            circles.push(drawCircle(18 + (count * 175) + (arr[i][0]/2.8) - 5, 100 + (yGap * 259) + (arr[i][1]/2.7) + 23, 4, "red", "black"))
        }
        count++
        if (count == 5) count = 0, yGap += 1
        group.add(el1, el2, el3, ...circles)
        inGameFormation.add(group)
        addHover(group, "")
        group.on('click', function() {
            gameObj.formation[n] = formations[c]
            createMyLineup(gameObj, n, true)
        });
    }
    inGameLineup.add(inGameFormation)
}

function shapeTactic(players, group){
    group.destroyChildren();
    isEditing = true
    var w = shapeTactics.tempWidth + widthTactic
    var d = (100 - (depthTactic + shapeTactics.tempDepth))
    var l = (100 - (lineTactic + shapeTactics.tempLine))
    //sliders
    drawRectangle(162.5, 82, 4, "gray", "black", 370, 16, group)
    drawRectangle(102.5, 210, 4, "gray", "black", 16, 370, group)
    drawRectangle(575, 210, 4, "gray", "black", 16, 370, group)
    var bar1 = drawRectangle(164.5, 84, 0, "purple", "black", (w * 3.5), 12, group)
    var bar2 = drawRectangle(104.5, 578, 0, "purple", "black", 12, -350 + (l * 3.5), group)
    var bar3 = drawRectangle(577, 578, 0, "purple", "black", 12, -350 + (d * 3.5), group)
    var slider1 = drawSlider(162.5 + (w * 3.5), 80, 20, 20, "gray", 10, 162.5, 532.5, false, group)
    var slider2 = drawSlider(100.5, 210 + (l * 3.5), 20, 20, "gray", 10, 210, 580, true, group)
    var slider3 = drawSlider(573, 210 + (d * 3.5), 20, 20, "gray", 10, 210, 580, true, group)
    var arr = [{slider: slider1, bar: bar1, p: 162.5, max: 512.5, type: "width"}, {slider: slider2, bar: bar2, p: 560, max: 210, type: "line"}, {slider: slider3, bar: bar3, p: 560, max: 210, type: "depth"}]
    //add positions and players

    adjustPlayers(players, d, w, l)
    arr.forEach(s=>{
        s.slider.on('dragmove', function(e) {
            if (s.type == "width"){
                var a = s.p
                var b = s.max
                var z = s.slider.x()
                var coreValue = (z - a)
                s.bar.width(coreValue)
                shapeTactics.tempWidth = ((z - a) - (widthTactic * 3.5))/3.5
                adjustPlayers(players)
            }
            if (s.type == "line"){
                var a = s.p
                var b = s.max
                var z = s.slider.y()
                var coreValue = (z - a) 
                s.bar.height(coreValue)
                shapeTactics.tempLine = ((a - z) - (lineTactic * 3.5))/3.5
                adjustPlayers(players)
            }
            if (s.type == "depth"){
                var a = s.p
                var b = s.max
                var z = s.slider.y()
                var coreValue = (z - a) 
                s.bar.height(coreValue)
                shapeTactics.tempDepth = ((a - z) - (depthTactic * 3.5))/3.5
                //var pc = ((z - a) / (b - a)) * 100
                adjustPlayers(players)
            }
        });
    })

}


function adjustPlayers(players){
    var w = shapeTactics.tempWidth + widthTactic
    var d = (100 - (depthTactic + shapeTactics.tempDepth))
    var l = (100 - (lineTactic + shapeTactics.tempLine))
    players.forEach(e=>{
        e.children[0].fill("red")
        e.children.forEach((e,n)=>{
            if (n != 0) e.visible(false)
        })
    })
    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        var myX = player.children[0].x()
        var myY = player.children[0].y()
        var x = (w - 100) * (myX - 319) / 200
        var y = (((d + 50) * ((550-myY)/125))/2) + ((l * 0.45) * 1.5)
        if (i == 10) y = 50
        
        player.x(x)
        player.y(y - 50)
    }
}


function defenceTactic(point, group){
    group.destroyChildren();

    var tactics = [["Drop Back", "Balanced Pressure", "Constant Pressure"], ["Zonal Marking", "Man Marking"], ["Yes", "No"], ["Yes", "No"]]
    gradientRectangle(100, 70, 789, 630, "#4d296f", "black", 0, "#114652", group, 15)
    drawRectangle(100, 70, 1, "#062f39", "black", 789, 257.5, group, 15)
    addImageToCanvas("font-view.png", 260, 97, 489, 230, group) 
    blurRectangle(100, 70, 35, 630, "rgba(0, 0, 0, 0.55)", "black", 0, "rgba(0, 0, 0, 0.0)", true, group, 15)
    blurRectangle(854, 70, 35, 630, "rgba(0, 0, 0, 0.0)", "black", 0, "rgba(0, 0, 0, 0.55)", false, group, 15)
    drawText("Team Pressing", 375, 350, "beige", "Optima", 30, "right", "middle", "black", 0, group);
    drawText("Team Marking", 375, 450, "beige", "Optima", 30, "right", "middle", "black", 0, group);
    drawText("Time Wasting", 375, 550, "beige", "Optima", 30, "right", "middle", "black", 0, group);
    drawText("Offside Trap", 375, 650, "beige", "Optima", 30, "right", "middle", "black", 0, group);

    drawText(defensiveTactics.tempPressure, 705, 350, "gold", "Arial Black", 27, "center", "middle", "black", 1.5, group);
    var left1 = drawText("<", 545, 350, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, group)
    var right1 = drawText(">", 860, 350, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, group)
    //
    drawLine(325, 410, 350, "#062f39", group)
    drawText(defensiveTactics.tempMarking, 705, 450, "gold", "Arial Black", 30, "center", "middle", "black", 1.5, group);
    var left2 = drawText("<", 545, 450, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, group)
    var right2 = drawText(">", 860, 450, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, group)
    //
    drawLine(325, 510, 350, "#062f39", group)
    drawText(defensiveTactics.tempWasting, 705, 550, "gold", "Arial Black", 30, "center", "middle", "black", 1.5, group);
    var left3 = drawText("<", 545, 550, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, group)
    var right3 = drawText(">", 860, 550, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, group)
    //
    drawLine(325, 610, 350, "#062f39", group)
    drawText(defensiveTactics.tempOffside, 705, 650, "gold", "Arial Black", 30, "center", "middle", "black", 1.5, group);
    var left4 = drawText("<", 545, 650, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, group)
    var right4 = drawText(">", 860, 650, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, group)

    var arrows = [[left1, right1, defensiveTactics.tempPressure], [left2, right2, defensiveTactics.tempMarking], [left3, right3, defensiveTactics.tempWasting], [left4, right4, defensiveTactics.tempOffside]]
    arrows.forEach((a, n)=>{
        addHover(a[0], "")
        addHover(a[1], "")
        a[0].on('click', function() {
            var arr = tactics[n]
            var index = arr.indexOf(a[2])
            index -= 1
            if (index < 0) index = arr.length - 1
            if (index >= arr.length) index = 0
            defensiveTactics[Object.keys(defensiveTactics)[n]] = tactics[n][index]
            defenceTactic(n, group)
        })
        a[1].on('click', function() {
            var arr = tactics[n]
            var index = arr.indexOf(a[2])
            index += 1
            if (index < 0) index = arr.length - 1
            if (index >= arr.length) index = 0
            defensiveTactics[Object.keys(defensiveTactics)[n]] = tactics[n][index]
            defenceTactic(n, group)
        })
    })
    var main = allFormations["442"]
    var opposition = allFormations["433"]
    //
    if (point == 0) createPressAnimation(group, main, opposition, defensiveTactics.tempPressure);
    if (point == 1) createZonalAnimation(group, main, opposition, defensiveTactics.tempMarking);
    if (point == 2) createTimeAnimation(group, main, opposition, defensiveTactics.tempWasting);
    if (point == 3) createOffsideAnimation(group, main, opposition, defensiveTactics.tempOffside);

}


function attackTactic(point, group){
    group.destroyChildren();

    var tactics = [["Long Ball", "Possession", "Direct Passing", 'Wing Play'], ["Slow", "Medium", "Fast"], [5, 6, 7, 8, 9, 10], ["Defensive Full-Back", "Full-Back", "Inverted Wing-Back", "Wing-Back"]]
    gradientRectangle(100, 70, 789, 630, "#4d296f", "black", 0, "#114652", group, 15)
    drawRectangle(100, 70, 1, "#062f39", "black", 789, 257.5, group, 15)
    addImageToCanvas("font-view.png", 260, 97, 489, 230, group) 
    blurRectangle(100, 70, 35, 630, "rgba(0, 0, 0, 0.55)", "black", 0, "rgba(0, 0, 0, 0.0)", true, group, 15)
    blurRectangle(854, 70, 35, 630, "rgba(0, 0, 0, 0.0)", "black", 0, "rgba(0, 0, 0, 0.55)", false, group, 15)
    drawText("Offensive Style", 375, 350, "beige", "Optima", 30, "right", "middle", "black", 0, group);
    drawText("Transition Speed", 375, 450, "beige", "Optima", 30, "right", "middle", "black", 0, group);
    drawText("Corners N°", 375, 550, "beige", "Optima", 30, "right", "middle", "black", 0, group);
    drawText("Full Backs", 375, 650, "beige", "Optima", 30, "right", "middle", "black", 0, group);

    drawText(offensiveTactics.tempOffensive, 705, 350, "gold", "Arial Black", 28, "center", "middle", "black", 1.5, group);
    var left1 = drawText("<", 545, 350, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, group)
    var right1 = drawText(">", 860, 350, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, group)
    //
    drawLine(325, 410, 350, "#062f39", group)
    drawText(offensiveTactics.tempTransition, 705, 450, "gold", "Arial Black", 30, "center", "middle", "black", 1.5, group);
    var left2 = drawText("<", 545, 450, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, group)
    var right2 = drawText(">", 860, 450, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, group)
    //
    drawLine(325, 510, 350, "#062f39", group)
    drawText(offensiveTactics.tempCorner, 705, 550, "gold", "Arial Black", 30, "center", "middle", "black", 1.5, group);
    var left3 = drawText("<", 545, 550, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, group)
    var right3 = drawText(">", 860, 550, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, group)
    //
    drawLine(325, 610, 350, "#062f39", group)
    drawText(offensiveTactics.tempFullBack.split(" ")[0], 705, 650, "gold", "Arial Black", 28, "center", "middle", "black", 1.5, group);
    var left4 = drawText("<", 545, 650, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, group)
    var right4 = drawText(">", 860, 650, "#bf9000", "Arial Black", 30, "center", "middle", "black", 0, group)

    var arrows = [[left1, right1, offensiveTactics.tempOffensive], [left2, right2, offensiveTactics.tempTransition], [left3, right3, offensiveTactics.tempCorner], [left4, right4, offensiveTactics.tempFullBack]]
    arrows.forEach((a, n)=>{
        addHover(a[0], "")
        addHover(a[1], "")
        a[0].on('click', function() {
            var arr = tactics[n]
            var index = arr.indexOf(a[2])
            index -= 1
            if (index < 0) index = arr.length - 1
            if (index >= arr.length) index = 0
            offensiveTactics[Object.keys(offensiveTactics)[n]] = tactics[n][index]
            attackTactic(n, group)
        })
        a[1].on('click', function() {
            var arr = tactics[n]
            var index = arr.indexOf(a[2])
            index += 1
            if (index < 0) index = arr.length - 1
            if (index >= arr.length) index = 0
            offensiveTactics[Object.keys(offensiveTactics)[n]] = tactics[n][index]
            attackTactic(n, group)
        })
    })
    var main = allFormations["442"]
    var opposition = allFormations["433"]
    //
    if (point == 0 && offensiveTactics.tempOffensive == "Wing Play") createWingPlayAnimation(group, main, opposition);
    if (point == 0 && offensiveTactics.tempOffensive == "Long Ball") createLongBallAnimation(group, main, opposition);
    if (point == 0 && offensiveTactics.tempOffensive == "Possession") createPossessionAnimation(group, main, opposition)
    if (point == 0 && offensiveTactics.tempOffensive == "Direct Passing") createDirectAnimation(group, main, opposition)
    if (point == 1) createTransitionAnimation(group, main, opposition, offensiveTactics.tempTransition);
    if (point == 2) createCornerAnimation(group, main, opposition, parseInt(offensiveTactics.tempCorner));
    if (point == 3) createFullbackAnimation(group, main, opposition, offensiveTactics.tempFullBack);

}


function refreshTactics(formation){
    shapeTactics, defensiveTactics, offensiveTactics
    if (!defensiveTactics.tempPressure) defensiveTactics.tempPressure = pressureTactic;
    if (!defensiveTactics.tempMarking) defensiveTactics.tempMarking = markingTactic;
    if (!defensiveTactics.tempWasting) defensiveTactics.tempWasting = timeWasting ? "Yes" : "No";
    if (!defensiveTactics.tempOffside) defensiveTactics.tempOffside = offsideTrap ? "Yes" : "No";
    if (!offensiveTactics.tempOffensive) offensiveTactics.tempOffensive = offensiveTactic;
    if (!offensiveTactics.tempTransition) offensiveTactics.tempTransition = transitionTactic;
    if (!offensiveTactics.tempCorner) offensiveTactics.tempCorner = cornerTactic;
    if (!offensiveTactics.tempFullBack) offensiveTactics.tempFullBack = fullbackTactic;
    
    var finalTactics = {
      "formation": formation,
      "height": Math.floor(shapeTactics.tempLine + lineTactic),
      "length": Math.floor(shapeTactics.tempDepth + depthTactic),
      "width": Math.floor(shapeTactics.tempWidth + widthTactic),
      "pressing": defensiveTactics.tempPressure,
      "marking": defensiveTactics.tempMarking,
      "timeWasting": defensiveTactics.tempWasting == "Yes" ? true : false,
      "offsideTrap": defensiveTactics.tempOffside == "Yes" ? true : false,
      "offensiveStyle": offensiveTactics.tempOffensive,
      "transition": offensiveTactics.tempTransition,
      "corners": parseInt(offensiveTactics.tempCorner),
      "fullbacks": offensiveTactics.tempFullBack
    }

    return finalTactics
}


window.addEventListener("beforeunload", function (event) {
  if (scoreLineGroup.visible() == true) {
    resumeMatch({}, 0);
  }
});