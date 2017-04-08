
function model2json() {
  // header part
  var tmp={ "id": model_id, "label": model_label, "caption":model_caption, "bgcolor":model_color, "bboxcolor":model_bbox};
  return tmp;
}

// view="{ "view":[ { "matrix": [..]} ]}"
function view2json() {
  var tmp_matrix=[];
  // view="{ "view":[ { "matrix": [..]} ]}"

  for(var i=0; i< ren3d.camera.view.length; i++)
    tmp_matrix[i]=ren3d.camera.view[i];
  var tmpstring=stringIt("dumpView", tmp_matrix);
  tmp= {"view": [{"matrix":tmp_matrix}]};
  return tmp;
}

// what can be changed, opacity -
//  
function mesh2json()
{
  var mlist=[];
  for(var i=0; i< meshs.length; i++) {
    var _m=meshs[i][1]; // original mesh state
    var _t=meshs[i][0]; // the xtk mesh object
    var _mstr=JSON.stringify(_m); // make a deep copy
    var _mm=JSON.parse(_mstr); 
    _mm.opacity=_t.opacity;
    mlist.push(_mm);
  }
  var mjson= { "mesh": mlist };
  return mjson;
}

function landmark2json()
{
  var llist=[];
  for(var i=0; i< landmarks.length; i++) {
    var _m=landmarks[i][1]; // original landmark state
    var _t=landmarks[i][0]; // the xtk sphere object
    var _mstr=JSON.stringify(_m); // make a deep copy
    var _mm=JSON.parse(_mstr); 
    _mm.visible=_t.visible;
    llist.push(_mm);
  }
  var ljson= { "landmark": llist };
  return ljson;
}

function vol2json()
{
   var _v=vol_json;
   return _v;
}

function clip2json()
{
// grab clip value
 var _c=jQuery('#clip-plane').slider("option", "value");
  var cjson= { "clip": _c };
  return cjson;
}

function snapshot() {
/* easy way 
  var _str=callString;
  var vjson=view2json();
  var vstr=JSON.stringify(vjson);
  vstr=encodeURI(vstr);
  var nstr=_str+"&view=\""+vstr+"\"";
window.console.log("NEW=>",nstr);
*/

  var _top=model2json();
  var _m=mesh2json();
  var _l=landmark2json();
  var _v=vol2json();
  var _c=clip2json();
  var _w=view2json();

  var _model = Object.assign({},_top,_c,_m,_l,_v,_w);
  var mview = document.getElementById("mainView");
  var mcanvas= document.getElementsByTagName("canvas");

  var nstr=JSON.stringify(_model);
window.console.log("model", nstr);
  return nstr;
}

function modelDownload(fname) {
  var dname=fname;
  if(dname == null) {
    var f = new Date().getTime();
    var ff= f.toString();
    dname="model_"+ff+".json";
  }
  var txt=snapshot();
  var dload = document.createElement('a');
  dload.href = URL.createObjectURL(new Blob([txt], {type: 'text/plain'}));
  dload.download = dname;
  dload.style.display='none';
  document.body.appendChild(dload);
  dload.click();
  document.body.removeChild(dload);
  delete dload;
}

function jpgDownload0(fname) {
   var dname=fname;
   if(dname == null) {
     var f = new Date().getTime();
     var ff= f.toString();
     dname="isrd_"+ff+".jpg";
   }

   html2canvas(document.body, {
       onrendered: function(canvas) {
/*
           return Canvas2Image.saveAsPNG(canvas);
*/
    document.body.appendChild(canvas);
    canvas.id = "ctx"
    var ctx = document.getElementById('ctx');
    var img = ctx.toDataURL("image/png");
    window.open(img);

      }});
}

function jpgDownload2(fname) {
   var dname=fname;
   if(dname == null) {
     var f = new Date().getTime();
     var ff= f.toString();
     dname="isrd_"+ff+".jpg";
   }

//   var target=ren3d;
//   var _canvas=target._canvas;
   var items = document.getElementsByTagName("canvas");
   var cnt=items.length;
window.console.log("NUMBER OF canvas is ",cnt);
   var _canvas=items[0];
//   var canvas = document.getElementById("mainView");
window.console.log(typeof _canvas);
   var rawImg = _canvas.toDataURL("image/jpeg");
   rawImg= rawImg.replace("image/jpeg", "image/octet-stream");
   document.location.href = rawImg;
}

var isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
//var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);
var isChrome = !!window.chrome && !!window.chrome.webstore;
var isIE = /*@cc_on!@*/false || !!document.documentMode;

function jpgDownload3(fname) {
   var dname=fname;
   if(dname == null) {
     var f = new Date().getTime();
     var ff= f.toString();
     dname="isrd_"+ff+".jpg";
   }

   html2canvas(document.body, {
       onrendered: function(canvas) {
// RETINA FIX
       var rawImg;
       var pixelDensityRatio=queryForRetina(canvas);
       if(pixelDensityRatio != 1) {
         var newCanvas = document.createElement("canvas");
         var _width = canvas.width;
         var _height = canvas.height;
         newCanvas.width = _width;
         newCanvas.height = _height;
         var newCtxt = newCanvas.getContext("2d");
         newCtxt.drawImage(canvas, 0,0, _width, _height, 
                                  0,0, _width, _height);
         rawImg = newCanvas.toDataURL("image/jpeg",1);
         } else {
           var ctxt = canvas.getContext("2d");
           rawImg = canvas.toDataURL("image/jpeg",1);
       }

       if( ! isIE ) { // this only works for firefox and chrome
         var dload = document.createElement('a');
         dload.href = rawImg;
         dload.download = dname;
         dload.innerHTML = "Download Image File";
         dload.style.display = 'none';
         if( isChrome ) {
           dload.click();
           delete dload;
           } else {
             dload.onclick=destroyClickedElement;
             document.body.appendChild(dload);
             dload.click();
             delete dload;
         }
         } else {
           if(isSafari) {
             rawImg= rawImg.replace("image/jpeg", "image/octet-stream");
             document.location.href = rawImg;
             } else { // IE
                var blob = dataUriToBlob(rawImg);
                window.navigator.msSaveBlob(blob, dname);
           }
       }
       }
   });
}

// testing for retina
function queryForRetina(canv) {
// query for various pixel ratios
 var ctxt = canv.getContext("2d");
 var devicePixelRatio = window.devicePixelRatio || 1;
 var backingStoreRatio = ctxt.webkitBackingStorePixelRatio ||
                         ctxt.mozBackingStorePixelRatio ||
                         ctxt.msBackingStorePixelRatio ||
                         ctxt.oBackingStorePixelRatio ||
                         ctxt.backingStorePixelRatio || 1;
  var pixelDensityRatio = devicePixelRatio / backingStoreRatio;

  return pixelDensityRatio;
}

function destroyClickedElement(event)
{
    document.body.removeChild(event.target);
}

