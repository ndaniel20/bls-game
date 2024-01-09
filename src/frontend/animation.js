function drawAnimatedCircle(centerX, centerY, radius, maxNumber, color, animationColor, stripeColor, n, layer) {
    drawCircle(centerX, centerY, radius, color, "black", 2, layer)
    
    var animatedArc = new Konva.Arc({
      x: centerX,
      y: centerY,
      innerRadius: radius,
      outerRadius: radius,
      angle: (n / 100) * 360,
      rotation: -90,
      stroke: animationColor,
      strokeWidth: 6,
      fill: animationColor
    });
    if (layer) layer.add(animatedArc);
    
    var anim = new Konva.Animation((frame) => {
        if (n == maxNumber) return anim.stop();
        if (n < maxNumber) n += 1;
        if (n > maxNumber) n -= 1;

        var targetAngle = (n / 100) * 360; 
        animatedArc.angle(targetAngle); 
      });
    anim.start();
}
  
function drawAnimatedRectangle(x, y, width, height, animationColor, n, maxNumber, layer) {
    const barWidth = n * 1.5;
    var backgroundRect = drawRectangle(x, y, 2, "#CCCCCC", "black", width, height, layer)
    var animatedRect = drawRectangle(x, y, 2, animationColor, "black", barWidth, height, layer)

    var anim = new Konva.Animation((frame) => {
        if (n == maxNumber) return anim.stop();
        if (n < maxNumber) n += 1;
        if (n > maxNumber) n -= 1;

        animatedRect.width(n * 1.5);
      });
    anim.start();
}

function createOffsideAnimation(layer, main, opposition, type){
    var blueTeam = []
    var redTeam = []
    for (var i = 0; i < opposition.length; i++){
        var x = 336 + (opposition[i][0] * 0.7)
        var y = 260 - (opposition[i][1] * 0.25)
        var size = y/35
         var circle = drawCircle(x, y, size, "#0e5eb3", "black", 2.5, layer)
        blueTeam.push(circle)
    }    

    for (var i = 0; i < main.length - 1; i++){
        var x = 336 + (main[i][0] * 0.7)
        var y = 130 + (main[i][1] * 0.35)
        if (i < 6 && i > 1) y -= 30
        var size = y/35
        var circle = drawCircle(x, y, size, "red", "black", 2.5, layer)
        redTeam.push(circle)
    }    
    var soccerBall = drawCircle(600, 190, 190/60, "white", "black", 1, layer)
    
    var animation = new Konva.Animation(function(frame) {
        var blueY = blueTeam[1].y()
        var redY = redTeam[9].y()
        if (blueY > redY + 10) {
            var deltaX = (blueTeam[1].x() - soccerBall.x()) / 30;
            var deltaY = ((blueTeam[1].y() + 20) - soccerBall.y()) / 30;
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
            blueTeam[1].fill("#063a71");
            if (deltaX < 0.1 && deltaY < 0.1) animation.stop()
        }
        if (blueY < redY + 20) {
            blueTeam[1].move({ x: 0, y: 1 });
            blueTeam[1].radius(blueY/35);
            redTeam.slice(6, 10).forEach(e=>{e.move({ x: 0, y: -1 });e.radius(redY/35);})
        }
    });
      
    if (type) animation.start();
}


function createPressAnimation(layer, main, opposition, type){
    var blueTeam = []
    var redTeam = []
    for (var i = 0; i < opposition.length; i++){
        var x = 336 + (opposition[i][0] * 0.7)
        var y = 260 - (opposition[i][1] * 0.25)
        var size = y/35
        var circle = drawCircle(x, y, size, "#0e5eb3", "black", 2.5, layer)
        blueTeam.push(circle)
    }    
    for (var i = 0; i < main.length - 1; i++){
        var x = 336 + (main[i][0] * 0.7)
        var y = 130 + (main[i][1] * 0.35)
        if (i < 6 && i > 1) y -= 30
        var size = y/35
        var circle = drawCircle(x, y, size, "red", "black", 2.5, layer)
        redTeam.push(circle)
    }    
    var soccerBall = drawCircle(600, 190, 260/60, "white", "black", 1, layer)
    var target = blueTeam[4]

    var animation = new Konva.Animation(function(frame) {
        if (frame.time > 4000) animation.stop()
        redTeam.slice(0, 10).forEach((e, n)=>{
            if (n >= 2) var height = 20
            else var height = -5
            var distance = Math.max(Math.min(Math.sqrt(Math.pow(e.x() - (soccerBall.x()), 2) + Math.pow(e.y() - soccerBall.y(), 2)), 150), 50)
            var deltaX = soccerBall.x() - (e.x());
            var deltaY = soccerBall.y() - (e.y() - height);
            var magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            var normalizedX = deltaX / magnitude;
            var normalizedY = deltaY / magnitude;
            if (type == "Constant Pressure") e.move({ x: (normalizedX/distance) * 20, y: (normalizedY/distance) * 25 });
            else if (e.y() < 310 && type == "Drop Back") e.move({ x: ((normalizedX/distance) * 20)/2, y: Math.abs((normalizedY/distance) * 20) });
            else {
                if (distance < 60) e.move({ x: ((normalizedX/distance) * 15), y: ((normalizedY/distance) * 15) });
                else if (n >= 6) e.move({ x: ((normalizedX/distance) * 15)/2, y: -0.08 });
                else if (distance < 120) e.move({ x: ((normalizedX/distance) * 20)/2, y: 0.1 });
                else e.move({ x: ((normalizedX/distance) * 15), y: 0 });
            }
            e.radius(e.y()/35);
        })
        
        if (frame.time > 500 && frame.time < 2000) {
            var deltaX = (target.x() - soccerBall.x()) / 30;
            var deltaY = ((target.y() + 10) - soccerBall.y()) / 30;
            soccerBall.move({x: deltaX, y: deltaY})
        }        
        if (frame.time > 2000) {
            var deltaX = (target.x() - soccerBall.x()) / 30;
            var deltaY = ((target.y()) - soccerBall.y()) / 30;
            target = blueTeam[3]
            soccerBall.move({x: deltaX, y: deltaY})
        }
        
    });
      
    animation.start();
}

function createZonalAnimation(layer, main, opposition, type){
    var blueTeam = []
    var redTeam = []
    for (var i = 0; i < opposition.length; i++){
        var x = 336 + (opposition[i][0] * 0.7)
        var y = 320 - (opposition[i][1] * 0.35)
        if (i == 6 || i == 7) y += 20
        var size = y/35
        var circle = drawCircle(x, y, size, "#0e5eb3", "black", 2.5, layer)
        blueTeam.push(circle)
    }    
    if (type == "Zonal Marking"){
        for (var i = 0; i < main.length - 1; i++){
            var x = 336 + (main[i][0] * 0.7)
            var y = 150 + (main[i][1] * 0.35)
            if (i < 6 && i > 1) y -= 30
            var size = y/35
            var circle = drawCircle(x, y, size, "red", "black", 2.5, layer)
            redTeam.push(circle)
        }    
    }
    else{
        for (var i = 0; i < main.length - 1; i++){
            var mark = blueTeam[i]
            var x = mark.x() + 10
            var y = mark.y() + 20
            if (i == 8) y = blueTeam[1].y() + 15
            if (i == 1) x += 10
            //if (i == 5) {x += 20;y -= 30}
            if (i == 5) {x -= 110;y -= 15}
            if (i == 4) {y -= 35;x -= 35}
            if (i == 7) {y += 15;x -= 65}
            var size = y/35
            var circle = drawCircle(x, y, size, "red", "black", 2.5, layer)
            redTeam.push(circle)
        }   

    }

}

function createTimeAnimation(layer, main, opposition, type){
    var blueTeam = []
    var redTeam = []
    for (var i = 0; i < opposition.length; i++){
        var x = 336 + (opposition[i][0] * 0.7)
        var y = 260 - (opposition[i][1] * 0.25)
        var size = y/35
         var circle = drawCircle(x, y, size, "#0e5eb3", "black", 2.5, layer)
        blueTeam.push(circle)
    }    

    for (var i = 0; i < main.length - 1; i++){
        var x = 336 + (main[i][0] * 0.7)
        var y = 130 + (main[i][1] * 0.35)
        if (i < 6 && i > 1) y -= 30
        var size = y/35
        var circle = drawCircle(x, y, size, "red", "black", 2.5, layer)
        redTeam.push(circle)
    }    

    var soccerBall = drawCircle(630, 285, 285/60, "white", "black", 1, layer)

    var animation = new Konva.Animation(function(frame) {
        blueTeam.slice(0, 10).forEach((e, n)=>{
            if (n >= 2) var height = 20
            else var height = -5
            var distance = Math.max(Math.min(Math.sqrt(Math.pow(e.x() - (soccerBall.x()), 2) + Math.pow(e.y() - soccerBall.y(), 2)), 150), 50)
            var deltaX = soccerBall.x() - (e.x());
            var deltaY = soccerBall.y() - (e.y() - height);
            var magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            var normalizedX = deltaX / magnitude;
            var normalizedY = deltaY / magnitude;
            e.move({ x: (normalizedX/distance) * 15, y: (normalizedY/distance) * 20 });
            e.radius(e.y()/35);
        })
        redTeam.slice(0,6).forEach(e=>e.move({ x: 0, y: 0.05 }))

        if (frame.time >= 600 && frame.time < 2500){
            var deltaX = (redTeam[9].x() - soccerBall.x()) / 30;
            var deltaY = ((redTeam[9].y() - 10) - soccerBall.y()) / 30;
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
        }
        if (frame.time >= 2500 && frame.time < 4400){
            var deltaX = (redTeam[8].x() - soccerBall.x()) / 30;
            var deltaY = ((redTeam[8].y() - 10) - soccerBall.y()) / 30;
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
        }
        if (frame.time >= 4000 && frame.time < 5400){
            var deltaX = (redTeam[6].x() - soccerBall.x()) / 30;
            var deltaY = ((redTeam[6].y() - 10) - soccerBall.y()) / 30;
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
        }
        if (frame.time >= 5400 && frame.time < 6400){
            var deltaX = (redTeam[8].x() - soccerBall.x()) / 30;
            var deltaY = ((redTeam[8].y() + 15) - soccerBall.y()) / 30;
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
        }
        if (frame.time > 6400){
            soccerBall.move({x: 0, y: 1})
            if (soccerBall.y() > 324) soccerBall.visible(false)
        }
        if (soccerBall.y() > 340){
            animation.stop();
        }
    });

    if (type) animation.start()
}

function createWingPlayAnimation(layer, main, opposition){
    var blueTeam = []
    var redTeam = []
    for (var i = 0; i < opposition.length; i++){
        var x = 336 + (opposition[i][0] * 0.7)
        var y = 260 - (opposition[i][1] * 0.25)
        var size = y/35
         var circle = drawCircle(x, y, size, "#0e5eb3", "black", 2.5, layer)
        blueTeam.push(circle)
    }    

    for (var i = 0; i < main.length - 1; i++){
        var x = 336 + (main[i][0] * 0.7)
        var y = 130 + (main[i][1] * 0.35)
        if (i < 6 && i > 1) y -= 30
        if (i == 5) x -= 30
        if (i == 2) x += 30
        if (i == 4) {y += 25;x += 25}
        if (i == 3) {y += 25;x -= 25}
        if (i == 6 || i == 7) y -= 100
        var size = y/35
        var circle = drawCircle(x, y, size, "red", "black", 2.5, layer)
        redTeam.push(circle)
    }  


    var soccerBall = drawCircle(598, 203, 203/60, "white", "black", 1, layer)
    var controlled = [redTeam[7]]
    var step = 0

    var animation = new Konva.Animation(function(frame) {
        blueTeam.slice(0, 10).concat(redTeam.slice(0, 10).filter(e =>!controlled.includes(e))).forEach((e, n)=>{
            var distance = Math.max(Math.min(Math.sqrt(Math.pow(e.x() - (soccerBall.x()), 2) + Math.pow(e.y() - soccerBall.y(), 2)), 150), 50)
            var deltaX = soccerBall.x() - (e.x());
            var deltaY = soccerBall.y() - (e.y() -5);
            var magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            var normalizedX = deltaX / magnitude;
            var normalizedY = deltaY / magnitude;
            e.move({ x: (normalizedX/distance) * 15, y: (normalizedY/distance) * 20 });
            e.radius(e.y()/35);
        })
        if (step == 0){
            redTeam[7].move({x: 0, y: -0.50})
            redTeam[7].radius(redTeam[7].y()/35);
        }

        if (frame.time >= 600 && step == 0){
            var deltaX = (redTeam[7].x() - soccerBall.x()) / 30;
            var deltaY = ((redTeam[7].y()- 20) - soccerBall.y()) / 30;
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
            redTeam[0].move({x: 0.2, y: -0.2})
            redTeam[0].radius(redTeam[0].y()/35);
            if (Math.abs(deltaX) < 0.4 && Math.abs(deltaY) < 0.55) step += 1
        }

        if (step == 1){
            controlled = []
            var deltaX = (redTeam[0].x() - soccerBall.x()) / 30;
            var deltaY = (((redTeam[0].y()) - 5) - soccerBall.y()) / 30;
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
            if (Math.abs(deltaX) <= 0.1 && deltaY <= 0.15) animation.stop();
        }
    });

    animation.start()
}

function createLongBallAnimation(layer, main, opposition){
    var blueTeam = []
    var redTeam = []
    for (var i = 0; i < opposition.length; i++){
        var x = 336 + (opposition[i][0] * 0.7)
        var y = 280 - (opposition[i][1] * 0.25)
        if (i == 10) y = 120
        var size = y/35
         var circle = drawCircle(x, y, size, "#0e5eb3", "black", 2.5, layer)
        blueTeam.push(circle)
    }    

    for (var i = 0; i < main.length - 1; i++){
        var x = 336 + (main[i][0] * 0.7)
        var y = 150 + (main[i][1] * 0.35)
        if (i < 6 && i > 1) y -= 30
        if (i == 6 || i == 7) y -= 30
        var size = y/35
        var circle = drawCircle(x, y, size, "red", "black", 2.5, layer)
        redTeam.push(circle)
    }  


    var soccerBall = drawCircle(542, 300, 300/60, "white", "black", 1, layer)
    var controlled = [redTeam[0], redTeam[9]]
    var step = 0

    var animation = new Konva.Animation(function(frame) {
        blueTeam.slice(0, 10).concat(redTeam.slice(0, 10).filter(e =>!controlled.includes(e))).forEach((e, n)=>{
            var distance = Math.max(Math.min(Math.sqrt(Math.pow(e.x() - (soccerBall.x()), 2) + Math.pow(e.y() - soccerBall.y(), 2)), 150), 50)
            var deltaX = soccerBall.x() - (e.x());
            var deltaY = soccerBall.y() - (e.y() + 10);
            var magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            var normalizedX = deltaX / magnitude;
            var normalizedY = deltaY / magnitude;
            e.move({ x: (normalizedX/distance) * 20, y: (normalizedY/distance) * 25 });
            e.radius(e.y()/35);
        })

        if (frame.time >= 800 && step == 0){
            var deltaX = (redTeam[0].x() - soccerBall.x()) / 30;
            var deltaY = ((redTeam[0].y()- 20) - soccerBall.y()) / 30;
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
            redTeam[0].move({x: -0.1, y: -0.2})
            redTeam[0].radius(redTeam[0].y()/35);
            if (Math.abs(deltaX) < 0.4 && Math.abs(deltaY) < 0.4) animation.stop()//step += 1
        }

        if (step == 1){
            controlled = []
            var deltaX = (redTeam[0].x() - soccerBall.x()) / 30;
            var deltaY = (((redTeam[0].y()) - 5) - soccerBall.y()) / 30;
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
            if (Math.abs(deltaX) <= 0.1 && deltaY <= 0.15) animation.stop();
        }
    });

    animation.start()
}

function createPossessionAnimation(layer, main, opposition){
    var blueTeam = []
    var redTeam = []
    for (var i = 0; i < opposition.length; i++){
        var x = 336 + (opposition[i][0] * 0.7)
        var y = 260 - (opposition[i][1] * 0.25)
        var size = y/35
         var circle = drawCircle(x, y, size, "#0e5eb3", "black", 2.5, layer)
        blueTeam.push(circle)
    }    

    for (var i = 0; i < main.length - 1; i++){
        var x = 336 + (main[i][0] * 0.7)
        var y = 130 + (main[i][1] * 0.35)
        if (i < 6 && i > 1) y -= 30
        if (i == 6 || i == 7) y -= 30
        var size = y/35
        var circle = drawCircle(x, y, size, "red", "black", 2.5, layer)
        redTeam.push(circle)
    }  


    var soccerBall = drawCircle(542, 288, 288/60, "white", "black", 1, layer)
    var controlled = [redTeam[9]]
    var step = 0

    var animation = new Konva.Animation(function(frame) {
        blueTeam.slice(0, 10).concat(redTeam.slice(0, 10).filter(e =>!controlled.includes(e))).forEach((e, n)=>{
            var distance = Math.max(Math.min(Math.sqrt(Math.pow(e.x() - (soccerBall.x()), 2) + Math.pow(e.y() - soccerBall.y(), 2)), 150), 50)
            var deltaX = soccerBall.x() - (e.x());
            var deltaY = soccerBall.y() - (e.y() -5);
            var magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            var normalizedX = deltaX / magnitude;
            var normalizedY = deltaY / magnitude;
            if (n <= 10) e.move({ x: (normalizedX/distance) * 15, y: (normalizedY/distance) * 20 });
            else e.move({ x: (normalizedX/distance) * 15, y: (normalizedY/distance) * 10 });
            e.radius(e.y()/35);
        })

        if (frame.time >= 600 && step == 0){
            controlled = [redTeam[7]]
            var deltaX = (redTeam[7].x() - soccerBall.x()) / 25;
            var deltaY = ((redTeam[7].y()) - soccerBall.y()) / 25;
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
            if (Math.abs(deltaX) < 0.2 && Math.abs(deltaY) < 0.2) step += 1
        }

        if (step == 1){
            controlled = [redTeam[4], redTeam[5]]
            var deltaX = (redTeam[4].x() - soccerBall.x()) / 25;
            var deltaY = ((redTeam[4].y()) - soccerBall.y()) / 25;
            redTeam[5].move({x: 0, y: -0.2})
            redTeam[5].radius(redTeam[5].y()/35);
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
            if (Math.abs(deltaX) < 0.1 && Math.abs(deltaY) < 0.1) step += 1
        }

        if (step == 2){
            controlled = [redTeam[8]]
            var deltaX = (redTeam[8].x() - soccerBall.x()) / 30;
            var deltaY = ((redTeam[8].y()) - soccerBall.y()) / 30;
            redTeam[7].move({x: 0.4, y: 0})
            redTeam[7].radius(redTeam[7].y()/35);
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
            if (Math.abs(deltaX) < 0.1 && Math.abs(deltaY) < 0.1) step += 1
        }
        
        if (step == 3){
            controlled = []
            var deltaX = (redTeam[6].x() - soccerBall.x()) / 25;
            var deltaY = ((redTeam[6].y()) - soccerBall.y()) / 25;
            redTeam[2].move({x: -0.4, y: -0.2})
            redTeam[2].radius(redTeam[2].y()/35);
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
            if (Math.abs(deltaX) < 0.1 && Math.abs(deltaY) < 0.1) step += 1
        }

        if (step == 4){
            controlled = []
            var deltaX = (redTeam[2].x() - soccerBall.x()) / 25;
            var deltaY = ((redTeam[2].y()) - soccerBall.y()) / 25;
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
            if (Math.abs(deltaX) < 0.1 && Math.abs(deltaY) < 0.1) step += 1
        }
        if (step == 5){
            controlled = [redTeam[1]]
            var deltaX = (redTeam[1].x() - soccerBall.x()) / 25;
            var deltaY = ((redTeam[1].y() - 20) - soccerBall.y()) / 25;
            redTeam[1].move({x: 0, y: -0.2})
            redTeam[1].radius(redTeam[1].y()/35);
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
            if (Math.abs(deltaX) < 0.4 && Math.abs(deltaY) < 0.4) animation.stop()//step += 1
        }
    });

    animation.start()
}

function createDirectAnimation(layer, main, opposition){
    var blueTeam = []
    var redTeam = []
    for (var i = 0; i < opposition.length; i++){
        var x = 336 + (opposition[i][0] * 0.7)
        var y = 260 - (opposition[i][1] * 0.25)
        var size = y/35
         var circle = drawCircle(x, y, size, "#0e5eb3", "black", 2.5, layer)
        blueTeam.push(circle)
    }    

    for (var i = 0; i < main.length - 1; i++){
        var x = 336 + (main[i][0] * 0.7)
        var y = 130 + (main[i][1] * 0.35)
        if (i < 6 && i > 1) y -= 30
        if (i == 6 || i == 7) y -= 30
        var size = y/35
        var circle = drawCircle(x, y, size, "red", "black", 2.5, layer)
        redTeam.push(circle)
    }  


    var soccerBall = drawCircle(542, 288, 288/60, "white", "black", 1, layer)
    var controlled = [redTeam[9]]
    var step = 0

    var animation = new Konva.Animation(function(frame) {
        blueTeam.slice(0, 10).concat(redTeam.slice(0, 10).filter(e =>!controlled.includes(e))).forEach((e, n)=>{
            var distance = Math.max(Math.min(Math.sqrt(Math.pow(e.x() - (soccerBall.x()), 2) + Math.pow(e.y() - soccerBall.y(), 2)), 150), 50)
            var deltaX = soccerBall.x() - (e.x());
            var deltaY = soccerBall.y() - (e.y() -5);
            var magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            var normalizedX = deltaX / magnitude;
            var normalizedY = deltaY / magnitude;
            if (n <= 10) e.move({ x: (normalizedX/distance) * 15, y: (normalizedY/distance) * 20 });
            else e.move({ x: (normalizedX/distance) * 15, y: (normalizedY/distance) * 10 });
            e.radius(e.y()/35);
        })

        if (frame.time >= 600 && step == 0){
            controlled = [redTeam[4]]
            var deltaX = (redTeam[4].x() - soccerBall.x()) / 25;
            var deltaY = ((redTeam[4].y()) - soccerBall.y()) / 25;
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
            if (Math.abs(deltaX) < 0.2 && Math.abs(deltaY) < 0.2) step += 1
        }

        if (step == 1){
            controlled = []
            var deltaX = (redTeam[0].x() - soccerBall.x()) / 25;
            var deltaY = ((redTeam[0].y()) - soccerBall.y()) / 25;
            redTeam[1].move({x: 0, y: -0.1})
            redTeam[1].radius(redTeam[1].y()/35);
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
            if (Math.abs(deltaX) < 0.1 && Math.abs(deltaY) < 0.1) step += 1
        }

        if (step == 2){
            controlled = []
            var deltaX = (redTeam[1].x() - soccerBall.x()) / 30;
            var deltaY = ((redTeam[1].y() - 20) - soccerBall.y()) / 30;
            redTeam[1].move({x: 0, y: -0.2})
            redTeam[1].radius(redTeam[1].y()/35);
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
            if (Math.abs(deltaX) < 0.1 && Math.abs(deltaY) < 0.4) animation.stop()
        }
    });

    animation.start()
}

function createTransitionAnimation(layer, main, opposition, type){
    var blueTeam = []
    var redTeam = []
    for (var i = 0; i < opposition.length; i++){
        var x = 336 + (opposition[i][0] * 0.7)
        var y = 300 - (opposition[i][1] * 0.25)
        if (i == 10) y = 120
        if (i < 6 && i > 1) y += 10
        var size = y/35
         var circle = drawCircle(x, y, size, "#0e5eb3", "black", 2.5, layer)
        blueTeam.push(circle)
    }    

    for (var i = 0; i < main.length - 1; i++){
        var x = 336 + (main[i][0] * 0.7)
        var y = 190 + (main[i][1] * 0.25)
        if (i == 2 || i == 5) y -= 15
        var size = y/35
        var circle = drawCircle(x, y, size, "red", "black", 2.5, layer)
        redTeam.push(circle)
    }  

    var soccerBall = drawCircle(650, 278, 278/60, "white", "black", 1, layer)
    var controlled = [blueTeam[2]]
    var step = 0
    if (type == "Slow") var speed = 60, xGap = 0.1
    if (type == "Medium") var speed = 30, xGap = 0.15
    if (type == "Fast") var speed = 15, xGap = 0.2

    var animation = new Konva.Animation(function(frame) {
        blueTeam.slice(0, 10).filter(e =>!controlled.includes(e)).concat(redTeam.slice(0, 10).filter(e =>!controlled.includes(e))).forEach((e, n)=>{
            var distance = Math.max(Math.min(Math.sqrt(Math.pow(e.x() - (soccerBall.x()), 2) + Math.pow(e.y() - soccerBall.y(), 2)), 150), 50)
            var deltaX = soccerBall.x() - (e.x());
            var deltaY = soccerBall.y() - (e.y() -5);
            var magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            var normalizedX = deltaX / magnitude;
            var normalizedY = deltaY / magnitude;
            if (n <= 10) e.move({ x: (normalizedX/distance) * 15, y: (normalizedY/distance) * 10 });
            else e.move({ x: (normalizedX/distance) * 15, y: (normalizedY/distance) * 5 });
            e.radius(e.y()/35);
        })

        if (step == 0){
            var alphaX = (redTeam[7].x() - soccerBall.x()) / speed;
            var alphaY = ((redTeam[7].y()) - soccerBall.y()) / speed;
            blueTeam[0].move({x: 0.1, y: 0.05})
            blueTeam[0].radius(blueTeam[0].y()/35);
            blueTeam[2].move({x: 0.2, y: 0.05})
            blueTeam[2].radius(blueTeam[2].y()/35);
            soccerBall.move({x: 0.2, y: 0.05})
            soccerBall.radius(soccerBall.y()/60);
            if (Math.abs(alphaX) < ((xGap * 10) * xGap) && Math.abs(alphaY) < 0.4) step += 1
        }

        if (step == 1){
            controlled = []
            var deltaX = (redTeam[9].x() - soccerBall.x()) / speed;
            var deltaY = ((redTeam[9].y()) - soccerBall.y()) / speed;
            blueTeam[0].move({x: 0.1, y: 0.05})
            blueTeam[0].radius(blueTeam[0].y()/35);
            redTeam[2].move({x: -0.2, y: -0.1})
            redTeam[2].radius(redTeam[2].y()/35);
            redTeam[4].move({x: 0, y: -0.2})
            redTeam[4].radius(redTeam[4].y()/35);
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
            if (Math.abs(deltaX) < xGap && Math.abs(deltaY) < 0.2) step += 1
        }

        if (step == 2){
            controlled = [redTeam[9]]
            var deltaX = (redTeam[4].x() - soccerBall.x()) / speed;
            var deltaY = ((redTeam[4].y()) - soccerBall.y()) / speed;
            blueTeam[0].move({x: 0.1, y: 0.05})
            blueTeam[0].radius(blueTeam[0].y()/35);
            redTeam[2].move({x: -0.2, y: -0.1})
            redTeam[2].radius(redTeam[2].y()/35);
            redTeam[3].move({x: 0, y: -0.2})
            redTeam[3].radius(redTeam[3].y()/35);
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
            if (Math.abs(deltaX) < xGap && Math.abs(deltaY) < 0.2) step += 1
        }

        if (step == 3){
            controlled = [redTeam[4]]
            var deltaX = (redTeam[3].x() - soccerBall.x()) / speed;
            var deltaY = ((redTeam[3].y()) - soccerBall.y()) / speed;
            blueTeam[0].move({x: 0.1, y: 0.05})
            blueTeam[0].radius(blueTeam[0].y()/35);
            redTeam[2].move({x: -0.2, y: -0.1})
            redTeam[2].radius(redTeam[2].y()/35);
            redTeam[1].move({x: 0, y: -0.4})
            redTeam[1].radius(redTeam[1].y()/35);
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
            if (Math.abs(deltaX) < xGap && Math.abs(deltaY) < 0.2) step += 1
        }

        if (step == 4){
            controlled = []
            var deltaX = ((redTeam[2].x() - 20) - soccerBall.x()) / speed;
            var deltaY = ((redTeam[2].y()) - soccerBall.y()) / speed;
            soccerBall.move({x: deltaX, y: deltaY})
            soccerBall.radius(soccerBall.y()/60);
            if (Math.abs(deltaX) < (4 * xGap) && Math.abs(deltaY) < 0.2) animation.stop()//step += 1
        }
    });

    animation.start()
}

function createCornerAnimation(layer, main, opposition, type){

    var forward = [[505, 115], [490, 135], [505, 145], [470, 145], [520, 145], [530, 130], [460, 125], [500, 160], [545, 145], [510, 130], [490, 120]].slice(0, type + 1)
    var back = [[505, 250], [620, 225], [390, 225], [475, 210], [535, 190]]
    var max = forward.length
    for (var i = 0; i < forward.length; i++){
        var x = forward[i][0]
        var y = forward[i][1]
        var size = y/35
        drawCircle(x, y, size, "#0e5eb3", "black", 2.5, layer)
        if (i > 1) drawCircle(x + (5 - (i * 2)), (y - 20) + (-5 + (i * 3)), size, "red", "black", 2.5, layer)
        if (i == 0) drawCircle(640, 115, 115/35, "red", "black", 2.5, layer)
    }    

    for (var i = 0; i < back.length; i++){
        var x = back[i][0]
        var y = back[i][1]
        var size = y/35
        if (max >= 11) continue;
        drawCircle(x, y, size, "#0e5eb3", "black", 2.5, layer)
        drawCircle(x + (5 - (i * 3)), y + (18 - (i * 3)), size, "red", "black", 2.5, layer)
        max++
    }    

}

function createFullbackAnimation(layer, main, opposition, type){
    for (var i = 0; i < opposition.length; i++){
        var x = 336 + (opposition[i][0] * 0.7)
        var y = 260 - (opposition[i][1] * 0.25)
        var size = y/35
        drawCircle(x, y, size, "#0e5eb3", "black", 2.5, layer)
    }    
    for (var i = 0; i < main.length - 1; i++){
        var x = 336 + (main[i][0] * 0.7)
        var y = 130 + (main[i][1] * 0.35)
        if (i < 6 && i > 1) y -= 30
        if ((i == 6 || i == 7) && type == "Defensive Full-Back") {x += i == 7 ? -20 :20; y += 5}
        if ((i == 6 || i == 7) && type == "Inverted Wing-Back") {x += i == 7 ? -20 :20; y -= 20}
        if ((i == 6 || i == 7) && type == "Wing-Back") y -= 30
        var size = y/35
        drawCircle(x, y, size, "red", "black", 2.5, layer)
    }    
}