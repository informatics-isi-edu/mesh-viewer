// mesh sidebar js

var meshes_sidebar=false;
var using_meshes_button=false;

function toggleActiveSidebar(sidebarID) {
  if (sidebarID == 'landmarks' && meshes_sidebar)
    dismissMeshes();
  if (sidebarID == 'meshes' && landmarks_sidebar)
    dismissLandmarks();
}

// or could initiate a 'click' on
// the meshesButton
function dismissMeshes() {
  if(using_meshes_button)
    meshesClick_btn();
  else meshesClick();
}

// placeholder.. 
function meshesClick_btn() {
  using_meshes_button=true;
  meshes_sidebar = !meshes_sidebar;
  if(meshes_sidebar) {
    $('#meshesbtn').addClass('pick');
    } else {
      $('#meshesbtn').removeClass('pick');
  }
}

// slide out
function meshesClick() {
  if(clip_sidebar) {
     clipClick();
  }
  toggleActiveSidebar('meshes');
  meshes_sidebar = !meshes_sidebar;
  if(meshes_sidebar) {
    sidebar_meshes_slideOut();
    $('#meshesbtn').addClass('pick');
    } else {
      sidebar_meshes_slideIn();
      $('#meshesbtn').removeClass('pick');
  }
}

function sidebar_meshes_slideOut() {
  if (jQuery('#meshes').hasClass('menuDisabled')) {
    // if this menu is disabled, don't slide
    return;
  }
  var panelptr=$('#meshes');
  var sidebarptr=$('#sidebar');
  panelptr.css("display","");
  sidebarptr.css("display","");
  panelptr.removeClass('fade-out').addClass('fade-in');
}
function sidebar_meshes_slideIn() {
  if (jQuery('#meshes').hasClass('menuDisabled')) {
    // if this menu is disabled, don't slide
    return;
  }
  var panelptr=$('#meshes');
  panelptr.removeClass('fade-in').addClass('fade-out');
  panelptr.css("display","none");
}


// clip sidebar js

var clip_sidebar=false;
var using_clip_button=false;

// or could initiate a 'click' on
// the clipButton
function dismissClip() {
  if(using_clip_button)
    clipClick_btn();
  else clipClick();
}

// placeholder.. 
function clipClick_btn() {
  using_clip_button=true;
  clip_sidebar = !clip_sidebar;
  if(clips_sidebar) {
    $('#clipbtn').addClass('pick');
    } else {
      $('#clipbtn').removeClass('pick');
  }
}

// slide out
function clipClick() {
  if(meshes_sidebar) {
     meshesClick();
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

function sidebar_clip_slideOut() {
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
