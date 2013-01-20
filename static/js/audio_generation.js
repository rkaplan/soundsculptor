function BufferLoader(context,urlList,callback){this.context=context;this.urlList=urlList;this.onload=callback;this.bufferList=new Array();this.loadCount=0;}
BufferLoader.prototype.loadBuffer=function(url,index){var request=new XMLHttpRequest();request.open("GET",url,true);request.responseType="arraybuffer";var loader=this;request.onload=function(){loader.context.decodeAudioData(request.response,function(buffer){if(!buffer){alert('error decoding file data: '+url);return;}
loader.bufferList[index]=buffer;if(++loader.loadCount==loader.urlList.length)
loader.onload(loader.bufferList);},function(error){console.error('decodeAudioData error',error);});}
request.onerror=function(){alert('BufferLoader: XHR error');}
request.send();}
BufferLoader.prototype.load=function(){for(var i=0;i<this.urlList.length;++i)
this.loadBuffer(this.urlList[i],i);}

var context;
var bufferLoader;
var BUFFERS;
window.onload = init;

function init() {
  context = new webkitAudioContext();

  bufferLoader = new BufferLoader(
    context,
    [
      '../static/techno.wav',
      '../static/wood_1.ogg',
      '../static/wood_2.ogg',
      '../static/wood_3.ogg',
      '../static/wood_4.ogg',
      '../static/wood_5.ogg',
      '../static/wood_6.ogg',
      '../static/wood_7.ogg',
      '../static/wood_8.ogg',
      '../static/wood_9.ogg',
      '../static/wood_10.ogg',
      '../static/wood_11.ogg',
      '../static/wood_12.ogg',
      '../static/wood_13.ogg',
      '../static/wood_14.ogg',
      '../static/wood_15.ogg',
      '../static/wood_16.ogg',
      '../static/bzz_1.ogg',
      '../static/bzz_2.ogg',
      '../static/bzz_3.ogg',
      '../static/bzz_4.ogg',
      '../static/bzz_5.ogg',
      '../static/bzz_6.ogg',
      '../static/bzz_7.ogg',
      '../static/bzz_8.ogg',
      '../static/bzz_9.ogg',
      '../static/bzz_10.ogg',
      '../static/bzz_11.ogg',
      '../static/bzz_12.ogg',
      '../static/bzz_13.ogg',
      '../static/bzz_14.ogg',
      '../static/bzz_15.ogg',
      '../static/bzz_16.ogg',
      '../static/bass_1.ogg',
      '../static/bass_2.ogg',
      '../static/bass_3.ogg',
      '../static/bass_4.ogg',
      '../static/bass_5.ogg',
      '../static/bass_6.ogg',
      '../static/bass_7.ogg',
      '../static/bass_8.ogg',
      '../static/bass_9.ogg',
      '../static/bass_10.ogg',
      '../static/bass_11.ogg',
      '../static/bass_12.ogg',
      '../static/bass_13.ogg',
      '../static/bass_14.ogg',
      '../static/bass_15.ogg',
      '../static/bass_16.ogg',
      '../static/ping_1.ogg',
      '../static/ping_2.ogg',
      '../static/ping_3.ogg',
      '../static/ping_4.ogg',
      '../static/ping_5.ogg',
      '../static/ping_6.ogg',
      '../static/ping_7.ogg',
      '../static/ping_8.ogg',
      '../static/ping_9.ogg',
      '../static/ping_10.ogg',
      '../static/ping_11.ogg',
      '../static/ping_12.ogg',
      '../static/ping_13.ogg',
      '../static/ping_14.ogg',
      '../static/ping_15.ogg',
      '../static/ping_16.ogg',
    ],
    storeBuffers
    );
  bufferLoader.load();
}

function storeBuffers(bufferList) {
  // stores audio buffers in BUFFERS
  BUFFERS = bufferList;
}

var BG = {
  FREQ_MUL: 7000,
  QUAL_MUL: 30,
  playing: false
};

BG.gainNode = null;
var rec = null; 

BG.play = function() {
  // Create gain node (volume)
  this.gainNode = context.createGainNode();
  // Create the source.
  var source1 = context.createBufferSource();
  source1.buffer = BUFFERS[0];
  // Create the filter.
  var filter = context.createBiquadFilter();
  filter.type = 0; // LOWPASS
  filter.Q.value = 30;
  filter.frequency.value = 5000;
  // Connect source to gainNode, gainNode to filter, filter to destination.
  source1.connect(this.gainNode);
  this.gainNode.connect(filter);
  filter.connect(context.destination);

  // Play!
  source1.loop = true;

  source1.noteOn(0);

  Wood.play()
  Bzz.play()
  Bass.play()
  Ping.play()

  // Enable record button
  $('#record').removeAttr('disabled');

  // Save source and filterNode for later access.
  this.source1 = source1;
  this.filter = filter;
};

BG.stop = function() {
  this.source1.noteOff(0);
  $('#record').attr({'disabled':true});
};

BG.toggle = function() {
  this.playing ? this.stop() : this.play();
  this.playing = !this.playing;
};

BG.changeFrequency = function(element) {
  var minValue = 40;
  var maxValue = context.sampleRate / 2;
  var numberOfOctaves = Math.log(maxValue / minValue) / Math.LN2;
  var multiplier = Math.pow(2, numberOfOctaves * (element.value - 1.0));
  this.filter.frequency.value = maxValue * multiplier;
};

BG.changeQuality = function(element) {
  this.filter.Q.value = element.value * this.QUAL_MUL;
};

BG.changeVolume = function(element) {
  var volume = element.value;
  var fraction = parseInt(element.value) / parseInt(element.max);
  this.gainNode.gain.value = fraction * fraction;
};

var tempo = 114*4;
var interval = (60 / tempo) * 1000;

var tempo2 = 114;
var interval2 = (60 / tempo2) * 1000;

var tempo3 = 114*2;
var interval3 = (60 / tempo3) * 1000;

/* Wood Sound Handler */
var Wood = {
};

var wood_vol = 0;
var wood_track = 8;

Wood.play = function() {
  function playSoundWood(buffer) {
    var source = context.createBufferSource();
    source.buffer = buffer;
    this.gainNode = context.createGainNode();

    source.connect(this.gainNode);
    this.gainNode.connect(BG.gainNode);
    BG.gainNode.connect(context.destination);

    this.gainNode.gain.value = wood_vol;
    Wood.source = source;
    source.noteOn(0);
  }

  wood_playing = setInterval(function() {playSoundWood(BUFFERS[wood_track])}, interval);
};

Wood.stop = function () {
  window.clearInterval(wood_playing);
}

Wood.mute = function () {
  wood_vol = 0;
}

Wood.change = function (x) {
  wood_track = x;
}

Wood.audioOn = function () {
  wood_vol = 0.75;
}

Wood.random = function () {
  var n = Math.floor(Math.random()*16) + 1;
  Wood.change(n);
}

/* Bzz Sound Handler */

var Bzz = {
};

var bzz_vol = 0;
var bzz_track = 28;

Bzz.play = function() {
  function playSoundBzz(buffer) {
    var source = context.createBufferSource();
    source.buffer = buffer;
    this.gainNode = context.createGainNode();

    source.connect(this.gainNode);
    this.gainNode.connect(BG.gainNode);
    BG.gainNode.connect(context.destination);

    this.gainNode.gain.value = bzz_vol;
    Bzz.source = source;
    source.noteOn(0);
  }

  bzz_playing = setInterval(function() {playSoundBzz(BUFFERS[bzz_track])}, interval2);
};

Bzz.stop = function () {
  window.clearInterval(bzz_playing);
}

Bzz.mute = function () {
  bzz_vol = 0;
}

Bzz.change = function (x) {
  bzz_track = x;
}

Bzz.audioOn = function () {
  bzz_vol = 0.35;
}

Bzz.random = function () {
  var n = Math.floor(Math.random()*16) + 17;
  Bzz.change(n);
}

/* Bass Sound Handler */
var Bass = {
};

var bass_vol = 0;
var bass_track = 36;


Bass.play = function() {
  function playSoundBass(buffer) {
    var source = context.createBufferSource();
    source.buffer = buffer;
    this.gainNode = context.createGainNode();

    source.connect(this.gainNode);
    this.gainNode.connect(BG.gainNode);
    BG.gainNode.connect(context.destination);

    this.gainNode.gain.value = bass_vol;
    Bass.source = source;
    source.noteOn(0);
  }

  bass_playing = setInterval(function() {playSoundBass(BUFFERS[bass_track])}, interval3);
};

Bass.stop = function () {
  window.clearInterval(bass_playing);
}

Bass.mute = function () {
  bass_vol = 0;
}

Bass.change = function (x) {
  bass_track = x;
}

Bass.audioOn = function () {
  bass_vol = 0.4;
}

Bass.random = function () {
  var n = Math.floor(Math.random()*16) + 33;
  Bass.change(n);
}

/* Ping Sound Handler */
var Ping = {
};

var ping_vol = 0;
var ping_track = 50;

Ping.play = function() {
  function playSoundPing(buffer) {
    var source = context.createBufferSource();
    source.buffer = buffer;
    this.gainNode = context.createGainNode();

    source.connect(this.gainNode);
    this.gainNode.connect(BG.gainNode);
    BG.gainNode.connect(context.destination);

    this.gainNode.gain.value = ping_vol;
    Ping.source = source;
    source.noteOn(0);
  }

  ping_playing = setInterval(function() {playSoundPing(BUFFERS[ping_track])}, interval3);
};

Ping.stop = function () {
  window.clearInterval(ping_playing);
}

Ping.mute = function () {
  ping_vol = 0;
}

Ping.change = function (x) {
  ping_track = x;
}

Ping.audioOn = function () {
  ping_vol = 0.3;
}

Ping.random = function () {
  var n = Math.floor(Math.random()*16) + 49;
  Ping.change(n);
}

var recording = false;

function record_click() {
  if (recording) {
    $('#record').text('Record')

    rec.stop();
    rec.exportWAV(function(x) {Recorderr.forceDownload(x, 'recording')});

  } else {
    $('#record').text('Stop')

    rec = new Recorderr(BG.filter, {'workerPath': '../static/js/recorderWorker.js'});
    rec.record();
    recording = true;
  }
}

LEAP_X_RANGE = 360;
LEAP_Y_RANGE = 460;
CANVAS_WIDTH = 800;
CANVAS_HEIGHT = 500;
PARTITION = 1/16;

function r(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

function stream_data() {
  setInterval(update_sounds, 50);
}

function random_coords() {
   //make random dict of x, y, z from
  x = [r(-180,180),r(-180,180),r(-180,180),r(-180,180)];
  y = [r(0,460),r(0,460),r(0,460),r(0,460)];
  // [{x:123, y:321, z:213}, {x:123, y:43, z:21}]
  var p1 = JSON.parse('{"x":'+x[0]+', "y":'+y[0]+', "z":0}');
  var p2 = JSON.parse('{"x":'+x[1]+', "y":'+y[1]+', "z":0}');
  var p3 = JSON.parse('{"x":'+x[2]+', "y":'+y[2]+', "z":0}');
  var p4 = JSON.parse('{"x":'+x[3]+', "y":'+y[3]+', "z":0}');

  coords = [p1,p2,p3,p4];
  return coords;
}

function coords_to_partitions(coords){
  // normalize coordinates to 0<c<1
  partitions = []

  // use only first two sets of coordinates (two fingers)
  var coord, norm_x, norm_y;
  for(var i = 0; i < 2; i++) {
    coord = coords[i];
    norm_x = coord['x'] / CANVAS_WIDTH;
    norm_y = coord['y'] / CANVAS_HEIGHT;

    part_x = Math.ceil(norm_x / PARTITION);
    part_y = Math.ceil(norm_y / PARTITION);

    partitions.push({'x':part_x, 'y':part_y});
  }

  return partitions
}

function update_sounds() {
  leap_coords = random_coords();
  adj_coords = leapCoordsToPixels(leap_coords);

  partitions = coords_to_partitions(adj_coords)

  Bzz.change(partitions[0]['x']);
  Wood.change(partitions[0]['y']);
  Bass.change(partitions[1]['x']);
  Ping.change(partitions[1]['y']);
}