var numInterpolations = 5; //몇칸으로 나눌것인지

var melodiesModelCheckPoint = './data/mel_small';
var NUM_STEPS = 32; // 총 음악의 길이
var interpolatedNoteSequences1;
var interpolatedNoteSequences2;

new musicvae.MusicVAE(melodiesModelCheckPoint)
    .initialize()
    .then(function (musicVAE) {
        return musicVAE.interpolate([MELODY1,MELODY2],numInterpolations);
    })
    .then(function(noteSequences) {
            interpolatedNoteSequences1 = noteSequences;
            interpolatedNoteSequences1.pop();
            interpolatedNoteSequences1.reverse().pop();

            interpolatedNoteSequences1.push(MELODY1);
            interpolatedNoteSequences1.reverse().push(MELODY2);
            console.log(interpolatedNoteSequences1);
        }
    );

new musicvae.MusicVAE(melodiesModelCheckPoint)
    .initialize()
    .then(function (musicVae){
        return musicVae.interpolate([MELODY3,MELODY4],numInterpolations);
    })
    .then(function (noteSequences) {
            interpolatedNoteSequences2 = noteSequences;
            interpolatedNoteSequences2.pop();
            interpolatedNoteSequences2.reverse().pop();
            interpolatedNoteSequences2.push(MELODY3);
            interpolatedNoteSequences2.reverse().push(MELODY4);
            console.log(interpolatedNoteSequences2);
        }
    );


var pianoPath = './data/piano/';
var samples = {};
var NUM_NOTES = 88;
var MIDI_START_NOTE = 21;

for (var i = MIDI_START_NOTE; i < NUM_NOTES + MIDI_START_NOTE; i++) {
    samples[i] = pianoPath + i + '.mp3';
}
var players = new Tone.Players(samples, function onPlayersLoaded(){
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

var TILE_SIZE = 150;
var WIDTH = TILE_SIZE * numInterpolations;
var HEIGHT = 170;
var START_COLOR;
var END_COLOR;

function setup() {
    createCanvas(WIDTH , HEIGHT*2);
    START_COLOR = color(219, 189, 219);
    END_COLOR = color(43, 227, 202);
    noStroke();
}

function draw() {
    var totalPlayTime = (Tone.Transport.bpm.value * NUM_STEPS * numInterpolations) / 1000; // 분당 비트 * 악음악당 길이 * 칸수
    var percent = Tone.Transport.seconds / totalPlayTime % 1;
    var currSequenceIndex = Math.floor(percent * numInterpolations);
    var currStepIndex = Math.floor((percent * numInterpolations - currSequenceIndex) * NUM_STEPS);
    function isCurrentStep(note) {
        return note.quantizedStartStep === currStepIndex;
    }
    if(Tone.Transport.state === 'started') {
        if(currStepIndex != stepIndex) {

            var notes = interpolatedNoteSequences1[currSequenceIndex].notes.filter(isCurrentStep);
            notes.forEach(function(note) {
                var noteDuration = note.quantizedEndStep - note.quantizedStartStep;
                playNote(note.pitch, noteDuration);
            });

            var left_notes = interpolatedNoteSequences2[currSequenceIndex].notes.filter(isCurrentStep);
            left_notes.forEach(function(n) {
                var noteDuration2 = n.quantizedEndStep - n.quantizedStartStep;
                playNote(n.pitch, noteDuration2);
            });
        }
        sequenceIndex = currSequenceIndex;
        stepIndex = currStepIndex;
    }
    background(0);
    for(var i = 0; i < numInterpolations; i++){
        var x = i * TILE_SIZE;
        var y = HEIGHT-TILE_SIZE;
        var currColor = lerpColor(START_COLOR, END_COLOR, i / numInterpolations);
        fill(red(currColor), green(currColor), blue(currColor), 125); //숫자는 밝기
        rect(x, y, TILE_SIZE, TILE_SIZE); //타일 사이즈
        fill(currColor); //음표 색
        if(interpolatedNoteSequences1){
            drawNotes(interpolatedNoteSequences1[i].notes, x, y, TILE_SIZE, TILE_SIZE);
        }
    }

    for(var j = 0; j < numInterpolations; j++){
        var u = j * TILE_SIZE;
        var v = (HEIGHT-TILE_SIZE)*9;
        var currColor1 = lerpColor(START_COLOR, END_COLOR, j / numInterpolations);
        fill(red(currColor1), green(currColor1), blue(currColor1), 125); //숫자는 밝기
        rect(u, v, TILE_SIZE, TILE_SIZE); //타일 사이즈
        fill(currColor1); //음표 색
        if(interpolatedNoteSequences2) {
            drawNotes(interpolatedNoteSequences2[j].notes, u, v, TILE_SIZE, TILE_SIZE);
        }
    }


    fill(255, 64); //음악시작하면 지나는 작대기
    rect(percent * WIDTH, 0, TILE_SIZE / NUM_STEPS, HEIGHT*2);

    text(sequenceIndex + " - " + currStepIndex, 15, 15);
}

function mousePressed() {
    if(!interpolatedNoteSequences1) {
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