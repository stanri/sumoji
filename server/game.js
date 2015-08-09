/**
 * Object representing the game model
 */
Game = function() {
  this.MAX_SPEED = 200;
  this.FRICTION = 0.8;
  this.isRunning = false;
};

/**
 * Changes the player object's position property by the velocity vector.
 * @param  {Player} player [player to be translated]
 * @return {endefined}
 */
Game.prototype.translatePlayer_ = function(player) {
  player.position[0] = player.position[0] + player.velocity[0];
  player.position[1] = player.position[1] + player.velocity[1];
};

/**
 * Calculates and applies the velocity of the player caused by a user click.
 * @param  {String} playerID [Mongo ID of player]
 * @param  {Number} x        [x click position]
 * @param  {Number} y        [y click position]
 * @return {undefined}
 */
Game.prototype.applyClick = function(playerID, x, y) {
  // move object with position vector v1 along unit vector v2 by moveSpeed:
  // v1.translate(v2.multiplyByScalar(moveSpeed));
  var player = Players.find({_id : playerID}).fetch()[0];
  var mousePoint = [x, y];
  var inputVelocity = vectorSub(mousePoint, player.position);

  // inputVelocity = (inputVelocity / inputVelocity.length) * 10;
  var nextVelocity = vectorAdd(player.velocity, inputVelocity);

  Players.update({_id: player._id}, {$set: {velocity: nextVelocity}});
};

/**
 * Shrink's the player mass
 * @param  {Player} player [player object to shrink]
 * @return {undefined}
 */
Game.prototype.shrink_ = function(player) {
  player.mass = player.mass*.95;
};

/**
 * Shrink's the player mass
 * @param  {Player} player [player object to grow]
 * @return {undefined}
 */
Game.prototype.grow_ = function(player) {
  player.mass = player.mass*1.05;
};

Game.prototype.friction_ = function(player) {
  player.velocity[0] = player.velocity[0] * this.FRICTION;
  player.velocity[1] = player.velocity[1] * this.FRICTION;
};

/**
 * Determines whether or not a player is in the arena
 * @param  {Player} player [Player object in question]
 * @return {Boolean}       [Whether or not the given player is in the arena]
 */
Game.prototype.inArena_ = function(player) {
  var x = player.position[0];
  var y = player.position[1];

  if (x < 0 || y < 0 || x > 1200 || y > 600) {
    return false;
  } else {
    return true;
  }
};

/**
 * Determines whether or not the player is colliding with the other player
 * @param  {Player}  player1 [Player in question]
 * @param  {Player}  player2 [Other player in question]
 * @return {Boolean}         [whether or not the two are colliding]
 */
Game.prototype.isColliding_ = function(player1, player2) {
  var p1 = player1.position;
  var p2 = player2.position;
  var r1 = player1.mass / 2;
  var r2 = player2.mass / 2;

  var distanceBtwn = Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2);
  var collisionDist = Math.pow(r1, 2) + Math.pow(r2, 2);

  return distanceBtwn <= collisionDist;
};

/**
 * Calculates all colliding players in this game
 * @param  {Array<Player>} players [All players in the game]
 * @return {Array<Array<Player>>}  [Tuple arrays of colliding players]
 */
Game.prototype.collidingPlayers_ = function(players) {
  var results = [];
  for (var i = 0; i < players.length; i++) {
    var p1 = players[i];
    for (var j = i + 1; j < players.length; j++) {
      var p2 = players[j];
      if (this.isColliding_(p1, p2)) {
        results.push([p1, p2]);
      }
    }
  }

  return results;
};

/**
 * Determines the velocity of two colliding players
 * @param  {Player} player1 [First colliding player.]
 * @param  {Player} player2 [Second colliding player.]
 * @return {undefined}
 */
Game.prototype.collide_ = function(player1, player2) {
  v1 = player1.velocity;
  v2 = player2.velocity;
  x1 = player1.position;
  x2 = player2.position;
  m1 = player1.mass;
  m2 = player2.mass;
  dotProd = vectorDot(vectorSub(v1, v2), vectorSub(x1, x2));
  massConst = ((2*m2)/(m1 + m2));
  player1.velocity =
    vectorSub(v1,
      vectorScalarMult(vectorSub(x1, x2),
        massConst *
        (dotProd/Math.pow(vectorMag(vectorSub(x1, x2)),2))
      )
    );
  dotProd = vectorDot(vectorSub(v2, v1), vectorSub(x2, x1));
  massConst = ((2*m1)/(m1 + m2));
  player2.velocity =
    vectorSub(v2,
      vectorScalarMult(vectorSub(x2, x1),
        massConst *
        (dotProd/Math.pow(vectorMag(vectorSub(x2, x1)),2))
      )
    );
};

Game.prototype.update = function() {
  var allPlayers = Players.find().fetch();
  var collisionPairs = this.collidingPlayers_(allPlayers);
  for (var i = 0; i < collisionPairs.length; i++) {
    var pair = collisionPairs[i];
    this.collide_(pair[0], pair[1]);
  }

  var counter = 0;
  for (var i = 0; i < allPlayers.length; i++) {
    var player = allPlayers[i];
    this.friction_(player);
    this.translatePlayer_(player);
    Players.update(
      {_id: player._id},
      {$set: player},
      function(err, num) {
        counter++;
        if (counter == allPlayers.length) {
          Updates.insert({createdAt: Date.now()});
        }
      }
    );
  }
};

var game = new Game();

Meteor.methods({
  applyClick: function(playerID, x, y) {
    game.applyClick(playerID, x, y);
  },

  startGameClock: function() {
    if (!game.isRunning) {
      game.isRunning = true;
      Meteor.setInterval(function() {game.update()}, 100);
    }
  }
});




