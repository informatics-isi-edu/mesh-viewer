//**************************************************************
//   m.setup.js
//
// model.json attributes
//    label is used for legend 
//    id, group are used for internal keys
//
//**************************************************************
var hostname=window.location.hostname;
var initial_mesh_json=null; // master mesh list
var mesh_json=null; // this is used just for testing of adding mesh on demand
var landmark_json=null;
var vol_json=null;
var view_json=null;
var anno_json=null;
var hasLandmarks=false;
var hasViews=false;


var model_label='Default Mesh';
var model_id='model id';
var model_caption=null;
var model_color=[1,1,1];
var model_bbox=[0,0,0];
var model_clip=null;

/*
#FFCC66    orange (1.00, 0.80, 0.40)
#868600    yellow (0.527, 0.527, 0)
#009600    green (0, 0.592, 0)
#008E8E    cyan (0, 0.559, 0.559)
#5050FC    blue (0.316, 0.316, 0.991)
#B700B7    magenta (0.718, 0, 0.718)
*/
var defaultColor=[ [1.00, 0.80, 0.40],
                   [0, 0.559, 0.559],
                   [0, 0.592, 0],
                   [0.718, 0, 0.718],
                   [0.527, 0.527, 0],
                   [0.316, 0.316, 0.991]];

// just in case my defaultColor is too little
function getDefaultColor(p) {
  var len=defaultColor.length;
  var t= (p+len) % len;
  return defaultColor[t];
}

//https://stackoverflow.com/questions/4434076/best-way-to-alphanumeric-check-in-javascript
//https://stackoverflow.com/questions/784586/convert-special-characters-to-html-in-javascript
function HTMLEncode(str){
  var i = str.length,
      aRet = [];
  while (i--) {
    var iC = str[i].charCodeAt();
    if (!(iC > 47 && iC < 58) && // numeric (0-9)
        !(iC > 64 && iC < 91) && // upper alpha (A-Z)
        !(iC > 96 && iC < 123)) { // lower alpha (a-z)
      aRet[i] = '_';
    } else {
      aRet[i] = str[i];
    }
   }
  return aRet.join('');    
}

// ...file.obj
// ...file.obj.gz
function chopForStub(url){
  var s=url.split('/').pop();
  var ss = s.replace(/.gz/,"").replace(/.obj/,"");
  // if file has funny characters.. change it..
  var sss=HTMLEncode(ss);
  return sss;
}

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
     || (str[0] == "[" && str[ str.length-1 ] == "]")
     || (str[0] == "\'" && str[ str.length-1 ] == "\'"))
    str=str.substr(1,str.length-2);
    return str;
  }
  return s;
}

// THIS is for internal testing only
function setupWithDefaults()
{
  initial_mesh_json=$.parseJSON(foo_initial_mesh_json);
  mesh_json=$.parseJSON(foo_mesh_json);
  landmark_json=$.parseJSON(foo_landmark_json);
  vol_json=$.parseJSON(foo_vol_json);
  view_json=foo_view_json;
  anno_json=foo_anno_json;
}

// expect ends with .obj, or .obj.gz
function notMesh(fobj) {
  var fname=fobj.name; 
  var i=fname.indexOf('.obj.gz');
  var ii=fname.indexOf('.obj');
  if(i || ii) {
    return 0;
    } else {
      return 1;
  }
}

// this is for preview run where local mesh file is being picked
// up using html5's file reader
function selectLocalFiles(files) {
window.console.log("just started on selectLocalFiles..");
  var f=files;
  var cnt = files.length;
  var mesh_i=0;
  for(var i=0; i<cnt; i++) {
    var fobj=files[i];
    if( notMesh(fobj) )
      continue;
    // create a default mesh url json
//{ "mesh" : [ { "url": "abc.obj" } ] }
    var tt= {"url": fobj};
    if(initial_mesh_json == null) {
      var ttt={ "mesh" : [ tt ]};
      initial_mesh_json= ttt;
      } else {
        initial_mesh_json["mesh"].push(tt);
        mesh_i=initial_mesh_json["mesh"].length-1;
    }
// what needs to happen when a new mesh is injected
    addMesh(tt);
// in case there is no initial mesh, this force it to continue the initialization
    setNeed2Show();
// this might be duplicating in a particular case but that is okay
    setupOpacitySlider(mesh_i); 
  }
}

function processArgs(args) {
window.console.log(args[1]);
  var params = args[1].split('&');
  for (var i=0; i < params.length; i++) {
    var param = unescape(params[i]);
    var splitIndex = param.indexOf('='); 
    if (splitIndex == -1) {
      // only one -- expect it to be mesh json
      var url=param.replace(new RegExp('/$'),'').trim();
      var tmp=ckExist(url);
      var tt=trimQ(tmp);
      initial_mesh_json=JSON.parse(tt);
      } else {
        var kvp = [param.substring(0,splitIndex), param.substring(splitIndex+1,param.length)];

var myProcessArg=function(kvp0, kvp1) {
        switch (kvp0.trim()) {
          case 'url': // special case, when only mesh url being passed in
            {
            var t=kvp1.trim();
            // create a default mesh url json
//{ "mesh" : [ { "url": "http://localhost/data/3mesh/JI296CCMB.obj" } ] }
            if(initial_mesh_json == null) {
              var tt={ "mesh" : [ { "url": t} ]};
              initial_mesh_json= tt;
              } else {
                var tt= {"url":t};
                initial_mesh_json["mesh"].push(tt); 
            }
            break;
            }
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
//window.console.log("NOT handling volume yet..");
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
{ "mesh" : [{ \
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


