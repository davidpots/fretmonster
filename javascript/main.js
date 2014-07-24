$(document).ready(function(){
  
  // Sets up size for the overlays
  $('.js-overlay').css('position', 'fixed')
  var el = $('.js-overlay');
  $(el).css('top', 0).css('left', 0).css('right',0).css('bottom',0).height( $(window).height());
  
  // On overlay launch, prohibit body from scrolling
  $('.js-summonOverlay').click(function(){
    $('body').addClass('oh');
    return false
  });

  // On overlay launch, prohibit body from scrolling
  $('.js-closeOverlay').click(function(){
    $('body').removeClass('oh');
    $(this).closest('.js-overlay').hide();
    return false
  });
  
  // to launch scale picker overlay
  $('.js-summonScalePicker').click(function(){
    $('.js-scalePicker').fadeIn('fast');
    return false;
  });

  // to launch scale picker overlay
  $('.js-summonKeyPicker').click(function(){
    $('.js-keyPicker').fadeIn('fast');
    return false;
  });

});

var scales = {  'major'             : { 'name'    : 'major',
                                        'pattern' : 'o-o-oo-o-o-o' },
                'minor_melodic'     : { 'name'    : 'melodic minor',
                                        'pattern' : 'o-oo-o-o-o-o' },
                'minor_harmonic'    : { 'name'    : 'harmonic minor',
                                        'pattern' : 'o-oo-o-oo--o' },
                'minor_natural'     : { 'name'    : 'natural minor',
                                        'pattern' : 'o-oo-o-oo-o-' },
                'pentatonic_major'  : { 'name'    : 'pentatonic major',
                                        'pattern' : 'o-o-o--o-o--' },
                'pentatonic_minor'  : { 'name'    : 'pentatonic minor',
                                        'pattern' : 'o--o-o-o--o-' }
              };

var defaultKey = "E",
    defaultScale = scales['major'],
    currentScale = defaultScale,
    currentKey = defaultKey;
    showingIntervals = true,
    showingNotes = false,
    highlightingRoot = true,
    highlightingTriads = false;

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
  }
  console.log("A " + currentScale.name + " scale in the key of " + key + " has been saved to the variable 'grid'.");
}



function addTonesToFretboard() {
  
  // Remoe any existing notes, in case user is generating a new scale
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
    extendedNotes = rearrange(extendedNotes,(12 - stringDiff[stringNum+1]));
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

  $('.js-keySlector a[data-key-name="'+defaultKey+'"]').addClass('active');
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
            $('body').removeClass('oh');
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

            // Put into function
            $('body').removeClass('oh');

            $('.js-summonScalePicker').text(scales[newScale].name);
            $(this).closest('.js-overlay').hide();
            return false;
          })

  
  // Lets the user tweak or toggle some misc display options. TO DO: Make these persist if a key/scale changes...
  
          $('.showNotes').click(function(){
            var replaceWith;
            $('.note[data-active="true"]').each(function(i,obj){
              replaceWith = $(obj).data('note');
              $(obj).text(replaceWith);
            });
            showingNotes = true;
            showingIntervals = false;
            $('.showIntervals').removeClass('active');
            $(this).toggleClass('active');
            return false;
          });

          $('.showIntervals').click(function(){
            var replaceWith;
            $('.note[data-active="true"]').each(function(i,obj){
              replaceWith = $(obj).data('interval');
              $(obj).text(replaceWith);
            });
            showingNotes = false;
            showingIntervals = true;
            $('.showNotes').removeClass('active');
            $(this).toggleClass('active');
            return false;
          });

          $('.highlightRoot').click(function(){
            $('.note[data-active="true"]').each(function(i,obj){
              if ( ($(obj).attr('data-interval') == "3") || ($(obj).attr('data-interval') == "5") || ($(obj).attr('data-interval') == "b3") ) {
                $(this).removeClass('highlight');
              }
              if ( $(obj).attr('data-interval') == "1" ) {
                $(this).addClass('highlight');
              }
            });
            highlightingRoot = true;
            highlightingTriads = false;
            $('.highlightTriads').removeClass('active');
            $(this).addClass('active');
            return false;
          });

          $('.highlightTriads').click(function(){
            $('.note[data-active="true"]').each(function(i,obj){
              if ( ($(obj).attr('data-interval') == "3") || ($(obj).attr('data-interval') == "5") || ($(obj).attr('data-interval') == "b3") || ($(obj).attr('data-interval') == "1")) {
                $(this).addClass('highlight');
              }
            });
            highlightingRoot = false;
            highlightingTriads = true;
            $('.highlightRoot').removeClass('active');
            $(this).addClass('active');
            return false;
          });
          
          // 
          // $('.show135').click(function(){
          //   $('.note[data-active="true"]').each(function(i,obj){
          //     if ( ($(obj).attr('data-interval') == "3") || ($(obj).attr('data-interval') == "5") || ($(obj).attr('data-interval') == "b3") || ($(obj).attr('data-interval') == "1")) {
          //       $(this).toggleClass('highlight');
          //     }
          //   });
          //   if ( showingTriads == true ) {
          //     showingTriads = false;
          //   } else {
          //     showingTriads = true;
          //   }
          //   $(this).toggleClass('active');
          //   return false;
          // });
          
});