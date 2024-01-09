function capitalizeFirstCharacter(str) {

    return str.charAt(0).toUpperCase() + str.slice(1);
}

function addCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function convertFromPosToColor(pos){
    if (pos == "FW") return "red"
    if (pos == "MF") return "orange"
    if (pos == "DF") return "blue"
    if (pos == "GK") return "gray"
}

function calculateSquadOverall(){
    var filteredArray = startingPlayers.filter(e=>e).map(p=>findSquadPlayer(p.c)?.rating)
    if (filteredArray.length > 0) var sum = filteredArray.reduce((a, b)=> parseInt(a) + parseInt(b))
    return sum || 0
}

function findPlayer(id){
    var player = database.find(e => e.id === id)
    return player
}

function findSquadPlayer(crypto, isOkay){
    var player = fullSquad.find(e => e.c == crypto)
    if (!player && isOkay) player = playersSquad.find(e => e.id == crypto)
    return player
}

function createBasePrice(){
    var r = 50
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

function formatPrice(value) {
    if (value >= 1000000) {
      const millions = (value / 1000000).toFixed(1);
      return `${millions}m`;
    } else if (value >= 100000) {
        const thousands = (value / 1000).toFixed(0);
        return `${thousands}k`;
    } else if (value >= 1000) {
      const thousands = (value / 1000).toFixed(1);
      return `${thousands}k`;
    } else {
      return `${value}`;
    }
}
  
function calculatePrice(player){
    var inGameStats = Object.values(player.stats).map(e=>parseInt(e)).reduce((a, b) => a + b)
    var price = basePrice[parseInt(player.rating)]
    var pCt = Math.round((Math.min(inGameStats/1000, 0.50) * 100) + 50)
    price = (price * 0.9) + (basePrice[pCt] * 0.1)

    return Math.round(price);
}

function ratingToColor(rating){
    var squareColor = ""
    if (rating < 6) squareColor = "#eb1c23"
    else if (rating < 6.5) squareColor = "#ff7b00"
    else if (rating < 7) squareColor = "#f4bb00"
    else if (rating < 8) squareColor = "#c0cc00"
    else if (rating < 9) squareColor = "#5cb400"
    else if (rating < 10) squareColor = "#009e9e"
    return squareColor
}
function findArea(pos){
    if (["ST", "LW", "RW"].includes(pos)) return "FW"
    if (["LM", "RM", "AM", "CM", "DM"].includes(pos)) return "MF"
    if (["LWB", "RWB", "LB", "RB", "CB"].includes(pos)) return "DF"
    if (pos == "GK") return "GK"
}

function findPositionType(pos){
    if (["ST", "LW", "RW"].includes(pos)) return "Forward"
    if (["LM", "RM", "AM", "CM", "DM"].includes(pos)) return "Midfielder"
    if (["LWB", "RWB", "LB", "RB", "CB"].includes(pos)) return "Defender"
    if (pos == "GK") return "Goalkeeper"
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}
  
function getRandomAngle() {
    return Math.random() * 360;
}
function convertRating(num){
    if (num >= 88) return 5
    if (num >= 82) return 4.5
    if (num >= 78) return 4
    if (num >= 74) return 3.5
    if (num >= 70) return 3
    if (num >= 66) return 2.5
    if (num >= 62) return 2
    if (num >= 58) return 1.5
    if (num >= 54) return 1
    else return 0.5
}

function getPositionOrder(pos){
    var arr = ["ST", "RW", "LW", "RM", "LM", "AM", "CM", "DM", "RWB", "LWB", "RB", "LB", "CB", "GK"]
    return arr.indexOf(pos)
}

function findFirstName(name){
    var split = name.split(" ")
    if (split.length > 1) return split.slice(1).join(" ")
    else return name
}  

function findAbbrevationName(name){
    var split = name.split(" ")
    if (split.length > 1) return split.slice(0).join(" ")[0] + ". " + split.slice(1).join(" ")
    else return name
}  

function drawTriangle(x, y, w, h, color, stroke, width, layer, rotation) {
    var triangle = new Konva.Shape({
        sceneFunc: function(context) {
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(x + w, y);
          context.lineTo(x + (w / 2), y + h); 
          context.closePath();
          context.fillStrokeShape(this);
        },
        fill: color,
        stroke: stroke,
        strokeWidth: width,
        rotation: rotation
    });
    
    if (layer) layer.add(triangle);
    return triangle;
}

function drawLine(x, y, length, color, layer){
    var line = new Konva.Line({
        points: [x, y, x + length, y], // Adjust the line width based on the text width
        stroke: color,
        strokeWidth: 1
    });
    
    if (layer) layer.add(line)
    return line
}
function drawRectangle(x, y, width, color, stroke, w, h, layer, cornerRadius) {
    var square = new Konva.Rect({
        x: x,
        y: y,
        width: w,
        height: h,
        fill: color,
        stroke: stroke,
        strokeWidth: width,
        cornerRadius: cornerRadius
    });
    if (layer) layer.add(square)
    return square;
}

function drawCurvedText(name, x, y, color, font, fontSize, layer) {
    var text = new Konva.TextPath({x: x,y: y,text: name,fontSize: fontSize,fontFamily: font,fill: color});

    if (layer) layer.add(text)
    return text
}  
  
function drawText(name, x, y, color, font, fontSize, align, baseline, strokeColor, strokeWidth, layer) {

    var text = new Konva.Text({
        x: x,
        y: y,
        text: name,
        fontSize: fontSize,
        fontFamily: font,
        fill: color,
        verticalAlign: baseline,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
    });

    if (align === 'center') text.x(x - text.width() / 2);
    if (align === 'right') text.x(x - text.width());
    if (baseline == 'center') text.y(y - text.height()/2);

    if (layer) layer.add(text)
    return text
}  



function addImageToCanvas(url, x, y, w, h, layer, opacity, cornerRadius){
    var img = imageCache[url]
    var layerImage = new Konva.Image({
        x: x,y: y,cornerRadius: cornerRadius,image: img,width: w, height: h, opacity: opacity,
    });
  
    if (layer) layer.add(layerImage);
    return layerImage;
}

async function preloadImages(imageURLs) {
    const promises = imageURLs.map(url => storeImage(url));
    const images = await Promise.all(promises);
    
    imageURLs.forEach((url, index) => {
        if (images[index] !== null) {
          imageCache[url] = images[index];
        }
    });
}

async function storeImage(url) {
    try {
        if (backgrounds.includes(url)) {
            url = `src/images/${url}`;
        }
        const img = await loadImage(url);
        return img;
    } catch (error) {
        return null;
    }
}

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function () {
            resolve(img);
        };
        img.onerror = function () {
            reject(new Error('Failed to load image: ' + url));
        };
        if (url == "https://img.fminside.net/facesfm24/67228634.png") url = "https://img.fminside.net/facesfm22/67228634.png"
        img.src = url;
    });
}

  
function drawStar(x, y, size, color, isHalf, layer) {
    var shape = new Konva.Shape({
        x: x,
        y: y,
        sceneFunc: function (context, shape) {
            context.beginPath();
            context.moveTo(0, -size / 2);
            context.lineTo(size / 4, -size / 4);
            context.lineTo(size / 2, -size / 4);
            context.lineTo(size / 3, 0);
            context.lineTo(size / 2, size / 4);
            context.lineTo(size / 4, size / 4);
        
            if (isHalf) {
                var gradient = context.createLinearGradient(-size / 2, -size / 2, size / 2, size / 2);
                gradient.addColorStop(0, "yellow");
                gradient.addColorStop(1, "black");
                context.fillStyle = gradient;
            } else {
                context.fillStyle = color;
            }
        
            context.lineTo(0, size / 2);
            context.lineTo(-size / 4, size / 4);
            context.lineTo(-size / 2, size / 4);
            context.lineTo(-size / 3, 0);
            context.lineTo(-size / 2, -size / 4);
            context.lineTo(-size / 4, -size / 4);
            context.closePath();
            context.fill();
        },
    });
    if (layer) layer.add(shape)
    return shape;
}

function drawArrow(x, y, w, h, color, layer) {
    var arrow = new Konva.Shape({
        sceneFunc: function(context) {
          context.beginPath();
          context.moveTo(x, y + h);
          context.lineTo(x + w / 2, y);
          context.lineTo(x + w, y + h);
          context.closePath();
          context.fillStrokeShape(this);
        },
        fill: color,
      });

    if (layer) layer.add(arrow)
    return arrow
}

function drawBackArrow(x, y, arrowWidth, arrowHeight, lineLength, color, stroke, strokeWidth, layer) {
    var group = new Konva.Group()
    var arrow = new Konva.Shape({
      sceneFunc: function(context) {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + arrowWidth, y - arrowHeight / 2);
        context.lineTo(x + arrowWidth, y + arrowHeight / 2);
        context.closePath();
        context.fillStrokeShape(this);
      },
      fill: color,
      stroke: stroke,
      strokeWidth: strokeWidth
    });
  
    var line = new Konva.Line({
      points: [x + arrowWidth + lineLength, y, x + arrowWidth, y],
      stroke: stroke,
      strokeWidth: strokeWidth
    });
  
    group.add(arrow, line);
    layer.add(group)
  
    return group;
  }
  

function drawUpsideDownArrow(x, y, w, h, color, layer) {
    var arrow = new Konva.Shape({
        sceneFunc: function(context) {
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(x + w / 2, y + h);
          context.lineTo(x + w, y);
          context.closePath();
          context.fillStrokeShape(this);
        },
        fill: color,
    });
    
    if (layer) layer.add(arrow)
    return arrow
}

function coolRectangle(x, y, w, h, color, stroke, size, darkerColor, layer, cornerRadius) {
    var rectangle = new Konva.Rect({
        x: x,
        y: y,
        width: w,
        height: h,
        cornerRadius: cornerRadius,
        fillLinearGradientStartPoint: { x: w, y: 0},
        fillLinearGradientEndPoint: { x: w, y: h},
        fillLinearGradientColorStops: [0, darkerColor, 0.5, color, 1, darkerColor],
        stroke: stroke,
        strokeWidth: size
    });
  
    if (layer) layer.add(rectangle);
}

function blurRectangle(x, y, w, h, color, stroke, size, darkerColor, isVertical, layer, cornerRadius) {
    if (isVertical){
        var rectangle = new Konva.Rect({x: x,y: y,width: w,cornerRadius: cornerRadius,height: h,fillLinearGradientStartPoint: { x: 0, y: h},fillLinearGradientEndPoint: { x: w, y: h},fillLinearGradientColorStops: [0, color, 0.85, darkerColor],stroke: stroke,strokeWidth: size});
    }else{
        var rectangle = new Konva.Rect({x: x,y: y,width: w,cornerRadius: cornerRadius,height: h,fillLinearGradientStartPoint: { x: 0, y: h},fillLinearGradientEndPoint: { x: w, y: h},fillLinearGradientColorStops: [0.25, color, 1, darkerColor],stroke: stroke,strokeWidth: size});
    }
    if (layer) layer.add(rectangle);
}

function createStar(opacity, size, x, y) {
    var star = new Konva.Star({
        x: getRandomNumber(0, x),
        y: getRandomNumber(0, y),
        numPoints: 5,
        innerRadius: size / 2,
        outerRadius: size,
        fill: 'darkgray',
        opacity: opacity,
        rotation: getRandomAngle()
    });

    return star;
}

function gradientRectangle(x, y, w, h, color, stroke, size, darkerColor, layer, cornerRadius) {
    var rectangle = new Konva.Rect({
        x: x,
        y: y,
        width: w,
        height: h,
        cornerRadius: cornerRadius,
        fillLinearGradientStartPoint: { x: w, y: 0},
        fillLinearGradientEndPoint: { x: w, y: h},
        fillLinearGradientColorStops: [0, darkerColor, 1, color],
        stroke: stroke,
        strokeWidth: size
    });
    if (layer) layer.add(rectangle);
}

function drawCircle(x, y, radius, color, stroke, strokeWidth, layer) {
    var circle = new Konva.Circle({
      x: x,
      y: y,
      radius: radius,
      fill: color,
      stroke: stroke,
      strokeWidth: strokeWidth
    });
  
    if (layer) layer.add(circle);
    return circle
}

function drawSemiCircle(x, y, w, h, color, stroke, strokeWidth, layer, rotation) {
    var semiCircle = new Konva.Arc({
        x: x,
        y: y,
        innerRadius: w / 2,
        outerRadius: w / 2,
        angle: 180,
        fill: color,
        stroke: stroke,
        strokeWidth: strokeWidth,
        rotation: rotation,
        scaleX: w / h
    });
  
    if (layer) {
      layer.add(semiCircle);
    }
  
    return semiCircle;
  }

function drawTrapezoid(x, y, w, h, color, stroke, strokeWidth, layer, curve){
    if (!curve) curve = 2
    var trapezoid = new Konva.Shape({
        sceneFunc: function(context) {
            context.beginPath();
            context.moveTo(x, y); // Top-left corner
            context.lineTo(x + w, y); // Top-right corner
            context.lineTo(x + w + h / curve, y + h); // Bottom-right corner
            context.lineTo(x - h / curve, y + h); // Bottom-left corner
            context.closePath();
            context.fillStrokeShape(this);
        },
        fill: color,
        stroke: stroke,
        strokeWidth: strokeWidth,
    });

    if (layer) layer.add(trapezoid);
    return trapezoid
}

function drawSlider(x, y, w, h, color, radius, min, max, isRotated, layer){
    var handle = new Konva.Rect({
        x: x,
        y: y,
        width: w,
        height: h,
        cornerRadius: radius,
        stroke: "black",
        fill: color,
        draggable: true,
        dragBoundFunc: function(pos) {
            if (isRotated){
                var newY = pos.y
                if (newY < min) newY = min;
                else if (newY > max - w) newY = max - w;
                return {
                    x: x,
                    y: newY
                };

            }else{
                var newX = pos.x
                if (newX < min) newX = min;
                else if (newX > max - w) newX = max - w;
                return {
                    x: newX,
                    y: y
                };
            }
        }
    });

    if (layer) layer.add(handle)
    return handle;
}

function drawPitch(x, y, width, height, color, strokeColor, strokeWidth, layer) {
    var group = new Konva.Group();
    var background = new Konva.Rect({x: x,y: y,width: width,height: height,fill: color,stroke: strokeColor,strokeWidth: strokeWidth});
    var centerX = x + width / 2;
    var centerY = y + height / 2;
    var circleRadius = Math.min(width, height) * 0.1;
    var squareWidth = width * 0.2;
    var squareHeight = height * 0.1;
    var topSquareY = y;
    var bottomSquareY = y + height - squareHeight;
    var squareX = x + (width - squareWidth) / 2;
    var circle = new Konva.Circle({x: centerX,y: centerY,radius: circleRadius,stroke: "rgba(0, 0, 0, 0.1)",strokeWidth: 2});
    var line1 = new Konva.Line({points: [x + width, centerY, x + width / 2 + circleRadius, centerY],stroke: "rgba(0, 0, 0, 0.1)",strokeWidth: 2});
    var line2 = new Konva.Line({points: [x, centerY, x + width / 2 - circleRadius, centerY],stroke: "rgba(0, 0, 0, 0.1)",strokeWidth: 2});
    var square1 = new Konva.Rect({x: squareX,y: topSquareY,width: squareWidth,height: squareHeight,stroke: "rgba(0, 0, 0, 0.1)",strokeWidth: strokeWidth});
    var square2 = new Konva.Rect({x: squareX,y: bottomSquareY,width: squareWidth,height: squareHeight,stroke: "rgba(0, 0, 0, 0.1)",strokeWidth: strokeWidth});
    var square3 = new Konva.Rect({x: squareX - 15,y: topSquareY,width: squareWidth + 30,height: squareHeight + 15,stroke: "rgba(0, 0, 0, 0.1)",strokeWidth: strokeWidth});
    var square4 = new Konva.Rect({x: squareX - 15,y: bottomSquareY - 15,width: squareWidth + 30,height: squareHeight + 15,stroke: "rgba(0, 0, 0, 0.1)",strokeWidth: strokeWidth});
    group.add(background, circle, line1, line2, square1, square2, square3, square4);
    if (layer) layer.add(group)
    return group
} 


function squadSort(){
    if (sortFeature == "squad") playersSquad.reverse()
    else playersSquad.sort((a,b)=> getPositionOrder(b.primaryPositions[0]) - getPositionOrder(a.primaryPositions[0]))
    sortFeature = "squad"
    drawList();
}

function ratingSort(){
    if (sortFeature == "rating") playersSquad.reverse()
    else playersSquad.sort((a,b)=> parseInt(b.rating) - parseInt(a.rating))
    sortFeature = "rating"
    drawList();
}

function scrollUp(){
    pointerNum -= 1
    drawList();
}

function scrollDown(){
    pointerNum += 1
    drawList();
}

function nextPage(){
    searchPage += 50
    addSmallCards(lastSearch, searchPage);
}

function backPage(){
    searchPage -= 50
    addSmallCards(lastSearch, searchPage);
}

function nextPage2(){
    searchPage += 50
    showSquad(lastSearch, searchPage2);
}

function backPage2(){
    searchPage -= 50
    showSquad(lastSearch, searchPage2);
}

function changeView(){
    view += 1
    if (view == 4) view = 0 
    drawLineup();
}

function changePreview(){
    view2 += 1
    if (view2 >= 4) view2 = 0
    addSmallCards(lastSearch, searchPage);
}

function getFullPlayers(squad){
    var arr = []
    for (x in squad){
        var obj = {...findPlayer(squad[x].id)}
        var potInc = squad[x].potInc
        var wholeNumber = Math.floor(potInc);
        if (obj.rating != obj.potential) obj.rating = (parseInt(obj.rating) + wholeNumber).toString() //MHHHH
        obj.potInc = potInc
        obj.c = squad[x].c
        obj.inSquad = squad[x].inSquad
        obj.stats = updateStats({...obj.stats}, wholeNumber)
        arr.push(obj)
    }
    return arr
}

function updateStats(stats, num){
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

    return stats
}

function highlightSelectedPosition(e) {
    if (selectedPlayer != null){
        startingPlayers[selectedPosition] = selectedPlayer
        selectedPlayer = null
        selectedPosition = null
        previousPosition = null
        if (pointerNum > Math.max(playersSquad.filter(e=>!startingPlayers.includes(e.id)).length - 12, 0)) pointerNum -= 1
        drawList();
        drawLineup();
        drawStats();
        checkTactics(getTactics());
    }
    else if (previousPosition != null){
        var temp = startingPlayers[previousPosition];
        startingPlayers[previousPosition] = startingPlayers[selectedPosition];
        startingPlayers[selectedPosition] = temp;
        selectedPlayer = null
        selectedPosition = null
        previousPosition = null
        drawLineup();
        checkTactics(getTactics());
    }
}

function highlightSelectedPlayer() {
    if (selectedPosition != null){
        startingPlayers[selectedPosition] = selectedPlayer
        selectedPlayer = null
        selectedPosition = null
        previousPosition = null
        drawList();
        drawLineup();
        drawStats();
        checkTactics(getTactics());
    }
}

function buildTeam(name, form){
    var club = database.filter(e=>e.club == name)
    club = JSON.parse(JSON.stringify(club))
    var formation = allFormations[form]
    var arr = [[],[],[],[],[]]
    var ratings = [0, 0, 0, 0,0]
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

  
function checkDrag(){
    var isDragging = false;
    var dragImage = null
    var storeX = 0
    var storeY = 0
    var type = 0
    var target = null;
    var targetColor = null;
    var draggedSelected = null

    stage.on('mousedown', function(e) {
        if (e.target.posID >= 0) {
            type = 1
            isDragging = true;
            var pos = stage.getPointerPosition();
            var playerID = e.target.playerID
            draggedSelected = e.target
            storeX = pos.x
            storeY = pos.y
            dragImage = addImageToCanvas(`https://img.fminside.net/facesfm24/${playerID}.png`, pos.x, pos.y, 70, 80, lineupGroup, 0.8)
            dragImage.visible(false)
            selectedPosition = e.target.posID
        }
        else if (e.target.playerID >= 0) {
            type = 2
            isDragging = true;
            var pos = stage.getPointerPosition();
            var playerID = e.target.playerID
            var playerC = e.target.C
            draggedSelected = e.target
            storeX = pos.x
            storeY = pos.y
            dragImage = addImageToCanvas(`https://img.fminside.net/facesfm24/${playerID}.png`, pos.x, pos.y, 70, 80, lineupGroup, 0.8)
            dragImage.visible(false)
            selectedPlayer = {id: playerID, c: playerC}
        }
    });

    stage.on('mousemove', function(e) {
        if (isDragging) {
            var pos = stage.getPointerPosition();
            dragImage.x(pos.x + 10);
            dragImage.y(pos.y + 10);
            if (Math.abs(pos.x - storeX) + Math.abs(pos.y - storeY) < 15) return
            dragImage.visible(true)
        }
        if (isDragging && e.target.posID >= 0){
            if (e.target.attrs.text) return;
            if (target) target.attrs.stroke = targetColor
            target = e.target
            targetColor = e.target.stroke()
            target.attrs.stroke = "gold"
        }
        else if (target){
            target.attrs.stroke = targetColor
        }
    });

    stage.on('mouseup', function(e) {
        isDragging = false;
        if (!dragImage) return;
        if ((draggedSelected?.isGK == true || e.target.isGK == true) && !((selectedPosition == 10 && e.target.isGK == true) || (e.target.posID == 10 && draggedSelected?.isGK == true))){
            if (target) target.attrs.stroke = targetColor
            dragImage.destroy();
            dragImage = null
            selectedPosition = null;
        }
        else if ((e.target.posID == 10 && draggedSelected?.isGK == false) || (selectedPosition == 10 && e.target.isGK == false)){
            if (target) target.attrs.stroke = targetColor
            dragImage.destroy();
            dragImage = null
            selectedPosition = null;
        }
        else if (type == 1 && e.target.posID >= 0){
            previousPosition = e.target.posID
            selectedPlayer = null
            if (previousPosition != selectedPosition) highlightSelectedPosition()
            if (target) target.attrs.stroke = targetColor
            dragImage.destroy();
            dragImage = null
            type = 0
        }
        else if (type == 1 && e.target.playerID >= 0){
            selectedPlayer = {id: e.target.playerID, c: e.target.C}
            highlightSelectedPosition()
            dragImage.destroy();
            type = 0
        }
        else if (type == 2){
            selectedPosition = e.target.posID
            highlightSelectedPlayer()
            dragImage.destroy();
            dragImage = null
            type = 0
        }
        else if (dragImage) {
            dragImage.destroy();
            dragImage = null
        }
    });
}

function addPointerTriangle(x, y, value, rotation, type, layer){
    var group = new Konva.Group({rotation: rotation });
    var triangle1 = drawTriangle(x, y, 100, 50, "#062f39", "black", 2)
    var text1 = drawText(value, x + 50, y + 7, "gold", "Optima", 28, "center", "middle", "black", 0);
    var text2 = drawText(type, x + 50, y - 15, "beige", "Optima", 13, "center", "middle", "black", 0);
    group.add(triangle1, text1, text2)
    layer.add(group)
    return;
}

function addHandler(startX, startY, size, type){
    var sliderGroup = new Konva.Group();
    var isDragged = false
    if (type != "width") {
        if (type == "depth") var value = depthTactic
        if (type == "line") var value = lineTactic
        var track = drawRectangle(startX, startY, 2, "red", "black", 10, size, sliderGroup);
        var colored = drawRectangle(startX, startY, 2, "lightgray", "black", 10, -5 - (value * 3.5) + size, sliderGroup);
        var handle = drawSlider(startX - 5, startY - (value * 3.5) + size - 20, 20, 20, "gray", 10, startY, track.y() + track.height(), true, sliderGroup);
    }
    else {
        var track = drawRectangle(startX, startY, 2, "lightgray", "black", size, 10, sliderGroup)
        var colored = drawRectangle(startX, startY, 2, "red", "black", 0 + (widthTactic * 3.5), 10, sliderGroup)
        var handle = drawSlider(startX + (widthTactic * 3.5), startY - 5, 20, 20, "gray", 10, startX, track.x() + track.width(), false, sliderGroup);
    }
    
    handle.on('dragmove', function(e) {
        isDragged = true
        if (type != "width"){
            var newY = e.target.y();
            var value = 1 - ((newY - track.y()) / (track.height() - handle.height()));
            var coreValue = newY - startY + (handle.height()/2)

            if (type == "depth") depthTactic = value * 100
            if (type == "line") lineTactic = value * 100
            colored.height(coreValue);
            shapeTactic1();
        }else{
            var newX = e.target.x();
            var value = (newX - track.x()) / (track.width() - handle.width());
            var coreValue = newX - startX + (handle.width()/2)

            widthTactic = value * 100
            widthTactic = value * 100
            colored.width(coreValue);
            shapeTactic1();
        }
    });

    stage.on('mouseup', function(e) {
        if (isDragged) {
            isDragged = false
            checkTactics(getTactics());
        }
    });

    return sliderGroup
}

function addHover(icon, type, ignore){
    icon.on('click', function() {
        hearClicks(type);
    });

    if (ignore == true) return;
    icon.on('mouseenter', function(e) {
        stage.container().style.cursor = 'pointer';
    });
    icon.on('mouseleave', function () {
        stage.container().style.cursor = 'default';
    });

}
