var firstTimeLoad = true;

function onRender() {

    if(!need2Show) {
      return;
    }

// clip it if preset
    if( first_time_render ) {
      first_time_render=false;
      if(model_clip >=0) {
        initClipSlider(model_clip);
      }
    }
// rotate the camera in X-direction
    if(spin_view) {
      ren3d.camera.rotate([1, 0]);
    }

    if (firstTimeLoad && openMeshPanelOnStart) {
        meshesClick();
    }
    firstTimeLoad = false;

}

function onShowtime() {

//window.console.log("calling onShowtime");
    var loadingDiv = document.getElementById('loading');
    loadingDiv.style.display = 'none';
    setupViewerBackground();

    if(!need2Show) {
      return;
    }

    if( first_time_show ) {
      first_time_show=false;
      setupClipSlider();
      initOpacitySliders();
      if (vol) { // use vol bounding box if vol exists
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
}


function zoomIn()
{
  cameraZoomingIn(true,false);
}

function zoomOut()
{
  cameraZoomingIn(false,false);
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

// NOT IN USE
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

// NOT IN USE
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
window.console.log("show_caption..");
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