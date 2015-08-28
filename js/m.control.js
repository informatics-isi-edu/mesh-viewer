

// 2d sliders
function volumeslicingSag(event, ui) {
  if (!vol) { return; }
  vol.indexX = Math.floor(jQuery('#Sag_slider').slider("option", "value"));
}
function volumeslicingAx(event, ui) {
  if (!vol) { return; }
  vol.indexZ = Math.floor(jQuery('#Ax_slider').slider("option", "value"));
}

function volumeslicingCor(event, ui) {
  if (!vol) { return; }
  vol.indexY = Math.floor(jQuery('#Cor_slider').slider("option", "value"));
}

function setup2dSliders() {

  // create the 2d sliders
  jQuery("#Ax_slider").slider({
    slide: volumeslicingAx
  });
  jQuery("#Ax_slider .ui-slider-handle").unbind('keydown');

  jQuery("#Sag_slider").slider({
    slide: volumeslicingSag
  });
  jQuery("#Sag_slider .ui-slider-handle").unbind('keydown');

  jQuery("#Cor_slider").slider({
    slide: volumeslicingCor
  });
  jQuery("#Cor_slider .ui-slider-handle").unbind('keydown');
}

function init2dSliders() { 
   // update 2d slice sliders
  var dim = vol.range;

    // ax
  window.console.log("Ax max is "+(dim[2]-1));
  jQuery("#Ax_slider").slider("option", "disabled", false);
  jQuery("#Ax_slider").slider("option", "min", 0);
  jQuery("#Ax_slider").slider("option", "max", dim[2] - 1);
  jQuery("#Ax_slider").slider("option", "value", vol.indexZ);

   // sag
  window.console.log("Sag's max is "+(dim[0] -1));
  jQuery("#Sag_slider").slider("option", "disabled", false);
  jQuery("#Sag_slider").slider("option", "min", 0);
  jQuery("#Sag_slider").slider("option", "max", dim[0] - 1);
  jQuery("#Sag_slider").slider("option", "value", vol.indexX);

  // cor
  window.console.log("Cor's max is "+ (dim[1]-1));
  jQuery("#Cor_slider").slider("option", "disabled", false);
  jQuery("#Cor_slider").slider("option", "min", 0);
  jQuery("#Cor_slider").slider("option", "max", dim[1] - 1);
  jQuery("#Cor_slider").slider("option", "value", vol.indexY);
}

// LINK THE RENDERERS
//
// link the 2d renderers to the 3d one by setting the onScroll
// method. this means, once you scroll in 2d, it upates 3d as well
function updateSag() {
  window.console.log("Sag is going to .."+vol.indexX);
  jQuery('#Sag_slider').slider("option", "value",vol.indexX);
};
function updateAx() {
  window.console.log("Ax is going to .."+vol.indexZ);
  jQuery('#Ax_slider').slider("option", "value",vol.indexZ);
};
function updateCor() {
  window.console.log("Cor is going to .."+vol.indexY);
  jQuery('#Cor_slider').slider("option", "value",vol.indexY);
};

function onSliceNavigation() {
  jQuery('#Sag_slider').slider("option", "value",vol.indexX);
  jQuery('#Ax_slider').slider("option", "value",vol.indexY);
  jQuery('#Cor_slider').slider("option", "value",vol.indexZ);
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

/* slide from 1 to 100 */
function clipPlane(event, ui) {
  clip3d(ui.value/100);
}

function reset_clipPlane() {
  clip3d(-1);
  jQuery('#clip-plane').slider("option", "value", 0);
}

function windowLevelVolume(event, ui) {
  if (!vol) { return; }
  vol.windowLow = ui.values[0];
  vol.windowHigh = ui.values[1];
}

function setup3dSliders() {

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

function setupClipSlider() {
  jQuery('#clip-plane').slider({ slide: clipPlane });
  jQuery('#clip-plane').width(100);
}

function init3dSliders() {
  if(!vol) { return; }

  jQuery('#opacity-volume').slider("option", "value", 80);
  vol.opacity = 0.8; // re-propagate
  vol.modified();

  jQuery('#threshold-volume').dragslider("option", "max", vol.max);
  jQuery('#threshold-volume').dragslider("option", "min", vol.min);
  jQuery('#threshold-volume').dragslider("option", "values",
        [vol.min, vol.max]);
}

function initClipSlider() {
  jQuery('#clip-plane').slider("option", "value", 0);
}
