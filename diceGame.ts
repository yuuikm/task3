import * as crypto from "crypto";

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
    .createHmac("sha3-256", key)
    .update(value.toString())
    .digest("hex");
  return { value, hmac, key };
}

function modularSum(a: number, b: number, mod: number): number {
  return (a + b) % mod;
}

function playDiceGame(dice: number[][]) {
  console.log(`Welcome to the Dice Game!`);
  console.log(`Here are the dice configurations:`);
  dice.forEach((d, i) => console.log(`Dice ${i + 1}: ${d.join(", ")}`));

  const min = 1;
  const max = 6;

  console.log(`Determining who goes first...`);
  const {
    value: compFirstValue,
    hmac: compFirstHmac,
    key: compFirstKey,
  } = generateFairRandom(min, max);
  console.log(`Computer's HMAC: ${compFirstHmac}`);
  const userFirstValue = parseInt(
    prompt(`Select a number between ${min} and ${max}: `) || "1",
    10
  );

  const firstMove = modularSum(compFirstValue, userFirstValue, max);
  console.log(`Computer's number was ${compFirstValue}. Key: ${compFirstKey}`);
  console.log(firstMove % 2 === 0 ? `Computer goes first.` : `You go first.`);

  while (true) {
    console.log(`\nSelect an action:`);
    console.log(`1. Throw a dice`);
    console.log(`2. Exit`);
    const action = parseInt(prompt("Your choice: ") || "2", 10);

    if (action === 2) {
      console.log(`Thanks for playing!`);
      break;
    } else if (action === 1) {
      console.log(`Select a dice:`);
      dice.forEach((d, i) => console.log(`${i + 1}. Dice ${i + 1}`));
      const diceChoice = parseInt(prompt("Your dice choice: ") || "1", 10) - 1;

      if (diceChoice < 0 || diceChoice >= dice.length) {
        console.log(`Invalid dice choice.`);
        continue;
      }

      const {
        value: userRoll,
        hmac: userHmac,
        key: userKey,
      } = generateFairRandom(min, max);
      console.log(`Your HMAC: ${userHmac}`);
      const userNum = parseInt(
        prompt(`Select a number between ${min} and ${max}: `) || "1",
        10
      );
      const finalUserRoll = modularSum(userRoll, userNum, max);

      console.log(`Your number was ${userRoll}. Key: ${userKey}`);
      console.log(`You rolled a ${dice[diceChoice][finalUserRoll - 1]}`);

      const {
        value: compRoll,
        hmac: compHmac,
        key: compKey,
      } = generateFairRandom(min, max);
      console.log(`Computer's HMAC: ${compHmac}`);
      console.log(
        `Computer rolled a ${dice[diceChoice][compRoll - 1]}. Key: ${compKey}`
      );

      if (
        dice[diceChoice][finalUserRoll - 1] > dice[diceChoice][compRoll - 1]
      ) {
        console.log(`You win this round!`);
      } else if (
        dice[diceChoice][finalUserRoll - 1] < dice[diceChoice][compRoll - 1]
      ) {
        console.log(`Computer wins this round!`);
      } else {
        console.log(`It's a tie!`);
      }
    } else {
      console.log(`Invalid action.`);
    }
  }
}

try {
  const args = process.argv.slice(2);
  const dice = parseDice(args);
  playDiceGame(dice);
} catch (error: any) {
  console.error(error.message);
}
