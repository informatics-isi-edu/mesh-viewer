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

var mesh_list;
var last_mesh_list;
var anno_list;

var saved_color=null;
var saved_id=null;
var show_caption=false;

window.onload = function() {

  var _m=mesh_load();
  mesh_list=_m[0], last_mesh_list=_m[1];
  anno_list=anno_load();
  
  if (webgl_detect() == false) {
    alertify.confirm("There is no webgl!!");
    throw new Error("WebGL is not enabled!");
    return;
  }

  initRenderer();

  for (var i=0;i<mesh_list['mesh'].length;i++) {
     addMesh(mesh_list['mesh'][i]);
  }

  // zoom in alittle
  var _camera=ren3d.camera.position;
  ren3d.camera.position = [ 0, 10, 0];

// stackoverflow.com/question/17462936/xtk-flickering-in-overlay-mesh
// resolve multiple mesh transparent object being rendered causing flickering
// effect
  ren3d.config.ORDERING_ENABLED=false;

// disable caption 
  ren3d.interactor.config.HOVERING_ENABLED = false;
  show_caption=false;


  ren3d.onRender = function(){
    var loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'none';
  }

  ren3d.interactor.onMouseDown = function() {
    if(saved_color != null) {
      ren3d.get(saved_id).color = saved_color;
//      ren3d.get(saved_id).transform.translateY(-1);
      saved_color=null;
    }
    // grab the current mouse position
    var _pos = ren3d.interactor.mousePosition;

window.console.log("current mouse position is.."+_pos);

    // pick the current object
    var _id = ren3d.pick(_pos[0], _pos[1]);

    if (_id != 0) {
      if(show_caption && ren3d.get(_id).caption) {
        var _j=ren3d.get(_id).caption;
        showLabel(_j['type'],_j['data']);
        } else {
          // grab the object and turn it red
//window.console.log("picking obj .."+_id);
          saved_color=ren3d.get(_id).color;
          saved_id=_id;
          ren3d.get(_id).color = [1, 0, 0];
//      ren3d.get(saved_id).transform.translateY(1);
      }
    }
  }

  ren3d.interactor.onMouseUp = function() {
    if(saved_color == null) {
      return;
    }
    // grab the object and turn it red
    ren3d.get(saved_id).color = saved_color;
//    ren3d.get(saved_id).transform.translateY(-1);
    saved_color=null;
    saved_id=null;
  }

  ren3d.render();
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

// create mesh object 
//    add to the local mesh list
//    add to 3D renderer
//    add to ui's meshlist 
function addMesh(t) { // color, url, caption, id
  var _mesh = new X.mesh();
  _mesh.color = t['color'];
  _mesh.file = encodeURI(t['url']);
  _mesh.caption = t['caption'];
  var _cnt=meshs.push(_mesh);
  var loadingDiv = document.getElementById('loading');
  loadingDiv.style.display ='';
  ren3d.add(_mesh);
  addListEntry(t['url'],_cnt,t['color']);
  t['id']=_mesh._id;
}

// testing adding a new mesh after rendering
function loadLastMesh() {
  for (var i=0;i<last_mesh_list['mesh'].length;i++) {
     addMesh(last_mesh_list['mesh'][i]);
  }
  document.getElementById('lastbtn').style.visibility = 'hidden';
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
var _nn='<p id="dtext">'+JSON.stringify(jval)+'</p>';
window.console.log(_nn);
     _p.replaceWith(_nn);
    }
  });//dialog
}

