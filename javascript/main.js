  var instruments = {
                       'guitar' : { 'name'         : 'guitar',
                                    'numStrings'   : 6,
                                    'fretsToLabel' : [1,3,5,7,9,12,15],
                                    'stringLabels' : ['E','B','G','D','A','E'],
                                    'stringDiff'   : {
                                                        1 : 0,  // E string (high)
                                                        2 : 5,  // B string
                                                        3 : 9,  // G string
                                                        4 : 2,  // D string
                                                        5 : 7,  // A string
                                                        6 : 0   // E string (low)
                                                      } },
                       'bass'   : { 'name'         : 'bass',
                                    'numStrings'   : 4,
                                    'fretsToLabel' : [1,3,5,7,9,12,15],
                                    'stringLabels' : ['G','D','A','E'],
                                    'stringDiff'   : {
                                                        1 : 9,  // G string
                                                        2 : 2,  // D string
                                                        3 : 7,  // A string
                                                        4 : 0   // E string
                                                      } },
                       'mandolin'   : { 'name'         : 'mandolin',
                                    'numStrings'   : 4,
                                    'fretsToLabel' : [1,3,5,7,9,12,15],
                                    'stringLabels' : ['E','A','D','G'],
                                    'stringDiff'   : {
                                                        1 : 0,  // E string
                                                        2 : 7,  // A string
                                                        3 : 2,  // D string
                                                        4 : 9   // G string
                                                      } },
                       'ukulele' : { 'name'         : 'ukulele',
                                     'numStrings'   : 4,
                                     'fretsToLabel' : [1,3,5,7,10,12,15],
                                     'stringLabels' : ['A','E','C','G'],
                                     'stringDiff'   : {
                                                        1 : 7,  // A string
                                                        2 : 0,  // E string
                                                        3 : 4,  // C string
                                                        4 : 9   // G string
                                                      } } };

var scales = {  'major'             : { 'name'    : 'major',
                                        'pattern' : 'o-o-oo-o-o-o' },
                'minor_melodic'     : { 'name'    : 'melodic minor',
                                        'pattern' : 'o-oo-o-o-o-o' },
                'minor_harmonic'    : { 'name'    : 'harmonic minor',
                                        'pattern' : 'o-oo-o-oo--o' },
                'minor_natural'     : { 'name'    : 'natural minor',
                                        'pattern' : 'o-oo-o-oo-o-' },
                'pentatonic_major'  : { 'name'    : 'pentatonic (major)',
                                        'pattern' : 'o-o-o--o-o--' },
                'pentatonic_minor'  : { 'name'    : 'pentatonic (minor)',
                                        'pattern' : 'o--o-o-o--o-' },
                'blues_major'       : { 'name'    : 'blues (major)',
                                        'pattern' : 'o-ooo--o-o--' },
                'blues_minor'       : { 'name'    : 'blues (minor)',
                                        'pattern' : 'o--o-ooo--o-' },
                'ionian_mode'       : { 'name'    : 'ionian mode',
                                        'pattern' : 'o-o-oo-o-o-o' },
                'dorian_mode'       : { 'name'    : 'dorian mode',
                                        'pattern' : 'o-oo-o-o-oo-' },
                'phrygian_mode'     : { 'name'    : 'phrygian mode',
                                        'pattern' : 'oo-o-o-oo-o-' },
                'lydian_mode'       : { 'name'    : 'lydian mode',
                                        'pattern' : 'o-o-o-oo-o-o' },
                'mixolydian_mode'   : { 'name'    : 'mixolydian mode',
                                        'pattern' : 'o-o-oo-o-oo-' },
                'aeolian_mode'      : { 'name'    : 'aeolian mode',
                                        'pattern' : 'o-oo-o-oo-o-' },
                'locrian_mode'      : { 'name'    : 'locrian mode',
                                        'pattern' : 'oo-o-oo-o-o-' }
              };

var defaultKey = "E",
    defaultScale = scales['major'],
    defaultInstrument = instruments['guitar'],
    currentScale = defaultScale,
    currentKey = defaultKey,
    currentInstrument = defaultInstrument,
    showingIntervals = true,
    showingNotes = false,
    highlightingRoot = true,
    highlightingTriads = false;

var fretboardLength = 18;
var grid = {},
    notes = [ 'E','F','F#','G','G#','A','A#','B','C','C#','D','D#' ],
    keyDiff = {
                'E'  : 0,
                'F'  : 1,
                'F#' : 2,
                'Gb' : 2,
                'G'  : 3,
                'G#' : 4,
                'Ab' : 4,
                'A'  : 5,
                'A#' : 6,
                'Bb' : 6,
                'B'  : 7,
                'C'  : 8,
                'C#' : 9,
                'Db' : 9,
                'D'  : 10,
                'D#' : 11,
                'Eb' : 11,
              },
    toneMap = {
                1  : '1',
                2  : 'b2',
                3  : '2',
                4  : 'b3',
                5  : '3',
                6  : '4',
                7  : 'b5',
                8  : '5',
                9  : 'b6',
                10 : '6',
                11 : 'b7',
                12 : '7'
              };




function rearrange(toSplit,divider) {

  // Splits an array, shifts rear portion (after "divider") to the front
  // Universal function, used throughout the app.

  var backLop = [],
      frontLop = [],
      combined = [];
  backLop  = toSplit.slice( divider, toSplit.length);
  frontLop = toSplit.slice( 0, divider);
  combined = backLop.concat(frontLop);
  return combined;
}


function generateFretboard() {

  // Create & populate the placeholder & empty fretboard HTML

  // Append the empty Fretboard wrapper to the DOM
  $('.fretboard_wrapper').empty();

  // Generates the HTML for the fretboard, dynamic based on instrument # of strings/etc.
  var fretboardHTML =  '<div class="table_wrapper">\n';
      fretboardHTML += '<table class="string_labels">\n';
  for (var i = 0; i < currentInstrument.numStrings; i++) {
      fretboardHTML += '<tr><td><div class="cell">'+ currentInstrument.stringLabels[i] +'</div></td></tr>\n';
  }
      fretboardHTML += '</table>\n';
      fretboardHTML += '<table class="fretboard">\n';
  for (var i = 0; i < currentInstrument.numStrings; i++) {
      fretboardHTML += '<tr class="string"></tr>\n';
  }
      fretboardHTML += '<tr class="legend"></tr>\n';
      fretboardHTML += '</table>\n';
      fretboardHTML += '</div>';

  console.log(currentInstrument.numStrings);

  $('.fretboard_wrapper').append(fretboardHTML);

  // Prime the HTML that each fret/cell will be filled with
  cellHTML = '<td><div class="cell fret"></div></td>';

  // Apply the fret/cell HTML into each string
  $('.fretboard .string').each(function(i,string){
    for (var i = 0; i <= fretboardLength; i++) {
      $(string).append(cellHTML);
    }
    $(string).find('.cell').each(function(cellNum,cellObj){
      if ( cellNum == 0 ) {
        $(cellObj).addClass('fret--open');
      } else {
        $(cellObj).addClass('fret--hasBG');
      }
      if ( cellNum == fretboardLength) {
        $(cellObj).addClass('fret--trailer');
      }
    });
  });

  // Apply the fret number row beneath all strings
  for (var i = 1; i < fretboardLength; i++) {
    $('.fretboard .legend').append(cellHTML);
  }
  $('.fretboard .legend').find('.fret').each(function(fretNum,fretObj){
    $(fretObj).hide();
    $(fretObj).addClass('fret--fretNum').attr('data-fret-num',fretNum).text(fretNum);
  });
  $('.fret_marker').empty();
  var showFrets = currentInstrument.fretsToLabel;
  $(showFrets).each(function(i,obj){
    $('.fret--fretNum[data-fret-num='+ obj +']').show();
  });

}


function tonify(scale) {

  // Convert the scale's "o" and "-" blips into the intervals per that scale.
  // Example: "o-o-oo-o-o-o" becomes ["1", "", "2", "", "3", "4", "", "5", "", "6", "", "7"]

  // Convert scale string to an array
  scale = scale.split('');
  // Iterate through each tone
  var tone;
  $(scale).each(function(i,obj) {
    tone = i+1;
    if (obj == 'o') {
      scale[i] = toneMap[tone];
    } else {
      scale[i] = '';
    }
  });
  console.log(scale);
  return scale;
}


function computeScaleTones(scale,key,length) {

  // Accepts (1) a scale, (2) a desired key, and (3) the desired length of the fretboard

  scaleName = scale;

  // Convert the scale's blip pattern into key-agnostic intervals
  scale = tonify(scale);

  // Convert the tones in tonified scale to be as they'd appear on the E string, starting at fret 0
  // For example, a major scale in the key of G would be converted
  // from ["1", "", "2", "", "3", "4", "", "5", "", "6", "", "7"] to ["6", "", "7", "1", "", "2", "", "3", "4", "", "5", ""]
  scale = rearrange( scale, (12 - keyDiff[key]) );

  // Populate each string with the scale, adjusted for variable string tone
  for (var i = 1; i <= currentInstrument.numStrings; i++) {
    var fullString = rearrange(scale, (12 - currentInstrument.stringDiff[i]) );
    // Extend/shorten the scale to match desired length
    grid[i] = fullString.concat(fullString).slice(0,length);
  }
  console.log("A " + currentScale.name + " scale in the key of " + key + " has been saved to the variable 'grid'.");
}



function addTonesToFretboard() {

  // Remove any existing notes, in case user is generating a new scale
  $('.fretboard .note').remove();

  // Set the core HTML that each tone/interval gets
  var noteHTML = '<div class="note"></div>';

  var dotHTML;

  // Go through each string, add the tones/intervals where appropriate
  $('.fretboard .string').each(function(stringNum,stringObj){

    // Give each active fret the empty noteHTML...
    $(grid[stringNum+1]).each(function(gridNum,gridObj){
      if ( gridObj != "" ) {
        $(stringObj).find('.fret').eq(gridNum).html(noteHTML);
      }
    });

    // Give each active fret the necessary data attributes...
    $(grid[stringNum+1]).each(function(gridNum,gridObj){
      if ( gridObj != "" ) {
        $(stringObj).find('.fret').eq(gridNum).find('.note').attr('data-active',true).attr('data-interval',gridObj);
      }
    });

    // Give each active fret its absolute note...
    var extendedNotes = notes.concat(notes);
    extendedNotes = rearrange(extendedNotes,(12 - currentInstrument.stringDiff[stringNum+1]));
    $(stringObj).find('.fret').each(function(fretNum,fretObj){
      $(fretObj).find('.note').attr('data-note', extendedNotes[fretNum]);
    });


    // Give each active fret the necessary data attributes...
    $(grid[stringNum+1]).each(function(gridNum,gridObj){
      if ( gridObj != "" ) {

        if ( showingNotes == true ) {
          dotHTML = $(stringObj).find('.fret').eq(gridNum).find('.note').attr('data-note');
        }
        if ( showingIntervals == true ) {
          dotHTML = gridObj;
        }
        if ( highlightingTriads == true ) {
          var x = $(stringObj).find('.fret').eq(gridNum).find('.note');
          if ( ($(x).attr('data-interval') == "3") || ($(x).attr('data-interval') == "5") || ($(x).attr('data-interval') == "b3") || ($(x).attr('data-interval') == "1")) {
            $(x).addClass('highlight');
          }
        }

        $(stringObj).find('.fret').eq(gridNum).find('.note').text(dotHTML);
      }
    });
  });

}


$(document).ready(function(){

  $('.js-keySelector a[data-key-name="'+defaultKey+'"]').addClass('active');
  $('.js-summonKeyPicker').text(defaultKey);

  $('.js-scaleSelector a[data-scale-name="'+defaultScale.name+'"]').addClass('active');
  $('.js-summonScalePicker').text(defaultScale.name);

  // Generate the placeholder Fretboard wrapper
  generateFretboard();

  // Give the user a pre-canned scale to start with.
  computeScaleTones(defaultScale.pattern,defaultKey,fretboardLength);
  addTonesToFretboard();

});


$(window).on('load', function(){

  // Key Changer!

          $('.js-keySelector a').click(function(){
            $('.js-keySelector a').removeClass('active');
            $(this).addClass('active');
            var newKey = $(this).attr('data-key-name');
            currentKey = newKey;
            computeScaleTones(currentScale.pattern,newKey,fretboardLength);
            addTonesToFretboard();

            // Put into function
            $('.js-summonKeyPicker').text(newKey);
            $(this).closest('.js-overlay').hide();

            return false;
          })

  // Scale Changer!

          $('.js-scaleSelector a').click(function(){
            $('.js-scaleSelector a').removeClass('active');
            $(this).addClass('active');
            var newScale = $(this).attr('data-scale-name');
            currentScale = scales[newScale];
            computeScaleTones(scales[newScale].pattern,currentKey,fretboardLength);
            addTonesToFretboard();

            // Check for rare chords w/ wacky intervals. Make into function?
                // Lydian
                if (newScale == 'lydian_mode') {
                  $('.note[data-interval="b5"]').attr('data-interval','4#');
                  if ( showingIntervals == true ) {
                    $('.note[data-interval="b5"]').text('4#');
                  }
                }

            // Put into function

            $('.js-summonScalePicker').text(scales[newScale].name);
            $(this).closest('.js-overlay').hide();
            return false;
          })

  // Instrument Changer!

          $('.js-instrumentSelector a').click(function(){
            $('.js-instrumentSelector a').removeClass('active--toggle');
            $(this).addClass('active--toggle');
            var newInstrument = $(this).data('instrument'); // e.g., 'ukulele'
            if (currentInstrument.name != newInstrument) {
              currentInstrument = instruments[newInstrument];
              generateFretboard();
              computeScaleTones(currentScale.pattern,currentKey,fretboardLength);
              addTonesToFretboard();
            }
            return false;
          });


});
