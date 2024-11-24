import * as readline from "readline";
import * as crypto from "crypto";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

function parseDice(args: string[]): number[][] {
  if (args.length < 3) {
    throw new Error(
      `Invalid number of dice provided. At least 3 dice configurations are required.\n` +
        `Example usage: node diceGame.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3`
    );
  }
  return args.map((arg, index) => {
    const parts = arg.split(",").map((part) => parseInt(part, 10));
    if (parts.length !== 6 || parts.some(isNaN)) {
      throw new Error(
        `Invalid dice configuration at argument ${index + 1}: "${arg}".\n` +
          `Each dice must contain exactly 6 comma-separated integers.\n` +
          `Example usage: node diceGame.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3`
      );
    }
    return parts;
  });
}

function generateFairRandom(
  min: number,
  max: number
): { value: number; hmac: string; key: string } {
  const key = crypto.randomBytes(32).toString("hex");
  const range = max - min + 1;

  let value: number;
  do {
    value = (crypto.randomBytes(4).readUInt32BE() % range) + min;
  } while (value < min || value > max);

  const hmac = crypto
    .createHmac("sha256", key)
    .update(value.toString())
    .digest("hex");
  return { value, hmac, key };
}

function modularSum(a: number, b: number, mod: number): number {
  return (a + b) % mod;
}

async function playDiceGame(dice: number[][]) {
  console.log(`Welcome to the Dice Game!`);
  console.log(`Here are the dice configurations:`);
  dice.forEach((d, i) => console.log(`Dice ${i + 1}: ${d.join(", ")}`));

  console.log(`Let's determine who makes the first move.`);
  const {
    value: compMove,
    hmac: compHmac,
    key: compKey,
  } = generateFairRandom(0, 1);
  console.log(
    `I selected a random value in the range 0..1 (HMAC=${compHmac}).`
  );
  console.log(`Try to guess my selection.`);
  console.log(`0 - 0\n1 - 1\nX - exit\n? - help`);
  const userGuess = (await askQuestion(`Your selection: `)).trim();

  if (userGuess.toLowerCase() === "x") {
    console.log(`Thanks for playing!`);
    rl.close();
    return;
  }

  const userSelection = parseInt(userGuess, 10);
  console.log(`My selection: ${compMove} (KEY=${compKey}).`);
  const computerFirst = compMove !== userSelection;
  console.log(
    computerFirst ? `I make the first move.` : `You make the first move.`
  );

  let computerDiceIndex = 1;
  console.log(`I choose the [${dice[computerDiceIndex].join(", ")}] dice.`);
  console.log(`Choose your dice:`);
  dice.forEach((d, i) => console.log(`${i} - ${d.join(", ")}`));
  console.log(`X - exit\n? - help`);
  const userDiceIndex = parseInt(
    (await askQuestion(`Your selection: `)).trim(),
    10
  );

  if (userDiceIndex < 0 || userDiceIndex >= dice.length) {
    console.log(`Invalid selection. Exiting.`);
    rl.close();
    return;
  }

  console.log(`You choose the [${dice[userDiceIndex].join(", ")}] dice.`);

  console.log(`It's time for my throw.`);
  const {
    value: compRoll,
    hmac: compRollHmac,
    key: compRollKey,
  } = generateFairRandom(0, 5);
  console.log(
    `I selected a random value in the range 0..5 (HMAC=${compRollHmac}).`
  );
  console.log(`Add your number modulo 6.`);
  console.log(`0 - 0\n1 - 1\n2 - 2\n3 - 3\n4 - 4\n5 - 5\nX - exit\n? - help`);
  const userAdd = parseInt((await askQuestion(`Your selection: `)).trim(), 10);

  console.log(`My number is ${compRoll} (KEY=${compRollKey}).`);
  const computerThrow =
    dice[computerDiceIndex][modularSum(compRoll, userAdd, 6)];
  console.log(`My throw is ${computerThrow}.`);

  console.log(`It's time for your throw.`);
  const {
    value: userRoll,
    hmac: userRollHmac,
    key: userRollKey,
  } = generateFairRandom(0, 5);
  console.log(
    `I selected a random value in the range 0..5 (HMAC=${userRollHmac}).`
  );
  console.log(`Add your number modulo 6.`);
  console.log(`0 - 0\n1 - 1\n2 - 2\n3 - 3\n4 - 4\n5 - 5\nX - exit\n? - help`);
  const userAddRoll = parseInt(
    (await askQuestion(`Your selection: `)).trim(),
    10
  );

  console.log(`My number is ${userRoll} (KEY=${userRollKey}).`);
  const userThrow = dice[userDiceIndex][modularSum(userRoll, userAddRoll, 6)];
  console.log(`Your throw is ${userThrow}.`);

  if (userThrow > computerThrow) {
    console.log(`You win (${userThrow} > ${computerThrow})!`);
  } else if (userThrow < computerThrow) {
    console.log(`I win (${computerThrow} > ${userThrow})!`);
  } else {
    console.log(`It's a tie (${userThrow} = ${computerThrow})!`);
  }

  rl.close();
}

(async function main() {
  try {
    const args = process.argv.slice(2);
    const dice = parseDice(args);
    await playDiceGame(dice);
  } catch (error: any) {
    console.error(error.message);
    rl.close();
  }
})();
