//**************************************************************
//   m.viewer.js
//
//   viewer.html  (using default localhost data)
//   viewer.html?model="http:..."
//   viewer.html?mesh="http:..."&landmark="http:..."
//   viewer.html?...&view="";
//
// from view.html
//    meshesClick()
//    toggleAllLandmark()
//    toggleBox()
//    clipClick()
//    spinView()
//    resetView()
//    zoomIn()
//    zoomOut()
//    jpgDownload(null) ** not enabled
//    dismissMeshes()
//    dismissClip()
//    reset_clipPlane()
//
//   meshes, label is used to display on the legends
//           id is used to link between mesh and its landmarks points
//**************************************************************

/*
 [1.00, 0.80, 0.40]  eggyoke yellow 
 [0.53, 0.90, 0.90]  light aqua 
 [1.00, 0.46, 0.19]  light orange 
*/
var TESTMODE=false; // to track demo.html and view.html requirements

// global scoped data
var ren3d=null; // 3d renderer

var meshs=[];   // mesh objects -- [_mesh, _meshjson]
var vol=null;   // volume objects
var gbbox=null; // global bounding box

var sliceAx=null;
var sliceSag=null;
var sliceCor=null;
var landmarks=[];  // sphere objects
var first_time=true;
var first_time_vol=true;

var add_landmark=false;
var load_landmark=false;

//=== bounding box ===
var show_box = true;

//==== Mesh ====
var initial_mesh_list={};
var mesh_list={};
var mesh_opacity_list=[];
var show_mesh = true;

//==== Landmark ====
var calcDistance = false;
var points=[]; // only keeps last two
var show_landmark = true;

//==== Label/Picking ====
var saved_color=null;
var saved_id=null;
var show_caption=false;

//==== View/Tracking ====
var save_view_matrix = new Float32Array(16);
var spin_view=false;


// MAIN
jQuery(document).ready(function() {

  if (webgl_detect() == false) {
    alertify.confirm("There is no webgl!!");
    throw new Error("WebGL is not enabled!");
    return;
  }

  var h=window.innerHeight;
  var m= document.getElementById('meshes');
  var h= Math.floor(h*0.80);
  var hh=h+"px";
  if(m)
    m.style.maxHeight=hh;
//  window.console.log("height is..",hh);

  var tmp = document.getElementById('TESTING');
  if(tmp) {
    TESTMODE=true;
  }
  
  var args=document.location.href.split('?');
  if (args.length >= 2) { // there are some url to pick up
    processArgs(args);
    } else {
      setupWithDefaults();
  }

  var _m=mesh_load();
  initial_mesh_list=_m[0], mesh_list=_m[1];

  initRenderer();

  if(initial_mesh_list) {
    for (var i=0;i<initial_mesh_list['mesh'].length;i++) {
       addMesh(initial_mesh_list['mesh'][i]);
    }
  }

// load the landmarks
  toggleAllLandmark();
// suppress the showing of the landmarks
  toggleAllLandmark();


// stackoverflow.com/question/17462936/xtk-flickering-in-overlay-mesh
// resolve multiple mesh transparent object being rendered causing flickering
// effect
  ren3d.config.ORDERING_ENABLED=false;

  show_caption=false;

  ren3d.interactor.onMouseDown = myMouseDownFunc;
  ren3d.interactor.onMouseUp = myMouseUpFunc;

// zoom in alittle
// replace default X camera's zoom,
  ren3d.camera.zoomIn = function() {
    cameraZoomingIn(true,false);
  };

  ren3d.camera.zoomOut = function() {
    cameraZoomingIn(false,false);
  };

  ren3d.onShowtime = function(){
//window.console.log("calling onShowtime");
    var loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'none';

    if( first_time ) {
      setupViewerBackground();
      first_time=false;
      setupClipSlider();
      initClipSlider();
      initOpacitySliders();
      if (vol) { // use bounding box if vol exists
        var _y=(vol.bbox[3] - vol.bbox[2] + 1)*1.3;
        ren3d.camera.position = [ 0, _y, 0];
//window.console.log("using vol, y max "+vol.bbox[3]+" y min "+ vol.bbox[2]);
//window.console.log("and now "+_y);
        } else {
          var _y=(ren3d.bbox[3] - ren3d.bbox[2] + 1)*1.3;
          ren3d.camera.position = [ 0, _y, 0];
//window.console.log("using renderer3d, y max "+ren3d.bbox[3]+" y min "+ ren3d.bbox[2]);
//window.console.log("and now "+_y);
      }
      if(!hasViews) {
        saveView();
        } else {
          loadView();
          goView();
      }
dumpView();
    }
    if(first_time_vol && vol) {

      first_time_vol=false;
      setupSlicers();
      setup3dSliders();
      init3dSliders();
      setup2dSliders();
      init2dSliders();
      makeBBox(ren3d,vol);
      gbbox.visible=false;
      show_box = false;
      } else {
        makeBBox(ren3d,null);
        gbbox.visible=false;
        show_box = false;
    }
  };

  ren3d.onRender = function() {
// rotate the camera in X-direction
    if(spin_view) {
      ren3d.camera.rotate([1, 0]);
    }
  };

  ren3d.render();
})

function setupViewerBackground()
{
  var id='mainView';
window.console.log("model_color is..",model_color);
  if(model_color) {
    var color=RGBTohex(model_color);
    document.getElementById(id).style.backgroundColor = color;
  }
}

function myMouseDownFunc() {
window.console.log("in myMouseDownFunc..");
  if(saved_color != null) {
    ren3d.get(saved_id).color = saved_color;
//      ren3d.get(saved_id).transform.translateY(-1);
    saved_color=null;
  }
 // grab the current mouse position
 var _pos = ren3d.interactor.mousePosition;
//
window.console.log("  current mouse position is.."+_pos);
//var _c = ren3d.camera.unproject_(_pos[0], _pos[1], 0);
//window.console.log("  and c is "+_c[0]+" "+_c[1]+" "+_c[2]);

  // pick the current object
  var _id = ren3d.pick(_pos[0], _pos[1]);

window.console.log("picking the current object..",_id);

  if (_id != 0) {
    var _obj=ren3d.get(_id);
// this is particular to the mousehead mesh, need to figure out
// how to calc on the fly or store landmark params somewhere.

    if(show_caption) {
//window.console.log("show_caption..");
      if(ren3d.get(_id).caption) {
        var _j=ren3d.get(_id).caption;

        showLabel(_j['description'],_j['link']);
window.console.log("trying to show Label..");
window.console.log(_j['description'],_j['link']);
        } else { 
window.console.log("  this object "+_id+ " does not have caption..");
      }
      return; // show_caption
    }
    
    // highlight the object
    if(ren3d.get(_id).caption && !add_landmark) {
//window.console.log("  picking obj .."+_id);
      saved_color=ren3d.get(_id).color;
      var obj=ren3d.get(_id);
      saved_id=_id;
      ren3d.get(_id).color = [1, 1, 1];
//ren3d.get(saved_id).transform.translateY(1);
      return;
    }

// treat this as dynamic landmark to be added
    if( add_landmark ) {  
      var _targetlist=ren3d.pick3d(_pos[0],_pos[1], 0.4, 0.08, _obj);
      var m=[];
      var plist=[];
// [[march_point,[roi_points]],...[march_point,[roi_points]]
// stop at the first set roi_points that has length > 0 
//window.console.log(" picking "+_id+ " no c=0");
      if(_targetlist != null) {
        for(var i=0; i<_targetlist.length; i++) {
          if(_targetlist[i][1].length !=0) {
            m=_targetlist[i][0];
            plist=_targetlist[i][1];
            break;
          }
        }
      }
          
      if(plist.length ==0)
        return;

      for(var i=0; i< plist.length; i++) {
        var _p=plist[i];
        if(i == 0) {
          var _s=addSphere(_p,[0.25,1,0.4],0.04, _c);
          insertLandmark(_s,_obj);
          } else {
            var _c={ "description":"fake landmark" };
            var _s=addSphere(_p,[0.25,1,0.6],0.04, _c);
            insertLandmark(_s,_obj);
        }
      }
    }
  } else {
window.console.log("  DID not pick anything");
  }
}

function myMouseUpFunc() {
window.console.log("in myMouseUpFunc..");
  if(saved_color == null) {
    return;
  }
  // grab the object and turn it red
  ren3d.get(saved_id).color = saved_color;
//window.console.log("  reset "+saved_id + " with "+saved_color);
//    ren3d.get(saved_id).transform.translateY(-1);
  saved_color=null;
  saved_id=null;
}


// inward = true for zoomIn
// inward = false for zoomOut
// logic from xtk's source
function cameraZoomingIn(inward,fast)
{
  var zoomStep = 20;
  var tmp=ren3d.camera.view[14];
  var s=Math.abs(tmp);

  var slow=false;
  if (fast!=undefined && !fast && s<100) {
    slow=true;
  }

  if (slow) {
    zoomStep = 1;
  }
//window.console.log("zoomStep is..",zoomStep);

// mouse->10, 19mesh -> 1000 range
// 
  if(inward) {
    ren3d.camera.view[14] += zoomStep;
    } else {
      ren3d.camera.view[14] -= zoomStep;
  }
  if(ren3d.camera.view[14] > 0) {
//window.console.log("calling my zoomIn.. cap it..");
    ren3d.camera.view[14]=0;
  } 
}

function zoomIn()
{
  cameraZoomingIn(true,false);
}

function zoomOut()
{
  cameraZoomingIn(false,false);
}

//http://stackoverflow.com/questions/11871077/proper-way-to-detect-webgl-support
function webgl_detect()
{
  if (!!window.WebGLRenderingContext) {
    var canvas = document.createElement("canvas"),
         names = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
       context = false;

    for(var i=0;i<4;i++) {
      try {
        context = canvas.getContext(names[i]);
        if (context && typeof context.getParameter == "function") {
          // WebGL is enabled
          return true;
        }
      } catch(e) {}
    }
    // WebGL is supported, but disabled
    return false;
  }

  // WebGL not supported
  return false;
}

function insertLandmark(_s,_obj) {
window.console.log("PANIC, insertLandmark, should double check here..");
   var _g=_obj.file.split('/').pop().toLowerCase().split('.').shift();
   var _cap= { "description":"user added landmark" };
//window.console.log("==> insertLandmark, adding a new landmark for "+_g);

   if( landmarks[_g] == null ) {
     landmarks[_g]=[];
     landmarks[_g].push(_s);
     } else {
       landmarks[_g].push(_s);
   }
   var _label=askForLabel(_g);
   addLandmarkListEntry(_g,landmarks[_g].length,_obj.color,_label,null);
}

function askForLabel(g)
{
  return "new landmark for "+g;
}

function stringIt(msg, v) {
  var str="{";
  for(var i=0; i<v.length; i++) {
    str=str+" "+v[i].toString();
    if(i!=v.length-1) {
       str=str+",";
    } else {
          str=str+"}";
    }
  }
  window.console.log(msg+" "+str);
}

function saveView() {
  /* copy it over */
  for(var i=0; i< ren3d.camera.view.length; i++)
    save_view_matrix[i]=ren3d.camera.view[i];
}

function dumpView() {
  var tmp_matrix=[];
  // view: [ { "matrix": [..]} ]
  for(var i=0; i< ren3d.camera.view.length; i++)
    tmp_matrix[i]=ren3d.camera.view[i];
  stringIt("dumpView", tmp_matrix);
}

function goView() {
  for(var i=0; i< save_view_matrix.length; i++)
    ren3d.camera.view[i]=save_view_matrix[i];
  ren3d.render();
}

function resetView() {
  ren3d.resetViewAndRender();
  goView();
}

function loadView() {
  var _v = view_load();
  if(_v) {
    for(var i=0; i< _v.length; i++) { 
      save_view_matrix[i]=_v[i];
    }
  }
  stringIt("loadView", save_view_matrix);
}

function spinView() {
  spin_view = !spin_view;
  if(spin_view) {
    jQuery('#spinbtn').prop('value','stop spinning');
    $('#spinbtn').addClass('pick');
    } else {
      jQuery('#spinbtn').prop('value','spin');
      $('#spinbtn').removeClass('pick');
  }
}

function initRenderer() {
  // do it once only
  if( ren3d != null ) {
      return;
  }
  ren3d = new X.renderer3D();
  ren3d.container='mainView';

  ren3d.init();

//http://stackoverflow.com/questions/10380269/change-the-config-attribute
//-of-an-interactor-for-disabling-some-user-events?rq=1

// disable default tooltip-caption 
//  ren3d.interactor.config.HOVERING_ENABLED = false;

// suppress zoom in and out via mousewheel

  if(!TESTMODE) {
    ren3d.interactor.config.MOUSEWHEEL_ENABLED = false;
    ren3d.interactor.init();
  }
}

function RGBTohex(rgb) {
   var r=Math.floor(rgb[0] * 255);
   var g=Math.floor(rgb[1] * 255);
   var b=Math.floor(rgb[2] * 255);
   var _hex = '#' + (r==0?'00':r.toString(16))+
               (g==0?'00':g.toString(16))+ (b==0?'00':b.toString(16));
   return _hex;
}

//var name=fname.split('/').pop().toLowerCase().split('.').shift();
function addMeshListEntry(label,name,i,color,opacity,href)
{
  var _name = name.replace(/ +/g, "");
  var _collapse_name=i+'_collapse';
  var _visible_name=i+'_visible';
  var _landmark_name=i+'_landmark'; // place holder
  var _reset_btn=_name+'_reset_btn';

// landmark's name is always lowercased
  var gname=_name.toLowerCase();
  var _landmark_list=gname+'_landmark_list';
  var _opacity_name=gname+'_opacity';
  var _opacity_reset=gname+'_opacity_reset';
  var landmarkDiv=_landmark_list+'Div';
  var sliderDiv=_opacity_name+'Div';

  var _nn='';

_nn+='<div class="panel panel-default col-md-12 col-xs-12">';
_nn+='<div class="panel-heading">';
_nn+='<div class="panel-title row" style="background-color:transparent">'

var _bb='<button id="'+_visible_name+'" class="pull-left"  style="display:inline-block;outline: none;border:none; background-color:white"  onClick="openMesh('+i+',\'eye_'+_name+'\',\''+_opacity_name+'\',\''+_landmark_list+'\')" title="hide or show mesh"><span id="eye_'+_name+'" class="glyphicon glyphicon-eye-open" style="color:'+RGBTohex(color)+';"></span> </button>';

var _bbb='<button id="'+_landmark_name+'" class="pull-left"  style="display:inline-block;outline: none;border:none; background-color:white"  onClick="openLandmark('+i+',\''+_opacity_name+'\',\''+_landmark_list+'\')" title="click to expand landmarks"><span class="glyphicon glyphicon-map-marker" style="color:#407CCA"></span> </button>';

if(hasLandmarks) {
   if(href) {
      _nn+='<a class="accordion-toggle" data-toggle="collapse" data-parent="#meshlist" href="#' +_collapse_name+'" title="click to expand landmarks">'+_bb+_bbb+'</a>';
      _nn+='<a href="'+href+'">'+label+'<span class="glyphicon glyphicon-link" style="font-size:12px;color:grey"></span></a>';
      } else {
      _nn+='<a class="accordion-toggle" data-toggle="collapse" data-parent="#meshlist" href="#' +_collapse_name+'" title="click to expand landmarks">'+_bb+_bbb+'</a><a>'+label+'</a>';
   }
  } else {
    if(href) {
      _nn+='<a class="accordion-toggle" data-toggle="collapse" data-parent="#meshlist" href="#' +_collapse_name+'" title="click to expand landmarks">'+_bb+'</a>';
      _nn+='<a href="'+href+'">'+label+'<span class="glyphicon glyphicon-link" style="font-size:12px;color:grey"></span></a>';
      } else {
        _nn+='<a class="accordion-toggle" data-toggle="collapse" data-parent="#meshlist" href="#' +_collapse_name+'" title="click to expand landmarks">'+_bb+'</a><a>'+label+'</a>';
    }
}
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

  jQuery('#meshlist').append(_nn);
window.console.log("MM",_nn);
}

// TEST MEI
function addTESTMeshListEntry(label,name,i,color)
{
  var _name = name.replace(/ +/g, "");
  var _nn='<button class="btn btn-sq-sm" disabled=true style="background-color:'+RGBTohex(color)+';"/><input id='+_name+' type=checkbox checked="" onClick=openMesh('+i+') value='+i+' name="mesh">'+label+'</input><br>';
  jQuery('#TESTmeshlist').append(_nn);
//window.console.log(_nn);
}

function makeSliderStubs(sliderId, resetId, opacity)
{ //mesh_opacity_list=[];
  var _nn='';
  var sliderDiv=sliderId+'Div';

_nn+='<div id=\''+sliderDiv+'\' class="row col-md-12 col-xs-12" style="margin-top:10px; margin-left:5px; display:none" >';
_nn+='<div id=\''+ sliderId +'\' title="move slider to adjust opacity" class="h-slider"> </div>';
/*
_nn+='<div id=\''+ sliderId +'\' title="move slider to adjust opacity" style="background:rgb(51, 122, 183)"> </div>';
*/
_nn+='<div class="row col-md-10 col-xs-10 pull-right">';
_nn+='<button id=\''+resetId+'\' class="btn btn-xs btn-success" style="margin:10px; title="Reset opacity" onclick="reset_opacity(\''+sliderId+'\');">Reset</button>';
_nn+='</div> <!-- opacityDiv -->';

  mesh_opacity_list.push( { 'id':sliderId, 'reset':resetId , 'opacity':opacity});
  return _nn;
}

function initOpacitySliders()
{
  var cnt=mesh_opacity_list.length;  
  for(var i=0; i<cnt; i++) {
    setupOpacitySlider(i);
  }
}

function setupOpacitySlider(idx) {
    var item=mesh_opacity_list[idx];
    var sid=item['id'];
    var rid=item['reset'];
    var op=item['opacity'];
    var _s='#'+sid;

window.console.log("init..",_s, " ", sid);

    jQuery(_s).slider({
      slide: function( event, ui ) {
       updateOpacitySlider(sid, ui.value);
      }
    });
    jQuery(_s).width(100 + '%');
    jQuery(_s).slider("option", "value", op); // by default
    jQuery(_s).slider("option", "min", 0);
    jQuery(_s).slider("option", "max", 1);
    jQuery(_s).slider("option", "step", 0.1);
}

function updateOpacitySlider(sid, op) {
window.console.log("sid opacity slider..", sid);
  var cnt=mesh_opacity_list.length;
  for(var i=0; i<cnt; i++) {
     if(mesh_opacity_list[i]['id']==sid) {
window.console.log(mesh_opacity_list[i]['id'], " and ", sid);
       resetOpacitySlider(i, op);
       return;
     }
  }
}

function reset_opacity(sid) {
  var cnt=mesh_opacity_list.length;
  for(var i=0; i<cnt; i++) {
     if(mesh_opacity_list[i]['id']==sid) {
       var op=mesh_opacity_list[i]['opacity'];
       resetOpacitySlider(i, op);
       return;
     }
  }
}

function resetOpacitySlider(idx,op) {
window.console.log("reset opacity..",idx," with ",op);
//  mesh_opacity_list[idx]['opacity']=op;
  var item=mesh_opacity_list[idx];
  var id=item['id'];

  var _m=meshs[idx];
  var _mm=_m[0];
  _mm.opacity=op;
  if(op == 0) {
    _mm.visible=false;
    } else {
      _mm.visible=true;
  }

  var _s='#'+id;
  jQuery(_s).slider("option", "value", op); // by default
}

function toggleAddLandmark() 
{
  add_landmark = ! add_landmark;
  if(add_landmark) {
    jQuery('#toggleAddLandmarkbtn').prop('value','noAdd');
    } else {
      jQuery('#toggleAddLandmarkbtn').prop('value','addMore');
  }
}

function addLandmarkListEntry(name,i,color,label,href)
{
  var _name = name.replace(/ +/g, "");
  var _landmark_list='#'+_name+'_landmark_list';
  var _nn='';
  if(href) {
    _nn+='<div class="row col-md-12 col-xs-12"><input id='+_name+'_'+i+' type=checkbox checked="" onClick="toggleLandmark(\''+_name+'\','+i+');" value='+i+' name="landmark"></input><a href="'+href+'" style="color:inherit">'+" "+label+'</a><span class="glyphicon glyphicon-link" style="font-size:12px;color:grey"></span></div>';
    } else {
      _nn+='<div class="row col-md-12 col-xs-12"><input id='+_name+'_'+i+' type=checkbox checked="" onClick="toggleLandmark(\''+_name+'\','+i+');" value='+i+' name="landmark" style="color:inherit">'+" "+label+'</input></div>';
  }
  jQuery(_landmark_list).append(_nn);
//window.console.log("LLL",_nn);
}

function addTESTLandmarkListEntry(name,i,color,label)
{
  var _name = name.replace(/ +/g, "");
  var _nn='<button class="btn" disabled=true style="background-color:'+RGBTohex(color)+';"/><input type="checkbox" class="mychkbox" id="'+_name+'_'+i+'d" onClick="toggleDistance(\''+_name+'\','+i+');"/><label for="'+_name+'_'+i+'d" style="display:none" name="distance"></label><input id='+_name+'_'+i+' type=checkbox checked="" onClick="toggleLandmark(\''+_name+'\','+i+');" value='+i+' name="landmark">'+label+'</input><br>';
    jQuery('#TESTlandmarklist').append(_nn);
//window.console.log(_nn);
}

function selectLandmark()
{
  /* by default, replace all distance selection */
  jQuery('#calcbtn').css('border-color','grey');
  noDistance();
  computeDistance();

  show_landmark = !show_landmark;
  var _list=document.getElementsByName("landmark");
  if(show_landmark) {
    jQuery('#selectlandmarkbtn').prop('value','excludeLandmark');
    for (var i=0; i<_list.length;i++) {
      _list[i].checked=false;
      var _g=(_list[i].id).split('_').shift();
      var _i=_list[i].value-1;
      _list[i].checked=true;
      landmarks[_g][_i].visible=true;
    }
    } else {
      jQuery('#selectlandmarkbtn').prop('value','selectLandmark');
      for (var i=0; i<_list.length;i++) {
        _list[i].checked=true;
        var _g=(_list[i].id).split('_').shift();
        var _i=_list[i].value-1;
        _list[i].checked=false;
        landmarks[_g][_i].visible=false;
      }
  }
}


// similar to selectLandmark but for demo.html
function toggleAllLandmark()
{
  if(!load_landmark) {
    loadLandmark();
    $('#landmarkbtn').addClass('pick');
    return;
  }

  show_landmark = !show_landmark;
  var _list=document.getElementsByName("landmark");
  if(show_landmark) {
    $('#landmarkbtn').addClass('pick');
    for (var i=0; i<_list.length;i++) {
      _list[i].checked=false;
      var _g=(_list[i].id).split('_').shift();
      var _i=_list[i].value-1;
      _list[i].checked=true;
      landmarks[_g][_i].visible=true;
    }
    } else {
      $('#landmarkbtn').removeClass('pick');
      for (var i=0; i<_list.length;i++) {
        _list[i].checked=true;
        var _g=(_list[i].id).split('_').shift();
        var _i=_list[i].value-1;
        _list[i].checked=false;
        landmarks[_g][_i].visible=false;
      }
  }
}


function selectMesh()
{
  show_mesh = ! show_mesh;
  var _list=document.getElementsByName("mesh");
  if (show_mesh) {
    jQuery('#selectmeshbtn').prop('value','excludeMesh');
    for (var i=0; i<_list.length;i++) {
       _list[i].checked=true;
       var _m=meshs[_list[i].value];
       _m[0].visible=true;
    }
    } else {
      jQuery('#selectmeshbtn').prop('value','selectMesh');
      for (var i=0; i<_list.length;i++) {
        _list[i].checked=false;
        var _m=meshs[_list[i].value];
        _m[0].visible=false;
      }
  }
}

function toggle3D() {
  if(vol.visible) {
    vol.volumeRendering= ! vol.volumeRendering;
    if(vol.volumeRendering) {
      jQuery('#3dbtn').prop('value','2dVol');
      } else {
        jQuery('#3dbtn').prop('value','3dVol');
    }
  }
}

function toggleVolume() {
  vol.visible= ! vol.visible;
  if(vol.visible) {
    jQuery('#2dViews').show();
    jQuery('#visbtn').prop('value','noVol');
    jQuery('#3dbtn').prop('disabled',false);
    jQuery('#sliders').show();
    } else {
      jQuery('#2dViews').hide();
      jQuery('#visbtn').prop('value','vizVol');
      jQuery('#3dbtn').prop('disabled',true);
// remove the sliders XXX
      jQuery('#sliders').hide();
  }
}

function openLandmark(i,opacity_name,landmark_name) {
  var _mesh=meshs[i][0];
  var landmarkDiv=landmark_name+'Div';
  var sliderDiv=opacity_name+'Div';
  resetCollapse(i,'landmark',landmarkDiv, sliderDiv);
  document.getElementById(landmarkDiv).style.display = '';
  document.getElementById(sliderDiv).style.display = 'none';
}

// just in case if the panel was opened by the other open
// then need to close it and then reopen it 
function resetCollapse(i,type,landmarkDiv, sliderDiv) {
  var _collapse_name=i+'_collapse';
  var id='#'+_collapse_name;
  if($(id).hasClass('in')) {
    if(type == 'mesh') {
      if(document.getElementById(sliderDiv).style.display == 'none') {
        $(id).removeClass('in');
      }
    } else {
      if(document.getElementById(landmarkDiv).style.display == 'none') {
        $(id).removeClass('in');
      }
    }
  }
}

function openMesh(i,eye_name,opacity_name,landmark_name) {
  var landmarkDiv=landmark_name+'Div';
  var sliderDiv=opacity_name+'Div';
  resetCollapse(i,'mesh',landmarkDiv, sliderDiv);
  document.getElementById(landmarkDiv).style.display = 'none';
  document.getElementById(sliderDiv).style.display = '';

/* SWITCH to using slider to control 
  var _mesh=meshs[i][0];
  var eye='#'+eye_name;
  _mesh.visible = !_mesh.visible;
  if(_mesh.visible) {
    $(eye).removeClass('glyphicon-eye-close').addClass('glyphicon-eye-open');
    } else {
      $(eye).removeClass('glyphicon-eye-open').addClass('glyphicon-eye-close');
  }
*/
}

// check with points
function notSelected(g,i) {
  for(var j=0; j< points.length; j++) {
    var _g=points[j]['g'];
    var _i=points[j]['i'];
    if( g == _g && i == _i ) {
      return false;
    }
  }
  return true;
}

function uncheckLandmark(g,i) {
    var _n=g+'_'+i;
    var _bb=document.getElementById(_n);
    _bb.checked="";
}

function checkLandmark(g,i) {
    var _n=g+'_'+i;
    var _bb=document.getElementById(_n);
    _bb.checked="none";
}

// g, i
function disableDistance(g,i) {
/* if it is one of the selected.. can not disable it */
  if( notSelected(g,i) ) {
    var _n=g+'_'+i+'d';
    var _bb=document.getElementById(_n);
    _bb.disabled=true;
    return true;
    } else {
       window.console.log("CAN not disable this distance..");
       return false;
  }
}

function enableDistance(g,i) {
  var _n=g+'_'+i+'d';
  var _bb=document.getElementById(_n);
  _bb.disabled=false;
  return true;
}

function uncheckDistance(g,i) {
  var _n=g+'_'+i+'d';
  var _bb=document.getElementById(_n);
  _bb.checked=false;
}

function computeDistance() {
  var p = document.getElementById("result");
  if(points.length == 2) {
    var _s="New:"+points[0]['g']+"/"+points[0]['i']+
    "to "+points[1]['g']+"/"+points[1]['i'];
    p.innerHTML = _s;
/* update the color of the landmark..?? */
    } else {
      p.innerHTML = "";
  }
}

function toggleDistance(g,i) {
/* If the landmark is visible, track the last two */
  var _i=i-1;
  var p=landmarks[g][_i].visible;
  if (landmarks[g][_i].visible) { 
    var _a=g+'_'+i+'d';
    var _aa=document.getElementById(_a);
    if(_aa.checked) {
      points.push({'g':g,'i':i});
      if(points.length > 2) {
        var _b=points.shift();
        var _n=_b['g']+'_'+_b['i']+'d';
        var _bb=document.getElementById(_n);
        _bb.checked=false;
      }
      } else { // got unchecked, so remove from the points
        var _b=points.shift();
        if (_b['g'] == g && _b['i']== i) {
          // is the first one
          var _n=_b['g']+'_'+_b['i']+'d';
          var _bb=document.getElementById(_n);
          _bb.checked=false;
          } else {
            points.push({'g':g,'i':i});
            var _b=points.shift(); // it is the second one
            var _n=_b['g']+'_'+_b['i']+'d';
            var _bb=document.getElementById(_n);
            _bb.checked=false;
        }
    }
  } else {
// landmark is not visible.. can I add ??
    window.console.log(" where is this ???");
  }
  computeDistance();
}

// turn on/off the options
function noDistance()
{
  var _list=document.getElementsByName("distance");
  for (var i=0; i<_list.length;i++) {
     _list[i].style.display="none";
  }
  var _s=points.length;
  for(var j=0;j<_s;j++) {
    var _b=points.shift();
    var _n=_b['g']+'_'+_b['i']+'d';
    var _bb=document.getElementById(_n);
    _bb.checked=false;
  }
}

function showDistance()
{
  var _list=document.getElementsByName("distance");
  for (var i=0; i<_list.length;i++) {
     _list[i].style.display="";
  }
  // set to the right state..
  var _list=document.getElementsByName("landmark");
  for (var j=0; j<_list.length; j++) {
    var _g=(_list[j].id).split('_').shift();
    var _i=_list[j].value;
    var _n=_g+'_'+_i;
    var _nn=_g+'_'+_i+'d';
    var _b=document.getElementById(_n);
    var _bb=document.getElementById(_nn);
    if(_b.checked) {  // landmark is visible
      _bb.disabled=false;
      } else {  // if landmark is not visible
        _bb.disabled=true;
    }
  }
}

function toggleCalcDistance() {
  calcDistance = ! calcDistance;
  if(calcDistance) {
    jQuery('#calcbtn').css('border-color','red');
    showDistance();
    } else {
      jQuery('#calcbtn').css('border-color','grey');
      noDistance();
  }
  computeDistance();
}

function toggleLandmark(g,i) {
  var _i=i-1;
  landmarks[g][_i].visible = !landmarks[g][_i].visible;
  if(calcDistance) {
     if(landmarks[g][_i].visible) {
       enableDistance(g,i);
       } else {
         if( !disableDistance(g,i) ) { // reset, if failed to disable
           landmarks[g][_i].visible = !landmarks[g][_i].visible;
           checkLandmark(g,i);
         }
     }
  }
}

function toggleLabel() {
  show_caption=!show_caption;
  if(show_caption) {
    jQuery('#labelbtn').prop('value','offLabel');
    } else {
      jQuery('#labelbtn').prop('value','showLabel');
  }
}

function setupSlicers() { 
  sliceAx = new X.renderer2D();
  sliceAx.container = 'sliceAx';
  sliceAx.orientation = 'AXIAL';
  sliceAx.init();
  sliceAx.onSliceNavigation = onSliceNavigation;

  sliceSag = new X.renderer2D();
  sliceSag.container = 'sliceSag';
  sliceSag.orientation = 'SAGITTAL';
  sliceSag.init();
  sliceSag.onSliceNavigation = onSliceNavigation;

  sliceCor = new X.renderer2D();
  sliceCor.container = 'sliceCor';
  sliceCor.orientation = 'CORONAL';
  sliceCor.init();
  sliceCor.onSliceNavigation = onSliceNavigation;

  sliceAx.add(vol);
  sliceSag.add(vol);
  sliceCor.add(vol);

  sliceAx.render();
  sliceSag.render();
  sliceCor.render();

sliceAx.onScroll = updateAx;
sliceSag.onScroll = updateSag;
sliceCor.onScroll = updateCor;
}

function getHref(t) {
  var _cap=t['caption'];
  if(_cap && _cap['link']) {
     var href= _cap['link']['url'];
     window.console.log(">>",href,"<<");
     return href;
  }
  return(null);
}


function addVolume(t) { // color, url, caption, <id/new>
  vol = new X.volume();
  vol.file = encodeURI(t['url']);
  vol.caption = t['caption'];
  vol.color=t['color'];
  ren3d.add(vol);
  jQuery('#2dViews').show();
}

// create mesh object 
//    add to the local mesh list
//    add to 3D renderer
//    add to ui's meshlist 
function addMesh(t) { // color, url, caption
  var _mesh = new X.mesh();
  _mesh.color = t['color'];
  _mesh.file = encodeURI(t['url']);
  _mesh.caption = t['label'];
  var _opacity=t['opacity'];
  if(_opacity == undefined)
    _opacity=1;
  _mesh.opacity = _opacity;
//  _mesh.caption = t['caption'];
//  _mesh.label = t['label'];
//  _mesh.id= t['id'];
  var loadingDiv = document.getElementById('loading');
  loadingDiv.style.display ='';
  ren3d.add(_mesh);

// meshs[0] is the _mesh, meshs[1] is the original object
  var _cnt=meshs.push([_mesh,t]);
  var _name=t['id'];
  var _label=t['label'];
 
  var _href=getHref(t);
  if(TESTMODE) {
    addTESTMeshListEntry(_label,_name,_cnt-1,t['color']);
    } else {
      addMeshListEntry(_label,_name,_cnt-1,t['color'],_opacity,_href);
  }
}

// adding a new mesh after rendering
function loadMesh() {
  if(mesh_list) {
    for (var i=0;i<mesh_list['mesh'].length;i++) {
       addMesh(mesh_list['mesh'][i]);
    }
  }
  document.getElementById('lastbtn').style.display = 'none';
  document.getElementById('landmarkbtn').style.display = '';
}

// adding volume after initial rendering
function loadVol() {
  var _v=vol_load();
  if(_v) {
    addVolume(_v['volume'][0]); // one and only one
    document.getElementById('volbtn').style.display = 'none';
    var loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = '';
    jQuery('#forVolume').show();
  }
}

// meshs[1],
function lookupMeshByID(id) {  
  for(var i=0; i< meshs.length; i++) {
    var _m=meshs[i][1];
    var _id=_m['id'].toLowerCase();
    if( _id == id )
      return meshs[i][0]; // return the X.mesh
  }
  return null;
}

function addLandmark(p) {
  var _g=p['group'].toLowerCase();
  var _mesh=lookupMeshByID(_g);
  if( _mesh == null ) {
    window.console.log("BAD BAD.. can not find mesh for "+_g);
    return;
  }
  var _c=p['color'];
  var _r=p['radius'];
  var _loc=p['point'];
  var _cap=p['caption'];
  var _label=p['label'];
  var _s=addSphere(_loc, _c, _r, _cap);

  if( landmarks[_g] == null ) {
    landmarks[_g]=[];
    landmarks[_g].push(_s);
    } else {
      landmarks[_g].push(_s);
  }

  var _href=getHref(p);
  if(TESTMODE) {
    addTESTLandmarkListEntry(_g,landmarks[_g].length,_mesh.color,_label);
    } else {
      addLandmarkListEntry(_g,landmarks[_g].length,_mesh.color,_label,_href);
  }
}

// adding landmarks after initial rendering
function loadLandmark() {
  if(load_landmark) { // already loaded
    return;
  }
  load_landmark=true;
  var _l=landmark_load();
  if(_l) {
    for(var i=0; i< _l['landmark'].length;i++) {
      addLandmark(_l['landmark'][i]);
    }
  }
  // this is for view.html
  if(TESTMODE) {
    document.getElementById('landmarkbtn').style.display = 'none';
    jQuery('#forLandmark').show();
    jQuery('#forDistance').show();
  }
}

function autoLandmark(){
// bring in the random points
  for(var i=0; i<meshs.length; i++) {
      var _m=meshs[i][0];
      hlite(_m);
  }
  document.getElementById('autoLandmarkbtn').style.display = 'none';
}

//
function showLabel(jval,lval) {
  if ($("#dialog-label").dialog("instance") &&
                       $("#dialog-label").dialog("isOpen")) {
    $("#dialog-label").dialog("close");
  }
  $("#dialog-label").dialog({
    modal: false,
    width: 300,
    height: 200,
    dialogClass: 'myDialogClass',
    open: function() {
     var _p=jQuery('#dtext');
     var _nn='<p id="dtext">'+jval+'</p>';
     _p.replaceWith(_nn);
      _p=jQuery('#dlink');
     if (typeof lval != "undefined") {
       _nn='<a id="dlink" href="'+encodeURI(lval['url'])+'">'+lval['label']+'</a>'
       } else {
       _nn='<a id="dlink" href=""></a>'
     }
     _p.replaceWith(_nn);
    }
  });//dialog
}

function addSphereByIdx(mesh, pt, color, radius) {
  var _l=mesh.points.get(pt);
  var _m='pt '+String(pt)+' out of '+mesh.points.count;
  var caption= { "type":"POINT","data": _m };
  return addSphere(_l, color, radius, caption);
}

var newSphere;
function addSphere(loc, color, radius, caption) {
  newSphere = new X.sphere();
  newSphere.center = loc;
  caption['data']=caption['data']+'<br>x: '+String(loc[0])+'<br>y: '+String(loc[1])+'<br>z: '+String(loc[2]);
  newSphere.color = color;
  newSphere.radius = radius; 
  newSphere.caption = JSON.stringify(caption);
  ren3d.add(newSphere);
  return newSphere;
}

function hlite(mesh) {
  var _f=mesh.file;
//  var _n=_f.split('/').pop().toLowerCase().split('.').shift();
  var _n=mesh['id'];
  var numberOfPoints = mesh.points.count;
//window.console.log("mesh of "+_n+" --> point count "+numberOfPoints);
  var max0,min0,max1,min1,max2,min2;
  var max0_j, min0_j, max1_j, min1_j, max2_j, min2_j;
  var currentPoint;
  var lim = Math.floor(numberOfPoints / 50);

  for ( var j = 0; j < numberOfPoints-1; j++) {
    currentPoint = mesh.points.get(j);
    if(j==0) {
       max0=min0=currentPoint[0]; max0_j=min0_j=0;
       max1=min1=currentPoint[1]; max1_j=min1_j=0;
       max2=min2=currentPoint[2]; max2_j=min2_j=0;
window.console.log("first point.."+currentPoint[0]+" "+currentPoint[1]+" "+currentPoint[2]);
//       addSphereByIdx(mesh,j, [1,1,1], 0.08);
       continue;
       } else {
           if (j % lim == 0 ) {
             addSphereByIdx(mesh,j, [0,0,1], 0.05);
           }
           if(currentPoint[0]>max0) 
             { max0=currentPoint[0]; max0_j=j; }
           if(currentPoint[0]<min0) 
             { min0=currentPoint[0]; min0_j=j; }
           if(currentPoint[1]>max1) 
             { max1=currentPoint[1]; max1_j=j; }
           if(currentPoint[1]<min1) 
             { min1=currentPoint[1]; min1_j=j; }
           if(currentPoint[2]>max2) 
             { max2=currentPoint[2]; max2_j=j; }
           if(currentPoint[2]<min2) 
             { min2=currentPoint[2]; min2_j=j; }
    
    }
  }
  window.console.log("max0 j "+max0_j + " min0 j "+min0_j);
  window.console.log("max1 j "+max1_j + " min1 j "+min1_j);
  window.console.log("max2 j "+max2_j + " min2 j "+min2_j);

//console.log("max-min -- start");
addSphereByIdx(mesh,max0_j, [1,0,1], 0.08);
addSphereByIdx(mesh,min0_j, [1,0,1], 0.08);
addSphereByIdx(mesh,max1_j, [1,0,1], 0.08);
addSphereByIdx(mesh,min1_j, [1,0,1], 0.08);
addSphereByIdx(mesh,max2_j, [1,0,1], 0.08);
addSphereByIdx(mesh,min2_j, [1,0,1], 0.08);
//console.log("max-min -- end");

var t=numberOfPoints-1;
//console.log("last -- start");
for(var i=0; i<10; i++) {
addSphereByIdx(mesh,t-i, [0,1,0], 0.04);
}
//console.log("last -- end");
//console.log("begin -- start");
for(var i=0; i<10; i++) {
addSphereByIdx(mesh,i, [1,0.5,0], 0.04);
}
//console.log("begin -- end");

  window.console.log("line0, max "+max0+" min "+min0);
  window.console.log("line1, max "+max1+" min "+min1);
  window.console.log("line2, max "+max2+" min "+min2);
};

function clip3d(near) {
  var _width = jQuery(mainView).width();
  var _height = jQuery(mainView).height();
  if(near <= 0) { // reset 
    ren3d.camera.clip(_width,_height,1);
    return;
  }
  var _range= (ren3d.bbox[3] - ren3d.bbox[2] + 1);
  var _start=Math.abs(ren3d.camera.view[14])-(_range/2);
  var _near= (near * _range) + _start;
//window.console.log("clip3d, start "+_start+" and to "+_range+ " on target "+_near);
  ren3d.camera.clip(_width,_height,_near);
}

function toggleBox() {
//window.console.log(" calling toggleBox..");
  show_box = !show_box;
  if(show_box) {
    gbbox.visible=true;
    if(! TESTMODE)
      $('#boxbtn').addClass('pick');
    } else {
      gbbox.visible=false;
      if(! TESTMODE)
        $('#boxbtn').removeClass('pick');
  }
}

function makeBBox(r,v) {
// CREATE Bounding Box
//window.console.log("making bounding box..");
    var _r=r;
    var _v=v; // could be volume or renderer3D
    if(v == null) {
      _v=r; 
    }
    var res = [_v.bbox[0],_v.bbox[2],_v.bbox[4]];
    var res2 = [_v.bbox[1],_v.bbox[3],_v.bbox[5]];

    if(gbbox != null) {
      gbbox.visible=false;
      gbbox=null;
    }
    gbbox = new X.object();
    gbbox.points = new X.triplets(72);
    gbbox.normals = new X.triplets(72);
    gbbox.type = 'LINES';
    gbbox.points.add(res2[0], res[1], res2[2]);
    gbbox.points.add(res[0], res[1], res2[2]);
    gbbox.points.add(res2[0], res2[1], res2[2]);
    gbbox.points.add(res[0], res2[1], res2[2]);
    gbbox.points.add(res2[0], res[1], res[2]);
    gbbox.points.add(res[0], res[1], res[2]);
    gbbox.points.add(res2[0], res2[1], res[2]);
    gbbox.points.add(res[0], res2[1], res[2]);
    gbbox.points.add(res2[0], res[1], res2[2]);
    gbbox.points.add(res2[0], res[1], res[2]);
    gbbox.points.add(res[0], res[1], res2[2]);
    gbbox.points.add(res[0], res[1], res[2]);
    gbbox.points.add(res2[0], res2[1], res2[2]);
    gbbox.points.add(res2[0], res2[1], res[2]);
    gbbox.points.add(res[0], res2[1], res2[2]);
    gbbox.points.add(res[0], res2[1], res[2]);
    gbbox.points.add(res2[0], res2[1], res2[2]);
    gbbox.points.add(res2[0], res[1], res2[2]);
    gbbox.points.add(res[0], res2[1], res2[2]);
    gbbox.points.add(res[0], res[1], res2[2]);
    gbbox.points.add(res[0], res2[1], res[2]);
    gbbox.points.add(res[0], res[1], res[2]);
    gbbox.points.add(res2[0], res2[1], res[2]);
    gbbox.points.add(res2[0], res[1], res[2]);
    for ( var i = 0; i < 24; ++i) {
      gbbox.normals.add(0, 0, 0);
    }
    if(v==null) {
      gbbox.color=[0,1,1];
      } else {
        gbbox.color=[1,1,1];
    }
    _r.add(gbbox);
 
    var center = [_v.bbox[0] + (_v.bbox[1]-_v.bbox[0]),
              _v.bbox[2] + (_v.bbox[3]-_v.bbox[2]),
              _v.bbox[4] + (_v.bbox[5]-_v.bbox[4])
              ]

//   window.console.log("center is at.."+center[0]+" "+center[1]+" "+center[2]);

};


