//**************************************************************
//   m.viewer.js
//**************************************************************

/*
 [1.00, 0.80, 0.40]  eggyoke yellow 
 [0.53, 0.90, 0.90]  light aqua 
 [1.00, 0.46, 0.19]  light orange 
*/

// global scoped data
var meshs=[];
var ren3d=null;
var vol=null;

var mesh_list;
var last_mesh_list;

var saved_color=null;
var saved_id=null;
var show_caption=false;

var first_time=true;
var skip_vol=true;


window.onload = function() {

  if (webgl_detect() == false) {
    alertify.confirm("There is no webgl!!");
    throw new Error("WebGL is not enabled!");
    return;
  }

  var _m=mesh_load();
  mesh_list=_m[0], last_mesh_list=_m[1];
  var _v=null;

  initRenderer();

  if (_v && !skip_vol) {
    _v=vol_load();
    addVolume(_v['volume'][0]); // one and only one
    document.getElementById('volbtn').style.visibility = 'hidden';
    } else {
      document.getElementById('volbtn').style.visibility = 'visible';
      document.getElementById('3dbtn').style.visibility = 'hidden';
      document.getElementById('visbtn').style.visibility = 'hidden';
      document.getElementById('opacity-volume').style.visibility = 'hidden';
  }

  for (var i=0;i<mesh_list['mesh'].length;i++) {
     addMesh(mesh_list['mesh'][i]);
  }

// stackoverflow.com/question/17462936/xtk-flickering-in-overlay-mesh
// resolve multiple mesh transparent object being rendered causing flickering
// effect
  ren3d.config.ORDERING_ENABLED=false;

// disable default tooltip-caption 
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

window.console.log("  current mouse position is.."+_pos);

    // pick the current object
    var _id = ren3d.pick(_pos[0], _pos[1]);

    if (_id != 0) {
      if(show_caption) {
        if(ren3d.get(_id).caption) {
          var _j=ren3d.get(_id).caption;
          showLabel(_j['type'],_j['data']);
          } else { 
window.console.log("  this object "+_id+ " does not have caption..");
        }
        } else {
// grab the object and turn it white, only if it has caption,
          if(ren3d.get(_id).caption) {
window.console.log("  picking obj .."+_id);
          saved_color=ren3d.get(_id).color;
          var obj=ren3d.get(_id);
window.console.log("  saving color "+saved_color);
          saved_id=_id;
          ren3d.get(_id).color = [1, 1, 1];
//      ren3d.get(saved_id).transform.translateY(1);
            } else {
window.console.log(" picking "+_id+ " no change since no stored caption");
          }
      }
    } else {
window.console.log("  did not pick anything");
    }
  }

  ren3d.interactor.onMouseUp = function() {
window.console.log("mouse up..");
    if(saved_color == null) {
      return;
    }
    // grab the object and turn it red
    ren3d.get(saved_id).color = saved_color;
window.console.log("  reset "+saved_id + " with "+saved_color);
//    ren3d.get(saved_id).transform.translateY(-1);
    saved_color=null;
    saved_id=null;
  }

  ren3d.render();

  ren3d.onShowtime = function(){
    var loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'none';
// zoom in alittle
    var _camera=ren3d.camera.position;
    if( first_time ) {
      first_time=false;
      if (_v) { // use bounding box
        var _y=(vol.bbox[3] - vol.bbox[2] + 1)*2;
        ren3d.camera.position = [ 0, _y, 0];
        } else {
          ren3d.camera.position = [ 0, 10, 0];
      }
    }
    if(meshs.length > 0) {
      hlite(meshs[0]);
    }
  }
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

function addListEntry(fname,i,color)
{
  var _idx=i-1;
  var _n=fname.split('/').pop().toLowerCase().split('.').shift();
  var _nn='<button class="btn" disabled=true style="background-color:'+RGBTohex(color)+';"/><input id='+_n+' type=checkbox checked="" onClick=toggleMesh('+_idx+') value='+_idx+' name="mesh">'+_n+'</input><br>'
  jQuery('#meshlist').append(_nn);
}


function excludeMesh()
{
  var _list=document.getElementsByName("mesh");
  for (var i=0; i<_list.length;i++) {
     _list[i].checked=false;
     meshs[_list[i].value].visible=false;
  }
}

function refreshMesh()
{
  var _list=document.getElementsByName("mesh");
  for (var i=0; i<_list.length;i++) {
     _list[i].checked=true;
     meshs[_list[i].value].visible=true;
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

function toggleLabel() {
  show_caption=!show_caption;
  if(show_caption) {
    jQuery('#labelbtn').css('border-color','red');
    } else {
      jQuery('#labelbtn').css('border-color','');
  }
}

function addVolume(t) { // color, url, caption, <id/new>
  var _vol = new X.volume();
  _vol.file = encodeURI(t['url']);
  _vol.caption = t['caption'];
  _vol.color=t['color'];
  vol = _vol;
  ren3d.add(_vol);
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
  var _cnt=meshs.push(_mesh);
  var loadingDiv = document.getElementById('loading');
  loadingDiv.style.display ='';
  ren3d.add(_mesh);
  addListEntry(t['url'],_cnt,t['color']);
}

// testing adding a new mesh after rendering
function loadLastMesh() {
  for (var i=0;i<last_mesh_list['mesh'].length;i++) {
     addMesh(last_mesh_list['mesh'][i]);
  }
  document.getElementById('lastbtn').style.visibility = 'hidden';
}

function loadVol() {
  var _v=vol_load();
  addVolume(_v['volume'][0]); // one and only one
  skip_vol=false;
  document.getElementById('volbtn').style.visibility = 'hidden';
  var loadingDiv = document.getElementById('loading');
  loadingDiv.style.display = '';
  document.getElementById('3dbtn').style.visibility = 'visible';
  document.getElementById('visbtn').style.visibility = 'visible';
  document.getElementById('opacity-volume').style.visibility = 'visible';
}

//
function showLabel(tval,jval) {
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
window.console.log(_nn);
     _p.replaceWith(_nn);
    }
  });//dialog
}

function addSphere(mesh, pt, color, radius) {
  var loc=mesh.points.get(pt);
//  window.console.log(loc);
  var newSphere = new X.sphere();
  newSphere.center = loc;
  newSphere.color = color;
  newSphere.radius = radius;
  var msg='pt: '+String(pt)+'<br>x: '+String(loc[0])+'<br>y: '+String(loc[1])+'<br>z: '+String(loc[2]);
  newSphere.caption = { "type":"POINT","data": msg };
  ren3d.add(newSphere);
}

function hlite(mesh) {

  var numberOfPoints = mesh.points.count;
window.console.log("mesh--> point count "+numberOfPoints);
  var max0,min0,max1,min1,max2,min2;
  var max0_j, min0_j, max1_j, min1_j, max2_j, min2_j;
  var currentPoint;
  var lim = Math.floor(numberOfPoints / 200);

  for ( var j = 0; j < numberOfPoints-1; j++) {
    currentPoint = mesh.points.get(j);
    if(j==0) {
       max0=min0=currentPoint[0]; max0_j=min0_j=0;
       max1=min1=currentPoint[1]; max1_j=min1_j=0;
       max2=min2=currentPoint[2]; max2_j=min2_j=0;
window.console.log("first point.."+currentPoint[0]+" "+currentPoint[1]+" "+currentPoint[2]);
//       addSphere(mesh,j, [1,1,1], 0.08);
       continue;
       } else {
           if (j % lim == 0 ) {
             addSphere(mesh,j, [0,0,1], 0.05);
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
  window.console.log("max0 j "+max0_j + "min0 j "+min0_j);
  window.console.log("max1 j "+max1_j + "min1 j "+min1_j);
  window.console.log("max2 j "+max2_j + "min2 j "+min2_j);

console.log("max-min -- start");
addSphere(mesh,max0_j, [1,0,0], 0.05);
addSphere(mesh,min0_j, [1,0,0], 0.05);
addSphere(mesh,max1_j, [1,0,0], 0.05);
addSphere(mesh,min1_j, [1,0,0], 0.05);
addSphere(mesh,max2_j, [1,0,0], 0.05);
addSphere(mesh,min2_j, [1,0,0], 0.05);
console.log("max-min -- end");

var t=numberOfPoints-1;
console.log("last -- start");
for(var i=0; i<10; i++) {
addSphere(mesh,t-i, [1,0,1], 0.05);
}
console.log("last -- end");
console.log("begin -- start");
for(var i=0; i<10; i++) {
addSphere(mesh,i, [0,1,1], 0.05);
}
console.log("begin -- end");

  /* add a boundary cube.. */
  window.console.log("line0, max "+max0+" min "+min0);
  window.console.log("line1, max "+max1+" min "+min1);
  window.console.log("line2, max "+max2+" min "+min2);
};


function opacityVolume(event, ui) {
  if (!vol) { return; }
  vol.opacity = ui.value / 100;
}

//  setup slider
jQuery('#opacity-volume').slider({
    slide: opacityVolume 
});
jQuery('#opacity-volume').width(140);


