// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"node_modules/pokersolver/pokersolver.js":[function(require,module,exports) {
var global = arguments[3];
/**
 * pokersolver v2.1.2
 * Copyright (c) 2016, James Simpson of GoldFire Studios
 * http://goldfirestudios.com
 */

(function() {
  'use strict';

  // NOTE: The 'joker' will be denoted with a value of 'O' and any suit.
  var values = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

  /**
   * Base Card class that defines a single card.
   */
  class Card {
    constructor(str) {
      this.value = str.substr(0, 1);
      this.suit = str.substr(1, 1).toLowerCase();
      this.rank = values.indexOf(this.value);
      this.wildValue = str.substr(0, 1);
    }

    toString() {
      return this.wildValue.replace('T', '10') + this.suit;
    }

    static sort(a, b) {
      if (a.rank > b.rank) {
        return -1;
      } else if (a.rank < b.rank) {
        return 1;
      } else {
        return 0;
      }
    }
  }

  /**
   * Base Hand class that handles comparisons of full hands.
   */
  class Hand {
    constructor(cards, name, game, canDisqualify) {
      this.cardPool = [];
      this.cards = [];
      this.suits = {};
      this.values = [];
      this.wilds = [];
      this.name = name;
      this.game = game;
      this.sfLength = 0;
      this.alwaysQualifies = true;

      // Qualification rules apply for dealer's hand.
      // Also applies for single player games, like video poker.
      if (canDisqualify && this.game.lowestQualified) {
        this.alwaysQualifies = false;
      }

      // Ensure no duplicate cards in standard game.
      if (game.descr === 'standard' && new Set(cards).size !== cards.length) {
        throw new Error('Duplicate cards');
      }
      
      // Get rank based on game.
      var handRank = this.game.handValues.length;
      for (var i=0; i<this.game.handValues.length; i++) {
        if (this.game.handValues[i] === this.constructor) {
          break;
        }
      }
      this.rank = handRank - i;

      // Set up the pool of cards.
      this.cardPool = cards.map(function(c) {
        return (typeof c === 'string') ? new Card(c) : c;
      });

      // Fix the card ranks for wild cards, and sort.
      for (var i=0; i<this.cardPool.length; i++) {
        card = this.cardPool[i];
        if (card.value === this.game.wildValue) {
          card.rank = -1;
        }
      }
      this.cardPool = this.cardPool.sort(Card.sort);

      // Create the arrays of suits and values.
      var obj, obj1, key, key1, card;
      for (var i=0; i<this.cardPool.length; i++) {
        // Make sure this value already exists in the object.
        card = this.cardPool[i];

        // We do something special if this is a wild card.
        if (card.rank === -1) {
          this.wilds.push(card);
        } else {
          (obj = this.suits)[key = card.suit] || (obj[key] = []);
          (obj1 = this.values)[key1 = card.rank] || (obj1[key1] = []);

          // Add the value to the array for that type in the object.
          this.suits[card.suit].push(card);
          this.values[card.rank].push(card);
        }
      }

      this.values.reverse();
      this.isPossible = this.solve();
    }

    /**
     * Compare current hand with another to determine which is the winner.
     * @param  {Hand} a Hand to compare to.
     * @return {Number}
     */
    compare(a) {
      if (this.rank < a.rank) {
        return 1;
      } else if (this.rank > a.rank) {
        return -1;
      }

      var result = 0;
      for (var i=0; i<=4; i++) {
        if (this.cards[i] && a.cards[i] && this.cards[i].rank < a.cards[i].rank) {
          result = 1;
          break;
        } else if (this.cards[i] && a.cards[i] && this.cards[i].rank > a.cards[i].rank) {
          result = -1;
          break;
        }
      }

      return result;
    }

    /**
     * Determine whether a hand loses to another.
     * @param  {Hand} hand Hand to compare to.
     * @return {Boolean}
     */
    loseTo(hand) {
      return (this.compare(hand) > 0);
    }

    /**
     * Determine the number of cards in a hand of a rank.
     * @param  {Number} val Index of this.values.
     * @return {Number} Number of cards having the rank, including wild cards.
     */
    getNumCardsByRank(val) {
      var cards = this.values[val];
      var checkCardsLength = (cards) ? cards.length : 0;

      for (var i=0; i<this.wilds.length; i++) {
        if (this.wilds[i].rank > -1) {
          continue;
        } else if (cards) {
          if (this.game.wildStatus === 1 || cards[0].rank === values.length - 1) {
            checkCardsLength += 1;
          }
        } else if (this.game.wildStatus === 1 || val === values.length - 1) {
          checkCardsLength += 1;
        }
      }

      return checkCardsLength;
    }

    /**
     * Determine the cards in a suit for a flush.
     * @param  {String} suit Key for this.suits.
     * @param  {Boolean} setRanks Whether to set the ranks for the wild cards.
     * @return {Array} Cards having the suit, including wild cards.
     */
    getCardsForFlush(suit, setRanks) {
      var cards = (this.suits[suit] || []).sort(Card.sort);

      for (var i=0; i<this.wilds.length; i++) {
        var wild = this.wilds[i];

        if (setRanks) {
          var j=0;
          while (j<values.length && j<cards.length) {
            if (cards[j].rank === values.length-1-j) {
              j += 1;
            } else {
              break;
            }
          }
          wild.rank = values.length-1-j;
          wild.wildValue = values[wild.rank];
        }

        cards.push(wild);
        cards = cards.sort(Card.sort);
      }

      return cards;
    }

    /**
     * Resets the rank and wild values of the wild cards.
     */
    resetWildCards() {
      for (var i=0; i<this.wilds.length; i++) {
        this.wilds[i].rank = -1;
        this.wilds[i].wildValue = this.wilds[i].value;
      }
    }

    /**
     * Highest card comparison.
     * @return {Array} Highest cards
     */
    nextHighest() {
      var picks;
      var excluding = [];
      excluding = excluding.concat(this.cards);

      picks = this.cardPool.filter(function(card) {
        if (excluding.indexOf(card) < 0) {
          return true;
        }
      });

      // Account for remaining wild card when it must be ace.
      if (this.game.wildStatus === 0) {
        for (var i=0; i<picks.length; i++) {
          var card = picks[i];
          if (card.rank === -1) {
            card.wildValue = 'A';
            card.rank = values.length - 1;
          }
        }
        picks = picks.sort(Card.sort);
      }

      return picks;
    }

    /**
     * Return list of contained cards in human readable format.
     * @return {String}
     */
    toString() {
      var cards = this.cards.map(function(c) {
        return c.toString();
      });

      return cards.join(', ');
    }

    /**
     * Return array of contained cards.
     * @return {Array}
     */
    toArray() {
      var cards = this.cards.map(function(c) {
        return c.toString();
      });

      return cards;
    }

    /**
     * Determine if qualifying hand.
     * @return {Boolean}
     */
    qualifiesHigh() {
      if (!this.game.lowestQualified || this.alwaysQualifies) {
        return true;
      }

      return (this.compare(Hand.solve(this.game.lowestQualified, this.game)) <= 0);
    }

    /**
     * Find highest ranked hands and remove any that don't qualify or lose to another hand.
     * @param  {Array} hands Hands to evaluate.
     * @return {Array}       Winning hands.
     */
    static winners(hands) {
      hands = hands.filter(function(h) {
        return h.qualifiesHigh();
      });

      var highestRank = Math.max.apply(Math, hands.map(function(h) {
        return h.rank;
      }));

      hands = hands.filter(function(h) {
        return h.rank === highestRank;
      });

      hands = hands.filter(function(h) {
        var lose = false;
        for (var i=0; i<hands.length; i++) {
          lose = h.loseTo(hands[i]);
          if (lose) {
            break;
          }
        }

        return !lose;
      });

      return hands;
    }

    /**
     * Build and return the best hand.
     * @param  {Array} cards Array of cards (['Ad', '3c', 'Th', ...]).
     * @param  {String} game Game being played.
     * @param  {Boolean} canDisqualify Check for a qualified hand.
     * @return {Hand}       Best hand.
     */
    static solve(cards, game, canDisqualify) {
      game = game || 'standard';
      game = (typeof game === 'string') ? new Game(game) : game;
      cards = cards || [''];

      var hands = game.handValues;
      var result = null;

      for (var i=0; i<hands.length; i++) {
        result = new hands[i](cards, game, canDisqualify);
        if (result.isPossible) {
          break;
        }
      }

      return result;
    }

    /**
     * Separate cards based on if they are wild cards.
     * @param  {Array} cards Array of cards (['Ad', '3c', 'Th', ...]).
     * @param  {Game} game Game being played.
     * @return {Array} [wilds, nonWilds] Wild and non-Wild Cards.
     */
    static stripWilds(cards, game) {
      var card, wilds, nonWilds;
      cards = cards || [''];
      wilds = [];
      nonWilds = [];

      for (var i=0; i<cards.length; i++) {
        card = cards[i];
        if (card.rank === -1) {
          wilds.push(cards[i]);  
        } else {
          nonWilds.push(cards[i]);  
        }
      }

      return [wilds, nonWilds];
    }
  }

  class StraightFlush extends Hand {
    constructor(cards, game, canDisqualify) {
      super(cards, 'Straight Flush', game, canDisqualify);
    }

    solve() {
      var cards;
      this.resetWildCards();
      var possibleStraight = null;
      var nonCards = [];

      for (var suit in this.suits) {
        cards = this.getCardsForFlush(suit, false);
        if (cards && cards.length >= this.game.sfQualify) {
          possibleStraight = cards;
          break;
        } 
      }

      if (possibleStraight) {
        if (this.game.descr !== 'standard') {
          for (var suit in this.suits) {
            if (possibleStraight[0].suit !== suit) {
              nonCards = nonCards.concat(this.suits[suit] || []);
              nonCards = Hand.stripWilds(nonCards, this.game)[1];
            }
          }
        }
        var straight = new Straight(possibleStraight, this.game);
        if (straight.isPossible) {
          this.cards = straight.cards;
          this.cards = this.cards.concat(nonCards);
          this.sfLength = straight.sfLength;
        }
      }

      if (this.cards[0] && this.cards[0].rank === 13) {
        this.descr = 'Royal Flush';
      } else if (this.cards.length >= this.game.sfQualify) {
        this.descr = this.name + ', ' + this.cards[0].toString().slice(0, -1) + suit + ' High';
      }

      return this.cards.length >= this.game.sfQualify;
    }
  }

  class RoyalFlush extends StraightFlush {
    constructor(cards, game, canDisqualify) {
      super(cards, game, canDisqualify);
    }

    solve() {
      this.resetWildCards();
      var result = super.solve();
      return result && this.descr === 'Royal Flush';
    }
  }

  class NaturalRoyalFlush extends RoyalFlush {
    constructor(cards, game, canDisqualify) {
      super(cards, game, canDisqualify);
    }

    solve() {
      var i = 0;
      this.resetWildCards();
      var result = super.solve();
      if (result && this.cards) {
        for (i=0; i<this.game.sfQualify && i<this.cards.length; i++) {
          if (this.cards[i].value === this.game.wildValue) {
            result = false;
            this.descr = 'Wild Royal Flush';
            break;
          }
        }
        if (i === this.game.sfQualify) {
          this.descr = 'Royal Flush';
        }
      }
      return result;
    }
  }

  class WildRoyalFlush extends RoyalFlush {
    constructor(cards, game, canDisqualify) {
      super(cards, game, canDisqualify);
    }

    solve() {
      var i = 0;
      this.resetWildCards();
      var result = super.solve();
      if (result && this.cards) {
        for (i=0; i<this.game.sfQualify && i<this.cards.length; i++) {
          if (this.cards[i].value === this.game.wildValue) {
            this.descr = 'Wild Royal Flush';
            break;
          }
        }
        if (i === this.game.sfQualify) {
          result = false;
          this.descr = 'Royal Flush';
        }
      }
      return result;
    }
  }

  class FiveOfAKind extends Hand {
    constructor(cards, game, canDisqualify) {
      super(cards, 'Five of a Kind', game, canDisqualify);
    }

    solve() {
      this.resetWildCards();

      for (var i=0; i<this.values.length; i++) {
        if (this.getNumCardsByRank(i) === 5) {
          this.cards = this.values[i] || [];
          for (var j=0; j<this.wilds.length && this.cards.length<5; j++) {
            var wild = this.wilds[j];
            if (this.cards) {
              wild.rank = this.cards[0].rank;
            } else {
              wild.rank = values.length - 1;
            }
            wild.wildValue = values[wild.rank];
            this.cards.push(wild);
          }
          this.cards = this.cards.concat(this.nextHighest().slice(0, this.game.cardsInHand-5));
          break;
        }
      }

      if (this.cards.length >= 5) {
        this.descr = this.name + ', ' + this.cards[0].toString().slice(0, -1) + '\'s';
      }

      return this.cards.length >= 5;
    }
  }

  class FourOfAKindPairPlus extends Hand {
    constructor(cards, game, canDisqualify) {
      super(cards, 'Four of a Kind with Pair or Better', game, canDisqualify);
    }

    solve() {
      var cards;
      this.resetWildCards();

      for (var i=0; i<this.values.length; i++) {
        if (this.getNumCardsByRank(i) === 4) {
          this.cards = this.values[i] || [];
          for (var j=0; j<this.wilds.length && this.cards.length<4; j++) {
            var wild = this.wilds[j];
            if (this.cards) {
              wild.rank = this.cards[0].rank;
            } else {
              wild.rank = values.length - 1;
            }
            wild.wildValue = values[wild.rank];
            this.cards.push(wild);
          }
          break;
        }
      }

      if (this.cards.length === 4) {
        for (i=0; i<this.values.length; i++) {
          cards = this.values[i];
          if (cards && this.cards[0].wildValue === cards[0].wildValue) {
            continue;
          }
          if (this.getNumCardsByRank(i) >= 2) {
            this.cards = this.cards.concat(cards || []);
            for (var j=0; j<this.wilds.length; j++) {
              var wild = this.wilds[j];
              if (wild.rank !== -1) {
                continue;
              }
              if (cards) {
                wild.rank = cards[0].rank;
              } else if (this.cards[0].rank === values.length - 1 && this.game.wildStatus === 1) {
                wild.rank = values.length - 2;
              } else {
                wild.rank = values.length - 1;
              }
              wild.wildValue = values[wild.rank];
              this.cards.push(wild);
            }
            this.cards = this.cards.concat(this.nextHighest().slice(0, this.game.cardsInHand-6));
            break;
          }
        }
      }

      if (this.cards.length >= 6) {
        var type = this.cards[0].toString().slice(0, -1) + '\'s over ' + this.cards[4].toString().slice(0, -1) + '\'s';
        this.descr = this.name + ', ' + type;
      }

      return this.cards.length >= 6;
    }
  }

  class FourOfAKind extends Hand {
    constructor(cards, game, canDisqualify) {
      super(cards, 'Four of a Kind', game, canDisqualify);
    }

    solve() {
      this.resetWildCards();

      for (var i=0; i<this.values.length; i++) {
        if (this.getNumCardsByRank(i) === 4) {
          this.cards = this.values[i] || [];
          for (var j=0; j<this.wilds.length && this.cards.length<4; j++) {
            var wild = this.wilds[j];
            if (this.cards) {
              wild.rank = this.cards[0].rank;
            } else {
              wild.rank = values.length - 1;
            }
            wild.wildValue = values[wild.rank];
            this.cards.push(wild);
          }

          this.cards = this.cards.concat(this.nextHighest().slice(0, this.game.cardsInHand-4));
          break;
        }
      }

      if (this.cards.length >= 4) {
        if (this.game.noKickers) {
          this.cards.length = 4;
        }

        this.descr = this.name + ', ' + this.cards[0].toString().slice(0, -1) + '\'s';
      }

      return this.cards.length >= 4;
    }
  }

  class FourWilds extends Hand {
    constructor(cards, game, canDisqualify) {
      super(cards, 'Four Wild Cards', game, canDisqualify);
    }

    solve() {
      if (this.wilds.length === 4) {
        this.cards = this.wilds;
        this.cards = this.cards.concat(this.nextHighest().slice(0, this.game.cardsInHand-4));
      }

      if (this.cards.length >= 4) {
        if (this.game.noKickers) {
          this.cards.length = 4;
        }

        this.descr = this.name;
      }

      return this.cards.length >= 4;
    }
  }

  class ThreeOfAKindTwoPair extends Hand {
    constructor(cards, game, canDisqualify) {
      super(cards, 'Three of a Kind with Two Pair', game, canDisqualify);
    }

    solve() {
      var cards;
      this.resetWildCards();

      for (var i=0; i<this.values.length; i++) {
        if (this.getNumCardsByRank(i) === 3) {
          this.cards = this.values[i] || [];
          for (var j=0; j<this.wilds.length && this.cards.length<3; j++) {
            var wild = this.wilds[j];
            if (this.cards) {
              wild.rank = this.cards[0].rank;
            } else {
              wild.rank = values.length - 1;
            }
            wild.wildValue = values[wild.rank];
            this.cards.push(wild);
          }
          break;
        }
      }

      if (this.cards.length === 3) {
        for (var i=0; i<this.values.length; i++) {
          var cards = this.values[i];
          if (cards && this.cards[0].wildValue === cards[0].wildValue) {
            continue;
          }
          if (this.cards.length > 5 && this.getNumCardsByRank(i) === 2) {
            this.cards = this.cards.concat(cards || []);
            for (var j=0; j<this.wilds.length; j++) {
              var wild = this.wilds[j];
              if (wild.rank !== -1) {
                continue;
              }
              if (cards) {
                wild.rank = cards[0].rank;
              } else if (this.cards[0].rank === values.length - 1 && this.game.wildStatus === 1) {
                wild.rank = values.length - 2;
              } else {
                wild.rank = values.length - 1;
              }
              wild.wildValue = values[wild.rank];
              this.cards.push(wild);
            }
            this.cards = this.cards.concat(this.nextHighest().slice(0, this.game.cardsInHand-4));
            break;
          } else if (this.getNumCardsByRank(i) === 2) {
            this.cards = this.cards.concat(cards);
            for (var j=0; j<this.wilds.length; j++) {
              var wild = this.wilds[j];
              if (wild.rank !== -1) {
                continue;
              }
              if (cards) {
                wild.rank = cards[0].rank;
              } else if (this.cards[0].rank === values.length - 1 && this.game.wildStatus === 1) {
                wild.rank = values.length - 2;
              } else {
                wild.rank = values.length - 1;
              }
              wild.wildValue = values[wild.rank];
              this.cards.push(wild);
            }
          }
        }
      }

      if (this.cards.length >= 7) {
        var type = this.cards[0].toString().slice(0, -1) + '\'s over ' + this.cards[3].toString().slice(0, -1) + '\'s & ' + this.cards[5].value + '\'s';
        this.descr = this.name + ', ' + type;
      }

      return this.cards.length >= 7;
    }
  }

  class FullHouse extends Hand {
    constructor(cards, game, canDisqualify) {
      super(cards, 'Full House', game, canDisqualify);
    }

    solve() {
      var cards;
      this.resetWildCards();

      for (var i=0; i<this.values.length; i++) {
        if (this.getNumCardsByRank(i) === 3) {
          this.cards = this.values[i] || [];
          for (var j=0; j<this.wilds.length && this.cards.length<3; j++) {
            var wild = this.wilds[j];
            if (this.cards) {
              wild.rank = this.cards[0].rank;
            } else {
              wild.rank = values.length - 1;
            }
            wild.wildValue = values[wild.rank];
            this.cards.push(wild);
          }
          break;
        }
      }

      if (this.cards.length === 3) {
        for (i=0; i<this.values.length; i++) {
          cards = this.values[i];
          if (cards && this.cards[0].wildValue === cards[0].wildValue) {
            continue;
          }
          if (this.getNumCardsByRank(i) >= 2) {
            this.cards = this.cards.concat(cards || []);
            for (var j=0; j<this.wilds.length; j++) {
              var wild = this.wilds[j];
              if (wild.rank !== -1) {
                continue;
              }
              if (cards) {
                wild.rank = cards[0].rank;
              } else if (this.cards[0].rank === values.length - 1 && this.game.wildStatus === 1) {
                wild.rank = values.length - 2;
              } else {
                wild.rank = values.length - 1;
              }
              wild.wildValue = values[wild.rank];
              this.cards.push(wild);
            }
            this.cards = this.cards.concat(this.nextHighest().slice(0, this.game.cardsInHand-5));
            break;
          }
        }
      }

      if (this.cards.length >= 5) {
        var type = this.cards[0].toString().slice(0, -1) + '\'s over ' + this.cards[3].toString().slice(0, -1) + '\'s';
        this.descr = this.name + ', ' + type;
      }

      return this.cards.length >= 5;
    }
  }

  class Flush extends Hand {
    constructor(cards, game, canDisqualify) {
      super(cards, 'Flush', game, canDisqualify);
    }

    solve() {
      this.sfLength = 0;
      this.resetWildCards();

      for (var suit in this.suits) {
        var cards = this.getCardsForFlush(suit, true);
        if (cards.length >= this.game.sfQualify) {
          this.cards = cards;
          break;
        }
      }

      if (this.cards.length >= this.game.sfQualify) {
        this.descr = this.name + ', ' + this.cards[0].toString().slice(0, -1) + suit + ' High';
        this.sfLength = this.cards.length;
        if (this.cards.length < this.game.cardsInHand) {
          this.cards = this.cards.concat(this.nextHighest().slice(0, this.game.cardsInHand-this.cards.length));
        }
      }

      return this.cards.length >= this.game.sfQualify;
    }
  }

  class Straight extends Hand {
    constructor(cards, game, canDisqualify) {
      super(cards, 'Straight', game, canDisqualify);
    }

    solve() {
      var card, checkCards;
      this.resetWildCards();

      // There are still some games that count the wheel as second highest.
      // These games do not have enough cards/wilds to make AKQJT and 5432A both possible.
      if (this.game.wheelStatus === 1) {
        this.cards = this.getWheel();
        if (this.cards.length) {
          var wildCount = 0;
          for (var i=0; i<this.cards.length; i++) {
            card = this.cards[i];
            if (card.value === this.game.wildValue) {
              wildCount += 1;
            }
            if (card.rank === 0) {
              card.rank = values.indexOf('A');
              card.wildValue = 'A';
              if (card.value === '1') {
                card.value = 'A';
              }
            }
          }
          this.cards = this.cards.sort(Card.sort);
          for (; wildCount<this.wilds.length && this.cards.length < this.game.cardsInHand; wildCount++) {
            card = this.wilds[wildCount];
            card.rank = values.indexOf('A');
            card.wildValue = 'A';
            this.cards.push(card);
          }
          this.descr = this.name + ', Wheel';
          this.sfLength = this.sfQualify;
          if (this.cards[0].value === 'A') {
            this.cards = this.cards.concat(this.nextHighest().slice(1, this.game.cardsInHand-this.cards.length+1));
          } else {
            this.cards = this.cards.concat(this.nextHighest().slice(0, this.game.cardsInHand-this.cards.length));
          }
          return true;
        }
        this.resetWildCards();
      }

      this.cards = this.getGaps();

      // Now add the wild cards, if any, and set the appropriate ranks
      for (var i=0; i<this.wilds.length; i++) {
        card = this.wilds[i];
        checkCards = this.getGaps(this.cards.length);
        if (this.cards.length === checkCards.length) {
          // This is an "open-ended" straight, the high rank is the highest possible rank.
          if (this.cards[0].rank < (values.length - 1)) {
            card.rank = this.cards[0].rank + 1;
            card.wildValue = values[card.rank];
            this.cards.push(card);
          } else {
            card.rank = this.cards[this.cards.length - 1].rank - 1;
            card.wildValue = values[card.rank];
            this.cards.push(card);
          }
        } else {
          // This is an "inside" straight, the high card doesn't change.
          for (var j=1; j<this.cards.length; j++) {
            if (this.cards[j-1].rank - this.cards[j].rank > 1) {
              card.rank = this.cards[j-1].rank - 1;
              card.wildValue = values[card.rank];
              this.cards.push(card);
              break;
            }
          }
        }
        this.cards = this.cards.sort(Card.sort);
      }
      if (this.cards.length >= this.game.sfQualify) {
        this.descr = this.name + ', ' + this.cards[0].toString().slice(0, -1) + ' High';
        this.cards = this.cards.slice(0, this.game.cardsInHand);
        this.sfLength = this.cards.length;
        if (this.cards.length < this.game.cardsInHand) {
          if (this.cards[this.sfLength-1].rank === 0) {
            this.cards = this.cards.concat(this.nextHighest().slice(1, this.game.cardsInHand-this.cards.length+1));
          } else {
            this.cards = this.cards.concat(this.nextHighest().slice(0, this.game.cardsInHand-this.cards.length));
          }
        }
      }

      return this.cards.length >= this.game.sfQualify;
    }

    /**
     * Get the number of gaps in the straight.
     * @return {Array} Highest potential straight with fewest number of gaps.
     */
    getGaps(checkHandLength) {
      var wildCards, cardsToCheck, i, card, gapCards, cardsList, gapCount, prevCard, diff;

      var stripReturn = Hand.stripWilds(this.cardPool, this.game);
      wildCards = stripReturn[0];
      cardsToCheck = stripReturn[1];

      for (i=0; i<cardsToCheck.length; i++) {
        card = cardsToCheck[i];
        if (card.wildValue === 'A') {
          cardsToCheck.push(new Card('1' + card.suit));
        }
      }
      cardsToCheck = cardsToCheck.sort(Card.sort);

      if (checkHandLength) {
        i = cardsToCheck[0].rank + 1;
      } else {
        checkHandLength = this.game.sfQualify;
        i = values.length;
      }

      gapCards = [];
      for (; i>0; i--) {
        cardsList = [];
        gapCount = 0;
        for (var j=0; j<cardsToCheck.length; j++) {
          card = cardsToCheck[j];
          if (card.rank > i) {
            continue;
          }
          prevCard = cardsList[cardsList.length - 1];
          diff = (prevCard) ? prevCard.rank - card.rank : i - card.rank;

          if (diff === null) {
            cardsList.push(card);
          } else if (checkHandLength < (gapCount + diff + cardsList.length)) {
            break;
          } else if (diff > 0) {
            cardsList.push(card);
            gapCount += (diff - 1);
          }
        }
        if (cardsList.length > gapCards.length) {
          gapCards = cardsList.slice();
        }
        if (this.game.sfQualify - gapCards.length <= wildCards.length) {
          break;
        }
      }

      return gapCards;
    }

    getWheel() {
      var wildCards, cardsToCheck, i, card, wheelCards, wildCount, cardFound;

      var stripReturn = Hand.stripWilds(this.cardPool, this.game);
      wildCards = stripReturn[0];
      cardsToCheck = stripReturn[1];

      for (i=0; i<cardsToCheck.length; i++) {
        card = cardsToCheck[i];
        if (card.wildValue === 'A') {
          cardsToCheck.push(new Card('1' + card.suit));
        }
      }
      cardsToCheck = cardsToCheck.sort(Card.sort);

      wheelCards = [];
      wildCount = 0;
      for (i = this.game.sfQualify-1; i>=0; i--) {
        cardFound = false;
        for (var j=0; j<cardsToCheck.length; j++) {
          card = cardsToCheck[j];
          if (card.rank > i) {
            continue;
          }
          if (card.rank < i) {
            break;
          }
          wheelCards.push(card);
          cardFound = true;
          break;
        }
        if (!cardFound) {
          if (wildCount < wildCards.length) {
            wildCards[wildCount].rank = i;
            wildCards[wildCount].wildValue = values[i];
            wheelCards.push(wildCards[wildCount]);
            wildCount += 1;
          } else {
            return [];
          }
        }
      }

      return wheelCards;
    }
  }

  class TwoThreeOfAKind extends Hand {
    constructor(cards, game, canDisqualify) {
      super(cards, 'Two Three Of a Kind', game, canDisqualify);
    }

    solve() {
      this.resetWildCards();
      for (var i=0; i<this.values.length; i++) {
        var cards = this.values[i];
        if (this.cards.length > 0 && this.getNumCardsByRank(i) === 3) {
          this.cards = this.cards.concat(cards || []);
          for (var j=0; j<this.wilds.length; j++) {
            var wild = this.wilds[j];
            if (wild.rank !== -1) {
              continue;
            }
            if (cards) {
              wild.rank = cards[0].rank;
            } else if (this.cards[0].rank === values.length - 1 && this.game.wildStatus === 1) {
              wild.rank = values.length - 2;
            } else {
              wild.rank = values.length - 1;
            }
            wild.wildValue = values[wild.rank];
            this.cards.push(wild);
          }
          this.cards = this.cards.concat(this.nextHighest().slice(0, this.game.cardsInHand-6));
          break;
        } else if (this.getNumCardsByRank(i) === 3) {
          this.cards = this.cards.concat(cards);
          for (var j=0; j<this.wilds.length; j++) {
            var wild = this.wilds[j];
            if (wild.rank !== -1) {
              continue;
            }
            if (cards) {
              wild.rank = cards[0].rank;
            } else if (this.cards[0].rank === values.length - 1 && this.game.wildStatus === 1) {
              wild.rank = values.length - 2;
            } else {
              wild.rank = values.length - 1;
            }
            wild.wildValue = values[wild.rank];
            this.cards.push(wild);
          }
        }
      }

      if (this.cards.length >= 6) {
        var type = this.cards[0].toString().slice(0, -1) + '\'s & ' + this.cards[3].toString().slice(0, -1) + '\'s';
        this.descr = this.name + ', ' + type;
      }

      return this.cards.length >= 6;
    }
  }

  class ThreeOfAKind extends Hand {
    constructor(cards, game, canDisqualify) {
      super(cards, 'Three of a Kind', game, canDisqualify);
    }

    solve() {
      this.resetWildCards();

      for (var i=0; i<this.values.length; i++) {
        if (this.getNumCardsByRank(i) === 3) {
          this.cards = this.values[i] || [];
          for (var j=0; j<this.wilds.length && this.cards.length<3; j++) {
            var wild = this.wilds[j];
            if (this.cards) {
              wild.rank = this.cards[0].rank;
            } else {
              wild.rank = values.length - 1;
            }
            wild.wildValue = values[wild.rank];
            this.cards.push(wild);
          }
          this.cards = this.cards.concat(this.nextHighest().slice(0, this.game.cardsInHand-3));
          break;
        }
      }

      if (this.cards.length >= 3) {
        if (this.game.noKickers) {
          this.cards.length = 3;
        }

        this.descr = this.name + ', ' + this.cards[0].toString().slice(0, -1) + '\'s';
      }

      return this.cards.length >= 3;
    }
  }

  class ThreePair extends Hand {
    constructor(cards, game, canDisqualify) {
      super(cards, 'Three Pair', game, canDisqualify);
    }

    solve() {
      this.resetWildCards();

      for (var i=0; i<this.values.length; i++) {
        var cards = this.values[i];
        if (this.cards.length > 2 && this.getNumCardsByRank(i) === 2) {
          this.cards = this.cards.concat(cards || []);
          for (var j=0; j<this.wilds.length; j++) {
            var wild = this.wilds[j];
            if (wild.rank !== -1) {
              continue;
            }
            if (cards) {
              wild.rank = cards[0].rank;
            } else if (this.cards[0].rank === values.length - 1 && this.game.wildStatus === 1) {
              wild.rank = values.length - 2;
            } else {
              wild.rank = values.length - 1;
            }
            wild.wildValue = values[wild.rank];
            this.cards.push(wild);
          }
          this.cards = this.cards.concat(this.nextHighest().slice(0, this.game.cardsInHand-6));
          break;
        } else if (this.cards.length > 0 && this.getNumCardsByRank(i) === 2) {
          this.cards = this.cards.concat(cards || []);
          for (var j=0; j<this.wilds.length; j++) {
            var wild = this.wilds[j];
            if (wild.rank !== -1) {
              continue;
            }
            if (cards) {
              wild.rank = cards[0].rank;
            } else if (this.cards[0].rank === values.length - 1 && this.game.wildStatus === 1) {
              wild.rank = values.length - 2;
            } else {
              wild.rank = values.length - 1;
            }
            wild.wildValue = values[wild.rank];
            this.cards.push(wild);
          }
        } else if (this.getNumCardsByRank(i) === 2) {
          this.cards = this.cards.concat(cards);
          for (var j=0; j<this.wilds.length; j++) {
            var wild = this.wilds[j];
            if (wild.rank !== -1) {
              continue;
            }
            if (cards) {
              wild.rank = cards[0].rank;
            } else if (this.cards[0].rank === values.length - 1 && this.game.wildStatus === 1) {
              wild.rank = values.length - 2;
            } else {
              wild.rank = values.length - 1;
            }
            wild.wildValue = values[wild.rank];
            this.cards.push(wild);
          }
        }
      }

      if (this.cards.length >= 6) {
        var type = this.cards[0].toString().slice(0, -1) + '\'s & ' + this.cards[2].toString().slice(0, -1) + '\'s & ' + this.cards[4].toString().slice(0, -1) + '\'s';
        this.descr = this.name + ', ' + type;
      }

      return this.cards.length >= 6;
    }
  }

  class TwoPair extends Hand {
    constructor(cards, game, canDisqualify) {
      super(cards, 'Two Pair', game, canDisqualify);
    }

    solve() {
      this.resetWildCards();

      for (var i=0; i<this.values.length; i++) {
        var cards = this.values[i];
        if (this.cards.length > 0 && this.getNumCardsByRank(i) === 2) {
          this.cards = this.cards.concat(cards || []);
          for (var j=0; j<this.wilds.length; j++) {
            var wild = this.wilds[j];
            if (wild.rank !== -1) {
              continue;
            }
            if (cards) {
              wild.rank = cards[0].rank;
            } else if (this.cards[0].rank === values.length - 1 && this.game.wildStatus === 1) {
              wild.rank = values.length - 2;
            } else {
              wild.rank = values.length - 1;
            }
            wild.wildValue = values[wild.rank];
            this.cards.push(wild);
          }
          this.cards = this.cards.concat(this.nextHighest().slice(0, this.game.cardsInHand-4));
          break;
        } else if (this.getNumCardsByRank(i) === 2) {
          this.cards = this.cards.concat(cards);
          for (var j=0; j<this.wilds.length; j++) {
            var wild = this.wilds[j];
            if (wild.rank !== -1) {
              continue;
            }
            if (cards) {
              wild.rank = cards[0].rank;
            } else if (this.cards[0].rank === values.length - 1 && this.game.wildStatus === 1) {
              wild.rank = values.length - 2;
            } else {
              wild.rank = values.length - 1;
            }
            wild.wildValue = values[wild.rank];
            this.cards.push(wild);
          }
        }
      }

      if (this.cards.length >= 4) {
        if (this.game.noKickers) {
          this.cards.length = 4;
        }

        var type = this.cards[0].toString().slice(0, -1) + '\'s & ' + this.cards[2].toString().slice(0, -1) + '\'s';
        this.descr = this.name + ', ' + type;
      }

      return this.cards.length >= 4;
    }
  }

  class OnePair extends Hand {
    constructor(cards, game, canDisqualify) {
      super(cards, 'Pair', game, canDisqualify);
    }

    solve() {
      this.resetWildCards();

      for (var i=0; i<this.values.length; i++) {
        if (this.getNumCardsByRank(i) === 2) {
          this.cards = this.cards.concat(this.values[i] || []);
          for (var j=0; j<this.wilds.length && this.cards.length<2; j++) {
            var wild = this.wilds[j];
            if (this.cards) {
              wild.rank = this.cards[0].rank;
            } else {
              wild.rank = values.length - 1;
            }
            wild.wildValue = values[wild.rank];
            this.cards.push(wild);
          }
          this.cards = this.cards.concat(this.nextHighest().slice(0, this.game.cardsInHand-2));
          break;
        }
      }

      if (this.cards.length >= 2) {
        if (this.game.noKickers) {
          this.cards.length = 2;
        }

        this.descr = this.name + ', ' + this.cards[0].toString().slice(0, -1) + '\'s';
      }

      return this.cards.length >= 2;
    }
  }

  class HighCard extends Hand {
    constructor(cards, game, canDisqualify) {
      super(cards, 'High Card', game, canDisqualify);
    }

    solve() {
      this.cards = this.cardPool.slice(0, this.game.cardsInHand);

      for (var i=0; i<this.cards.length; i++) {
        var card = this.cards[i];
        if (this.cards[i].value === this.game.wildValue) {
          this.cards[i].wildValue = 'A';
          this.cards[i].rank = values.indexOf('A');
        }
      }

      if (this.game.noKickers) {
        this.cards.length = 1;
      }

      this.cards = this.cards.sort(Card.sort);
      this.descr = this.cards[0].toString().slice(0, -1) + ' High';

      return true;
    }
  }

  /*
   * Base class for handling Pai Gow Poker hands.
   * House Way is in accordance with the MGM Grand Casino, Las Vegas NV.
   * http://wizardofodds.com/games/pai-gow-poker/house-way/mgm/
   * EXCEPTION: With Four of a Kind and S/F, preserve the S/F, just like Three of a Kind.
   */
  class PaiGowPokerHelper {
    /*
     * Constructor class.
     * @param {Hand} hand Solved hand against Game 'paigowpokerfull'.
     */
    constructor(hand) {
      this.baseHand = null;
      this.hiHand = null;
      this.loHand = null;
      this.game = null;
      this.loGame = new Game('paigowpokerlo');
      this.hiGame = new Game('paigowpokerhi');

      if (Array.isArray(hand)) {
        this.baseHand = Hand.solve(hand, new Game('paigowpokerfull'));
      } else {
        this.baseHand = hand;
      }

      this.game = this.baseHand.game;
    }

    /*
     * Set a full hand into high and low hands, according to House Way.
     */
    splitHouseWay() {
      var hiCards, loCards;
      var rank = this.game.handValues.length - this.baseHand.rank;
      var handValue = this.game.handValues[rank];

      if (handValue === FiveOfAKind) {
        if (this.baseHand.cards[5].value === 'K' && this.baseHand.cards[6].value === 'K') {
          loCards = this.baseHand.cards.slice(5, 7);
          hiCards = this.baseHand.cards.slice(0, 5);
        } else {
          loCards = this.baseHand.cards.slice(0, 2);
          hiCards = this.baseHand.cards.slice(2, 7);
        }
      } else if (handValue === FourOfAKindPairPlus) {
        if (this.baseHand.cards[0].wildValue === 'A' && this.baseHand.cards[4].value !== 'K') {
          hiCards = this.baseHand.cards.slice(0, 2);
          loCards = this.baseHand.cards.slice(2, 4);
          hiCards = hiCards.concat(this.baseHand.cards.slice(4, 7));
        } else {
          hiCards = this.baseHand.cards.slice(0, 4);
          loCards = this.baseHand.cards.slice(4, 6);
          hiCards.push(this.baseHand.cards[6]);
        }
      } else if (handValue === StraightFlush || handValue === Flush || handValue === Straight) {
        var sfReturn;
        var altGame = new Game('paigowpokeralt');
        var altHand = Hand.solve(this.baseHand.cards, altGame);
        var altRank = altGame.handValues.length - altHand.rank;
        if (altGame.handValues[altRank] === FourOfAKind) {
          sfReturn = this.getSFData(altHand.cards);
          hiCards = sfReturn[0];
          loCards = sfReturn[1];
        } else if (altGame.handValues[altRank] === FullHouse) {
          hiCards = altHand.cards.slice(0, 3);
          loCards = altHand.cards.slice(3, 5);
          hiCards = hiCards.concat(altHand.cards.slice(5, 7));
        } else if (altGame.handValues[altRank] === ThreeOfAKind) {
          sfReturn = this.getSFData(altHand.cards);
          hiCards = sfReturn[0];
          loCards = sfReturn[1];
        } else if (altGame.handValues[altRank] === ThreePair) {
          loCards = altHand.cards.slice(0, 2);
          hiCards = altHand.cards.slice(2, 7);
        } else if (altGame.handValues[altRank] === TwoPair) {
          if (altHand.cards[0].rank < 6) {
            if (altHand.cards[4].wildValue === 'A') {
              hiCards = altHand.cards.slice(0, 4);
              loCards = altHand.cards.slice(4, 6);
              hiCards.push(altHand.cards[6]);
            } else {
              sfReturn = this.getSFData(altHand.cards);
              hiCards = sfReturn[0];
              loCards = sfReturn[1];
            }
          } else if (altHand.cards[0].rank < 10) {
            if (altHand.cards[4].wildValue === 'A') {
              hiCards = altHand.cards.slice(0, 4);
              loCards = altHand.cards.slice(4, 6);
              hiCards.push(altHand.cards[6]);
            } else {
              hiCards = altHand.cards.slice(0, 2);
              loCards = altHand.cards.slice(2, 4);
              hiCards = hiCards.concat(altHand.cards.slice(4, 7));
            }
          } else if (altHand.cards[0].wildValue !== 'A' && altHand.cards[2].rank < 6 && altHand.cards[4].wildValue === 'A') {
            hiCards = altHand.cards.slice(0, 4);
            loCards = altHand.cards.slice(4, 6);
            hiCards.push(altHand.cards[6]);
          } else {
            hiCards = altHand.cards.slice(0, 2);
            loCards = altHand.cards.slice(2, 4);
            hiCards = hiCards.concat(altHand.cards.slice(4, 7));
          }
        } else if (altGame.handValues[altRank] === OnePair) {
          if (altHand.cards[0].rank >= values.indexOf('T') && altHand.cards[0].rank <= values.indexOf('K') && altHand.cards[2].wildValue === 'A') {
            var possibleSF = altHand.cards.slice(0, 2);
            possibleSF = possibleSF.concat(altHand.cards.slice(3, 7));
            sfReturn = this.getSFData(possibleSF);
            if (sfReturn[0]) {
              hiCards = sfReturn[0];
              loCards = sfReturn[1];
              loCards.push(altHand.cards[2]);
            } else {
              hiCards = altHand.cards.slice(0, 2);
              loCards = altHand.cards.slice(2, 4);
              hiCards = hiCards.concat(altHand.cards.slice(4, 7));
            }
          } else {
            sfReturn = this.getSFData(altHand.cards.slice(2, 7));
            if (sfReturn[0]) {
              hiCards = sfReturn[0];
              loCards = altHand.cards.slice(0, 2);
            } else {
              sfReturn = this.getSFData(altHand.cards);
              hiCards = sfReturn[0];
              loCards = sfReturn[1];
            }
          }
        } else {
          sfReturn = this.getSFData(altHand.cards);
          hiCards = sfReturn[0];
          loCards = sfReturn[1];
        }
      } else if (handValue === FourOfAKind) {
        if (this.baseHand.cards[0].rank < 6) {
          hiCards = this.baseHand.cards.slice(0, 4);
          loCards = this.baseHand.cards.slice(4, 6);
          hiCards.push(this.baseHand.cards[6]);
        } else if (this.baseHand.cards[0].rank < 10 && this.baseHand.cards[4].wildValue === 'A') {
          hiCards = this.baseHand.cards.slice(0, 4);
          loCards = this.baseHand.cards.slice(4, 6);
          hiCards.push(this.baseHand.cards[6]);
        } else {
          hiCards = this.baseHand.cards.slice(0, 2);
          loCards = this.baseHand.cards.slice(2, 4);
          hiCards = hiCards.concat(this.baseHand.cards.slice(4, 7));
        }
      } else if (handValue === TwoThreeOfAKind) {
        loCards = this.baseHand.cards.slice(0, 2);
        hiCards = this.baseHand.cards.slice(3, 6);
        hiCards.push(this.baseHand.cards[2]);
        hiCards.push(this.baseHand.cards[6]);
      } else if (handValue === ThreeOfAKindTwoPair) {
        hiCards = this.baseHand.cards.slice(0, 3);
        loCards = this.baseHand.cards.slice(3, 5);
        hiCards = hiCards.concat(this.baseHand.cards.slice(5, 7));
      } else if (handValue === FullHouse) {
        if (this.baseHand.cards[3].wildValue === '2' && this.baseHand.cards[5].wildValue === 'A' && this.baseHand.cards[6].wildValue === 'K') {
          hiCards = this.baseHand.cards.slice(0, 5);
          loCards = this.baseHand.cards.slice(5, 7);
        } else {
          hiCards = this.baseHand.cards.slice(0, 3);
          loCards = this.baseHand.cards.slice(3, 5);
          hiCards = hiCards.concat(this.baseHand.cards.slice(5, 7));
        }
      } else if (handValue === ThreeOfAKind) {
        if (this.baseHand.cards[0].wildValue === 'A') {
          hiCards = this.baseHand.cards.slice(0, 2);
          loCards = this.baseHand.cards.slice(2, 4);
          hiCards = hiCards.concat(this.baseHand.cards.slice(4, 7));
        } else {
          hiCards = this.baseHand.cards.slice(0, 3);
          loCards = this.baseHand.cards.slice(3, 5);
          hiCards = hiCards.concat(this.baseHand.cards.slice(5, 7));
        }
      } else if (handValue === ThreePair) {
        loCards = this.baseHand.cards.slice(0, 2);
        hiCards = this.baseHand.cards.slice(2, 7);
      } else if (handValue === TwoPair) {
        if (this.baseHand.cards[0].rank < 6) {
          hiCards = this.baseHand.cards.slice(0, 4);
          loCards = this.baseHand.cards.slice(4, 6);
          hiCards.push(this.baseHand.cards[6]);
        } else if (this.baseHand.cards[0].rank < 10) {
          if (this.baseHand.cards[4].wildValue === 'A') {
            hiCards = this.baseHand.cards.slice(0, 4);
            loCards = this.baseHand.cards.slice(4, 6);
            hiCards.push(this.baseHand.cards[6]);
          } else {
            hiCards = this.baseHand.cards.slice(0, 2);
            loCards = this.baseHand.cards.slice(2, 4);
            hiCards = hiCards.concat(this.baseHand.cards.slice(4, 7));
          }
        } else if (this.baseHand.cards[0].wildValue !== 'A' && this.baseHand.cards[2].rank < 6 && this.baseHand.cards[4].wildValue === 'A') {
          hiCards = this.baseHand.cards.slice(0, 4);
          loCards = this.baseHand.cards.slice(4, 6);
          hiCards.push(this.baseHand.cards[6]);
        } else {
          hiCards = this.baseHand.cards.slice(0, 2);
          loCards = this.baseHand.cards.slice(2, 4);
          hiCards = hiCards.concat(this.baseHand.cards.slice(4, 7));
        }
      } else if (handValue === OnePair) {
        hiCards = this.baseHand.cards.slice(0, 2);
        loCards = this.baseHand.cards.slice(2, 4);
        hiCards = hiCards.concat(this.baseHand.cards.slice(4, 7));
      } else {
        hiCards = [this.baseHand.cards[0]];
        loCards = this.baseHand.cards.slice(1, 3);
        hiCards = hiCards.concat(this.baseHand.cards.slice(3, 7));
      }

      this.hiHand = Hand.solve(hiCards, this.hiGame);
      this.loHand = Hand.solve(loCards, this.loGame);
    }

    /*
     * Determine the best possible Straight and/or Flush.
     * @param  {Array} cards 5-7 Card objects to check.
     * @return {Array} [hiCards, loCards] High and Low components, if any.
     */
    getSFData(cards) {
      var hiCards, possibleLoCards, bestLoCards, bestHand;
      var handsToCheck = [
        new StraightFlush(cards, new Game('paigowpokersf7')),
        new StraightFlush(cards, new Game('paigowpokersf6')),
        new StraightFlush(cards, this.game),
        new Flush(cards, new Game('paigowpokersf7')),
        new Flush(cards, new Game('paigowpokersf6')),
        new Flush(cards, this.game),
        new Straight(cards, new Game('paigowpokersf7')),
        new Straight(cards, new Game('paigowpokersf6')),
        new Straight(cards, this.game)
      ];

      for (var i=0; i<handsToCheck.length; i++) {
        var hand = handsToCheck[i];
        if (hand.isPossible) {
          if (hand.sfLength === 7) {
            possibleLoCards = [hand.cards[0], hand.cards[1]];
          } else if (hand.sfLength === 6) {
            possibleLoCards = [hand.cards[0]];
            if (cards.length > 6) {
              possibleLoCards.push(hand.cards[6]);
            }
          } else if (cards.length > 5) {
            possibleLoCards = [hand.cards[5]];
            if (cards.length > 6) {
              possibleLoCards.push(hand.cards[6]);
            }
          }
          if (possibleLoCards) {
            possibleLoCards = possibleLoCards.sort(Card.sort);
            if (!bestLoCards || bestLoCards[0].rank < possibleLoCards[0].rank || (bestLoCards.length > 1 && bestLoCards[0].rank === possibleLoCards[0].rank && bestLoCards[1].rank < possibleLoCards[1].rank)) {
              bestLoCards = possibleLoCards;
              bestHand = hand;
            }
          } else if (!bestHand) {
            bestHand = hand;
            break;
          }
        }
      }

      if (bestHand) {
        if (bestHand.sfLength === 7) {
          hiCards = bestHand.cards.slice(2, 7);
        } else if (bestHand.sfLength === 6) {
          hiCards = bestHand.cards.slice(1, 6);
        } else {
          hiCards = bestHand.cards.slice(0, 5);
        }
      }

      return [hiCards, bestLoCards];
    }

    /*
     * Determine if the setting of the hands is valid. Hi must be higher than lo.
     * @return {Boolean}
     */
    qualifiesValid() {
      var compareHands = Hand.winners([this.hiHand, this.loHand]);

      return !(compareHands.length === 1 && compareHands[0] === this.loHand);
    }

    /**
     * Find which of two split hands is best, according to rules.
     * @param  {PaiGowPokerHelper} player Player hand to evaluate. Must be set.
     * @param  {PaiGowPokerHelper} banker Banker hand to evaluate. Must be set.
     * @param  {int}               winner Winning party, if any.
     *                                    Player = 1, Banker = -1, Push = 0
     */
    static winners(player, banker) {
      if (!player.qualifiesValid()) {
        if (banker.qualifiesValid()) {
          return -1;
        }
        // Probably shouldn't get here because the dealer must set house way.
        // However, we'll still have it as a sanity check, just in case.
        return 0;
      }

      if (!banker.qualifiesValid()) {
        return 1;
      }

      var hiWinner = Hand.winners([player.hiHand, banker.hiHand]);
      var loWinner = Hand.winners([player.loHand, banker.loHand]);

      // In Pai Gow Poker, Banker takes any equal valued hands.
      if (hiWinner.length === 1 && hiWinner[0] === player.hiHand) {
        if (loWinner.length === 1 && loWinner[0] === player.loHand) {
          // Player wins both; player wins
          return 1;
        }
        // Player wins hi, Banker wins lo; push
        return 0;
      }

      if (loWinner.length === 1 && loWinner[0] === player.loHand) {
        // Banker wins hi, Player wins lo; push
        return 0;
      }

      // Banker wins both; banker wins
      return -1;
    }

    /*
     * Set a full hand into high and low hands, according to manual input.
     * @param  {Array} hiHand       High hand to specify.
     *                              Can also be {Hand} with game of 'paigowpokerhi'.
     * @param  {Array} loHand       Low hand to specify.
     *                              Can also be {Hand} with game of 'paigowpokerlo'.
     * @return {PaiGowPokerHelper}  Object with split hands.
     */
    static setHands(hiHand, loHand) {
      var fullHand = [];

      if (Array.isArray(hiHand)) {
        hiHand = Hand.solve(hiHand, new Game('paigowpokerhi'));
      }
      fullHand = fullHand.concat(hiHand.cardPool);
      if (Array.isArray(loHand)) {
        loHand = Hand.solve(loHand, new Game('paigowpokerlo'));
      }
      fullHand = fullHand.concat(loHand.cardPool);

      var result = new PaiGowPokerHelper(fullHand);
      result.hiHand = hiHand;
      result.loHand = loHand;

      return result;
    }

    /**
     * Build and return PaiGowPokerHelper object with hands split House Way.
     * @param  {Array} fullHand    Array of cards (['Ad', '3c', 'Th', ...]).
     *                             Can also be {Hand} with game of 'paigowpokerfull'.
     * @return {PaiGowPokerHelper} Object with split hands.
     */
    static solve(fullHand) {
      var result = new PaiGowPokerHelper(fullHand = fullHand || ['']);
      result.splitHouseWay();

      return result;
    }
  }

  var gameRules = {
    'standard': {
      'cardsInHand': 5,
      'handValues': [StraightFlush, FourOfAKind, FullHouse, Flush, Straight, ThreeOfAKind, TwoPair, OnePair, HighCard],
      'wildValue': null,
      'wildStatus': 1,
      'wheelStatus': 0,
      'sfQualify': 5,
      'lowestQualified': null,
      "noKickers": false
    },
    'jacksbetter': {
      'cardsInHand': 5,
      'handValues': [StraightFlush, FourOfAKind, FullHouse, Flush, Straight, ThreeOfAKind, TwoPair, OnePair, HighCard],
      'wildValue': null,
      'wildStatus': 1,
      'wheelStatus': 0,
      'sfQualify': 5,
      'lowestQualified': ['Jc', 'Jd', '4h', '3s', '2c'],
      "noKickers": true
    },
    'joker': {
      'cardsInHand': 5,
      'handValues': [NaturalRoyalFlush, FiveOfAKind, WildRoyalFlush, StraightFlush, FourOfAKind, FullHouse, Flush, Straight, ThreeOfAKind, TwoPair, HighCard],
      'wildValue': 'O',
      'wildStatus': 1,
      'wheelStatus': 0,
      'sfQualify': 5,
      'lowestQualified': ['4c', '3d', '3h', '2s', '2c'],
      "noKickers": true
    },
    'deuceswild': {
      'cardsInHand': 5,
      'handValues': [NaturalRoyalFlush, FourWilds, WildRoyalFlush, FiveOfAKind, StraightFlush, FourOfAKind, FullHouse, Flush, Straight, ThreeOfAKind, HighCard],
      'wildValue': '2',
      'wildStatus': 1,
      'wheelStatus': 0,
      'sfQualify': 5,
      'lowestQualified': ['5c', '4d', '3h', '3s', '3c'],
      "noKickers": true
    },
    'threecard': {
      'cardsInHand': 3,
      'handValues': [StraightFlush, ThreeOfAKind, Straight, Flush, OnePair, HighCard],
      'wildValue': null,
      'wildStatus': 1,
      'wheelStatus': 0,
      'sfQualify': 3,
      'lowestQualified': ['Qh', '3s', '2c'],
      "noKickers": false
    },
    'fourcard': {
      'cardsInHand': 4,
      'handValues': [FourOfAKind, StraightFlush, ThreeOfAKind, Flush, Straight, TwoPair, OnePair, HighCard],
      'wildValue': null,
      'wildStatus': 1,
      'wheelStatus': 0,
      'sfQualify': 4,
      'lowestQualified': null,
      "noKickers": true
    },
    'fourcardbonus': {
      'cardsInHand': 4,
      'handValues': [FourOfAKind, StraightFlush, ThreeOfAKind, Flush, Straight, TwoPair, OnePair, HighCard],
      'wildValue': null,
      'wildStatus': 1,
      'wheelStatus': 0,
      'sfQualify': 4,
      'lowestQualified': ['Ac', 'Ad', '3h', '2s'],
      "noKickers": true
    },
    'paigowpokerfull': {
      'cardsInHand': 7,
      'handValues': [FiveOfAKind, FourOfAKindPairPlus, StraightFlush, Flush, Straight, FourOfAKind, TwoThreeOfAKind, ThreeOfAKindTwoPair, FullHouse, ThreeOfAKind, ThreePair, TwoPair, OnePair, HighCard],
      'wildValue': 'O',
      'wildStatus': 0,
      'wheelStatus': 1,
      'sfQualify': 5,
      'lowestQualified': null
    },
    'paigowpokeralt': {
      'cardsInHand': 7,
      'handValues': [FourOfAKind, FullHouse, ThreeOfAKind, ThreePair, TwoPair, OnePair, HighCard],
      'wildValue': 'O',
      'wildStatus': 0,
      'wheelStatus': 1,
      'sfQualify': 5,
      'lowestQualified': null
    },
    'paigowpokersf6': {
      'cardsInHand': 7,
      'handValues': [StraightFlush, Flush, Straight],
      'wildValue': 'O',
      'wildStatus': 0,
      'wheelStatus': 1,
      'sfQualify': 6,
      'lowestQualified': null
    },
    'paigowpokersf7': {
      'cardsInHand': 7,
      'handValues': [StraightFlush, Flush, Straight],
      'wildValue': 'O',
      'wildStatus': 0,
      'wheelStatus': 1,
      'sfQualify': 7,
      'lowestQualified': null
    },
    'paigowpokerhi': {
      'cardsInHand': 5,
      'handValues': [FiveOfAKind, StraightFlush, FourOfAKind, FullHouse, Flush, Straight, ThreeOfAKind, TwoPair, OnePair, HighCard],
      'wildValue': 'O',
      'wildStatus': 0,
      'wheelStatus': 1,
      'sfQualify': 5,
      'lowestQualified': null
    },
    'paigowpokerlo': {
      'cardsInHand': 2,
      'handValues': [OnePair, HighCard],
      'wildValue': 'O',
      'wildStatus': 0,
      'wheelStatus': 1,
      'sfQualify': 5,
      'lowestQualified': null
    }
  };

  /**
   * Base Game class that defines the rules of the game.
   */
  class Game {
    constructor(descr) {
      this.descr = descr;
      this.cardsInHand = 0;
      this.handValues = [];
      this.wildValue = null;
      this.wildStatus = 0;
      this.wheelStatus = 0;
      this.sfQualify = 5;
      this.lowestQualified = null;
      this.noKickers = null;

      // Set values based on the game rules.
      if (!this.descr || !gameRules[this.descr]) {
        this.descr = 'standard';
      }
      this.cardsInHand = gameRules[this.descr]['cardsInHand'];
      this.handValues = gameRules[this.descr]['handValues'];
      this.wildValue = gameRules[this.descr]['wildValue'];
      this.wildStatus = gameRules[this.descr]['wildStatus'];
      this.wheelStatus = gameRules[this.descr]['wheelStatus'];
      this.sfQualify = gameRules[this.descr]['sfQualify'];
      this.lowestQualified = gameRules[this.descr]['lowestQualified'];
      this.noKickers = gameRules[this.descr]['noKickers'];
    }
  }

  function exportToGlobal(global) {
    global.Card = Card;
    global.Hand = Hand;
    global.Game = Game;
    global.RoyalFlush = RoyalFlush;
    global.NaturalRoyalFlush = NaturalRoyalFlush;
    global.WildRoyalFlush = WildRoyalFlush;
    global.FiveOfAKind = FiveOfAKind;
    global.StraightFlush = StraightFlush;
    global.FourOfAKindPairPlus = FourOfAKindPairPlus;
    global.FourOfAKind = FourOfAKind;
    global.FourWilds = FourWilds;
    global.TwoThreeOfAKind = TwoThreeOfAKind;
    global.ThreeOfAKindTwoPair = ThreeOfAKindTwoPair;
    global.FullHouse = FullHouse;
    global.Flush = Flush;
    global.Straight = Straight;
    global.ThreeOfAKind = ThreeOfAKind;
    global.ThreePair = ThreePair;
    global.TwoPair = TwoPair;
    global.OnePair = OnePair;
    global.HighCard = HighCard;
    global.PaiGowPokerHelper = PaiGowPokerHelper;
  }

  // Export the classes for node.js use.
  if (typeof exports !== 'undefined') {
    exportToGlobal(exports);
  }

  // Add the classes to the window for browser use.
  if (typeof window !== 'undefined') {
    exportToGlobal(window);
  }

})();

},{}],"p2.js":[function(require,module,exports) {
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// by GPT4.0
var pokersolver = require('pokersolver');
var Hand = pokersolver.Hand;

// const suits = ['c', 'd', 'h', 's'];
var suits = ['♠', '♥', '♦', '♣'];
var ranks = '23456789TJQKA';
function calculateWinRate(playerHand, communityCards) {
  var wins = 0;
  var ties = 0;
  var total = 0;
  var unexposedCards = [];
  for (var _i = 0, _suits = suits; _i < _suits.length; _i++) {
    var suit = _suits[_i];
    var _iterator = _createForOfIteratorHelper(ranks),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var rank = _step.value;
        var card = rank + suit;
        if (!playerHand.includes(card) && !communityCards.includes(card)) {
          unexposedCards.push(card);
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }
  var communityCombinations = unexposedCards.length >= 5 - communityCards.length ? k_combinations(unexposedCards, 5 - communityCards.length) : [communityCards];
  var _iterator2 = _createForOfIteratorHelper(communityCombinations),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var community = _step2.value;
      var fullCommunity = community.concat(communityCards);
      var playerBestHand = Hand.solve(playerHand.concat(fullCommunity));
      var _iterator3 = _createForOfIteratorHelper(unexposedCards),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var card1 = _step3.value;
          if (community.includes(card1)) continue;
          var _iterator4 = _createForOfIteratorHelper(unexposedCards),
            _step4;
          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var card2 = _step4.value;
              if (community.includes(card2) || card1 === card2) continue;
              var opponentHand = [card1, card2];
              var opponentBestHand = Hand.solve(opponentHand.concat(fullCommunity));
              var winner = Hand.winners([playerBestHand, opponentBestHand]);
              if (winner.length === 1 && winner[0] === playerBestHand) {
                wins++;
              } else if (winner.length === 2) {
                ties++;
              }
              total++;
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  return {
    winRate: wins / total,
    tieRate: ties / total
  };
}
function k_combinations(set, k) {
  var combinations = [];
  var n = set.length;
  function helper(start, comb) {
    if (comb.length === k) {
      combinations.push(comb.slice());
      return;
    }
    for (var i = start; i < n; i++) {
      comb.push(set[i]);
      helper(i + 1, comb);
      comb.pop();
    }
  }
  helper(0, []);
  return combinations;
}
function monteCarloSimulation(playerHand, communityCards) {
  var numSimulations = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10000;
  var wins = 0;
  var ties = 0;
  var total = 0;
  for (var i = 0; i < numSimulations; i++) {
    var _generateRandomHandAn = generateRandomHandAndCommunity(playerHand, communityCards),
      _generateRandomHandAn2 = _slicedToArray(_generateRandomHandAn, 2),
      opponentHand = _generateRandomHandAn2[0],
      fullCommunity = _generateRandomHandAn2[1];
    var playerBestHand = Hand.solve(playerHand.concat(fullCommunity));
    var opponentBestHand = Hand.solve(opponentHand.concat(fullCommunity));
    var winner = Hand.winners([playerBestHand, opponentBestHand]);
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
  var unexposedCards = [];
  var _iterator5 = _createForOfIteratorHelper(suits),
    _step5;
  try {
    for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
      var suit = _step5.value;
      var _iterator6 = _createForOfIteratorHelper(ranks),
        _step6;
      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var rank = _step6.value;
          var card = rank + suit;
          if (!playerHand.includes(card) && !communityCards.includes(card)) {
            unexposedCards.push(card);
          }
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
    }
  } catch (err) {
    _iterator5.e(err);
  } finally {
    _iterator5.f();
  }
  var opponentHand = [];
  for (var i = 0; i < 2; i++) {
    var randomIndex = Math.floor(Math.random() * unexposedCards.length);
    opponentHand.push(unexposedCards.splice(randomIndex, 1)[0]);
  }
  var numCommunityCardsNeeded = 5 - communityCards.length;
  var fullCommunity = communityCards.slice();
  for (var _i2 = 0; _i2 < numCommunityCardsNeeded; _i2++) {
    var _randomIndex = Math.floor(Math.random() * unexposedCards.length);
    fullCommunity.push(unexposedCards.splice(_randomIndex, 1)[0]);
  }
  return [opponentHand, fullCommunity];
}

// const playerHand = ['Ah', 'Ks'];
// const communityCards = ['Qd', 'Js', 'Th'];
// // const result = calculateWinRate(playerHand, communityCards);
// const result = monteCarloSimulation(playerHand, communityCards);
// console.log(`胜率：${result.winRate.toFixed(4)}，平局率：${result.tieRate.toFixed(4)}`);

module.exports = {
  monteCarloSimulation: monteCarloSimulation
};
},{"pokersolver":"node_modules/pokersolver/pokersolver.js"}],"index.js":[function(require,module,exports) {
var _require = require("./p2"),
  monteCarloSimulation = _require.monteCarloSimulation;
window.addValue = function (value) {
  var cardNumber = document.getElementById("card-number");
  cardNumber.value += value;
};
window.cal = function () {
  var cardNumber = document.getElementById("card-number").value;
  var arr = [];
  for (var i = 0; i < cardNumber.length; i += 2) {
    var chunk = cardNumber.slice(i, i + 2);
    arr.push(chunk);
  }

  // Do calculation here
  var p = arr.slice(0, 2);
  var b = arr.slice(2);
  //获取要更改文本的元素
  var element = document.getElementById("result");
  //修改文本内容
  element.textContent = "\u8BA1\u7B97\u4E2D...";
  var result = monteCarloSimulation(p, b, 10000);
  console.log(p, b, result);
  //修改文本内容
  element.textContent = "win:".concat((result.winRate * 100).toFixed(2), ",tie:").concat((result.tieRate * 100).toFixed(2));
};
window.reset = function () {
  var cardNumber = document.getElementById("card-number");
  cardNumber.value = "";
  var element = document.getElementById("result");
  //修改文本内容
  element.textContent = "";
};
},{"./p2":"p2.js"}],"../../scoop/user/persist/nvm/nodejs/v16.18.0/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}
module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "60264" + '/');
  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);
    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);
          if (didAccept) {
            handled = true;
          }
        }
      });

      // Enable HMR for CSS by default.
      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });
      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }
    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }
    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }
    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}
function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}
function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}
function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }
  var parents = [];
  var k, d, dep;
  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }
  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }
  return parents;
}
function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}
function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }
  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }
  if (checkedAssets[id]) {
    return;
  }
  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }
  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}
function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }
  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }
  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }
}
},{}]},{},["../../scoop/user/persist/nvm/nodejs/v16.18.0/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=card.e31bb0bc.js.map