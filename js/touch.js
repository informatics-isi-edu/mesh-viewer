*************************************************************
//   touch.js
//**************************************************************

/*
 [1.00, 0.80, 0.40]  eggyoke yellow 
 [0.53, 0.90, 0.90]  light aqua 
 [1.00, 0.46, 0.19]  light orange 
*/

debug=true;

var add_landmark=false;

// global scoped data
var ren3d=null; // 3d renderer

var meshs=[];   // mesh objects
var vol=null;   // volume objects
var first_time=true;
var first_time_vol=true;

//==== Mesh ====
var initial_mesh_list;
var mesh_list;
var show_mesh = true;

window.onload = function() {

  var _m=mesh_load();
  initial_mesh_list=_m[0], mesh_list=_m[1];

  initRenderer();

  for (var i=0;i<initial_mesh_list['mesh'].length;i++) {
     addMesh(initial_mesh_list['mesh'][i]);
  }

// stackoverflow.com/question/17462936/xtk-flickering-in-overlay-mesh
// resolve multiple mesh transparent object being rendered causing flickering
// effect
  ren3d.config.ORDERING_ENABLED=false;

  ren3d.onShowtime = function(){
    if( first_time ) {
      first_time=false;
      if (vol) { // use bounding box if vol exists
        var _y=(vol.bbox[3] - vol.bbox[2] + 1)*2;
        ren3d.camera.position = [ 0, _y, 0];
printDebug("using vol, y max "+vol.bbox[3]+" y min "+ vol.bbox[2]);
printDebug("and now "+_y);
        } else {
          var _y=(ren3d.bbox[3] - ren3d.bbox[2] + 1);
          ren3d.camera.position = [ 0, _y, 0];
printDebug("using renderer3d, y max "+ren3d.bbox[3]+" y min "+ ren3d.bbox[2]);
printDebug("and now "+_y);
          makeBBox(ren3d);
      }
      addClipPlane();
    }
    ren3d.interactor.onMouseDown = function() {
printDebug("mouse down..");
      if(add_landmark) {
        var _pos = ren3d.interactor.mousePosition;
printDebug("  current mouse position is.."+_pos[0]+","+_pos[1]);
        var _t=getObjNear(_pos[0],_pos[1]);
        var _c = ren3d.camera.unproject_(_pos[0], _pos[1], 0);
printDebug("  and part of c is "+_c[0]+" "+_c[1]+" "+_c[2]);
      };
    };

  };

  ren3d.interactor.onTouchHover = function() {
printDebug("touch hover..");
    if(saved_color != null) {
      ren3d.get(saved_id).color = saved_color;
//      ren3d.get(saved_id).transform.translateY(-1);
      saved_color=null;
    }
    // grab the current touch position
    var _pos = ren3d.interactor.touchPosition;
printDebug("  current touch position is.."+_pos);

    // pick the current object
    var _id = ren3d.pick(_pos[0], _pos[1]);

    if (_id != 0) {
      var _obj=ren3d.get(_id);
      var _target=ren3d.pick3d(_pos[0],_pos[1], 0.5, 0.05, _obj);
      if(show_caption) {
        if(ren3d.get(_id).caption) {
          var _j=ren3d.get(_id).caption;

          showLabel(_j['type'],_j['data'],_j['link']);
          } else { 
//printDebug("  this object "+_id+ " does not have caption..");
        }
        } else { // grab the object and turn it white, only if it has caption,
          if(ren3d.get(_id).caption && !add_landmark) {
//printDebug("  picking obj .."+_id);
              saved_color=ren3d.get(_id).color;
              var obj=ren3d.get(_id);
              saved_id=_id;
              ren3d.get(_id).color = [1, 1, 1];
//ren3d.get(saved_id).transform.translateY(1);
              } else {
//printDebug(" picking "+_id+ " no change since no stored caption");
          }
      }
      if(add_landmark && _target) {
         if( _obj == null ) {
           return;
         }
         var _g=_obj.file.split('/').pop().toLowerCase().split('.').shift();
         var _cap= { "type":"Landmark","data":"user added landmark" };
         var _s=addSphere(_target, [0,0,1], 0.08,_cap);
printDebug("adding a new landmark for "+_g);

         if( landmarks[_g] == null ) {
           landmarks[_g]=[];
           landmarks[_g].push(_s);
           } else {
             landmarks[_g].push(_s);
         }
         var _label=askForLabel(_g);
         addLandmarkListEntry(_g,landmarks[_g].length,_obj.color,_label);
      }
    } else {
//printDebug("  did not pick anything");
    }
  }

  ren3d.interactor.onTouchEnd = function() {
printDebug("touch End..");
    if(saved_color == null) {
      return;
    }
    // grab the object and turn it red
    ren3d.get(saved_id).color = saved_color;
//printDebug("  reset "+saved_id + " with "+saved_color);
//    ren3d.get(saved_id).transform.translateY(-1);
    saved_color=null;
    saved_id=null;
  }

  ren3d.render();
}

function toggleAdd() {
  add_landmark = !add_landmark;
  if(add_landmark) {
    jQuery('#addbtn').prop('value','noAdd');
    } else {
      jQuery('#addbtn').prop('value','addMore');
  }
}

function getObjNear(x,y) {
  var target=ren3d.pick3d(x,y, 0.5, 0.08, null);
if(target) {
  printDebug("ObjNear.."+ target[0]+" "+target[1]+" "+target[2]);
  addSphere(target,[1,0,1]);
}
  return target;
}

/* slide from 1 to 100 */
function clipPlane(event, ui) {
  clip3d(ui.value/100);
}

function reset_clipPlane() {
  clip3d(-1);
  jQuery('#clip-plane').slider("option", "value", 0);
}

function addClipPlane() {
  jQuery('#clip-plane').slider({ slide: clipPlane });
  jQuery('#clip-plane').width(100);
  jQuery('#clip-plane').slider("option", "value", 0);
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
  printDebug(msg+" "+str);
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

function addMeshListEntry(fname,i,color)
{
  var _idx=i-1;
  var _n=fname.split('/').pop().toLowerCase().split('.').shift();
  var _nn='<button class="btn" disabled=true style="background-color:'+RGBTohex(color)+';"/><input id='+_n+' type=checkbox checked="" onClick=toggleMesh('+_idx+') value='+_idx+' name="mesh">'+_n+'</input><br>';
  jQuery('#meshlist').append(_nn);
//printDebug(_nn);
}

function addVolume(t) { // color, url, caption, <id/new>
  vol = new X.volume();
  vol.file = encodeURI(t['url']);
  vol.caption = JSON.stringify(t['caption']);
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
  _mesh.caption = JSON.stringify(t['caption']);
printDebug("caption is.."+_mesh.caption);
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

function clip3d(near) {

  var s=" ";
  for(var i=0; i< ren3d.camera.view.length; i++) {
   s=s+ren3d.camera.view[i]+" ";
  }
  printDebug("  view is=>"+s);
  var b=" ";
  for( var j=0; j<6; j++) {
   b=b+ren3d.bbox[j]+" ";
  }
  printDebug("  bbox is=>"+b);

  var _width = jQuery(mainView).width();
  var _height = jQuery(mainView).height();
  if(near <= 0) { // reset 
    ren3d.camera.clip(_width,_height,1);
    return;
  }
  var _range= (ren3d.bbox[3] - ren3d.bbox[2] + 1);
  var _start=(Math.abs(ren3d.camera.view[14])-(_range/2));
  var _near= (near * _range) + _start;
printDebug("clip3d, start "+_start+" and to "+_range+ " on target "+_near);
  ren3d.camera.clip(_width,_height,_near);
}


function makeBBox(r) {
// CREATE Bounding Box
    var res = [r.bbox[0],r.bbox[2],r.bbox[4]];
    var res2 = [r.bbox[1],r.bbox[3],r.bbox[5]];

    box = new X.object();
    box.points = new X.triplets(72);
    box.normals = new X.triplets(72);
    box.type = 'LINES';
    box.points.add(res2[0], res[1], res2[2]);
    box.points.add(res[0], res[1], res2[2]);
    box.points.add(res2[0], res2[1], res2[2]);
    box.points.add(res[0], res2[1], res2[2]);
    box.points.add(res2[0], res[1], res[2]);
    box.points.add(res[0], res[1], res[2]);
    box.points.add(res2[0], res2[1], res[2]);
    box.points.add(res[0], res2[1], res[2]);
    box.points.add(res2[0], res[1], res2[2]);
    box.points.add(res2[0], res[1], res[2]);
    box.points.add(res[0], res[1], res2[2]);
    box.points.add(res[0], res[1], res[2]);
    box.points.add(res2[0], res2[1], res2[2]);
    box.points.add(res2[0], res2[1], res[2]);
    box.points.add(res[0], res2[1], res2[2]);
    box.points.add(res[0], res2[1], res[2]);
    box.points.add(res2[0], res2[1], res2[2]);
    box.points.add(res2[0], res[1], res2[2]);
    box.points.add(res[0], res2[1], res2[2]);
    box.points.add(res[0], res[1], res2[2]);
    box.points.add(res[0], res2[1], res[2]);
    box.points.add(res[0], res[1], res[2]);
    box.points.add(res2[0], res2[1], res[2]);
    box.points.add(res2[0], res[1], res[2]);
    for ( var i = 0; i < 24; ++i) {
      box.normals.add(0, 0, 0);
    }
    box.color=[0,1,1];
    r.add(box);
 
    var center = [r.bbox[0] + (r.bbox[1]-r.bbox[0]),
              r.bbox[2] + (r.bbox[3]-r.bbox[2]),
              r.bbox[4] + (r.bbox[5]-r.bbox[4])
              ];
    addSphere(center,[1,0,0]);

   printDebug("bcenter is at.."+center[0]+" "+center[1]+" "+center[2]);

};

function addSphere(loc, color) {
printDebug("addSphere at. "+loc);
  var newSphere = new X.sphere();
  newSphere.center = loc;
  newSphere.color = color;
  newSphere.radius = 0.5;
  newSphere.caption = JSON.stringify({ "loc" : loc});
  ren3d.add(newSphere);
  return newSphere;
}


