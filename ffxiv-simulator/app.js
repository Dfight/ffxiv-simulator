const sim = require('./sim.js');
const set = require('./setting.js');

var log = [], dps = [], sum = 0, totalDamage = 0;
var input = set.set();

var data = sim.run(input);

if (input.simulate.battleLog) {

    var totalDamage = 0;
    for (var i = 0; i < data.length; i++) {
        var t = Math.floor(data[i].time / 6000) + ':' + (data[i].time % 6000) / 100;
        var m = '';
        if (data[i].crit) {
            m += '!';
        }
        if (data[i].dh) {
            m += '!';
        }
        console.log('[' + (data[i].time / 100).toFixed(2) + '] ' + data[i].damage_source + ' => ' + data[i].damage + m);
        totalDamage += data[i].damage;

    }

    console.log('Average DPS: ' + (100 * totalDamage / input.simulate.duration).toFixed(2));
}




/*
for (var i = 0; i < input['sim_set']['times']; i++) {
    var fight = sim.run();               // ??????
    log.push(fight);                     // ????
    dps.push(fight.dps);                 // DPS??
    sum += fight.dps;                    // ???DPS??
}

var max = 'Max dps: ' + Math.max.apply(Math, dps);
var min = 'Min dps: ' + Math.min.apply(Math, dps);
var avg = 'Avg dps: ' + Number(sum / fight.length).toFixed(2);

console.log(max);
console.log(min);
console.log(avg);
console.log('???????' + fight.length);

*/

Array.prototype.max = function () {
    return Math.max.apply(null, this);
};

Array.prototype.min = function () {
    return Math.min.apply(null, this);
};