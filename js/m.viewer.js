//**************************************************************
//   m.viewer.js
//
//   viewer.html  (using default localhost data)
//   viewer.html?meshurl="http:..."&landmarkurl="http:.."
//**************************************************************

/*
 [1.00, 0.80, 0.40]  eggyoke yellow 
 [0.53, 0.90, 0.90]  light aqua 
 [1.00, 0.46, 0.19]  light orange 
*/

// global scoped data
var ren3d=null; // 3d renderer

var meshs=[];   // mesh objects
var vol=null;   // volume objects
var gbbox=null; // global bounding box

var sliceAx=null;
var sliceSag=null;
var sliceCor=null;
var landmarks=[];  // sphere objects
var first_time=true;
var first_time_vol=true;

var add_landmark=false;

//=== bounding box ===
var show_box = true;

//==== Mesh ====
var initial_mesh_list={};
var mesh_list={};
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

  $('[data-toggle="tooltip"]').tooltip();   

  if (webgl_detect() == false) {
    alertify.confirm("There is no webgl!!");
    throw new Error("WebGL is not enabled!");
    return;
  }

  // viewer?meshurl="http:...&landmarkurl="http:.."
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

// stackoverflow.com/question/17462936/xtk-flickering-in-overlay-mesh
// resolve multiple mesh transparent object being rendered causing flickering
// effect
  ren3d.config.ORDERING_ENABLED=false;

// disable default tooltip-caption 
// XXX ???
  ren3d.interactor.config.HOVERING_ENABLED = false;
  show_caption=false;

  ren3d.interactor.onMouseDown = function() {
window.console.log("mouse down..")
    if(saved_color != null) {
      ren3d.get(saved_id).color = saved_color;
//      ren3d.get(saved_id).transform.translateY(-1);
      saved_color=null;
    }
    // grab the current mouse position
    var _pos = ren3d.interactor.mousePosition;
//
//???    var _c = ren3d.camera.unproject_(_pos[0], _pos[1], 0);
window.console.log("  current mouse position is.."+_pos);
//window.console.log("  and c is "+_c[0]+" "+_c[1]+" "+_c[2]);

    // pick the current object
    var _id = ren3d.pick(_pos[0], _pos[1]);

    if (_id != 0) {
      var _obj=ren3d.get(_id);
// this is particular to the mousehead mesh, need to figure out
// how to calc on the fly or store landmark params somewhere.

      if(show_caption) {
window.console.log("show_caption..");
        if(ren3d.get(_id).caption) {
          var _j=ren3d.get(_id).caption;

          showLabel(_j['type'],_j['data'],_j['link']);
window.console.log("trying to show Label..");
window.console.log(_j['type'],_j['data'],_j['link']);
          } else { 
window.console.log("  this object "+_id+ " does not have caption..");
        }
        return; // show_caption
      }
      
      // hightlight the object
      if(ren3d.get(_id).caption && !add_landmark) {
//window.console.log("  picking obj .."+_id);
        saved_color=ren3d.get(_id).color;
        var obj=ren3d.get(_id);
        saved_id=_id;
        ren3d.get(_id).color = [1, 1, 1];
//ren3d.get(saved_id).transform.translateY(1);
        return;
      }

      if( add_landmark ) {
        var _targetlist=ren3d.pick3d(_pos[0],_pos[1], 0.4, 0.08, _obj);
        var m=[];
        var plist=[];
// [[march_point,[roi_points]],...[march_point,[roi_points]]
// stop at the first set roi_points that has length > 0 
//window.console.log(" picking "+_id+ " no c=0;
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
            var _c={ "type":"POINT","data": i };
            var _s=addSphere(_p,[0.25,1,0.4],0.04, _c);
            insertLandmark(_s,_obj);
            } else {
              var _c={ "type":"POINT","data": i };
              var _s=addSphere(_p,[0.25,1,0.6],0.04, _c);
              insertLandmark(_s,_obj);
          }
        }
      }
    } else {
//window.console.log("  did not pick anything");
    }
  }

  ren3d.interactor.onMouseUp = function() {
//window.console.log("mouse up..");
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

  ren3d.onShowtime = function(){
//window.console.log("calling onShowtime");
    var loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'none';

// zoom in alittle
// replace default X camera's zoom,
    ren3d.camera.zoomIn = function(fast) {
      var zoomStep = 20;
      if (goog.isDefAndNotNull(fast) && !fast) {
        zoomStep = 1;
      }
      ren3d.camera.view[14] += zoomStep;
      if(ren3d.camera.view[14] > 0) {
// window.console.log("calling my zoomIn.. cap it..");
        ren3d.camera.view[14]=0;
      } 
    };

    var _camera=ren3d.camera.position;
    if( first_time ) {
      first_time=false;
      setupClipSlider();
      initClipSlider();
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
      saveView();
    }
    if(first_time_vol && vol) {

      first_time_vol=false;
      setupSlicers();
      setup3dSliders();
      init3dSliders();
      setup2dSliders();
      init2dSliders();
      makeBBox(ren3d,vol);
      } else {
        makeBBox(ren3d,null);
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
   var _g=_obj.file.split('/').pop().toLowerCase().split('.').shift();
   var _cap= { "type":"Landmark","data":"user added landmark" };
window.console.log("adding a new landmark for "+_g);

   if( landmarks[_g] == null ) {
     landmarks[_g]=[];
     landmarks[_g].push(_s);
     } else {
       landmarks[_g].push(_s);
   }
   var _label=askForLabel(_g);
   addLandmarkListEntry(_g,landmarks[_g].length,_obj.color,_label);
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
  stringIt("saveView", save_view_matrix);
}

function goView() {
  for(var i=0; i< save_view_matrix.length; i++)
    ren3d.camera.view[i]=save_view_matrix[i];
  ren3d.render();
}

function resetView() {
  ren3d.resetViewAndRender();
}

function loadView() {
  var _v = view_load();
  if(_v) {
    for(var i=0; i< _v.length; i++) 
      ren3d.camera.view[i]=_v[i];
  }
  ren3d.render();
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
function addMeshListEntry(name,i,color)
{
window.console.log("add..", name, " ", i, " ", color);
  var _collapse_name=i+'_collapse';
  var _visible_name=i+'_visible';
  var _reset_name=name+'_reset';
  var _reset_btn=name+'_reset_btn';

  var _nn='';

_nn+='<div class="panel panel-default col-md-12 col-xs-12">';
_nn+='<div class="panel-heading">';
_nn+='<div class="panel-title row" style="background-color:transparent; border:solid 2px green">'

_nn+='<button id="'+_visible_name+'" class="pull-left"  style="display:inline-block;outline: none;border:none; background-color:white"  onClick="toggleMesh('+i+',\'eye_'+name+'\')" title="hide or show mesh"><span id="eye_'+name+'" class="glyphicon glyphicon-eye-open" style="color:'+RGBTohex(color)+';"></span> </button>';

_nn+='<a class="accordion-toggle" data-toggle="collapse" data-parent="#meshlist" href="#' +_collapse_name+'" title="click to expand" >'+name+'</a>';
_nn+='</div></div> <!-- panel-heading -->';

_nn+=' <div id="'+_collapse_name+'" class="panel-collapse collapse"> <div class="panel-body">';

_nn+= ' <div id="'+name+ '" class="row" style="background-color:white;opacity:1;"> ';
_nn+= ' <button id="'+_reset_btn+ '" title="restore settings" type="button" class="btn btn-xs btn-primary pull-right" onclick="toggleResetMesh('+ i+ ','+ '\''+ name+ '\');" style="font-size:12px;margin-top:2px; margin-right:20px" >Reset</button>';
// last bits
_nn+= '</div> </div> <!-- panel-body --> </div> </div> <!-- panel -->';

  jQuery('#meshlist').append(_nn);
window.console.log(_nn);
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

function addLandmarkListEntry(name,i,color,label)
{
  var _nn='<button class="btn" disabled=true style="background-color:'+RGBTohex(color)+';"/><input type="checkbox" class="mychkbox" id="'+name+'_'+i+'d" onClick="toggleDistance(\''+name+'\','+i+');"/><label for="'+name+'_'+i+'d" style="display:none" name="distance"></label><input id='+name+'_'+i+' type=checkbox checked="" onClick="toggleLandmark(\''+name+'\','+i+');" value='+i+' name="landmark">'+label+'</input><br>';
  jQuery('#landmarklist').append(_nn);
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

function selectMesh()
{
  show_mesh = ! show_mesh;
  var _list=document.getElementsByName("mesh");
  if (show_mesh) {
    jQuery('#selectmeshbtn').prop('value','excludeMesh');
    for (var i=0; i<_list.length;i++) {
       _list[i].checked=true;
       meshs[_list[i].value].visible=true;
    }
    } else {
      jQuery('#selectmeshbtn').prop('value','selectMesh');
      for (var i=0; i<_list.length;i++) {
        _list[i].checked=false;
        meshs[_list[i].value].visible=false;
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

function toggleMesh(i,eye_name) {
  var _mesh=meshs[i];
  var eye='#'+eye_name;
  _mesh.visible = !_mesh.visible;
  if(_mesh.visible) {
    $(eye).removeClass('glyphicon-eye-close').addClass('glyphicon-eye-open');
    } else {
      $(eye).removeClass('glyphicon-eye-open').addClass('glyphicon-eye-close');
  }
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
  _mesh.caption = t['caption'];
  var loadingDiv = document.getElementById('loading');
  loadingDiv.style.display ='';
  ren3d.add(_mesh);

  var _cnt=meshs.push(_mesh);
  var _caption=t['caption'];
  addMeshListEntry(_caption['type'],_cnt-1,t['color']);
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

// given a mesh name, find the mesh that matches it
function lookupMesh(n) {  
  for(var i=0; i< meshs.length; i++) {
    var _n=meshs[i].file.split('/').pop().toLowerCase().split('.').shift();
    if( _n == n )
      return meshs[i];
  }
  return null;
}
function lookupMeshByID(id) {  
  for(var i=0; i< meshs.length; i++) {
    var _id=meshs[i].id;
    if( _id == id )
      return meshs[i];
  }
  return null;
}

function addLandmark(p) {
  var _g=p['group'].toLowerCase();
  var _mesh=lookupMesh(_g);
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
  addLandmarkListEntry(_g,landmarks[_g].length,_mesh.color,_label);
}

// adding landmarks after initial rendering
function loadLandmark() {
  var _l=landmark_load();
  if(_l) {
    for(var i=0; i< _l['landmark'].length;i++) {
      addLandmark(_l['landmark'][i]);
    }
  }
  document.getElementById('landmarkbtn').style.display = 'none';
  jQuery('#forLandmark').show();
  jQuery('#forDistance').show();
}

function autoLandmark(){
// bring in the random points
  for(var i=0; i<meshs.length; i++) {
      hlite(meshs[i]);
  }
  document.getElementById('autoLandmarkbtn').style.display = 'none';
}

//
function showLabel(tval,jval,lval) {
  if ($("#dialog-label").dialog("instance") &&
                       $("#dialog-label").dialog("isOpen")) {
    $("#dialog-label").dialog("close");
  }
  $("#dialog-label").dialog({
    modal: false,
    title: tval,
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
  var _n=_f.split('/').pop().toLowerCase().split('.').shift();
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
window.console.log("clip3d, start "+_start+" and to "+_range+ " on target "+_near);
  ren3d.camera.clip(_width,_height,_near);
}

function toggleBox() {
  show_box = !show_box;
  if(show_box) {
    gbbox.visible=true;
    $('#boxbtn').removeClass('pick');
    } else {
      gbbox.visible=false;
      $('#boxbtn').addClass('pick');
  }
}

function makeBBox(r,v) {
// CREATE Bounding Box
    var _r=r;
    var _v=v; // could be volume or renderer3D
    if(v == null) {
      _v=r; 
    }
    var res = [_v.bbox[0],_v.bbox[2],_v.bbox[4]];
    var res2 = [_v.bbox[1],_v.bbox[3],_v.bbox[5]];

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

   window.console.log("center is at.."+center[0]+" "+center[1]+" "+center[2]);

};


