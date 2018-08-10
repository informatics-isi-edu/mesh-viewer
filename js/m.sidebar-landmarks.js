
function addLandmarkSidebarEntry(label,name,i,color,opacity,href)
{
  var _name = name.replace(/ +/g, "");
  var _collapse_name=i+'_collapse_lc';
  var _visible_name_n=i+'_visible_lc';
  var _opacity_name_n=i+'_opacity_lc';
  var _landmark_name_n=i+'_landmark_lc'; // place holder
  var _reset_btn=_name+'_reset_btn_lc';

  // landmark's name is always lowercased
  var gname=_name.toLowerCase();
  var _landmark_list=gname+'_landmark_list_lc';
  var _opacity_name=gname+'_opacity';
  var _opacity_reset=gname+'_opacity_reset';
  var landmarkDiv=_landmark_list+'Div';
  var sliderDiv=_opacity_name+'Div';

  var _nn='';


  _nn+='<div class="panel panel-default col-md-12 col-xs-12">';
  _nn+='<div class="panel-heading">';
  _nn+='<div class="panel-title row" style="background-color:transparent">'

  // var _bb='<button id="'+_visible_name_n+'" class="pull-left" style="display:inline-block;outline: none;border:none; background-color:white; padding:0px 10px 2px 0px;"  onClick="openMesh('+i+',\'visible_'+_name+'\',\''+_opacity_name+'\',\''+_landmark_list+'\',\'opacity_'+_name+'\')" title="click to change visibility of mesh"><span id="visible_'+_name+'" class="glyphicon glyphicon-eye-open" style="color:'+RGBTohex(color)+';"></span> </button>';
  var _bb='';
  // _bb=_bb+'<button id="'+_opacity_name_n+'" class="pull-left"  style="display:inline-block;outline: none;border:none; background-color:white; padding:0px 0px 0px 0px;"  onClick="opacityMesh('+i+',\'opacity_'+_name+'\',\''+_opacity_name+'\',\''+_landmark_list+'\')" title="click to change opacity of mesh"><span id="opacity_'+_name+'" class="glyphicon glyphicon-tasks" style="color:#407CCA"></span> </button>';

  var _bbb='<button id="'+_landmark_name_n+'" class="pull-left"  style="display:inline-block;outline: none;border:none; background-color:white; padding:0px 5px 0px 0px;"  onClick="openLandmark('+i+',\''+_opacity_name+'\',\''+_landmark_list+'\')" title="click to expand landmarks"><span class="glyphicon glyphicon-map-marker" style="color:#407CCA"></span> </button>';
  //var _bbb=''

  // If a URL was specified in the query params, set it for all <a> tags. 
  // This enables these links to be opened within another iframe. 
  _target = '';
  if (targetURL != undefined) {
    _target = ' target="' + targetURL + '" ';
  } 
  // if(hasLandmarks) {
  //    if(href) {
  //       _nn+='<a class="accordion-toggle" data-toggle="collapse" data-parent="#landmarklist" href="#' +_collapse_name+'" title="click to expand landmarklist">'+_bb+_bbb+'</a>';
  //       _nn+='<a href="'+href+'"'+_target+'>'+label+'<span class="glyphicon glyphicon-link" style="font-size:2px;color:#aeaeae"></span></a>';
  //       } else {
        _nn+='<a class="accordion-toggle" data-toggle="collapse" data-parent="#landmarklist_lc" href="#' +_collapse_name+'" title="click to expand landmarklist">'+_bb+_bbb+'</a><p>'+label+'</p>';
  //    }
  //   } else {
  //     if(href) {
  //       _nn+='<a class="accordion-toggle" data-toggle="collapse" data-parent="#landmarklist" href="#' +_collapse_name+'" title="click to expand landmarklist">'+_bb+'</a>';
  //       _nn+='<a href="'+href+'"'+_target+'>'+label+'<span class="glyphicon glyphicon-link" style="font-size:2px;color:#aeaeae"></span></a>';
  //       } else {
  // _nn+='<a class="accordion-toggle" data-toggle="collapse" data-parent="#landmarklist" href="#' +_collapse_name+'" title="click to expand landmarklist">'+_bb+'</a><a>'+label+'</a>';
  //     }
  // }


  _nn+='</div></div> <!-- panel-title, panel-heading -->';

  _nn+=' <div id="'+_collapse_name+'" class="panel-collapse collapse">';
  _nn+=' <div class="panel-body" id="'+_name+ '" style="background-color:white;opacity:1;padding:0px;"> ';

  _nn+= '<div id="'+landmarkDiv+'" class="row">';
  _nn+= '<div id="'+_landmark_list+'" class="landmarkcontrol row pull-right"></div>';
  _nn+='</div> <!-- landmark Div -->';

  var _ss= makeSliderStubs(_opacity_name, _opacity_reset, opacity);
  _nn+=_ss;

  // last bits
  _nn+= '</div> <!-- panel-body -->';

  _nn+= ' </div> </div> <!-- panel-collapse, panel -->';

  jQuery('#landmarklist').append(_nn);

}

function addCalcHTML(name,i,color,label,href)
{
  var _name = name.replace(/ +/g, "");
  var _landmark_list='#'+_name+'_landmark_list_lc';
  var _nn='';
  if(href) {
    //_nn+='<div class="row col-md-12 col-xs-12"><input id='+_name+'_'+i+' type=checkbox checked="" onClick="toggleLandmark(\''+_name+'\','+i+');" value='+i+' name="landmark"></input><a href="'+href+'" style="color:inherit">'+" "+label+'</a><span class="glyphicon glyphicon-link" style="font-size:12px;color:grey"></span></div>';
    } else {
      _nn+='<div class="row col-md-12 col-xs-12">'+label+'</div>';
  }
  jQuery(_landmark_list).append(_nn);
}


// mesh sidebar js

var landmarks_sidebar=false;
var using_landmarks_button=false;

// or could initiate a 'click' on
// the landmarksButton
function dismissLandmarks() 
{
  if(using_landmarks_button)
    landmarksClick_btn();
  else landmarksClick();
}

// placeholder.. 
function landmarksClick_btn() 
{
  using_landmarks_button=true;
  landmarks_sidebar = !landmarks_sidebar;
  if(landmarks_sidebar) {
    $('#landmarksbtn').addClass('pick');
    } else {
      $('#landmarksbtn').removeClass('pick');
  }
}

function calculateLandmarkDistances() 
{

  jQuery('#landmarklist').empty();

  var lmark_calculations = []
  for(var i = 0; i < landmarks.length; i++) {
    if (!landmarks[i][0].visible)
      continue;

    var lmark_calculation = {
      'landmark': landmarks[i][1],
      'distances': []
    }
    addLandmarkSidebarEntry(lmark_calculation.landmark.link.label, lmark_calculation.landmark.id, i, null, null);


    for(var j = 0; j < landmarks.length; j++) {
      if (!landmarks[j][0].visible || i == j)
        continue;

      var lm = landmarks[j][1];
      var dist = calculateLandmarkDistance(landmarks[i], landmarks[j]);
      var actual_distance = dist * model_unitconversion;
      lmark_calculation.distances.push({
        'landmark': lm,
        'unit_distance': dist,
        'actual_distance': actual_distance
        });
      calc_label = '(' + actual_distance.toFixed(2) + model_measurement + ') ' + lm.link.label;
      addCalcHTML(lmark_calculation.landmark.id,i,null,calc_label,null);

    }
  }
  landmarksClick();
}

//Calculate the distance given two landmark objects, as defined by the schema in the README.
//The distance is measured by coordinate units from each landmark's center position. 
function calculateLandmarkDistance(landmark1, landmark2)
{
  lp1 = landmark1[1].point;
  lp2 = landmark2[1].point;
  p1 = new X.vector(lp1[0], lp1[1], lp1[2]);
  p2 = new X.vector(lp2[0], lp2[1], lp2[2]);
  return X.vector.distance(p1, p2);
}


// slide out
function landmarksClick() {
  if(clip_sidebar) {
     clipClick();
  }
  landmarks_sidebar = !landmarks_sidebar;
  if(landmarks_sidebar) {
    sidebar_landmarks_slideOut();
    $('#landmarksbtn').addClass('pick');
    } else {
      sidebar_landmarks_slideIn();
      $('#landmarksbtn').removeClass('pick');
  }
}

function sidebar_landmarks_slideOut() {
  if (jQuery('#landmarks').hasClass('menuDisabled')) {
    // if this menu is disabled, don't slide
    return;
  }
  var panelptr=$('#landmarks');
  var sidebarptr=$('#sidebar');
  panelptr.css("display","");
  sidebarptr.css("display","");
  panelptr.removeClass('fade-out').addClass('fade-in');
}
function sidebar_landmarks_slideIn() {
  if (jQuery('#landmarks').hasClass('menuDisabled')) {
    // if this menu is disabled, don't slide
    return;
  }
  var panelptr=$('#landmarks');
  panelptr.removeClass('fade-in').addClass('fade-out');
  panelptr.css("display","none");
}


// clip sidebar js


// slide out
function clipLandmarksClick() {
  if(landmarks_sidebar) {
     landmarksClick();
  }
  clip_sidebar = !clip_sidebar;
  if(clip_sidebar) {
    sidebar_clip_slideOut();
    $('#clipbtn').addClass('pick');
    } else {
      sidebar_clip_slideIn();
      $('#clipbtn').removeClass('pick');
  }
}

function sidebar_landmarks_clip_slideOut() {
  if (jQuery('#clip').hasClass('menuDisabled')) {
    // if this menu is disabled, don't slide
    return;
  }
  var panelptr=$('#clip');
  var sidebarptr=$('#sidebar');
  panelptr.css("display","");
  sidebarptr.css("display","");
  panelptr.removeClass('fade-out').addClass('fade-in');
}
function sidebar_clip_slideIn() {
  if (jQuery('#clip').hasClass('menuDisabled')) {
    // if this menu is disabled, don't slide
    return;
  }
  var panelptr=$('#clip');
  panelptr.removeClass('fade-in').addClass('fade-out');
  panelptr.css("display","none");
}




