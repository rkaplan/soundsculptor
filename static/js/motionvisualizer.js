var canvas;
var stage;
var circleCount = 20;
var text;
var pointerVisuals;
var inited = false;

var PALM_VELOCITY_THRESHOLD = 400;

var LEAP_X_RANGE = 360, //x leapCoords range from -180 to 180
    LEAP_Y_RANGE = 480; //y leapCoords range from 0 to 460

var CANVAS_WIDTH = 960,
    CANVAS_HEIGHT = 400;

$(document).ready(init);

function init() {
  if (window.top != window) {
    document.getElementById("header").style.display = "none";
  }

  canvas = document.getElementById("interfaceCanvas");
  // CANVAS_WIDTH = $("#interfaceCanvas").width();
  // CANVAS_HEIGHT = $("#interfaceCanvas").height();

  stage = new createjs.Stage(canvas);
  stage.enableMouseOver(10);

  pointerVisuals = [];

  createjs.Touch.enable(stage);
  createjs.Ticker.addListener(window);

  inited = true;
}

function handleLeapMove(leapCoords, palm) {
  var coords = leapCoordsToPixels(leapCoords);

  for(var i = 0; i < coords.length; i++) {
    if(pointerVisuals[i]) {
      pointerVisuals[i].moveTo({'x': coords[i].x, 'y': coords[i].y});
    }
    else {
      pointerVisuals.push(new PointerVisual({'x': coords[i].x, 'y': coords[i].y}));
    }
  }

  //this loop runs when there are fewer pointers in this frame than last
  for(var i = coords.length; i < pointerVisuals.length; i++) {
    pointerVisuals[i].destroy();
    pointerVisuals.splice(i, 1);
  }

  if(coords.length == 0) {
    stage.clear();  
  }

  if(palm && leapCoords.length >= 4) {
    if(Math.abs(palm.xVel) > PALM_VELOCITY_THRESHOLD) {
      var handRangeImmobilityFactor = 7;
      var pixelX = palm.x + (LEAP_X_RANGE / 2) * (CANVAS_WIDTH / LEAP_X_RANGE);
      var freq = ((pixelX * (100.0 / CANVAS_WIDTH) - 40) * handRangeImmobilityFactor) / 100.0;

      // ensure freq is within range
      freq = Math.max(freq, 0.0);
      freq = Math.min(freq, 1.0);

      console.log("AYO FREQUENCY CHANGED TO " + freq);
      //kenny.setFrequency(freq);
    }
    if(Math.abs(palm.yVel) > PALM_VELOCITY_THRESHOLD) {
      var pixelY = (LEAP_Y_RANGE - palm.y) * (CANVAS_HEIGHT / LEAP_Y_RANGE);
      var vol = (CANVAS_HEIGHT - pixelY) * (1.0 / CANVAS_HEIGHT);

      //ensure vol is within range
      vol = Math.max(vol, 0.0);
      vol = Math.min(vol, 1.0);

      console.log("AYO VOLUME CHANGED TO " + vol);
      //kenny.setVolume(vol);
    }

    //call audio generator:
    console.log()
  }
}

function leapCoordsToPixels(leapCoords) {
  var result = [];

  var coords, newx, newy;
  for(var i = 0; i < leapCoords.length; i++) {
    coords = leapCoords[i];
    newx = (coords.x + (LEAP_X_RANGE / 2)) * (CANVAS_WIDTH / LEAP_X_RANGE);
    newy = (LEAP_Y_RANGE - coords.y) * (CANVAS_HEIGHT / LEAP_Y_RANGE);
    result.push({'x': newx, 'y': newy});
  }

  return result;
}

function tick() {
    if (pointerVisuals[0] && pointerVisuals[0].activeCount) { 
      stage.update(); 
    }
}

function PointerVisual(coords) {
  this.tweens = [];
  this.activeCount = circleCount;

  this.tweenComplete = function() {
    this.activeCount--;
  }

  this.moveTo = function(coords) {
    for (var i=0; i<circleCount; i++) {
      var ref = this.tweens[i].ref;
      var tween = this.tweens[i].tween;
      createjs.Tween.get(ref,{override:true}).to({x:coords.x,y:coords.y}, (0.5+i*0.12)*1000, createjs.Ease.elasticOut).call($.proxy(this.tweenComplete, this));
    }
    this.activeCount = circleCount;
  }

  this.destroy = function() {
    for(var i = 0; i < this.tweens.length; i++) {
      stage.removeChild(this.tweens[i].ref);
    }
  }

  //make the concentric circles:
  for (var i=0; i<circleCount; i++) {
      // draw the circle, and put it on stage:
      var circle = new createjs.Shape();
      circle.graphics.setStrokeStyle(15);
      circle.graphics.beginStroke("#113355");
      circle.graphics.drawCircle(0,0,(i+1)*4);
      circle.alpha = 1-i*0.02;
      circle.x = coords.x;
      circle.y = coords.y;
      circle.compositeOperation = "lighter";

      var tween = createjs.Tween.get(circle).to({x:circle.x,y:circle.y}, (0.5+i*0.12)*1000, createjs.Ease.elasticOut).call($.proxy(this.tweenComplete, this));
      this.tweens.push({tween:tween, ref:circle});
      stage.addChild(circle);
  }
}


var oldPointables;
Leap.loop(function(frame) {
  var newPointables = new Array();
  for (var i = 0; i < frame.pointables.length; i++) {
    var coords = {};
    var pos = (frame.pointables)[i].tipPosition;
    coords['x'] = pos[0];
    coords['y'] = pos[1];
    newPointables[i] = coords;
  }

  var palm = {};
  if(frame.hands && frame.hands[0]) {
    palm.x = frame.hands[0].palmPosition[0];
    palm.y = frame.hands[0].palmPosition[1];
    palm.xVel = frame.hands[0].palmVelocity[0];
    palm.yVel = frame.hands[0].palmVelocity[1];
  }
  
  if(oldPointables && newPointables.length == oldPointables.length) {
    newPointables = makePointableIndicesConsistent(newPointables, oldPointables);
  }

  if(inited)
    handleLeapMove(newPointables, palm);

  oldPointables = newPointables;
});

//ensure that newPointables[i] corresponds to the same finger of the user that oldPointables[i] did
function makePointableIndicesConsistent(newPointables, oldPointables) {
  var MAX_INT = 4294967295;
  var distancesArr = [];

  for(var i = 0; i < newPointables.length; i++) {
    var curDistances = new Array();
    for(var j = 0; j < oldPointables.length; j++) {
      curDistances.push(cartesianDistance(newPointables[i], oldPointables[j]));
    }
    distancesArr.push(curDistances);
  }

  var oldIndexToNewIndex = {}; 
  var indicesOfUnusedNewPointables = {};
  for(var i = 0; i < newPointables.length; i++) {
    indicesOfUnusedNewPointables[i] = true;
  }

  for(var i = 0; i < distancesArr.length; i++) {
    var minDistance = MAX_INT;
    var indexOfMinDistance = 0;
    for(var j = 0; j < distancesArr[i].length; j++) {
      if(oldIndexToNewIndex.hasOwnProperty(j))
        continue; //we already mapped this oldPointable index to a newPointable index

      if(distancesArr[i][j] < minDistance) {
        minDistance = distancesArr[i][j];
        indexOfMinDistance = j;
      }
    }
    oldIndexToNewIndex[indexOfMinDistance] = i;
    delete indicesOfUnusedNewPointables[i];
  }

  var result = [];
  for(var oldIndex = 0; oldIndex < oldPointables.length; oldIndex++) {
    if(oldIndexToNewIndex[oldIndex] === undefined)
      continue; //this can happen when there are fewer fingers in the new frame than the old

    result.push(newPointables[oldIndexToNewIndex[oldIndex]]);
  }

  //in case there are more fingers in the new frame than the old:
  for(var unusedIndex in indicesOfUnusedNewPointables) {
    if(indicesOfUnusedNewPointables.hasOwnProperty(unusedIndex))
      result.push(newPointables[unusedIndex]);
  }

  return result;
}

function cartesianDistance(newPointable, oldPointable) {
  return Math.sqrt(Math.pow(newPointable.x - oldPointable.x, 2) + Math.pow(newPointable.y - oldPointable.y, 2));
}


