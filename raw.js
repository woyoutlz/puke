function calculateTexasHoldemWinRate(holeCards, board) {

  // 校验输入数据，如果不正确则返回错误信息
  if(!validateTexasHoldemInputs(holeCards, board)) {
    return "输入不正确，请输入两张手牌和 3-5 张公共牌";
  }

  let allCards = holeCards.concat(board); // 组合起来得到总牌数

  let allCombinations = generateAllCombinations(allCards, 5);
  
  let wins = 0;
  let losses = 0;
  let ties = 0;

  for(let i = 0; i < allCombinations.length; i++) {

    let playerCombination = allCombinations[i];
    let opponentCombination = getOpponentCombination(allCards, playerCombination);

    let playerRank = computeRank(playerCombination);
    let opponentRank = computeRank(opponentCombination);

    if(playerRank > opponentRank) {
      wins++;
    } else if(playerRank < opponentRank) {
      losses++;
    } else {
      ties++;
    }
  }

  let total = wins + losses + ties;
  let percentageWins = ((wins + (ties / 2)) / total) * 100;

  return `胜率: ${percentageWins.toFixed(2)}% （${wins}赢/${losses}输/${ties}和）`;
}

// 校验德州扑克输入是否正确
function validateTexasHoldemInputs(holeCards, board) {
  if(holeCards.length !== 2 || (board.length < 3 || board.length > 5)) {
    return false;
  }
  return true;
}

// 生成排列组合数列
function generateAllCombinations(cards, size) {
  let combinations = [];

  function generate(currentIndex, combination) {
    if(combination.length === size) {
      combinations.push(combination);
      return;
    }

    if(currentIndex === cards.length) {
      return;
    }

    generate(currentIndex + 1, [...combination, cards[currentIndex]]);
    generate(currentIndex + 1, combination);
  }

  generate(0, []);
  return combinations;
}

// 获取对手可能的遗传组合 
function getOpponentCombination(totalCards, playerCombination) {
  let possibleOpponentCards = difference(totalCards, playerCombination);
  let opponentCombinations = generateAllCombinations(possibleOpponentCards, 5 - playerCombination.length);
  let bestCombination = [possibleOpponentCards[0], possibleOpponentCards[1], possibleOpponentCards[2], possibleOpponentCards[3], possibleOpponentCards[4]]; 
  
  for(let i = 0; i < opponentCombinations.length; i++) {
    let currentOpponentCombination = opponentCombinations[i];
    let currentBestRank = computeRank(bestCombination);
    let currentRank = computeRank(playerCombination.concat(currentOpponentCombination));
    
    if(currentRank > currentBestRank) {
      bestCombination = playerCombination.concat(currentOpponentCombination);
    }
  }
  return bestCombination;
}
 
// 返回两个数组之间的差异部分.
function difference(a, b) {
  let setB = new Set(b);
  return a.filter(x => !setB.has(x));
}

// 计算给定5张牌的排名。目前只是简单地将它们排序后以字符串形式返回.
function computeRank(cards) {
  let sortedCards = cards.sort();
  return JSON.stringify(sortedCards);
}
// 两张手牌
const playerCards = [
  {suit: 'hearts', rank: 'A'},
  {suit: 'spades', rank: 'K'}
];

// 公共牌
// (可以是3，4或5张牌)
const communityCards = [
  {suit: 'hearts', rank: 'Q'},
  {suit: 'spades', rank: 'J'},
  {suit: 'hearts', rank: '10'},
  {suit: 'diamonds', rank: '9'},
  {suit: 'clubs', rank: '8'}
];

// 调用函数
const winRate = calculateTexasHoldemWinRate(playerCards, communityCards);
console.log(winRate); // 输出胜率（小数）