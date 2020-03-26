var max_iter = 100;
//defection payoff variable
var d_p=5;
//cooperation payoff variable
var c_p =4
//suckers payoff (when you cooperate and the other defects)
var s_p=0
// defector proportion initially
var p = 0.1

//payoff matrix - use javascript array to start
//for player A - top row is defect, bottom is cooperate
var payoff = [[1, d_p],[s_p, c_p]]

var pC = math.zeros(max_iter);

console.log(pC)
console.log(payoff)
