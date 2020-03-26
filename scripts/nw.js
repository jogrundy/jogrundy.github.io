
//rewritten from matlab code
//%https://uk.mathworks.com/matlabcentral/fileexchange/54484-geometric-prisoners-dilemma?focused=5793445&tab=function

//var col = [0,1,2,3];

var cmap = ['red', 'green', 'yellow', 'blue']

//var fid = 1; // output directed to screen (=1) or elsewhere.. not in js I think!

var max_iter = 10;
//defection payoff variable
var d_p=5;
//cooperation payoff variable
var c_p =4;
//suckers payoff (when you cooperate and the other defects)
var s_p=1;
// defector proportion initially
var p = 0.3;
//size of space used
var N = 60;
var M = 60;

//payoff matrix - use javascript array to start
//for player A - top row is cooperate, bottom is defect
//             - first col is opposition cooperates, second col defects
var payoff = [[c_p, s_p],[d_p, 2]];

//allocations
var pC = [];
var payment=math.zeros(N,M);
var NE = math.zeros(N,M);
var tab=math.zeros(N,M);
var tab_cube=math.zeros(N, M, max_iter);

//initial conditions
E = math.ones(N,M);

// random
// a = math.random()


function rand_mat(N,M) { // makes random matrix N by M
    var zeros = math.zeros(N,M);
    var rand = math.random;
    var RM = zeros.map(function (value, index, matrix){
	var a = rand();
	//console.log(a)
	return a
    });
    return RM;
}



//changing E according to initial proportion of defectors

//matlab code uses 1 for coops and 2 for defectors.
//better here to use 0 for coops and 1 for defectors

function cd_mat(N,M, p){ // makes matrix of coops and defectors
    var A = rand_mat(N,M);
    var E =  A.map(function (value, index, matrix){
	//console.log(value>p);
	if (value<p){
	    //console.log(1)
	    return 1;
	} else {
	    //console.log(0)
	    return 0;
	}});
    return E;
}

function cdc(x,lim){
    // adapts boundary conditions to cope with checkboards limits
    //checkboard becomes torus
    // though i had impression from paper that boundaries were fixed..
    // also need to adapt for zero indexing
    // lim can be M or N

    switch(x){
    case -1: // if moving to the left, -1 becomes lim-1
	y = lim-1;
	break;
    case lim: // if moving right, lim becomes 0
	y=0;
	break;
    default: // not going over edge
	y=x;
	break
    }
    return y
}
	
//var E = cd_mat(N,M, p);
var E = math.zeros(N,M);
E.subset(math.index(30,30), 1)

console.log(E.subset(math.index([0, 1, 2], [0,1,2,3])))
console.log(payoff)

// global loop

console.log("running geometric prisoners dilemma. Please Wait.. \n");
console.log("iteration  \n");

for (iter=0;iter<max_iter;iter++){
    console.log(math.sum(E))
    console.log('  %.2f  \n ', iter);
    // setting payments when each player plays with their 8 neighbours
    // including themselves? i dont think so!
    for (i=0;i<N;i++){
	for (j=0;j<M; j++){
	    var pa =0;
	    for (k=-1;k<2;k++){
		for (h=-1;h<2;h++){
		    if (k == h && h == 0){ // shouldn't play self
			continue
		    }
		    
		    // taking account of boundary conditions
		    var a = cdc(i+k,N);
		    var b = cdc (j+h, M);

		    // setting payment according to selected strategy
		    //get nature of opposition from matrix E
		   
		    // 1 is defector, 0 is cooperator
		    var self_typ = E.subset(math.index(i,j));
		    var opp_typ = E.subset(math.index(a,b));
		    // matrix indexing in mathjs is horrid
		    //console.log('self ', self_typ, [i, j]);
		    //console.log('other ', opp_typ, [a, b]);
		    pa = pa + payoff[self_typ][opp_typ];
		    //console.log('pay ',payoff[self_typ][opp_typ]); 
		    
		}
	    }
	    //console.log(pa);
	    payment.subset(math.index(i,j), pa);
	}
    }

    var NE = math.zeros(N,M);
    console.log(payment.subset(math.index([0, 1, 2],[0,1,2,3])));

    
    // evaluate environment and possible change of strategy

    var prop = 1- (math.sum(E)/(N*M));
    pC.push(prop);
    for (i=0;i<N;i++){
	for (j=0;j<M;j++){
	    
	    var pay = payment.subset(math.index(i,j));
	    NE.subset(math.index(i,j), E.subset(math.index(i,j)));
	    // set new e, NE to be the same as E to start with
	    for (k=-1;k<2;k++){
		for (h=-1;h<2;h++){
		    //taking account of boundary conditions
		    var a = cdc(i+k, N);
		    var b = cdc(j+h, M);
		    // if neighbour performed better, i j player mimics them
		    // mimics the one with the highest payoff
		    if (payment.subset(math.index(a,b)) > pay){
			pay = payment.subset(math.index(a,b));
			//console.log(pay, [i,j],[E.subset(math.index(a, b)), NE.subset(math.index(a, b))])
			NE.subset(math.index(i, j), E.subset(math.index(a, b)));
		    }
		}
	    }
	}
    }

    //console.log('NE ', NE.subset(math.index([0, 1, 2],[0,1,2,3])));
    
    // changes of strategy take effect here..
    // why can't i just make E = NE?
    // becuase I want colour to be from both last strategy and new strategy
    // ie
    //    1 - C->C: blue
    //    2 - D->C: green
    //    3 - C->D: yellow
    //    4 - D->D: red

    // tab_cube holds record of colour for each cell in each iteration
    col = [['blue', 'yellow'], ['green', 'red']]
    for (i=0;i<N;i++){
	for (j=0;j<M;j++){
	    //tab.subset(math.index(i,j), col[E.subset(math.index(i,j))][NE.subset(math.index(i,j))]);
	    tab_cube.subset(math.index(i,k, iter),  col[E.subset(math.index(i,j))][NE.subset(math.index(i,j))]);

	    // update E
	    E.subset(math.index(i,j), NE.subset(math.index(i,j)));
	}
    }
   
    // proportion of cooperators = 1- sum of E/(N*M)
    // as cooperators are 0, defectors are 1


}

console.log('end')


// graphic output

// going to use canvas

// code from https://codereview.stackexchange.com/questions/159317/javascript-implementation-of-conways-game-of-life-with-html5-canvas

//class 
    
    
	    
		    
