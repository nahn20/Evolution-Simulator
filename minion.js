/*
        ----------
        | :    ) |
        |        |
        |        |
    ---------x--------
    |        |       |
    |        |       |
    |        |       |
    |        c       |
    |                |
    |                |
    |                |
    |                |
    |                |
    |                |
    |                |
    |                |
    ------------------
*/
const bodyMultiplier = 1.6;
//const mutationFactor = 0.1; //Replaced with mutation rate
const bounceCoeff = 0.3;
const childFoodThreshold = 100;
const childCost = 80;
const traits = {
    speed: 0.3,
    posTurnChance: 1,
    negTurnChance: 1,
    foodPointChance: 1, //Chance the minion will turn towards the nearest food
    mutationRate: 0.2,
    friction: 1,
    turnAmt: 0.2,
    headSize: 15,
    bodySize: 30,
    bodyR: 255,
    bodyG: 255,
    bodyB: 255,
}
class Minion{
    constructor(pos, traits, headColor){
        this.food = 50;
        this.dying = false;
        this.pos = pos; //Pos is at the meeting point between the head and body in the center. See x on above diagram
        this.age = -200;
        this.veloc = [0, 0];
        this.theta = 6.28*Math.random(); //Facing direction in radians. Standard unit circle
        this.goalTheta = this.theta;
        //this.theta = 2;
        this.headSize = traits.headSize;
        this.bodySize = traits.bodySize; //Body size is the short end of the body. Body length is based on bodyMultiplier
        this.oHeadSize = this.headSize;
        this.oBodySize = this.bodySize;
        this.headColor = headColor;
        this.bodyColor = "RGB(" + traits.bodyR + "," + traits.bodyG + "," + traits.bodyB + ")";
        this.traits = traits;
    }
    update(){
        if(!this.dying && this.age >= 0){
            this.food -= 0.0002*Math.pow(this.headSize+this.bodySize, 2);
            this.collision();
            this.pos = vAdd(this.pos, this.veloc);
            this.veloc[0] -= this.traits.friction*this.veloc[0]*0.05;
            this.veloc[1] -= this.traits.friction*this.veloc[1]*0.05;
            if(Math.random() < this.traits.posTurnChance){
                this.goalTheta += this.traits.turnAmt;
                this.food -= this.traits.turnAmt;
            }
            if(Math.random() < this.traits.negTurnChance){
                this.goalTheta -= this.traits.turnAmt;
                this.food -= this.traits.turnAmt;
            }
            if(Math.random() < this.traits.foodPointChance){
                this.pointTowardsNearestFood();
                this.food -= this.traits.turnAmt;
            }
            this.theta += Math.sign(this.goalTheta-this.theta)*this.traits.turnAmt;
            this.veloc[0] += this.traits.speed*Math.cos(this.theta);
            this.veloc[1] += this.traits.speed*Math.sin(this.theta);
            this.food -= this.traits.speed;
            if(this.food < 0){
                this.kill()
            }
            if(this.food > childFoodThreshold){
                this.createChild();
            }
        }
        if(this.dying){
            this.headSize -= 0.01*this.oHeadSize;
            this.bodySize -= 0.01*this.oBodySize;
        }
        else{
            this.age++;
        }
    }
    draw(){
        if(this.age >= 0){
            //Shift amount is x to c on the diagram. Shift to center of minion
            var shiftAmount = this.headSize/2-bodyMultiplier*this.bodySize/2; //this.headSize-(this.headSize+bodyMultiplier*this.bodySize)/2 simplifies to what you see
            var center = [this.pos[0]+shiftAmount, this.pos[1]];
            ctx.save();
            ctx.translate(center[0], center[1]);   
            ctx.rotate(this.theta);
            //Drawing Head
            ctx.fillStyle = this.headColor;
            ctx.fillRect(-shiftAmount, -this.headSize/2, this.headSize, this.headSize);
            //Drawing Body
            ctx.fillStyle = this.bodyColor;
            ctx.fillRect(-shiftAmount-bodyMultiplier*this.bodySize, -this.bodySize/2, this.bodySize*bodyMultiplier, this.bodySize);
            ctx.restore();
        }
        if(this.age < 0){
            var length = (this.headSize+this.bodySize*bodyMultiplier);
            var size = length/Math.log(-this.age);
            size = clamp(size, 0.5, 0.8*length);
            ctx.fillStyle = this.headColor;
            ctx.fillRect(this.pos[0]-size/2, this.pos[1]-size/2, size, size);
        }
    }
    collision(){
        var shiftAmount = this.headSize/2-bodyMultiplier*this.bodySize/2;
        var minionCenter = [this.pos[0]+shiftAmount, this.pos[1]];
        var radius = (this.headSize+bodyMultiplier*this.bodySize)/2;
        //Wall collision
        if(minionCenter[0]-radius < 0){
            this.veloc[0] *= -bounceCoeff;
            this.pos[0] = radius-shiftAmount;
        }
        else if(minionCenter[0]+radius > cvsDim[0]){
            this.veloc[0] *= -bounceCoeff;
            this.pos[0] = cvsDim[0]-radius-shiftAmount;
        }
        if(minionCenter[1]-radius < 0){
            this.veloc[1] *= -bounceCoeff;
            this.pos[1] = radius;
        }
        else if(minionCenter[1]+radius > cvsDim[1]){
            this.veloc[1] *= -bounceCoeff;
            this.pos[1] = cvsDim[1]-radius;
        }
        //Other minion collision
        for(var i = 0; i < minions.length; i++){
            if(minions[i].age >= 0 && minions[i].pos != this.pos){
                var otherMinionCenter = [minions[i].pos[0]+minions[i].headSize/2-bodyMultiplier*minions[i].bodySize/2, minions[i].pos[1]];
                var otherRadius = (minions[i].headSize+bodyMultiplier*minions[i].bodySize)/2;
                if(vDist(minionCenter, otherMinionCenter) < radius+otherRadius){
                    // this.veloc[0] *= -1;
                    // this.veloc[1] *= -1;
                    // if(radius > otherRadius){ //The smaller of the two dies on collision
                    //     minions[i].kill();
                    // }
                }
            }
        }
        //Foods :)
        for(var i = 0; i < foods.length; i++){
            if(!foods[i].eaten){
                if(vDist(minionCenter, foods[i].pos) < radius+foods[i].radius){
                    this.food += foods[i].value;
                    foods[i].eaten = true;
                }
            }
        }
    }
    pointTowardsNearestFood(){
        var shiftAmount = this.headSize/2-bodyMultiplier*this.bodySize/2;
        var minionCenter = [this.pos[0]+shiftAmount, this.pos[1]];
        var minDist = vDist(minionCenter, foods[0].pos);
        var closestFoodPos = foods[0].pos;
        for(var i = 1; i < foods.length; i++){
            if(!foods[i].eaten){
                var dist = vDist(minionCenter, foods[i].pos);
                if(dist < minDist){
                    minDist = dist;
                    closestFoodPos = foods[i].pos;
                }
            }
        }
        this.goalTheta = Math.atan2(closestFoodPos[1]-this.pos[1], closestFoodPos[0]-this.pos[0]);
        this.theta %= 6.28;
    }
    kill(){
        this.bodyColor = "Red";
        this.headColor = "Red"
        this.dying = true;
    }
    createChild(){
        this.food -= childCost;
        minions.push(new Minion(this.pos, mutate(this.traits), this.headColor));
    }
}
function getRandomTraits(){
    var randomizedTraits = {};
    for(var key in traits){
        randomizedTraits[key] = traits[key]*Math.random();
    }
    randomizedTraits.headSize += 2;
    randomizedTraits.bodySize += 2;
    randomizedTraits.headSize = clamp(randomizedTraits.headSize, 2, randomizedTraits.bodySize);
    return randomizedTraits;
}
function mutate(oTraits){
    var newTraits = {};
    for(var key in oTraits){
        newTraits[key] = oTraits[key]+oTraits.mutationRate*(Math.random()-0.5)*traits[key]; //Only mutates by a certain amount of what's reasonable
    }
    newTraits.posTurnChance = clamp(newTraits.posTurnChance, 0, 1);
    newTraits.negTurnChance = clamp(newTraits.negTurnChance, 0, 1);
    newTraits.foodPointChance = clamp(newTraits.foodPointChance, 0, 1);
    newTraits.friction = clamp(newTraits.friction, 0, 1);
    newTraits.bodySize = clamp(newTraits.bodySize, 2, 1000);
    newTraits.headSize = clamp(newTraits.headSize, 2, newTraits.bodySize);
    newTraits.bodyR = clamp(newTraits.bodyR, 0, 255);
    newTraits.bodyG = clamp(newTraits.bodyG, 0, 255);
    newTraits.bodyB = clamp(newTraits.bodyB, 0, 255);
    return newTraits;
}