// by GPT4.0
const pokersolver = require('pokersolver');
const Hand = pokersolver.Hand;

// const suits = ['c', 'd', 'h', 's'];
const suits = ['♠', '♥', '♦', '♣'];
const ranks = '23456789TJQKA';

function calculateWinRate(playerHand, communityCards) {
  let wins = 0;
  let ties = 0;
  let total = 0;

  const unexposedCards = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      const card = rank + suit;
      if (!playerHand.includes(card) && !communityCards.includes(card)) {
        unexposedCards.push(card);
      }
    }
  }

  const communityCombinations = unexposedCards.length >= 5 - communityCards.length
    ? k_combinations(unexposedCards, 5 - communityCards.length)
    : [communityCards];

  for (const community of communityCombinations) {
    const fullCommunity = community.concat(communityCards);
    const playerBestHand = Hand.solve(playerHand.concat(fullCommunity));

    for (const card1 of unexposedCards) {
      if (community.includes(card1)) continue;
      for (const card2 of unexposedCards) {
        if (community.includes(card2) || card1 === card2) continue;
        const opponentHand = [card1, card2];
        const opponentBestHand = Hand.solve(opponentHand.concat(fullCommunity));
        const winner = Hand.winners([playerBestHand, opponentBestHand]);

        if (winner.length === 1 && winner[0] === playerBestHand) {
          wins++;
        } else if (winner.length === 2) {
          ties++;
        }
        total++;
      }
    }
  }

  return {
    winRate: wins / total,
    tieRate: ties / total
  };
}

function k_combinations(set, k) {
  const combinations = [];
  const n = set.length;

  function helper(start, comb) {
    if (comb.length === k) {
      combinations.push(comb.slice());
      return;
    }

    for (let i = start; i < n; i++) {
      comb.push(set[i]);
      helper(i + 1, comb);
      comb.pop();
    }
  }

  helper(0, []);
  return combinations;
}
function monteCarloSimulation(playerHand, communityCards, numSimulations = 10000) {
  let wins = 0;
  let ties = 0;
  let total = 0;

  for (let i = 0; i < numSimulations; i++) {
    const [opponentHand, fullCommunity] = generateRandomHandAndCommunity(playerHand, communityCards);
    const playerBestHand = Hand.solve(playerHand.concat(fullCommunity));
    const opponentBestHand = Hand.solve(opponentHand.concat(fullCommunity));
    const winner = Hand.winners([playerBestHand, opponentBestHand]);

    if (winner.length === 1 && winner[0] === playerBestHand) {
      wins++;
    } else if (winner.length === 2) {
      ties++;
    }
    total++;
  }

  return {
    winRate: wins / total,
    tieRate: ties / total
  };
}

function generateRandomHandAndCommunity(playerHand, communityCards) {
  const unexposedCards = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      const card = rank + suit;
      if (!playerHand.includes(card) && !communityCards.includes(card)) {
        unexposedCards.push(card);
      }
    }
  }

  const opponentHand = [];
  for (let i = 0; i < 2; i++) {
    const randomIndex = Math.floor(Math.random() * unexposedCards.length);
    opponentHand.push(unexposedCards.splice(randomIndex, 1)[0]);
  }

  const numCommunityCardsNeeded = 5 - communityCards.length;
  const fullCommunity = communityCards.slice();
  for (let i = 0; i < numCommunityCardsNeeded; i++) {
    const randomIndex = Math.floor(Math.random() * unexposedCards.length);
    fullCommunity.push(unexposedCards.splice(randomIndex, 1)[0]);
  }

  return [opponentHand, fullCommunity];
}

// const playerHand = ['Ah', 'Ks'];
// const communityCards = ['Qd', 'Js', 'Th'];
// // const result = calculateWinRate(playerHand, communityCards);
// const result = monteCarloSimulation(playerHand, communityCards);
// console.log(`胜率：${result.winRate.toFixed(4)}，平局率：${result.tieRate.toFixed(4)}`);

module.exports = {
  monteCarloSimulation
}