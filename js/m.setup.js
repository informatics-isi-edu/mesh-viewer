//**************************************************************
//   m.setup-url.js
//**************************************************************
var hostname=window.location.hostname;
var initial_mesh_json=null;
var mesh_json=null;
var landmark_json=null;
var vol_json=null;
var view_json=null;
var anno_json=null;

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
  initial_mesh_json=foo_initial_mesh_json;
  mesh_json=foo_mesh_json;
  landmark_json=foo_landmark_json;
  vol_json=foo_vol_json;
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
      initial_mesh_json=ckExist(url);
      } else {
        var kvp = param.split('=');
        switch (kvp[0].trim()) {
          case 'meshurl': // 
            {
            var t=kvp[1].trim();
            var tmp=ckExist(t);
            if(initial_mesh_json == null) {
              initial_mesh_json=trimQ(tmp);
              } else {
                 mesh_json=trimQ(tmp);
            }
            break;
            }
          case 'landmarkurl':
            {
            var t=kvp[1].trim();
            var tmp=ckExist(t);
            landmark_json=trimQ(tmp);
            break;
            }
          default:
            {
            window.console.log("HUM.. skip this arg ", kvp[0]);
            break;
            }
        }
    }
  }
  return 
}


var foo_initial_mesh_json='\
{ "mesh" : [\
  {\
    "url": "http://'+hostname+'/data/3mesh/JI296CCMB.obj",\
    "color": [1.00, 0.80, 0.40],\
    "caption": { "type": "JI296CCMB",\
                 "data":"a skull mesh",\
                 "link": { "label":"gene expression",\
                           "url":"http://'+hostname+'/meshviewer/gene.html"}\
                }\
  },\
  {\
    "url": "http://'+hostname+'/data/3mesh/Mandible.obj",\
    "color": [0.53, 0.90, 0.90],\
    "caption": { "type": "Mandible",\
                 "data":"a Mandible mesh",\
                 "link": { "label":"gene expression",\
                           "url":"http://'+hostname+'/meshviewer/gene.html"}\
                }\
  }\
 ]\
}';

var foo_mesh_json='\
{ "mesh" : [\
  {\
    "url": "http://'+hostname+'/data/3mesh/Maxilla.obj",\
    "color": [1.00, 0.46, 0.19],\
    "caption": { "type": "Maxilla",\
                 "data":"a Mandible Maxilla",\
                 "link": { "label":"gene expression",\
                           "url":"http://'+hostname+'/meshviewer/gene.html"}\
                }\
  }\
 ]\
}';

function mesh_load() {
   var _m=null;
   var _mm=null;
   if(initial_mesh_json)
     _m=$.parseJSON(initial_mesh_json);
   if(mesh_json)
     _mm=$.parseJSON(mesh_json);
   return [_m, _mm];
}

var foo_vol_json='\
{ "volume" : [\
  {\
    "url": "http://'+hostname+'/data/3mesh/JI296CCMB_Control_P0_Hard_Tissue.transformed.nii",\
    "color": [0.00, 0.00, 0.00],\
    "caption": { "type": "Volume",\
                 "data":"nifti vol file for JI296CCMB" }\
  }\
 ]\
}';

function vol_load() {
   if(vol_json)
     return $.parseJSON(vol_json);
   return(null);
}

var foo_landmark_json='\
{ "landmark" : [\
  {\
    "group": "JI296CCMB", \
    "color": [1, 0, 0],\
    "label": "Posterior point of something",\
    "radius": 0.1, \
    "point": [8.502269744873047, 6.578330039978027, 69.94249725341797],\
    "caption": { "type":"Landmark",\
                 "data":"Tail end of Skull"\
               }\
  },\
  {\
    "group": "JI296CCMB", \
    "color": [1, 0, 0],\
    "label": "Most anterior superior point of premaxilla",\
    "radius": 0.1, \
    "point": [15.606300354003906, 9.819620132446289,71.14600372314453],\
    "caption": { "type":"Landmark",\
                 "data":"Front tip of Skull",\
                 "link": { "label":"point expression",\
                           "url":"http://'+hostname+'/meshviewer/gene.html"}\
               }\
  },\
  {\
    "group": "JI296CCMB",\
    "color": [1, 0, 0],\
    "label": "Anterior point of something",\
    "radius": 0.1, \
    "point": [7.819620132446289,10.14050006866455,67.17459869384766],\
    "caption": { "type":"Landmark",\
                 "data":"Lowermost tip of Skull",\
                 "link": { "label":"point expression",\
                           "url":"http://'+hostname+'/meshviewer/gene.html"}\
               }\
  },\
  {\
    "group": "Maxilla", \
    "color": [1, 0, 0],\
    "label": "Anterior-medial point to zygomatic process",\
    "radius": 0.1, \
    "point": [13.516400337219238,11.584600448608398,70.9854965209961],\
    "caption": { "type": "Landmark", "data":"Lower most of Maxilla" }\
  },\
  {\
    "group": "Mandible", \
    "color": [1, 0, 0],\
    "label": "Superior tip of coronary process",\
    "radius": 0.1, \
    "point": [11.42609977722168,12.432299613952637,70.46399688720703],\
    "caption": { "type": "Landmark", "data":"Top tip of Mandible" }\
  },\
  {\
    "group": "Mandible", \
    "color": [1, 0, 0],\
    "label": "Most anterior point of mandible",\
    "radius": 0.1, \
    "point": [15.551799774169922,9.578940391540527,69.4209976196289],\
    "caption": { "type": "Landmark", "data":"Front tip of Mandible" }\
  }\
 ]\
}';

function landmark_load() {
   if(landmark_json)
     return $.parseJSON(landmark_json);
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
     var _v=$.parseJSON(view_json);
     return _v['view'][0]['matrix'];
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


