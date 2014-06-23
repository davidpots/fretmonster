var major             = 'o-o-oo-o-o-o',
    minor_melodic     = 'o-oo-o-o-o-o',
    minor_harmonic    = 'o-oo-o-oo--o',
    minor_natural     = 'o-oo-o-oo-o-',
    pentatonic_major  = 'o-o-o--o-o--',
    pentatonic_minor  = 'o--o-o-o--o-';

var fretboardLength;
var grid = {
              1 : '',
              2 : '',
              3 : '',
              4 : '',
              5 : '',
              6 : ''      
           },
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
              },
    stringDiff = {
                    // Kinda hacky, but this is constant/fixed. The value represents the number of tones this string is different from the E string.
                    1 : 0,  // E string (high)
                    2 : 5,  // B string        
                    3 : 9,  // G string
                    4 : 2,  // D string
                    5 : 7,  // A string
                    6 : 0   // E string (low)
                 };

var wrapper =  "<div class='fretboard'>\
                  <div class='string' data-string-num='1' data-string-name='E'></div>\
                  <div class='string' data-string-num='2' data-string-name='B'></div>\
                  <div class='string' data-string-num='3' data-string-name='G'></div>\
                  <div class='string' data-string-num='4' data-string-name='D'></div>\
                  <div class='string' data-string-num='5' data-string-name='A'></div>\
                  <div class='string' data-string-num='6' data-string-name='E'></div>\
                </div>";

function tonify(scale) {
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
  return scale;
}

function generateFretboard(scale,key,length) {
  fretboardLength = length;

  // Accepts (1) a scale, (2) a desired key, and (3) the desired length of the fretboard
  //
  // Example:   generateFreboard(major,'G',18)
  // Returns:   ["6", "-", "7", "1", "-", "2", "-", "3", "4", "-", "5", "-", "6", "-", "7", "1", "-", "2"]
  //
  // The first item in the returned array is understood to be the 0th fret (i.e., open) on the string.

  // Setup the initial 12-fret scale per that key
  var scaleSplit = tonify(scale);
  var backLop  = scaleSplit.slice( (scaleSplit.length - keyDiff[key]) , scaleSplit.length);
  var frontLop = scaleSplit.slice( 0, (scaleSplit.length - keyDiff[key]));
  var combined = backLop.concat(frontLop);
  
  // Populate each string with the scale, adjusted for variable string tone
  for (var i = 1; i <= 6; i++) {
    frontLop = combined.slice( 0, (12 - stringDiff[i]) );
    backLop = combined.slice( (12 - stringDiff[i]), combined.length );
    var fullString = backLop.concat(frontLop);
    // Extend/shorten the scale to match desired length
    fullString = fullString.concat(fullString).slice(0,length);
    grid[i] = fullString;
    

    console.log(grid[i]);
  }      
}

$(document).ready(function(){
  
  // Generate an initial fretboard
  generateFretboard(major,'G',18);
  
  // Generate the placeholder Fretboard wrapper
  $('body').append(wrapper);
  

});

$(window).on('load', function(){
  // Populate each string
  $('.fretboard .string').each(function(i,string){
    
    $(grid[i+1]).each(function(x,fret){
      $(string).append("<div class='fret p1 inline-block align-center bg-light-grey' data-note='' data-interval='" + fret + "'>" + fret + "</div>");
    });
    // Identify the open (first) note on each string
    $(string).find('.fret').first().addClass('open').addClass('bg-medium-grey');
    // Make empty cells have no interval, &nbsp;
    $(string).find('.fret').each(function(a,b){
      if ( $(b).data('interval') == "") {
        $(b).attr('data-interval','nil').html('&nbsp;');
      } 
    });
    
    // Give each cell it's note
    var extendedNotes = notes.concat(notes);
    frontLop = extendedNotes.slice( 0, (12 - stringDiff[i+1]) );
    backLop = extendedNotes.slice( (12 - stringDiff[i+1]), extendedNotes.length );
    extendedNotes = backLop.concat(frontLop);
    $(string).find('.fret').each(function(a,b){
      $(b).attr('data-note', extendedNotes[a]);
    });

  });
});