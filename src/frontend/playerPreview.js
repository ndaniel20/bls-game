
function playerPreview(id){
    htmlElements.style.display = "none"
    var player = findSquadPlayer(id) ? findSquadPlayer(id) : findPlayer(id)
    if (!player) return;
    var pot = player.potInc
    var crypto = player.c
    playerGroup.playerID = player.id
    playerGroup.perc = pot
    playerGroup.c = crypto
    calculatePrice(player)
    console.log(player)
    var decimal = removeWhole(pot)
    console.log(Object.values(player.stats).map(e=>parseInt(e)).reduce((a, b) => a + b))

    coolRectangle(1, 1, 898, 698, "#4d296f", "#25FB00", 2, "#484848", playerGroup)     
    var arrow = drawText("X", 875, 10, "gray", "Arial Black", 35, "center", "middle", "black", 0, playerGroup)
    addHover(arrow, `back_to_squad`)
    var stats = player["stats"]
    var primaryPositions = player.primaryPositions
    var secondaryPositions = player.secondaryPositions 
    for (var i = 0; i < parseInt(player.rating)/2; i++) {
        var opacity = 0.3;
        var size = getRandomNumber(3, 10);
        var star = createStar(opacity, size, 900, 700);
        if (star.y() > 200 || star.x() < 800) playerGroup.add(star);
    }
    //player card
    drawRectangle(40, 38, 0, "rgba(0, 0, 0, 0.3)", "#8777b7", 270, 330, playerGroup, 10);
    var card = drawCard(30, 30, 270, 330, "#5032a8", "#8777b7", player, playerGroup)
    //pannel
    drawRectangle(375, 38, 0, "rgba(0, 0, 0, 0.3)", "#8777b7", 470, 330, playerGroup);
    drawRectangle(365, 30, 0, "#130342", "black", 470, 330, playerGroup)
    gradientRectangle(2, 354, 896, 30, "rgba(44, 8, 120, 0.55)", "black", 0, "rgba(0, 0, 0, 0.0)", playerGroup)
    drawTrapezoid(479, 100, 240, 200, "", "gray", 2, playerGroup)
    drawTrapezoid(561, 275, 75, 25, "", "gray", 2, playerGroup, 6)
    drawTrapezoid(523, 250, 150, 50, "", "gray", 2, playerGroup, 4)
    drawSemiCircle(598, 250, 25, 15, "", "gray", 2, playerGroup, 180)
    drawSemiCircle(598, 100, 35, 25, "", "gray", 2, playerGroup, 0)
    var fX = 448
    var fY = 260
    var gap = 150
    var c = 0
    var next = parseInt(player.rating) + 1
    var color = "rgba(161, 161, 161, 0.5)"
    var positions = ["LB", "CB", "RB", "LWB", "DM", "RWB", "LM", "CM", "RM", "LW", "AM", "RW"]
    var foot = player.foot
    primaryPositions.includes("GK") ? color = "green" : secondaryPositions.includes("GK") ? color = "orange" : color = "rgba(161, 161, 161, 0.5)"
    drawCircle(598, 290, 7, color, "", 0, playerGroup)
    for (var i = 0; i < 12; i++){
        primaryPositions.includes(positions[i]) ? color = "green" : secondaryPositions.includes(positions[i]) ? color = "orange" : color = "rgba(161, 161, 161, 0.5)"
        drawCircle(fX + (c * gap), fY, 7, color, "", 0, playerGroup)
        // ** ADMIN **
        if (isAdmin && !crypto){
            var hover = 2
            color == "green" ? hover = 0 : color == "orange" ? hover = 2 : hover = 1
            addHover(drawCircle(fX + (c * gap), fY, 7, color, "", 0, playerGroup), `config_${positions[i]}_${hover}`)
        }
        c++
        if (c == 3){
            c = 0
            fX += 15
            gap -= 15
            fY -= 35
        }
    }
    primaryPositions.includes("ST") ? color = "green" : secondaryPositions.includes("ST") ? color = "orange" : color = "rgba(161, 161, 161, 0.5)" 
    drawCircle(598, 120, 7, color, "", 0, playerGroup)
    // ** ADMIN **
    if (isAdmin && !crypto){
        var hover = 2
        color == "green" ? hover = 0 : color == "orange" ? hover = 2 : hover = 1
        addHover(drawCircle(598, 120, 7, color, "", 0, playerGroup), `config_ST_${hover}`)
    }
    drawText(player.rating, 448, 320, "beige", "monospace", 30, "center", "middle", "black", 0, playerGroup)
    drawRectangle(488, 330, 0, "#25fb00", "black", (decimal * 220), 10, playerGroup)
    drawRectangle(488, 330, 1, "rgba(143, 141, 137, 0.5)", "black", 220, 10, playerGroup)
    if (next <= player.potential) drawText(next, 748, 320, "beige", "monospace", 30, "center", "middle", "black", 0, playerGroup)
    drawCircle(400, 60, 20, foot == "Left" || foot == "Both" ? "#93c47d" : "rgba(224, 102, 102, 0.35)", "black", "2", playerGroup)
    addImageToCanvas("leftShoe.png", 385, 45, 30, 30, playerGroup, 0.85)
    drawText(findPositionType(player.primaryPositions[0]), 600, 50, "beige", "Trebuchet MS", 28, "center", "middle", "black", 0, playerGroup)
    drawCircle(800, 60, 20, foot == "Right" || foot == "Both" ? "#93c47d" : "rgba(224, 102, 102, 0.35)", "black", "2", playerGroup)
    addImageToCanvas("rightShoe.png", 785, 45, 30, 30, playerGroup, 0.85)
    //stats
    var x = 11
    var y = 394
    var c = 0
    var width = 299
    drawRectangle(0, y - 10, 0, "rgba(129, 50, 168, 0.5)", "black", 900, 480, playerGroup)
    for (let name in stats){
        var value = stats[name]
        drawRectangle(x - 10, y+ (c * 35) - 10, 4, "", "rgba(0, 0, 0, 0.05)", width, 35, playerGroup)
        drawText(capitalizeFirstCharacter(name), x, y + (c * 35), "beige", "Verdana", 14, "left", "middle", "black", 0.2, playerGroup)
        drawRectangle(x + 245, y+ (c * 35) - 10, 1, value >= 15 ? "green" : value >= 10 ? "blue" : value >= 5 ? "orange" : "red", "black", 42, 35, playerGroup, 5)
        drawText(value, x + 266, y + (c * 35) - 1, "beige", "Trebuchet MS", 20, "center", "middle", "black", 0.2, playerGroup)
        // ** ADMIN **
        if (isAdmin && !crypto){
            addHover(drawText("-", x + 200, y + (c * 35) - 10, "#ffd966", "Trebuchet MS", 40, "center", "middle", "black", 0.2, playerGroup), `config_${name}_minus`)
            addHover(drawText("+", x + 230, y + (c * 35) - 10, "#ffd966", "Trebuchet MS", 40, "center", "middle", "black", 0.2, playerGroup), `config_${name}_plus`)
        }
        c++
        if (c % 9 == 0){
            c = 0
            x += width
            y = 394
        }
    }        
    // ** ADMIN **
    if (isAdmin && !crypto){
        addHover(drawText("-", 45, 100, "#ffd966", "Trebuchet MS", 55, "center", "middle", "black", 0.2, playerGroup), `config_rating_minus`)
        addHover(drawText("+", 75, 100, "#ffd966", "Trebuchet MS", 55, "center", "middle", "black", 0.2, playerGroup), `config_rating_plus`)
    }
    if (searchLayer.visible()) {
        addHover(addImageToCanvas("shoppingBag.png", 857, 55, 35, 35, playerGroup), `open_buyPage`)
    }
    else if (squadManagementLayer.visible() && crypto) {
        addHover(addImageToCanvas("trashBag.png", 857, 55, 35, 35, playerGroup), `open_sellPage`)
        if (player.rating != player.potential) addHover(addImageToCanvas("upgrade.png", 857, 105, 35, 35, playerGroup), `open_upgradePage`)
    }
}

function openBuyPage(id){
    var player = findPlayer(id)
    var group = new Konva.Group();
    var blackedOut = drawRectangle(0, 0, 0, "rgba(0, 0, 0, 0.7)", "black", stage.width(), stage.height(), group)
    drawRectangle(200, 200, 0, "rgba(0, 0, 0, 0.7)", "black", stage.width() - 390, stage.height() - 390, group, 15)
    var upgradeBanner = drawRectangle(200, 200, 2, "#4d296f", "black", stage.width() - 400, stage.height() - 400, group, 15)
    var x = upgradeBanner.x(), w = upgradeBanner.width(), y = upgradeBanner.y(), h = upgradeBanner.height()
    
    var cost = calculatePrice(player)
    var text1 = drawText(addCommas(babaCoins), (x + w) - 45, y + 15, "black", "Trebuchet MS", 20, "right", "middle", "black", 0.3, group);
    var text2 = drawText(addCommas(babaCoins), (x + w) - 43.5, y + 14.5, "beige", "Trebuchet MS", 20, "right", "middle", "black", 0.3, group);
    var lightning = addImageToCanvas("coins.png", (x + w) - 40, y + 8.5, 28, 28, group);
    drawText("Are you sure you want", (x + (x + w))/2, (y + (y + h))/2 - 90, "beige", "Trebuchet MS", 28, "center", "middle", "black", 0.2, group)
    drawText("to purchase this player?", (x + (x + w))/2, (y + (y + h))/2 - 45, "beige", "Trebuchet MS", 28, "center", "middle", "black", 0.2, group)
    drawText("Cost: " + addCommas(cost), (x + (x + w))/2, (y + (y + h))/2 + 20, "beige", "Courier New", 32, "center", "middle", "black", 0.2, group)

    var submitGroup = new Konva.Group()
    drawRectangle(x + 160, (y + h) - 60, 1, "#330d57", "black", 180, 40, submitGroup, 5)
    drawText("Purchase", ((x + 160) + (x + 160 + 180))/2, (y + h) - 50, "#bd8fe8", "Trebuchet MS", 24, "center", "middle", "black", 0.3, submitGroup)
    addHover(submitGroup, `buy_player`)

    group.add(submitGroup);
    playerGroup.add(group);
    blackedOut.on('click', function() {
        group.destroy()
    });
}

function openSellPage(crypto){
    var player = findSquadPlayer(crypto)
    var group = new Konva.Group();
    var blackedOut = drawRectangle(0, 0, 0, "rgba(0, 0, 0, 0.7)", "black", stage.width(), stage.height(), group)
    drawRectangle(200, 200, 0, "rgba(0, 0, 0, 0.7)", "black", stage.width() - 390, stage.height() - 390, group, 15)
    var upgradeBanner = drawRectangle(200, 200, 2, "#4d296f", "black", stage.width() - 400, stage.height() - 400, group, 15)
    var x = upgradeBanner.x(), w = upgradeBanner.width(), y = upgradeBanner.y(), h = upgradeBanner.height()
    
    var cost = Math.floor(calculatePrice(player)/3)
    var text1 = drawText(addCommas(babaCoins), (x + w) - 45, y + 15, "black", "Trebuchet MS", 20, "right", "middle", "black", 0.3, group);
    var text2 = drawText(addCommas(babaCoins), (x + w) - 43.5, y + 14.5, "beige", "Trebuchet MS", 20, "right", "middle", "black", 0.3, group);
    var lightning = addImageToCanvas("coins.png", (x + w) - 40, y + 8.5, 28, 28, group);
    drawText("Are you sure you want", (x + (x + w))/2, (y + (y + h))/2 - 90, "beige", "Trebuchet MS", 28, "center", "middle", "black", 0.2, group)
    drawText("to sell this player?", (x + (x + w))/2, (y + (y + h))/2 - 45, "beige", "Trebuchet MS", 28, "center", "middle", "black", 0.2, group)
    drawText("Gain: " + addCommas(cost), (x + (x + w))/2, (y + (y + h))/2 + 20, "beige", "Courier New", 32, "center", "middle", "black", 0.2, group)

    var submitGroup = new Konva.Group()
    drawRectangle(x + 160, (y + h) - 60, 1, "#330d57", "black", 180, 40, submitGroup, 5)
    drawText("Sell", ((x + 160) + (x + 160 + 180))/2, (y + h) - 50, "#bd8fe8", "Trebuchet MS", 24, "center", "middle", "black", 0.3, submitGroup)
    addHover(submitGroup, `sell_player`)

    group.add(submitGroup);
    playerGroup.add(group);
    blackedOut.on('click', function() {
        group.destroy()
    });
}

function openUpgradePage(crypto, perc){
    var player = findSquadPlayer(crypto)

    var group = new Konva.Group();
    var blackedOut = drawRectangle(0, 0, 0, "rgba(0, 0, 0, 0.7)", "black", stage.width(), stage.height(), group)
    drawRectangle(150, 150, 0, "rgba(0, 0, 0, 0.7)", "black", stage.width() - 290, stage.height() - 290, group, 15)
    var upgradeBanner = drawRectangle(150, 150, 2, "#4d296f", "black", stage.width() - 300, stage.height() - 300, group, 15)
    var x = upgradeBanner.x(), w = upgradeBanner.width(), y = upgradeBanner.y(), h = upgradeBanner.height()

    var text1 = drawText(addCommas(powerUps), (x + w) - 45, y + 15, "black", "Trebuchet MS", 20, "right", "middle", "black", 0.3, group);
    var text2 = drawText(addCommas(powerUps), (x + w) - 43.5, y + 14.5, "beige", "Trebuchet MS", 20, "right", "middle", "black", 0.3, group);
    var lightning = addImageToCanvas("lightning.png", (x + w) - 40, y + 8.5, 34, 28, group);
    drawText("Use the slider below to adjust how much", (x + (x + w))/2, (y + (y + h))/2 - 110, "beige", "Trebuchet MS", 28, "center", "middle", "black", 0.2, group)
    drawText("energy points you want to use to", (x + (x + w))/2, (y + (y + h))/2 - 65, "beige", "Trebuchet MS", 28, "center", "middle", "black", 0.2, group)
    drawText("upgrade the player", (x + (x + w))/2, (y + (y + h))/2 - 20, "beige", "Trebuchet MS", 28, "center", "middle", "black", 0.2, group)
    
    var submitGroup = new Konva.Group()
    drawRectangle(x + 210, (y + h) - 60, 1, "#330d57", "black", 180, 40, submitGroup, 5)
    drawText("Submit", ((x + 212) + (x + 210 + 180))/2, (y + h) - 50, "#bd8fe8", "Trebuchet MS", 24, "center", "middle", "black", 0.3, submitGroup)
    addHover(submitGroup, `upgrade_player`)

    var next = parseInt(player.rating) + 1
    drawText(player.rating, x + 150, (y + h) - 120, "beige", "monospace", 30, "center", "middle", "black", 0, group)
    drawRectangle(x + 190, (y + h) - 110, 1, "rgba(143, 141, 137, 0.5)", "black", 220, 10, group)
    if (next <= player.potential) drawText(next, x + 450, (y + h) - 120, "beige", "monospace", 30, "center", "middle", "black", 0, group)
    
    var decimal = removeWhole(perc)
    var startingX = 340
    var endingX = 540
    var bar = drawRectangle(x + 190, (y + h) - 110, 1, "#25fb00", "black", (decimal * 200), 10, group)
    var maxCap = Math.max(((1 - decimal) * 100), 0)
    var slider = drawSlider(startingX + (decimal * 200), (y + h) - 115, 20, 20, "red", 15, startingX + (decimal * 200), powerUps >= maxCap ? (endingX + 20) : startingX + (decimal * 200) + (powerUps * 2) + 19, false, group);
    var oldPerc = playerGroup.perc

    slider.on('dragmove', function () {
        var sliderPosition = slider.position();
        var x = sliderPosition.x;
        var pointer = (x - startingX)/(endingX-startingX)
        var point = pointer - decimal
        var fakePoints = Math.floor(powerUps - (point * 100))
      
        bar.width(((pointer) * 200) + 5)
        text1.text(addCommas(Math.max(fakePoints, 0)))
        text2.text(addCommas(Math.max(fakePoints, 0)))
        playerGroup.perc = parseFloat(perc) + point
    });

    group.add(submitGroup);
    playerGroup.add(group);
    blackedOut.on('click', function() {
        playerGroup.perc = oldPerc
        group.destroy()
    });
}

function drawCard(x, y, w, h, color, stroke, player, layer, isNoRating, isNoStars) {
    var group = new Konva.Group();
    drawRectangle(x, y, 4, color, stroke, w, h, group, 10);
  
    var stripeX1 = x + 5; 
    var stripeY1 = y + 5; 
    var stripeX2 = x + w - 5; 
    var stripeY2 = y + h - 5;
  
    for (var i = 0; i < 18; i++) {
      var stripe1 = new Konva.Line({
        points: [stripeX1, stripeY1 + (i * 18), stripeX1 + (i * 15), stripeY1],
        stroke: '#46289c',
        strokeWidth: 2,
      });
      group.add(stripe1);
  
      var stripe2 = new Konva.Line({
        points: [stripeX2 - (i * 15), stripeY2, stripeX2, stripeY2 - (i * 18)],
        stroke: '#46289c',
        strokeWidth: 2,
      });
      group.add(stripe2);
    }
  
    drawRectangle(x, y + 200, 0, "#8777b7", "#8777b7", w, 50, group);
    addImageToCanvas(`https://img.fminside.net/facesfm24/${player.id}.png`, x + 60, y + 20, 150, 180, group);
    addImageToCanvas(player.nationFlag, x + w - 60, y + 20, 50, 30, group);
    addImageToCanvas(player.clubLogoUrl, x + 15, y + 150, 40, 40, group);
    drawText(findFirstName(player.name), x + w / 2, y + 211, "beige", "Marker Felt", 34, "center", "middle", "black", 0.5, group);
    if (isNoRating) drawText(player.primaryPositions[0], x + 35, y + 20, "beige", "Trebuchet MS", 36, "center", "middle", "black", 0, group);
    else drawText(player.rating, x + 35, y + 20, "beige", "Trebuchet MS", 40, "center", "middle", "black", 0, group);
  
    var playerRating = convertRating(player.rating);
    var fullStar = Math.ceil(playerRating);
    var starSize = 30;
  
    if (isNoStars){
        var newGroup = new Konva.Group()
        addImageToCanvas("coins.png", 0, y + 270, 40, 40, newGroup)
        var txt = drawText(`${formatPrice(calculatePrice(player))}`, 45, y + 273, "gold", "Optima", 40, "left", "middle", "black", 0.3, newGroup)
        newGroup.x((x + w / 2) - (40 + txt.width())/2)
        group.add(newGroup)
    } else{
        for (var j = 0; j < 5; j++) {
        var starX = x + 50 + (j * 40);
        var starY = y + 290;
    
        if (playerRating % 1 === 0.5 && j === fullStar - 1) {
            drawStar(starX - 2.5, starY - 0.5, starSize + 2, "black", false, group);
            drawStar(starX, starY, starSize, "yellow", true, group);
        } else if (fullStar > j) {
            drawStar(starX - 2.5, starY - 0.5, starSize + 2, "black", false, group);
            drawStar(starX, starY, starSize, "yellow", false, group);
        } else {
            drawStar(starX, starY - 2, starSize + 2, "black", false, group);
        }
        }
    }

    if (layer) layer.add(group);
    return group;
}

function removeWhole(num){
    return num - Math.floor(num)
}