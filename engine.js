const foodRate = 0.1;
const startingFood = 50;
const startingMinions = 100;
var ctx;
var cvsDim = [window.innerWidth, window.innerHeight]
var minions = [];
var foods = [];
function startEngine(){
    var canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    for(var i = 0; i < startingMinions; i++){
        var m = new Minion(randomPos(), getRandomTraits(), getRandomColor());
        minions.push(m)
    }
    for(var i = 0; i < startingFood; i++){
        var f = new Food(randomPos());
        foods.push(f)
    }
    loopInterval = setInterval(function(){
        loop();
        draw();
    }, 20);
}
function updateWindowSize(){
    var canvas = document.getElementById("canvas")
    cvsDim = [window.innerWidth, window.innerHeight]
    canvas.width = cvsDim[0]
    canvas.height = cvsDim[1]
}
function draw(){
    for(var i = 0; i < foods.length; i++){
        foods[i].draw();
    }
    for(var i = 0; i < minions.length; i++){
        minions[i].draw();
    }
    ctx.font = "20px Comic Sans MS"
    var telemetry = [];
    telemetry.push("Living Minions: " + minions.length);
    for(var i = 0; i < telemetry.length; i++){
        topLeft = [20, 20];
        ctx.fillStyle = "Black";
        ctx.fillText(telemetry[i], topLeft[0], topLeft[1]+20*(i+0.5))
    }
}
function loop(){ //Standard game loop
    updateWindowSize();
    var toRemove = []; //List of indices to remove
    for(var i = 0; i < minions.length; i++){
        minions[i].update();
        if(minions[i].headSize < 0){
            toRemove.push(i);
        }
    }
    //Creates a new array with all the living minions
    if(toRemove.length > 0){
        var newMinions = [];
        for(var i = 0; i < minions.length; i++){
            if(!toRemove.includes(i)){
                newMinions.push(minions[i])
            }
        }
        minions = newMinions;
    }
    var toRemove = [];
    for(var i = 0; i < foods.length; i++){
        if(foods[i].eaten){
            toRemove.push(i);
        }
    }
    if(toRemove.length > 0){
        var newFoods = [];
        for(var i = 0; i < foods.length; i++){
            if(!toRemove.includes(i)){
                newFoods.push(foods[i])
            }
        }
        foods = newFoods;
    }

    //Adds more food
    if(Math.random() < foodRate){
        var f = new Food(randomPos());
        foods.push(f)
    }
}
function randomPos(){ //Gets random pos on canvas
    return [Math.random()*cvsDim[0], Math.random()*cvsDim[1]];
}