//**************************************************************
//   m.setup.js
//
// model.json attributes
//    label is used for legend 
//    id, group are used for internal keys
//
//**************************************************************
var hostname=window.location.hostname;
var initial_mesh_json=null;
var mesh_json=null;
var landmark_json=null;
var vol_json=null;
var view_json=null;
var anno_json=null;
var hasLandmarks=false;
var hasViews=false;

var model_label=null;
var model_id=null;
var model_caption=null;
var model_color=null;
var model_bbox=null;
var model_clip=null;

// should be a very small file and used for testing and so can ignore
// >>Synchronous XMLHttpRequest on the main thread is deprecated
// >>because of its detrimental effects to the end user's experience.
function ckExist(url) {
  var http = new XMLHttpRequest();
  http.onreadystatechange = function () {
    if (this.readyState == 4) {
 // okay
    }
  }
  http.open("GET", url, false);
  http.send();
  if(http.status !== 404) {
    return http.responseText;
    } else {
      return null;
  }
}

// trim quotes only if it is a string
function trimQ(s) {

  if( s && typeof s === 'string') {
    var str=s.trim(); // trim the ' or "
    if( (str[0] == "\"" && str[ str.length-1 ] == "\"")
     || (str[0] == "\'" && str[ str.length-1 ] == "\'"))
    str=str.substr(1,str.length-2);
    return str;
  }
  return s;
}


function setupWithDefaults()
{
  initial_mesh_json=$.parseJSON(foo_initial_mesh_json);
  mesh_json=$.parseJSON(foo_mesh_json);
  landmark_json=$.parseJSON(foo_landmark_json);
  vol_json=$.parseJSON(foo_vol_json);
  view_json=foo_view_json;
  anno_json=foo_anno_json;
}

function processArgs(args) {
window.console.log(args[1]);
  var params = args[1].split('&');
  for (var i=0; i < params.length; i++) {
    var param = unescape(params[i]);
    if (param.indexOf('=') == -1) {
      // only one -- expect it to be meshurl
      var url=param.replace(new RegExp('/$'),'').trim();
      var tmp=ckExist(url);
      var tt=trimQ(tmp);
      initial_mesh_json=JSON.parse(tt);
      } else {
        var kvp = param.split('=');

var myProcessArg=function(kvp0, kvp1) {
        switch (kvp0.trim()) {
          case 'mesh': // 
            {
            var tmp;
            if( typeof kvp1 === 'object') { // already in parsed
              tmp=kvp1;
              } else { // this is an url
                var t=kvp1.trim();
                var tt;
                if(isURL(t)) {
                  tt=ckExist(t);
                  } else {
                    tt=t;
                }
                tt=trimQ(tt);
                tmp= JSON.parse(tt);
            }
            if(initial_mesh_json == null) {
              initial_mesh_json=tmp;
              } else {
                 mesh_json=tmp;
            }
            break;
            }
          case 'landmark':
            {
            var tmp;
            if( typeof kvp1 === 'object') { // already in parsed
              tmp=kvp1;
              } else { // this is an url
                var t=kvp1.trim();
                var tt;
                if(isURL(t)) {
                  tt=ckExist(t);
                  } else {
                    tt=t;
                }
                tt=trimQ(tt);
                tmp= JSON.parse(tt);
            }
            landmark_json=tmp;
            // only when there are landmark that we enable the btn
            var p = document.getElementById('landmarkbtn');
            if(p) {
              p.style.display = '';
            }
            hasLandmarks=true;
            break;
            }
          case 'volume':
            {
window.console.log("NOT handling volume yet..");
            var tmp;
            if( typeof kvp1 === 'object') { // already in parsed
              tmp=kvp1;
              } else { // this is an url
                var t=kvp1.trim();
                var tt;
                if(isURL(t)) {
                  tt=ckExist(t);
                  } else {
                    tt=t;
                }
                tt=trimQ(tt);
                tmp= JSON.parse(tt);
            }
            vol_json=tmp;
            break;
            }
          case 'model':
            {
            var t=kvp1.trim();
            var tt=ckExist(t);
            tt=trimQ(tt);
            var tmp= JSON.parse(tt);
            var klist=Object.keys(tmp);
            var mi=klist.find(function(m) { return m=='mesh' });
            var li=klist.find(function(m) { return m=='landmark'});
            var vi=klist.find(function(m) { return m=='view'});
            var oi=klist.find(function(m) { return m=='volume'});
            if(mi != undefined) {
              myProcessArg('mesh',{ "mesh": tmp['mesh']}); 
            }
            if(li != undefined) {
              myProcessArg('landmark',{"landmark": tmp['landmark']});
            }
            if(vi != undefined) {
              myProcessArg('view',{"view": tmp['view']});
            }
            if(oi != undefined) {
              myProcessArg('volume',{"volume": tmp['volume']});
            }
            model_label=tmp['label'];
            model_id=tmp['id'];
            model_caption=tmp['caption'];
            var _tmp=tmp['bgcolor']; // background color of viewer
            if(_tmp) {
              model_color=_tmp;
              } else {
                model_color=[1,1,1];
            }
            _tmp=tmp['bboxcolor']; // bounding box's color
            if(_tmp) {
              model_bbox=_tmp;
              } else {
                model_bbox=[1,1,0];
            }
            _tmp=tmp['clip']; // clip plane's value,change to int
            if(_tmp) {
              model_clip=parseInt(_tmp);
            }
            break;
            }
          case "view":
            { // "-1,0,0,0,0,0,1,0,0,1,0,0,0,0,-10.206781387329102,1"
            var tmp;
            if( typeof kvp1 === 'object') { // already in parsed
              tmp=kvp1;
              } else { // this is an url or a string
                var t=kvp1.trim();
                var tt;
                if(isURL(t)) {
                  tt=ckExist(t);
                  } else {
                    tt=t;
                }
                tt=trimQ(tt);
                tmp= JSON.parse(tt);
            }
            view_json=tmp;
            hasViews=true;
window.console.log("view string is", JSON.stringify(tmp));
window.console.log("loading the view..", view_json);
            break;
            }
          default:
            {
            window.console.log("HUM.. skip this arg ", kvp0);
            break;
            }
        }
} // end of myProcessArg
       myProcessArg(kvp[0],kvp[1]);
    }
  }
  return; 
}


// http://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
function isURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return pattern.test(str);
}


var foo_initial_mesh_json='\
{ "mesh" : [ { \
      "id": "JI296CCMB",\
      "label": "Back Skull",\
      "url": "http://localhost/data/3mesh/JI296CCMB.obj",\
      "color": [1.00, 0.80, 0.40],\
      "opacity": 1,\
      "caption": {\
                   "description":"a skull mesh at the back of head",\
                   "link": { "label":"gene expression",\
                             "url":"http://localhost/meshviewer/gene.html"}\
                  }\
               },\
               {\
      "id": "Maxilla",\
      "label": "Maxilla",\
      "url": "http://localhost/data/3mesh/Maxilla.obj",\
      "color": [1.00, 0.46, 0.19],\
      "opacity": 1,\
      "caption": {\
                   "description":"a Mandible Maxilla",\
                   "link": { "label":"gene expression",\
                             "url":"http://localhost/meshviewer/gene.html"}\
                  }\
               }\
  ]\
}';

var foo_mesh_json='\
{ "mesh" : \
  [{\
      "id": "Mandible",\
      "label": "Mandible",\
      "url": "http://localhost/data/3mesh/Mandible.obj",\
      "color": [0.53, 0.90, 0.90],\
      "opacity": 1,\
      "caption": {\
                   "description":"a Mandible Mandible",\
                   "link": { "label":"gene expression",\
                             "url":"http://localhost/meshviewer/gene.html"}\
                  }\
   }]\
}';

function mesh_load() {
   var _m=null;
   var _mm=null;
   if(initial_mesh_json)
     _m=initial_mesh_json;
   if(mesh_json)
     _mm=mesh_json;
   return [_m, _mm];
}

var foo_vol_json='\
{ "volume" : [\
  {\
    "id": "VOL5600", \
    "label": "volume of JI296CCMB", \
    "url": "http://'+hostname+'/data/3mesh/JI296CCMB_Control_P0_Hard_Tissue.transformed.nii",\
    "color": [0.00, 0.00, 0.00],\
    "caption": { "description":"nifti vol file for JI296CCMB",\
                 "link": { "label":"gene expression",\
                           "url":"http://localhost/meshviewer/gene.html"}\
  }}]\
}';

function vol_load() {
   if(vol_json)
     return vol_json;
   return(null);
}

var foo_landmark_json='\
{  "landmark" : [ {\
         "id": "LND5678",\
         "label": "Posterior pt of JI296CCMB",\
         "group": "JI296CCMB", \
         "color": [1, 0, 0],\
         "radius": 0.1, \
         "point": [8.502269744873047, 6.578330039978027, 69.94249725341797],\
         "caption": { \
                 "description":"Tail end of Skull, JI296CCMB",\
                 "link": { "label": "landmark",\
                           "url":"https://www.example.com/path/to/info/about/LND5678" }\
                    }\
                 },\
                 {\
         "id": "LND5679",\
         "label": "Most anterior superior pt of premaxilla",\
         "group": "JI296CCMB", \
         "color": [1, 0, 0],\
         "radius": 0.1, \
         "point": [15.606300354003906, 9.819620132446289,71.14600372314453],\
         "caption": { \
                 "description":"Front tip of Skull",\
                 "link": { "label":"landmark",\
                           "url":"https://www.example.com/path/to/info/about/LND5679" }\
                    }\
                  },\
                  {\
         "id": "LND5680",\
         "label": "Anterior point of something",\
         "group": "JI296CCMB",\
         "color": [1, 0, 0],\
         "radius": 0.1, \
         "point": [7.819620132446289,10.14050006866455,67.17459869384766],\
         "caption": { \
                 "description":"Lowermost tip of Skull",\
                 "link": { "label":"landmark",\
                           "url":"https://www.example.com/path/to/info/about/LND5680" }\
                    }\
                  },\
                  {\
         "id": "LND5681",\
         "label": "Anterior-medial point to zygomatic process",\
         "group": "Maxilla", \
         "color": [1, 0, 0],\
         "radius": 0.1, \
         "point": [13.516400337219238,11.584600448608398,70.9854965209961],\
         "caption": { \
                 "description":"Lowermost tip of Maxilla",\
                 "link": { "label":"landmark",\
                           "url":"https://www.example.com/path/to/info/about/LND5681" }\
                    }\
                  },\
                  {\
         "id": "LND5682",\
         "label": "Superior tip of coronary process",\
         "group": "Mandible", \
         "color": [1, 0, 0],\
         "radius": 0.1, \
         "point": [11.42609977722168,12.432299613952637,70.46399688720703],\
         "caption": { \
                 "description":"Superior tip",\
                 "link": { "label":"landmark",\
                           "url":"https://www.example.com/path/to/info/about/LND5682" }\
                    }\
                   },\
                   {\
         "id": "LND5683",\
         "label": "Most anterior pt of mandible",\
         "group": "Mandible", \
         "color": [1, 0, 0],\
         "radius": 0.1, \
         "point": [15.551799774169922,9.578940391540527,69.4209976196289],\
         "caption": { \
                 "description":"Anterior tip",\
                 "link": { "label":"landmark",\
                           "url":"https://www.example.com/path/to/info/about/LND5683" }\
                     }\
             } ]\
}';

function landmark_load() {
   if(landmark_json )
     return landmark_json;
   return (null);
}

// new Float32Array(16)
// {-1,0,0,0,0,-0,1,0,0,1,0,0,0,0,-10,1}
// {0.66,-0.74,-0.09,0,-0.17,-0.03,-0.98,0,0.73,0.67,-0.15,0,0,0,-16,1}
var foo_view_json='\
{ "view" : [\
  { \
    "matrix": [ 0.3939458131790161, -0.14428237080574036, 0.9077383279800415, 0, 0.6927173733711243, -0.6025053858757019, -0.3963961601257324, 0, 0.6041101813316345, 0.784964919090271, -0.13740763068199158, 0, 0, 0, -10, 1 ] \
  }\
 ]\
}';

// just one for now
function view_load() {
   if(view_json) {
       var _v= view_json['view'][0]['matrix'];
     return _v;
   } 
   return null;
}

/**************
not in use yet
**************/
var foo_anno_json='\
{ "annotation" : [\
  {\
    "type": "xtk_mesh",\
    "id": 4124939659,\
    "event": "INFO",\
    "data": {\
      "src": "JI296CCMB",\
      "context": {\
          "url":"http://'+hostname+'/MeshViewer/view.html",\
          "camera": [0, 10, 0],\
          "center": [10.45, 9.94, 70.44],\
          "viewport": { "width": 500, "height": 400 },\
          "mesh" : "url=http://'+hostname+'/data/3mesh/JI296CCMB.obj&url=http://'+hostname+'/data/3mesh/Mandible.obj&url=http://'+hostname+'/data/3mesh/Maxilla.obj",\
          "volume" : "url=http://'+hostname+'/data/3mesh/JI296CCMB.nii",\
          "view" : { "matrix" : [ 0.3939458131790161, -0.14428237080574036, 0.9077383279800415, 0, 0.6927173733711243, -0.6025053858757019, -0.3963961601257324, 0, 0.6041101813316345, 0.784964919090271, -0.13740763068199158, 0, 0, 0, -10, 1 ] }\
      },\
      "text": "this is a annotation for skull of JI296CCMB",\
      "shape": "rect",\
      "x": 0,\
      "y": 0,\
      "width": 0,\
      "height": 0\
    }\
  }\
 ]\
}';

function anno_load() {
   if(anno_json)
     return $.parseJSON(anno_json);
   return null;
}


