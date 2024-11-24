"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
function parseDice(args) {
    if (args.length < 3) {
        throw new Error("Invalid number of dice provided. At least 3 dice configurations are required.\n" +
            "Example usage: node diceGame.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3");
    }
    return args.map(function (arg, index) {
        var parts = arg.split(",").map(function (part) { return parseInt(part, 10); });
        if (parts.length !== 6 || parts.some(isNaN)) {
            throw new Error("Invalid dice configuration at argument ".concat(index + 1, ": \"").concat(arg, "\".\n") +
                "Each dice must contain exactly 6 comma-separated integers.\n" +
                "Example usage: node diceGame.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3");
        }
        return parts;
    });
}
function generateFairRandom(min, max) {
    var key = crypto.randomBytes(32).toString("hex");
    var range = max - min + 1;
    var value;
    do {
        value = (crypto.randomBytes(4).readUInt32BE() % range) + min;
    } while (value < min || value > max);
    var hmac = crypto
        .createHmac("sha3-256", key)
        .update(value.toString())
        .digest("hex");
    return { value: value, hmac: hmac, key: key };
}
function modularSum(a, b, mod) {
    return (a + b) % mod;
}
function playDiceGame(dice) {
    console.log("Welcome to the Dice Game!");
    console.log("Here are the dice configurations:");
    dice.forEach(function (d, i) { return console.log("Dice ".concat(i + 1, ": ").concat(d.join(", "))); });
    var min = 1;
    var max = 6;
    console.log("Determining who goes first...");
    var _a = generateFairRandom(min, max), compFirstValue = _a.value, compFirstHmac = _a.hmac, compFirstKey = _a.key;
    console.log("Computer's HMAC: ".concat(compFirstHmac));
    var userFirstValue = parseInt(prompt("Select a number between ".concat(min, " and ").concat(max, ": ")) || "1", 10);
    var firstMove = modularSum(compFirstValue, userFirstValue, max);
    console.log("Computer's number was ".concat(compFirstValue, ". Key: ").concat(compFirstKey));
    console.log(firstMove % 2 === 0 ? "Computer goes first." : "You go first.");
    while (true) {
        console.log("\nSelect an action:");
        console.log("1. Throw a dice");
        console.log("2. Exit");
        var action = parseInt(prompt("Your choice: ") || "2", 10);
        if (action === 2) {
            console.log("Thanks for playing!");
            break;
        }
        else if (action === 1) {
            console.log("Select a dice:");
            dice.forEach(function (d, i) { return console.log("".concat(i + 1, ". Dice ").concat(i + 1)); });
            var diceChoice = parseInt(prompt("Your dice choice: ") || "1", 10) - 1;
            if (diceChoice < 0 || diceChoice >= dice.length) {
                console.log("Invalid dice choice.");
                continue;
            }
            var _b = generateFairRandom(min, max), userRoll = _b.value, userHmac = _b.hmac, userKey = _b.key;
            console.log("Your HMAC: ".concat(userHmac));
            var userNum = parseInt(prompt("Select a number between ".concat(min, " and ").concat(max, ": ")) || "1", 10);
            var finalUserRoll = modularSum(userRoll, userNum, max);
            console.log("Your number was ".concat(userRoll, ". Key: ").concat(userKey));
            console.log("You rolled a ".concat(dice[diceChoice][finalUserRoll - 1]));
            var _c = generateFairRandom(min, max), compRoll = _c.value, compHmac = _c.hmac, compKey = _c.key;
            console.log("Computer's HMAC: ".concat(compHmac));
            console.log("Computer rolled a ".concat(dice[diceChoice][compRoll - 1], ". Key: ").concat(compKey));
            if (dice[diceChoice][finalUserRoll - 1] > dice[diceChoice][compRoll - 1]) {
                console.log("You win this round!");
            }
            else if (dice[diceChoice][finalUserRoll - 1] < dice[diceChoice][compRoll - 1]) {
                console.log("Computer wins this round!");
            }
            else {
                console.log("It's a tie!");
            }
        }
        else {
            console.log("Invalid action.");
        }
    }
}
try {
    var args = process.argv.slice(2);
    var dice = parseDice(args);
    playDiceGame(dice);
}
catch (error) {
    console.error(error.message);
}
