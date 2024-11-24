"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var readline = require("readline");
var crypto = require("crypto");
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
function askQuestion(query) {
    return new Promise(function (resolve) { return rl.question(query, resolve); });
}
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
        .createHmac("sha256", key)
        .update(value.toString())
        .digest("hex");
    return { value: value, hmac: hmac, key: key };
}
function modularSum(a, b, mod) {
    return (a + b) % mod;
}
function playDiceGame(dice) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, compMove, compHmac, compKey, userGuess, userSelection, computerFirst, computerDiceIndex, userDiceIndex, _b, _c, compRoll, compRollHmac, compRollKey, userAdd, _d, computerThrow, _e, userRoll, userRollHmac, userRollKey, userAddRoll, _f, userThrow;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    console.log("Welcome to the Dice Game!");
                    console.log("Here are the dice configurations:");
                    dice.forEach(function (d, i) { return console.log("Dice ".concat(i + 1, ": ").concat(d.join(", "))); });
                    console.log("Let's determine who makes the first move.");
                    _a = generateFairRandom(0, 1), compMove = _a.value, compHmac = _a.hmac, compKey = _a.key;
                    console.log("I selected a random value in the range 0..1 (HMAC=".concat(compHmac, ")."));
                    console.log("Try to guess my selection.");
                    console.log("0 - 0\n1 - 1\nX - exit\n? - help");
                    return [4 /*yield*/, askQuestion("Your selection: ")];
                case 1:
                    userGuess = (_g.sent()).trim();
                    if (userGuess.toLowerCase() === "x") {
                        console.log("Thanks for playing!");
                        rl.close();
                        return [2 /*return*/];
                    }
                    userSelection = parseInt(userGuess, 10);
                    console.log("My selection: ".concat(compMove, " (KEY=").concat(compKey, ")."));
                    computerFirst = compMove !== userSelection;
                    console.log(computerFirst ? "I make the first move." : "You make the first move.");
                    computerDiceIndex = 1;
                    console.log("I choose the [".concat(dice[computerDiceIndex].join(", "), "] dice."));
                    console.log("Choose your dice:");
                    dice.forEach(function (d, i) { return console.log("".concat(i, " - ").concat(d.join(", "))); });
                    console.log("X - exit\n? - help");
                    _b = parseInt;
                    return [4 /*yield*/, askQuestion("Your selection: ")];
                case 2:
                    userDiceIndex = _b.apply(void 0, [(_g.sent()).trim(),
                        10]);
                    if (userDiceIndex < 0 || userDiceIndex >= dice.length) {
                        console.log("Invalid selection. Exiting.");
                        rl.close();
                        return [2 /*return*/];
                    }
                    console.log("You choose the [".concat(dice[userDiceIndex].join(", "), "] dice."));
                    console.log("It's time for my throw.");
                    _c = generateFairRandom(0, 5), compRoll = _c.value, compRollHmac = _c.hmac, compRollKey = _c.key;
                    console.log("I selected a random value in the range 0..5 (HMAC=".concat(compRollHmac, ")."));
                    console.log("Add your number modulo 6.");
                    console.log("0 - 0\n1 - 1\n2 - 2\n3 - 3\n4 - 4\n5 - 5\nX - exit\n? - help");
                    _d = parseInt;
                    return [4 /*yield*/, askQuestion("Your selection: ")];
                case 3:
                    userAdd = _d.apply(void 0, [(_g.sent()).trim(), 10]);
                    console.log("My number is ".concat(compRoll, " (KEY=").concat(compRollKey, ")."));
                    computerThrow = dice[computerDiceIndex][modularSum(compRoll, userAdd, 6)];
                    console.log("My throw is ".concat(computerThrow, "."));
                    console.log("It's time for your throw.");
                    _e = generateFairRandom(0, 5), userRoll = _e.value, userRollHmac = _e.hmac, userRollKey = _e.key;
                    console.log("I selected a random value in the range 0..5 (HMAC=".concat(userRollHmac, ")."));
                    console.log("Add your number modulo 6.");
                    console.log("0 - 0\n1 - 1\n2 - 2\n3 - 3\n4 - 4\n5 - 5\nX - exit\n? - help");
                    _f = parseInt;
                    return [4 /*yield*/, askQuestion("Your selection: ")];
                case 4:
                    userAddRoll = _f.apply(void 0, [(_g.sent()).trim(),
                        10]);
                    console.log("My number is ".concat(userRoll, " (KEY=").concat(userRollKey, ")."));
                    userThrow = dice[userDiceIndex][modularSum(userRoll, userAddRoll, 6)];
                    console.log("Your throw is ".concat(userThrow, "."));
                    if (userThrow > computerThrow) {
                        console.log("You win (".concat(userThrow, " > ").concat(computerThrow, ")!"));
                    }
                    else if (userThrow < computerThrow) {
                        console.log("I win (".concat(computerThrow, " > ").concat(userThrow, ")!"));
                    }
                    else {
                        console.log("It's a tie (".concat(userThrow, " = ").concat(computerThrow, ")!"));
                    }
                    rl.close();
                    return [2 /*return*/];
            }
        });
    });
}
(function main() {
    return __awaiter(this, void 0, void 0, function () {
        var args, dice, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    args = process.argv.slice(2);
                    dice = parseDice(args);
                    return [4 /*yield*/, playDiceGame(dice)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error(error_1.message);
                    rl.close();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
})();
