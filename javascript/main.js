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
                  <div class='row string' data-string-num='1' data-string-name='E'></div>\
                  <div class='row string' data-string-num='2' data-string-name='B'></div>\
                  <div class='row string' data-string-num='3' data-string-name='G'></div>\
                  <div class='row string' data-string-num='4' data-string-name='D'></div>\
                  <div class='row string' data-string-num='5' data-string-name='A'></div>\
                  <div class='row string' data-string-num='6' data-string-name='E'></div>\
                  <div class='row legend'></div>\
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

function rearrange(toSplit,divider) {
  // Splits an array, shifts rear portion (after "divider") to the front
  var backLop = [],
      frontLop = [],
      combined = [];
  backLop  = toSplit.slice( divider, toSplit.length);
  frontLop = toSplit.slice( 0, divider);
  combined = backLop.concat(frontLop);
  return combined;
}

function computeScaleTones(scale,key,length) {

  // Accepts (1) a scale, (2) a desired key, and (3) the desired length of the fretboard

  // Put the fretboard length into the global variable
  fretboardLength = length;
  
  // Convert the scale's "o" and "-" into the tones per that scale.
  // Example: "o-o-oo-o-o-o" becomes ["1", "", "2", "", "3", "4", "", "5", "", "6", "", "7"]
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
  
}

function addTonesToFretboard() {
  
  $('.fretboard .string').empty();
  $('.fretboard .legend').empty();
  
  // Populate each string
  $('.fretboard .string').each(function(i,string){
    
    $(grid[i+1]).each(function(x,fret){
      $(string).append("<div class='fret_wrapper'><div class='fret' data-active='' data-note='' data-interval='" + fret + "'>" + fret + "</div></div>");
    });
    // Identify the open (first) note on each string
    $(string).find('.fret_wrapper').first().addClass('open');
    // Make empty cells have no interval, &nbsp;
    $(string).find('.fret').each(function(a,b){
      if ( $(b).data('interval') == "") {
        $(b).attr('data-interval','nil').attr('data-active','false').html('&nbsp;');
      } else {
        $(b).attr('data-active','true');
      }
    });
    
    // Give each cell its note
    var extendedNotes = notes.concat(notes);    
    extendedNotes = rearrange(extendedNotes,(12 - stringDiff[i+1]));
    $(string).find('.fret').each(function(a,b){
      $(b).attr('data-note', extendedNotes[a]);
    });

  });
  
    $('.fretboard .legend').append("<div class='fret_marker'></div>");
    for (var i = 1; i < fretboardLength; i++) {
      $('.fretboard .legend').append("<div class='fret_marker' data-fret-num='"+(i)+"'>"+i+"</div>");
    }
    $('.fret_marker').empty();
    var showFrets = [1,3,5,7,9,12,15];
    $(showFrets).each(function(i,obj){
      $('.fret_marker[data-fret-num='+ obj +']').show().text(obj);  
    });
    
}

$(document).ready(function(){

  // Generate the placeholder Fretboard wrapper
  $('.fretboard_wrapper').append(wrapper);
  
  // Generate an initial fretboard
  computeScaleTones(major,'E',18);

});

$(window).on('load', function(){

  addTonesToFretboard();

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
  
  $('.showNotes').click(function(){
    var replaceWith;
    $('.fret[data-active="true"]').each(function(i,obj){
      replaceWith = $(obj).data('note');
      $(obj).text(replaceWith);
    });
    return false;
  });

  $('.showIntervals').click(function(){
    var replaceWith;
    $('.fret[data-active="true"]').each(function(i,obj){
      replaceWith = $(obj).data('interval');
      $(obj).text(replaceWith);
    });
    return false;
  });

  $('.show135').click(function(){
    $('.fret[data-active="true"]').each(function(i,obj){
      if ( ($(obj).attr('data-interval') == "3") || ($(obj).attr('data-interval') == "5") || ($(obj).attr('data-interval') == "b3") || ($(obj).attr('data-interval') == "1")) {
        $(this).toggleClass('highlight');
      }
    });
    return false;
  });

});