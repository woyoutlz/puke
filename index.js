var { monteCarloSimulation } = require("./p2");

window.addValue = function (value) {
  var cardNumber = document.getElementById("card-number");
  cardNumber.value += value;
}
window.cal = function () {
  var cardNumber = document.getElementById("card-number").value;
  const arr = [];

  for (let i = 0; i < cardNumber.length; i += 2) {
    const chunk = cardNumber.slice(i, i + 2);
    arr.push(chunk);
  }

  // Do calculation here
  const p = arr.slice(0, 2)
  const b = arr.slice(2)
  //获取要更改文本的元素
  const element = document.getElementById("result");
  //修改文本内容
  element.textContent = `计算中...`;
  const result = monteCarloSimulation(p, b, 10000);
  console.log(p, b, result)
  //修改文本内容
  element.textContent = `win:${(result.winRate * 100).toFixed(2)},tie:${(result.tieRate * 100).toFixed(2)}`;
}
window.reset = function () {
  var cardNumber = document.getElementById("card-number");
  cardNumber.value = "";
  const element = document.getElementById("result");
  //修改文本内容
  element.textContent = ``;
}