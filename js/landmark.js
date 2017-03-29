//**************************************************************
//   landmark.js, tesing on adding landmarks on the fly
// localhost/meshviewer/landmark.html
// localhost/meshviewer/landmark.html?3mesh/Mandible.obj
//**************************************************************

/*
 [1.00, 0.80, 0.40]  eggyoke yellow 
 [0.53, 0.90, 0.90]  light aqua 
 [1.00, 0.46, 0.19]  light orange 
*/

// global scoped data
var ren3d=null; // 3d renderer
var vol=null;   // volume objects
var save_view_matrix = new Float32Array(16);

var dflt=true;

var first_time=true;
var first_time_vol=true;
var add_landmark=false;
var hostname=window.location.hostname;

function saveView() {
  /* copy it over */
  for(var i=0; i< ren3d.camera.view.length; i++)
    save_view_matrix[i]=ren3d.camera.view[i];
}

function goView() {
  for(var i=0; i< save_view_matrix.length; i++)
    ren3d.camera.view[i]=save_view_matrix[i];
  ren3d.render();
}

//==== Mesh ====

window.onload = function() {

  ren3d = new X.renderer3D();
  ren3d.container='mainView';
  ren3d.init();

  var file="http://"+hostname+"/data/avf.vtk";
  var args = document.location.search.substring(1).split('&');
  if (args.length == 1 && args[0] !="") {
    dflt=false;
    var arg = unescape(args[0]);
    window.console.log("arg is"+arg);
    file="http://"+hostname+"/data/"+arg;
  }

  var _mesh = new X.mesh();
  _mesh.color = [1.00, 0.80, 0.40];
  _mesh.file = file;
  _mesh.caption = _mesh.file;
  ren3d.add(_mesh);


  ren3d.onShowtime = function(){
    if( first_time ) {
      first_time=false;
      if (vol) { // use bounding box if vol exists
        var _y=(vol.bbox[3] - vol.bbox[2] + 1)*2;
        ren3d.camera.position = [ 0, _y, 0];
        } else {
window.console.log("renderer's bbox is "+ren3d.bbox);
          var _y=(ren3d.bbox[3] - ren3d.bbox[2] + 1);
          ren3d.camera.position = [ 0, _y, 0];
          makeBBox(ren3d);
          saveView();
      }
    }
    ren3d.interactor.onMouseDown = function() {
//window.console.log("mouse down..")
      if(add_landmark) {
        var _pos = ren3d.interactor.mousePosition;
window.console.log("  current mouse position is.."+_pos[0]+","+_pos[1]);
    
        var _target;
        if(dflt) { 
          _target=ren3d.pick3d(_pos[0],_pos[1], 2, 1, null);
          } else {
             _target=ren3d.pick3d(_pos[0],_pos[1], 0.5, 0.1, null);
        }
        if(_target) {
  //window.console.log("landmark loc.."+ _target[0]+" "+_target[1]+" "+_target[2]);
/*
// [PLIST]
         for(var i=0; i<_target.length; i++) {
           var p=_target[i];
           if(i == 0) {
              s=addSphere(p,[0,1,1],0.3, i);
              } else {
                s=addSphere(p,[1,0,1],0.2, i);
           }
           if(i==5)
              break; 
         }
*/
// [[MLIST][], [MLIST][PLIST]]
            var l=null;
            var offset=1/_target.length;
            var c=0;
            for(var i=0; i<_target.length; i++) {
               c=c+offset;
               l=_target[i];
               var m=l[0];
               var plist=l[1];
               if(i == 0) {
                 addSphere(m[0],[0.25,1,0.4],0.5, i);
                 } else {
                   addSphere(m[0],[1,1,0],0.5, i);
               }
               for( var j=0; j<plist.length; j++) {
                 var p=plist[j];
                 if(j == 0) {
                   addSphere(p,[0,1,c],0.3, j);
                   } else {
                     addSphere(p,[1,0,c],0.2, j);
                 }
               }
            }
          } else {
  window.console.log("can not find a landmark loc..");
        };
      };
    };

  };

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
    addSphere(center,[1,0,0],0.1, -1);

   window.console.log("bcenter is at.."+center[0]+" "+center[1]+" "+center[2]);

};

function addSphere(loc, color, size, idx) {
window.console.log("add sphere.. from "+idx+" "+loc);
  var newSphere = new X.sphere();
  newSphere.center = loc;
  newSphere.color = color;
  if(dflt) {
    newSphere.radius = size;
    } else {
      newSphere.radius = size/10;
  }
  newSphere.caption = JSON.stringify({ "loc" : loc, "idx": idx} );
  ren3d.add(newSphere);
  return newSphere;
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

