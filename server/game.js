/**
Player: {
  username: String username
  emoji: String? which emoji avatar to use
  mass: Number current size
  velocity: Number current velocity
  position: [Number, Number] current xy-coordinates
}
**/

/**
 * Object representing the game model
 */
Game = function() {
  this.maxSpeed = 200;
};

/**
 * Changes the player object's position property by the velocity vector.
 * @param  {Player} player [player to be translated]
 * @return {endefined}
 */
Game.prototype.translatePlayer_ = function(player) {
  player.position[0] = player.position[0] + player.velocity.x;
  player.position[1] = player.position[1] + player.velocity.y;
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
  var player = Players.find({_id : playerID});

  var mousePoint = new Point(x, y);
  var posPoint = new Point(player.position[0], player.position[1]);
  var inputVelocity = mousePoint - posPoint;

  // inputVelocity = (inputVelocity / inputVelocity.length) * 10;
  var nextVelocity = player.velocity + inputVelocity;

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

/**
 * Determines whether or not a player is in the arena
 * @param  {Player} player [Player object in question]
 * @return {Boolean}       [Whether or not the given player is in the arena]
 */
Game.prototype.inArena_ = function(player) {

};

/**
 * Determines whether or not the player is colliding with the other player
 * @param  {[type]}  player1 [Player in question]
 * @param  {[type]}  player2 [Other player in question]
 * @return {Boolean}         [whether or not the two are colliding]
 */
Game.prototype.isColliding_ = function(player1, player2) {
  var p1 = player1.position;
  var p2 = player2.position;
  var r1 = player1.mass / 2;
  var r2 = player2.mass / 2;

  var distanceBtwn = Math.pow(p1[0] - p2[0], 2) + math.pow(p1[1] - p2[1], 2);
  var collisionDist = Math.pow(r1, 2) + math.pow(r2, 2);

  return distanceBtwn < distanceBtwn;
};

/**
 * Calculates all colliding players in this game
 * @param  {Array<Player>} players [All players in the game]
 * @return {Array<Array<Player>>}  [Tuple arrays of colliding players]
 */
Game.prototype.collidingPlayers_ = function(players) {
  
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
  dotProd = (v1 - v2).dot(x1 - x2);
  // TODO: Math.pow might be wrong, .
  player1.velocity = v1 - ((2*m2)/(m1 + m2)) *
    (dotProd/normalize(Math.pow(x1 - x2, 2))) * (x1 - x2);
  dotProd = (v2 - v1).dot(x2 - x1);
  player2.velocity = v2 - ((2*m1)/(m1 + m2)) *
    (dotProd/normalize(Math.pow(x2 - x1, 2))) * (x2 - x1);
};

Game.prototype.update = function(playerID) {

};


var game = new Game();

Meteor.methods({
  movePlayer: function(playerID, x, y) {
    game.applyClick(playerID, x, y);
  }

  checkGameState: function() {

  }
});
