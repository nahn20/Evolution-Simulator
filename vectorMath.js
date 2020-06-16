//Treats arrays like vectors
function vAdd(v1, v2){
    if(v1.length != v2.length){
        console.log("Error: Vector mismatch length.");
        return null
    }
    var v3 = [];
    for(var i = 0; i < v1.length; i++){
        v3[i] = v1[i] + v2[i];
    }
    return v3;
}
function vDist(v1, v2){
    if(v1.length != v2.length){
        console.log("Error: Vector mismatch length.");
        return null
    }
    var sum = 0;
    for(var i = 0; i < v1.length; i++){
        sum += Math.pow(v1[i]-v2[i], 2);
    }
    return Math.sqrt(sum);
}