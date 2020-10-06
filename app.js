var numInterpolations = 3; //몇칸으로 나눌것인지
var everyNote = 'C,C#,D,D#,E,F,F#,G,G#,A,A#,B,'.repeat(20).split(',').map( function(x,i) {
  return x + '' + Math.floor(i/12);
}); //계명을 나눈다
var MELODY1 = { notes: [
    {pitch: 64, quantizedStartStep: 0, quantizedEndStep: 10},
    {pitch: 65, quantizedStartStep: 10, quantizedEndStep: 20},
  ]};
var MELODY2 = { notes: [
    {pitch: 76, quantizedStartStep: 0, quantizedEndStep: 1},
    {pitch: 77, quantizedStartStep: 1, quantizedEndStep: 2},
    {pitch: 77, quantizedStartStep: 2, quantizedEndStep: 3},
    {pitch: 77, quantizedStartStep: 3, quantizedEndStep: 4},
    {pitch: 77, quantizedStartStep: 4, quantizedEndStep: 5},
    {pitch: 76, quantizedStartStep: 5, quantizedEndStep: 6},
    {pitch: 76, quantizedStartStep: 6, quantizedEndStep: 7},
    {pitch: 53, quantizedStartStep: 7, quantizedEndStep: 8},
    {pitch: 52, quantizedStartStep: 8, quantizedEndStep: 9},
    {pitch: 55, quantizedStartStep: 9, quantizedEndStep: 10},
    {pitch: 60, quantizedStartStep: 10, quantizedEndStep: 11},
    {pitch: 60, quantizedStartStep: 11, quantizedEndStep: 12},
    {pitch: 60, quantizedStartStep: 12, quantizedEndStep: 13},
    {pitch: 60, quantizedStartStep: 13, quantizedEndStep: 14},
    {pitch: 60, quantizedStartStep: 14, quantizedEndStep: 15},
    {pitch: 52, quantizedStartStep: 15, quantizedEndStep: 16},
    {pitch: 57, quantizedStartStep: 16, quantizedEndStep: 17},
    {pitch: 57, quantizedStartStep: 17, quantizedEndStep: 18},
    {pitch: 57, quantizedStartStep: 18, quantizedEndStep: 19},
    {pitch: 65, quantizedStartStep: 19, quantizedEndStep: 20},
    {pitch: 65, quantizedStartStep: 20, quantizedEndStep: 21},
    {pitch: 65, quantizedStartStep: 21, quantizedEndStep: 22},
    {pitch: 57, quantizedStartStep: 22, quantizedEndStep: 23},
    {pitch: 57, quantizedStartStep: 23, quantizedEndStep: 24},
    {pitch: 57, quantizedStartStep: 24, quantizedEndStep: 25},
    {pitch: 57, quantizedStartStep: 25, quantizedEndStep: 26},
    {pitch: 62, quantizedStartStep: 26, quantizedEndStep: 27},
    {pitch: 62, quantizedStartStep: 27, quantizedEndStep: 28},
    {pitch: 65, quantizedStartStep: 28, quantizedEndStep: 29},
    {pitch: 65, quantizedStartStep: 29, quantizedEndStep: 30},
    {pitch: 69, quantizedStartStep: 30, quantizedEndStep: 31},
    {pitch: 69, quantizedStartStep: 31, quantizedEndStep: 32}
  ]};

var melodiesModelCheckPoint = './data/mel_small';
var NUM_STEPS = 32; // DO NOT CHANGE.
var interpolatedNoteSequences;

new musicvae.MusicVAE(melodiesModelCheckPoint)
    .initialize()
    .then(function(musicVAE) {
      return musicVAE.interpolate([MELODY1, MELODY2], numInterpolations);
    })
    .then(function(noteSequences) {
      var text = 'Click to Play a blend from Melody 1 to Melody 2 in ' + numInterpolations + ' interpolations';
      document.querySelector('.loading').innerHTML = text;
      interpolatedNoteSequences = noteSequences;
    });


var pianoPath = './data/piano/';
var samples = {};
var NUM_NOTES = 88;
var MIDI_START_NOTE = 21;
for (var i = MIDI_START_NOTE; i < NUM_NOTES + MIDI_START_NOTE; i++) {
  samples[i] = pianoPath + i + '.mp3';
}

var players = new Tone.Players(samples, function onPlayersLoaded(){
  console.log("Tone.js players loaded");
}).toMaster();


function playNote(midiNote, numNoteHolds){
  var duration = Tone.Transport.toSeconds('8n') * (numNoteHolds || 1);
  var player = players.get(midiNote);
  player.fadeOut = 0.05;
  player.fadeIn = 0.01;
  player.start(Tone.now(), 0, duration);
}

var sequenceIndex = -1;
var stepIndex = -1;

//p5.js setup
var TILE_SIZE = 150;
var WIDTH = TILE_SIZE * numInterpolations;
var HEIGHT = 170;
var START_COLOR;
var END_COLOR;

function setup() {
  createCanvas(WIDTH , HEIGHT);
  START_COLOR = color(60, 180, 203);
  END_COLOR = color(233, 72, 88);
  noStroke();
}

function draw() {
  var totalPlayTime = (Tone.Transport.bpm.value * NUM_STEPS * numInterpolations) / 1000;
  var percent = Tone.Transport.seconds / totalPlayTime % 1;
  var currSequenceIndex = Math.floor(percent * numInterpolations);
  var currStepIndex = Math.floor((percent * numInterpolations - currSequenceIndex) * NUM_STEPS);
  function isCurrentStep(note) {
    return note.quantizedStartStep === currStepIndex;
  }
  if(Tone.Transport.state === 'started') {
    if(currStepIndex != stepIndex) {
      var notes = interpolatedNoteSequences[currSequenceIndex].notes.filter(isCurrentStep);
      notes.forEach(function(note) {
        var noteDuration = note.quantizedEndStep - note.quantizedStartStep;
        playNote(note.pitch, noteDuration);
      });
    }
    sequenceIndex = currSequenceIndex;
    stepIndex = currStepIndex;
  }
  background(38);
  for(var i = 0; i < numInterpolations; i++){
    var x = i * TILE_SIZE;
    var y = HEIGHT-TILE_SIZE;
    var currColor = lerpColor(START_COLOR, END_COLOR, i / numInterpolations);
    fill(red(currColor), green(currColor), blue(currColor), 125); //숫자는 밝기
    rect(x, y, TILE_SIZE, TILE_SIZE); //타일 사이즈
    fill(currColor); //음표 색
    if(interpolatedNoteSequences){
      drawNotes(interpolatedNoteSequences[i].notes, x, y, TILE_SIZE, TILE_SIZE);
    }

  }

  fill(255, 64);
  rect(percent * WIDTH, 0, TILE_SIZE / NUM_STEPS, HEIGHT); //음악시작하면 지나는 작대기

  text(sequenceIndex + " - " + currStepIndex, 15, 15);
}

function mousePressed() {
  if(!interpolatedNoteSequences) {
    return;
  }
  var loadingSpan = document.querySelector('.loading');
  if(Tone.Transport.state === 'started') {
    Tone.Transport.stop();
    loadingSpan.innerHTML = 'Play';
  } else {
    Tone.Transport.start();
    loadingSpan.innerHTML = 'Pause';
  }
}

function drawNotes(notes, x, y, width, height) {
  push();
  translate(x, y);
  var cellWidth = width / NUM_STEPS;
  var cellHeight = height / NUM_NOTES;
  notes.forEach(function(note) {
    var emptyNoteSpacer = 1;
    rect(emptyNoteSpacer + cellWidth * note.quantizedStartStep, height - cellHeight * (note.pitch-MIDI_START_NOTE),
        cellWidth * (note.quantizedEndStep - note.quantizedStartStep) - emptyNoteSpacer, cellHeight);
  });
  pop();
}