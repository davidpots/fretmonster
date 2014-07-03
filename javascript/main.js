var major             = 'o-o-oo-o-o-o',
    minor_melodic     = 'o-oo-o-o-o-o',
    minor_harmonic    = 'o-oo-o-oo--o',
    minor_natural     = 'o-oo-o-oo-o-',
    pentatonic_major  = 'o-o-o--o-o--',
    pentatonic_minor  = 'o--o-o-o--o-';

var fretboardLength = 18;
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


  var fretboardHTML =  '<div class="table_wrapper">\
                          <table class="string_labels">\
                            <tr><td><div class="cell">E</div></td></tr>\
                            <tr><td><div class="cell">B</div></td></tr>\
                            <tr><td><div class="cell">G</div></td></tr>\
                            <tr><td><div class="cell">D</div></td></tr>\
                            <tr><td><div class="cell">A</div></td></tr>\
                            <tr><td><div class="cell">E</div></td></tr>\
                          </table>\
                          <table class="fretboard">\
                            <tr class="string"></tr>\
                            <tr class="string"></tr>\
                            <tr class="string"></tr>\
                            <tr class="string"></tr>\
                            <tr class="string"></tr>\
                            <tr class="string"></tr>\
                            <tr class="legend"></tr>\
                          </table>\
                        </div>';


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
  var showFrets = [1,3,5,7,9,12,15];
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
  for (var i = 1; i <= 6; i++) {
    var fullString = rearrange(scale, (12 - stringDiff[i]) );
    // Extend/shorten the scale to match desired length
    grid[i] = fullString.concat(fullString).slice(0,length);
    console.log(grid[i]);
  }
  console.log("A " + scaleName + " scale in the key of " + key + " has been saved to the variable 'grid'.");
}



function addTonesToFretboard() {
  
  // Remoe any existing notes, in case user is generating a new scale
  $('.fretboard .note').remove();
  
  // Set the core HTML that each tone/interval gets
  noteHTML = '<div class="note"></div>';
  
  // Go through each string, add the tones/intervals where appropriate
  $('.fretboard .string').each(function(stringNum,stringObj){

    // For each note in the scale, give that fret cell the 'note' HTML (i.e., dot)
    $(grid[stringNum+1]).each(function(gridNum,gridObj){
      if ( gridObj != "" ) {
        $(stringObj).find('.fret').eq(gridNum).html(noteHTML);
        $(stringObj).find('.fret').eq(gridNum).find('.note').attr('data-active',true).attr('data-interval',gridObj).text(gridObj);
      }
    });    

    // Give each cell its musical note (i.e., "F#")
    var extendedNotes = notes.concat(notes);    
    extendedNotes = rearrange(extendedNotes,(12 - stringDiff[stringNum+1]));
    $(stringObj).find('.fret').each(function(fretNum,fretObj){
      $(fretObj).find('.note').attr('data-note', extendedNotes[fretNum]);
    });

  });    
}

$(document).ready(function(){

  // Generate the placeholder Fretboard wrapper
  generateFretboard();
  
  // Give the user a pre-canned scale to start with.
  computeScaleTones(major,'E',18);
  addTonesToFretboard();

});


$(window).on('load', function(){

  // Lets the user switch between pre-canned scale choices. To be replaced with more open-ended UI.

          $('.scenario_0').click(function(){
            computeScaleTones(major,'E',18);
            addTonesToFretboard();
            return false;
          });
          $('.scenario_1').click(function(){
            computeScaleTones(major,'G',18);
            addTonesToFretboard();
            return false;
          });
          $('.scenario_2').click(function(){
            computeScaleTones(major,'D',18);
            addTonesToFretboard();
            return false;
          });
          $('.scenario_3').click(function(){
            computeScaleTones(pentatonic_major,'A',18);
            addTonesToFretboard();
            return false;
          });
          $('.scenario_4').click(function(){
            computeScaleTones(pentatonic_minor,'A',18);
            addTonesToFretboard();
            return false;
          });
          $('.scenario_5').click(function(){
            computeScaleTones(minor_melodic,'E',18);
            addTonesToFretboard();
            return false;
          });
          
          $('.scenario').click(function(){
            $('.scenario').removeClass('active');
            $(this).addClass('active');
          })
  
  // Lets the user tweak or toggle some misc display options
  
          $('.showNotes').click(function(){
            var replaceWith;
            $('.note[data-active="true"]').each(function(i,obj){
              replaceWith = $(obj).data('note');
              $(obj).text(replaceWith);
            });
            return false;
          });

          $('.showIntervals').click(function(){
            var replaceWith;
            $('.note[data-active="true"]').each(function(i,obj){
              replaceWith = $(obj).data('interval');
              $(obj).text(replaceWith);
            });
            return false;
          });

          $('.show135').click(function(){
            $('.note[data-active="true"]').each(function(i,obj){
              if ( ($(obj).attr('data-interval') == "3") || ($(obj).attr('data-interval') == "5") || ($(obj).attr('data-interval') == "b3") || ($(obj).attr('data-interval') == "1")) {
                $(this).toggleClass('highlight');
              }
            });
            return false;
          });
          
});