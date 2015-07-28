//**************************************************************
//   m.viewer.js
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
var landmarks=[];  // sphere objects
var first_time=true;
var first_time_vol=true;

//==== Mesh ====
var initial_mesh_list;
var mesh_list;
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

window.onload = function() {

  if (webgl_detect() == false) {
    alertify.confirm("There is no webgl!!");
    throw new Error("WebGL is not enabled!");
    return;
  }

  var _m=mesh_load();
  initial_mesh_list=_m[0], mesh_list=_m[1];

//  setup slider
jQuery('#opacity-volume').slider({
    slide: opacityVolume
});
jQuery('#opacity-volume').width(100);
jQuery('#opacity-volume').height(10);

  setupSliders();

  initRenderer();

  for (var i=0;i<initial_mesh_list['mesh'].length;i++) {
     addMesh(initial_mesh_list['mesh'][i]);
  }

// stackoverflow.com/question/17462936/xtk-flickering-in-overlay-mesh
// resolve multiple mesh transparent object being rendered causing flickering
// effect
  ren3d.config.ORDERING_ENABLED=false;

// disable default tooltip-caption 
  ren3d.interactor.config.HOVERING_ENABLED = false;
  show_caption=false;

  ren3d.interactor.onMouseDown = function() {
//window.console.log("mouse down..")
    if(saved_color != null) {
      ren3d.get(saved_id).color = saved_color;
//      ren3d.get(saved_id).transform.translateY(-1);
      saved_color=null;
    }
    // grab the current mouse position
    var _pos = ren3d.interactor.mousePosition;

//window.console.log("  current mouse position is.."+_pos);

    // pick the current object
    var _id = ren3d.pick(_pos[0], _pos[1]);

    if (_id != 0) {
      if(show_caption) {
        if(ren3d.get(_id).caption) {
          var _j=ren3d.get(_id).caption;

          showLabel(_j['type'],_j['data'],_j['link']);
          } else { 
window.console.log("  this object "+_id+ " does not have caption..");
        }
        } else {
// grab the object and turn it white, only if it has caption,
          if(ren3d.get(_id).caption) {
//window.console.log("  picking obj .."+_id);
          saved_color=ren3d.get(_id).color;
          var obj=ren3d.get(_id);
          saved_id=_id;
          ren3d.get(_id).color = [1, 1, 1];
//      ren3d.get(saved_id).transform.translateY(1);
            } else {
//window.console.log(" picking "+_id+ " no change since no stored caption");
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

  ren3d.render();

  ren3d.onShowtime = function(){
//window.console.log("XXX calling onShowtime");
    var loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'none';
// zoom in alittle
    var _camera=ren3d.camera.position;
    if( first_time ) {
      first_time=false;
      if (vol) { // use bounding box if vol exists
        var _y=(vol.bbox[3] - vol.bbox[2] + 1)*2;
        ren3d.camera.position = [ 0, _y, 0];
        } else {
          ren3d.camera.position = [ 0, 10, 0];
      }
      saveView();
    }
    if(first_time_vol && vol) {

      first_time_vol=false;
      initSliders();
    }
  };

  ren3d.onRender = function() {
    // rotate the camera in X-direction
    if(spin_view) {
      ren3d.camera.rotate([1, 0]);
    }
  };
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

function stringIt(v) {
  var str="{";
  for(var i=0; i<v.length; i++) {
    str=str+" "+v[i].toString();
    if(i!=v.length-1) {
       str=str+",";
    } else {
          str=str+"}";
    }
  }
  window.console.log(str);
}

function saveView() {
  /* copy it over */
  for(var i=0; i< ren3d.camera.view.length; i++)
    save_view_matrix[i]=ren3d.camera.view[i];
//  stringIt(save_view_matrix);
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
  for(var i=0; i< _v.length; i++) 
    ren3d.camera.view[i]=_v[i];
  ren3d.render();
}

function spinView() {
  spin_view = !spin_view;
  if(spin_view) {
    jQuery('#spinbtn').css('border-color','red');
    jQuery('#spinbtn').prop('value','stop');
    } else {
      jQuery('#spinbtn').css('border-color','');
      jQuery('#spinbtn').prop('value','spin');
  }
}

function initRenderer() {
  // do it once only
  if( ren3d != null ) {
      return;
  }
  ren3d = new X.renderer3D();
  ren3d.container='3mesh';
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

function addMeshListEntry(fname,i,color)
{
  var _idx=i-1;
  var _n=fname.split('/').pop().toLowerCase().split('.').shift();
  var _nn='<button class="btn" disabled=true style="background-color:'+RGBTohex(color)+';"/><input id='+_n+' type=checkbox checked="" onClick=toggleMesh('+_idx+') value='+_idx+' name="mesh">'+_n+'</input><br>';
  jQuery('#meshlist').append(_nn);
//window.console.log(_nn);
}

function addLandmarkListEntry(name,i,color,label)
{
  var _nn='<button class="btn" disabled=true style="background-color:'+RGBTohex(color)+';"/><input type="checkbox" class="mychkbox" id="'+name+'_'+i+'d" onClick="toggleDistance(\''+name+'\','+i+');"/><label for="'+name+'_'+i+'d" style="display:none" name="distance"></label><input id='+name+'_'+i+' type=checkbox checked="" onClick="toggleLandmark(\''+name+'\','+i+');" value='+i+' name="landmark">'+label+'</input><br>';
  jQuery('#landmarklist').append(_nn);
window.console.log(_nn);
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
  vol.volumeRendering= ! vol.volumeRendering;
}

function toggleVolume() {
  vol.visible= ! vol.visible;
}

function toggleMesh(i) {
  var _mesh=meshs[i];
  _mesh.visible = !_mesh.visible;
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
    jQuery('#labelbtn').css('border-color','red');
    jQuery('#labelbtn').prop('value','offLabel');
    } else {
      jQuery('#labelbtn').css('border-color','');
      jQuery('#labelbtn').prop('value','showLabel');
  }
}

function addVolume(t) { // color, url, caption, <id/new>
  var _vol = new X.volume();
  _vol.file = encodeURI(t['url']);
  _vol.caption = t['caption'];
  _vol.color=t['color'];
  vol = _vol;
  ren3d.add(_vol);
  vol = _vol;
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
  addMeshListEntry(t['url'],_cnt,t['color']);
}

// adding a new mesh after rendering
function loadMesh() {
  for (var i=0;i<mesh_list['mesh'].length;i++) {
     addMesh(mesh_list['mesh'][i]);
  }
  document.getElementById('lastbtn').style.display = 'none';
  document.getElementById('landmarkbtn').style.display = '';
}

// adding volume after initial rendering
function loadVol() {
  var _v=vol_load();
  addVolume(_v['volume'][0]); // one and only one
  document.getElementById('volbtn').style.display = 'none';
  var loadingDiv = document.getElementById('loading');
  loadingDiv.style.display = '';
  jQuery('#forVolume').show();
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
  for(var i=0; i< _l['landmark'].length;i++) {
    addLandmark(_l['landmark'][i]);
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

function addSphere(loc, color, radius, caption) {
  var newSphere = new X.sphere();
  newSphere.center = loc;
  caption['data']=caption['data']+'<br>x: '+String(loc[0])+'<br>y: '+String(loc[1])+'<br>z: '+String(loc[2]);
  newSphere.color = color;
  newSphere.radius = radius;
  newSphere.caption = caption;
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



// volume's control
function opacityVolume(event, ui) {
  if (!vol) { return; }
  vol.opacity = ui.value / 100;
  vol.modified;
}

function thresholdVolume(event, ui) {
  if (!vol) { return; }
window.console.log("in here..");
  vol.lowerThreshold = ui.values[0];
  vol.upperThreshold = ui.values[1];
  vol.modified;
}

function setupSliders() {
  jQuery('#opacity-volume').slider({ slide: opacityVolume });
  jQuery('#opacity-volume').width(100);

  jQuery('#threshold-volume').dragslider({
    range: true,
    rangeDrag: true,
    values: [0, 100],
    slide: thresholdVolume
  });
  jQuery('#threshold-volume').width(100);
}

function initSliders() {
window.console.log("calling initSlider..");
  if(!vol) { return; }

  jQuery('#opacity-volume').slider("option", "value", 80);
  vol.opacity = 0.8; // re-propagate
  vol.modified();

  jQuery('#threshold-volume').dragslider("option", "max", vol.max);
  jQuery('#threshold-volume').dragslider("option", "min", vol.min);
  jQuery('#threshold-volume').dragslider("option", "values",
        [vol.min, vol.max]);
}
