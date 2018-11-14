
function addLandmarkSidebarEntry(label,name,i,href)
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
  var _bb='';
  var _bbb='<button id="'+_landmark_name_n+'" class="pull-left"  style="display:inline-block;outline: none;border:none; background-color:white; padding:0px 5px 0px 0px;"  onClick="openLandmark('+i+',\''+_opacity_name+'\',\''+_landmark_list+'\')" title="click to expand landmarks"><span class="glyphicon glyphicon-map-marker" style="color:#407CCA"></span> </button>';

  // If a URL was specified in the query params, set it for all <a> tags. 
  // This enables these links to be opened within another iframe. 
  _target = '';
  if (targetURL != undefined) {
    _target = ' target="' + targetURL + '" ';
  }
  html_label = '';
  if (href != undefined) {
    html_label = '<a href="'+href+'"'+_target+'>'+label+'<span class="glyphicon glyphicon-link" style="font-size:2px;color:#aeaeae"></span></a>'
  } else {
    html_label = '<p>'+label+'</p>'
  }

  _nn+='<a class="accordion-toggle" data-toggle="collapse" data-parent="#landmarklist_lc" href="#' +_collapse_name+'" title="click to expand landmarklist">'+_bb+_bbb+'</a>';
  _nn+=html_label;

  _nn+='</div></div> <!-- panel-title, panel-heading -->';

  _nn+=' <div id="'+_collapse_name+'" class="panel-collapse collapse">';
  _nn+=' <div class="panel-body" id="'+_name+ '" style="background-color:white;opacity:1;padding:0px;"> ';

  _nn+= '<div id="'+landmarkDiv+'" class="row">';
  _nn+= '<div id="'+_landmark_list+'" class="landmarkcontrol row pull-right"></div>';
  _nn+='</div> <!-- landmark Div -->';

  // last bits
  _nn+= '</div> <!-- panel-body -->';

  _nn+= ' </div> </div> <!-- panel-collapse, panel -->';

  jQuery('#landmarklist').append(_nn);

}

function addCalcHTML(name,i,color,label,href)
{
  var _name = name.replace(/ +/g, "");
  var gname=_name.toLowerCase();
  var _landmark_list='#'+gname+'_landmark_list_lc';
  var _label = '<div class="row col-md-12 col-xs-12">'+label+'</div>';

  jQuery(_landmark_list).append(_label);
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

function getLandmarkOrder(lmk) {
    return isNaN(lmk[1].order) ? Number.MAX_VALUE: lmk[1].order;
}

function calculateLandmarkDistances() 
{

  jQuery('#landmarklist').empty();

  if (countSelectedLandmarks() < 2) {
    return
  }

  var lmark_list = landmarks;
  // Check if any landmarks have 'order' set on them. If any do, treat the whole set as 'ordered'.
  var landmarks_ordered = landmarks.some(function(lmk) {return getLandmarkOrder(lmk) != Number.MAX_VALUE});
  if (landmarks_ordered) {
    lmark_list.sort(function(a, b) {return getLandmarkOrder(a) - getLandmarkOrder(b)});
  }

  for(var i = 0; i < lmark_list.length; i++)
  {
    if (!lmark_list[i][0].visible)
      continue;

    var lmark_calculation = {
      'landmark': lmark_list[i][1],
      'distances': []
    }
    var prefix = '';
    if (landmarks_ordered) {
      var lmk_order = getLandmarkOrder(lmark_list[i]);
      //If the order was set to be last, list (N) instead of the set order
      prefix = (lmk_order == Number.MAX_VALUE) ? '(N): ': '(' + lmk_order + '): ';
    }
    addLandmarkSidebarEntry(prefix + getLabel(lmark_calculation.landmark),
                            lmark_calculation.landmark.id,
                            i,
                            getHref(lmark_calculation.landmark));


    for(var j = 0; j < lmark_list.length; j++)
    {
      if (!lmark_list[j][0].visible || i == j)
        continue;

      var lm = lmark_list[j][1];
      var dist = calculateLandmarkDistance(lmark_list[i], lmark_list[j]);
      var actual_distance = dist * model_unitconversion;
      lmark_calculation.distances.push({
        'landmark': lm,
        'unit_distance': dist,
        'actual_distance': actual_distance
        });
      calc_label = '(' + actual_distance.toFixed(2) + model_measurement + ') ' + getLabel(lm);
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

function countSelectedLandmarks()
{
  var num_selected = 0;
  landmarks.forEach(function(landmark)
  {
    if (landmark[0].visible)
    {
      num_selected++;
    }
  });
  return num_selected;
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




