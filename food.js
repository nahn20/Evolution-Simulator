class Food{
    constructor(pos){
        this.pos = pos; //Is center of circle
        this.radius = 4;
        this.eaten = false;
        this.value = 20;
    }
    draw(){
        ctx.fillStyle = "Green";
        ctx.fillRect(this.pos[0]-this.radius, this.pos[1]-this.radius, 2*this.radius, 2*this.radius);
    }
}