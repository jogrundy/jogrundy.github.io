//rewritten from https://codereview.stackexchange.com/questions/159317/javascript-implementation-of-conways-game-of-life-with-html5-canvas
function all_arr(len, n){
    var arr = [];
    for (let i = 0; i < (len); i++) {
	arr[i] = n;
    }
    return arr
}

function arr_eq(arr1, arr2) {
    if (arr1.length != arr2.length){
	return false;
    } else {
	for (let i = 0; i<arr1.length; i++) {
	    if (arr1[i] != arr2[i]) {
		return false;
	    }
	}
    }
    return true
}

function int_div(a, b){
    return (a/b|0);
}
	
    

class World {
    constructor(width, height, init, b,  wrap ){
	this.width = width;
	this.height = height;
	this.step_count = 0
	this.payoff = [[1,0],[b,0]];//ie payoff[0][1] gives c|d payoff
	//this.init = init
	//this.cells = zero_arr(width*height);
	this.strategy =  all_arr(width*height, 0);//ones for defect, 0s for coop
	this.next_strategy =  all_arr(width*height, 0);
	this.generate(init) // generates starting position
	this.payment =  all_arr(width*height, 0);
	this.wrap = wrap; // can be "none" as well..
	console.log("initialised world class..");
	console.log(init);
    }

    set_d_d(d_d){ //defector defector
	this.payoff[1][1] = d_d;
    }

    set_d_c(d_c) { //you defect, they cooperate
	this.payoff[1][0] = d_c;
    }

    set_c_d(c_d) { //you cooperate, they defect
	this.payoff[0][1] = c_d;
    }

    set_c_c(c_c) { // coopoerate cooperate
	this.payoff[1][1] = c_c;
    }

    get_payoff() { //getter for payoff matrix
	return this.payoff;
    }

    set_strategy (new_strategy){
	this.strategy = new_strategy.slice()
    }
	

    randomise(density=0.1) {
	console.log("randomize")
	let random = math.random;

	for (let i = 0; i<this.strategy.length;i++){
	    this.strategy[i] = random() + density | 0;
	    this.next_strategy[i] = this.strategy[i]
	}
	console.log(this.strategy)
    }

    generate(init) {
	switch(init){
	case "singleD_seed":
	    this.single_seed();
	    break;
	case "singleC_seed":
	    this.coop_seed(1);
	    break;
	case "squareC_seed2":
	    this.coop_seed(2);
	    break;
	case "squareC_seed3":
	    this.coop_seed(3);
	    break;
 	case "plusC_seed":
	    this.coop_plus();
	    break;
	default:
	    this.randomise();
	}
    }

    coop_seed(n){//put seed of cooperators in center
	//of array of defectors
	this.strategy = all_arr(this.width*this.height, 1);
	this.next_strategy = all_arr(this.width*this.height, 1);
	var x = int_div(this.height, 2);
        var y = int_div(this.width, 2);
	for (let k=0;k<n;k++){
	    for (let j=0;j<n;j++){
		var xa = x+k
		var ya = y+j
		console.log("in loop", k, j)
		var i = this.get_i(xa, ya);
		this.strategy[i] = 0;
		this.next_strategy[i] = 0;
	    }
	}
    }

    coop_plus(n){
	this.strategy = all_arr(this.width*this.height, 1);
	this.next_strategy = all_arr(this.width*this.height, 1);
	var x = int_div(this.height, 2);
        var y = int_div(this.width, 2);
	var i = this.get_i(x, y);
	this.strategy[i] = 0;
	this.next_strategy[i] = 0;
	this.strategy[i+1] = 0;
	this.next_strategy[i+1] = 0;
	this.strategy[i-1] = 0;
	this.next_strategy[i-1] = 0;
	this.strategy[i+this.width] = 0;
	this.next_strategy[i+this.width] = 0;
	this.strategy[i-this.width] = 0;
	this.next_strategy[i-this.width] = 0;
    }

    single_seed(){//put single defector seed in center
	//this.strategy initialised as zero array
	this.strategy = all_arr(this.width*this.height, 0);
	this.next_strategy = all_arr(this.width*this.height, 0);
	var x = int_div(this.height, 2);
        var y = int_div(this.width, 2);
	var i = this.get_i(x, y);
	this.strategy[i] = 1;
	this.next_strategy[i] = 1;
    }
	
    clear() {
	let cells = this.strategy;

	for (let i=0;i<cells.length; i++) {
	    cells[i] = 0;
	}
    }

    get_xy(i){
	// takes an index gives a coordinate set
	var [N,M] = [int_div(i,this.width), i%this.height];
	return [N,M];
    }

    get_i(N,M){
	//takes xy coords and gives index
	var i = N*this.width + M;
	return i;
    }
	
    
    toroid_wrap(a,N){// calculate new coordinates if wrapping
	switch(a){
	case(N): //N is this.width or this.height
	    return 0; // so has gone to right/bottom edge, put at left/top
	    break;
	case(-1): // so has gone to left/top edge, put at right/bottom
	    return N-1;
	default:  //otherwise don't need to do anything
	    return a;
	}
    }

   

    payoff_cell_4(i){ // N = row number, M = col number
	// works off payoff for one cell address ii
	var s = this.strategy[i];
	var [N,M] = this.get_xy(i);
	var pa = 0;
	var look = [+1, -1]
	for (let k=0;k<look.length;k++){
	    //look up, look down..
	    if (this.wrap == "none"){
		if (N+look[k] == -1 || N+look[k] == this.width){
			continue;
		    } else {
			var a = N+look[k];
		    }
	    } else if (this.wrap == "toroid"){
		var a = this.toroid_wrap(N+look[k], this.width);
	    }
	    var j = this.get_i(a,M);
	    pa += this.payoff[this.strategy[i]][this.strategy[j]];
	}
	for (let k=0;k<look.length;k++){
	    //look all around (just left and right actually..)
	    if (this.wrap == "none"){
		if (M+look[k] == -1 || M+look[k] == this.height){
		    continue;
		} else {
		    var b = M + look[k]
		}
	    }
	    if (this.wrap == "toroid"){
		var b = this.toroid_wrap(M+look[k], this.height);
	    }
	    var j = this.get_i(N, b);
	    pa += this.payoff[this.strategy[i]][this.strategy[j]]
	}
	//console.log(pa);
	return pa;
    }


    payoff_cell(i){ // N = row number, M = col number
	// works off payoff for one cell address ii
	var s = this.strategy[i];
	var [N,M] = this.get_xy(i);
	var pa = 0;
	
	for (let k=-1;k<2;k++){//varies width, looks left and right
	    for (let h=-1;h<2;h++){ // varies height, looks up and down
		//if (k==h && k==0){// 
		//    continue; // 
		//}
		if (this.wrap == "none"){
		    if (N+k == -1 || N+k == this.height || M+h == -1 || M+h == this.width){
			continue;
		    } else {
			var a = N+k;
			var b = M+h;
		    }
		}
		if (this.wrap == "toroid"){
		    var a = this.toroid_wrap(N+k, this.height);
		    var b = this.toroid_wrap(M+h, this.width);
		}; 
		var j = this.get_i(a,b);
		pa += this.payoff[this.strategy[i]][this.strategy[j]];
	    }
	}
	//console.log(pa);
	return pa;
    }

    update_strategy_4(i){ // 4 around
	
//updates strategies for one cell, puts updated strategy value in 
//this.next_strategy array. 

	var  [N,M] = this.get_xy(i);
	var pay = this.payment[i];
	var look = [+1, -1]
	for (let k=0;k<look.length;k++){
	    //look up, look down..
	    if (this.wrap == "none"){
		if (N+look[k] == -1 || N+look[k] == this.height){
			continue;
		    } else {
			var a = N+look[k];
		    }
	    } else if (this.wrap == "toroid"){
		var a = this.toroid_wrap(N+look[k], this.height);
	    }
	    var j = this.get_i(a, M);
	    var opp = this.payment[j];
	    if (pay < this.payment[j]) {
		this.next_strategy[i] = this.strategy[j];
		pay = this.payment[j];
	    }
		
	}
	for (let k=0;k<look.length;k++){
	    //look all around (just left and right actually..)
	    if (this.wrap == "none"){
		if (M+look[k] == -1 || M+look[k] == this.width){
		    continue;
		} else {
		    var b = M + look[k]
		}
	    } else if (this.wrap == "toroid"){
		var b = this.toroid_wrap(M+look[k], this.width);
	    }
	    var j = this.get_i(N,b);
	    if (pay < this.payment[j]) {
		this.next_strategy[i] = this.strategy[j];
		pay = this.payment[j];
	    }	  
	}

    }

    update_strategy(i){ // eight around
	/* 
updates strategies for one cell, puts updated strategy value in 
this.next_strategy array. 
*/ 
	var  [N,M] = this.get_xy(i);
	var pay = this.payment[i];
	for (let k=-1;k<2;k++){
	    for (let h=-1;h<2;h++){ //doesn't matter if it compares with self
		// however will need to check for wrapping
		if (this.wrap == "none"){
		    if (N+k==-1 || N+k == this.height || M+h == -1 || M+h == this.width){
			continue; // if not wrapped, ignore when goes over limit
		    } else {
			var a = N+k;
			var b = M+h;
		    }
		}
		if (this.wrap == "toroid"){
		    var a = this.toroid_wrap(N+k, this.height);
		    var b = this.toroid_wrap(M+h, this.width);
		}
		var j = this.get_i(a,b);
	
		if (pay < this.payment[j]){
		    this.next_strategy[i] = this.strategy[j];
		    pay = this.payment[j];
		}
	    }
	}
	//console.log(this.strategy[i] == this.next_strategy[i])
    }
     
	
    step(){
	this.step_count = this.step_count + 1
	console.log(this.step_count)
	document.getElementById("step").innerHTML = this.step_count;
	let height = this.height,
	    width = this.width;

	// set up game logic -
	// work out payoff for each cell
	// put it in this.payment array
	// then update strategy

	for (let i=0;i<(height*width);i++){
	    var pa = this.payoff_cell(i);
	    this.payment[i] = pa;
	    //console.log(this.payment[i]);
	}
	for (let i=0;i<(height*width);i++){
	    this.update_strategy(i)
	    // works out next_strategy
	    
	}
	console.log(arr_eq(this.next_strategy, this.strategy))
    }
	
}

class Game {
    constructor (canvas, width=21, height =21, b=1.9 ,init, wrap){
	this.canvas = canvas;
	this.context = canvas.getContext("2d");
	this.canvas.style.width = "400px";
	this.canvas.style.height = "400px"
	this.initialise(width, height, b, init, wrap);
	this.interval=undefined;
	console.log("initialised game object");
    }

    initialise(width, height, b, init, wrap) {
	this.world = new World(width, height, b, init, wrap);
	document.getElementById("step").innerHTML = this.world.step_count;
	this.canvas.width = width;
	this.canvas.height = height;
	this.draw(this.context);
    }

    update(){
	console.log("in update");
	this.world.step();
	this.draw(this.context);
	this.world.set_strategy(this.world.next_strategy);
    }


    start(speed=25){
	clearInterval(this.interval);
	this.interval = setInterval(this.update.bind(this), speed);
    }

    stop(){
	clearInterval(this.interval);
	this.interval = undefined;
    }
    running(){
	return !!this.interval;
    }

    draw(context){
	console.log("in draw(context)")
	console.log(this.world.strategy)
	let imageData = context.getImageData(0,0,this.world.width, this.world.height),
	    data = imageData.data,

	    //r, g, b, alpha - red, green, blue, yellow
	    n = this.world.next_strategy,
	    s = this.world.strategy, // last strategy
	    cmap = [[[0, 0,255, 255], [255,255,0, 255]], //blue, yellow
		    [[0,255,0, 255],[255,0,0, 255]]]; // green, blue
	// corresponding to four colours, C|C, C|D, D|C, D|D..
	// blue green blue yellow

	for (let i=0;i<s.length;i+=1){

	     var map = cmap[s[i]][n[i]];
	     data[4*i + 0] = map[0];
	     data[4*i + 1] = map[1];
	     data[4*i + 2] = map[2];
	     data[4*i + 3] = map[3];
	   
	 }
	context.putImageData(imageData, 0, 0);
	
	
    }   
}
    
let canvas = document.getElementById('canvas'),

    startBtn = document.getElementById("btn-start"),
    stepBtn = document.getElementById("btn-step"),
    generateBtn = document.getElementById("btn-generate"),
    widthBtn = document.getElementById("btn-width"),
    resetBtn = document.getElementById("btn-reset"),
    wrapBtn = document.getElementById("btn-wrap"),
    bBtn = document.getElementById("btn-b"),
    game = new Game(canvas);

game.initialise(+widthBtn.value, +widthBtn.value, generateBtn.value, +bBtn.value, wrapBtn.value)
console.log("should have both game and world object");

stepBtn.addEventListener("click", function(event) {
    console.log("in step button");
    game.update()
});

document.getElementById("step").innerHTML = game.world.step_count;

startBtn.addEventListener("click", function(event) {
  if (game.running()) {
      game.stop();
       startBtn.value="Start";
    //startBtn.textContent = "Start";
  } else {
      game.start();
      startBtn.value="Stop";
    //startBtn.textContent = "Stop";
  }
});

generateBtn.addEventListener("change", function(event) {
    console.log("generate button value");
    console.log(generateBtn.value);
    game.initialise(+widthBtn.value, +widthBtn.value, generateBtn.value, +bBtn.value, wrapBtn.value);
});

widthBtn.addEventListener("change", function(event) {
    game.initialise(+widthBtn.value, +widthBtn.value, generateBtn.value, +bBtn.value, wrapBtn.value);
});

wrapBtn.addEventListener("change", function(event) {
    game.initialise(+widthBtn.value, +widthBtn.value, generateBtn.value, +bBtn.value, wrapBtn.value);
});

resetBtn.addEventListener("click", function(event) {
    console.log("reset");
    game.initialise(+widthBtn.value, +widthBtn.value, generateBtn.value, +bBtn.value, wrapBtn.value);
});

bBtn.addEventListener("change", function(event) {
    game.initialise(+widthBtn.value, +widthBtn.value, generateBtn.value, +bBtn.value, wrapBtn.value);
});



//game.initialise(+widthBtn.value, +heightBtn.value, +generateBtn.value);

