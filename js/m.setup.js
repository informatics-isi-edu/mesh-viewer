//**************************************************************
//   m.setup.js
//**************************************************************
var hostname=window.location.hostname;

var initial_mesh_json='\
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

var mesh_json='\
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
   var _m=$.parseJSON(initial_mesh_json);
   var _mm=$.parseJSON(mesh_json);
   return [_m, _mm];
}

var vol_json='\
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
   return $.parseJSON(vol_json);
}

var landmark_json='\
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
    "group": "JI296CCMB", \
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
   return $.parseJSON(landmark_json);
}

// new Float32Array(16)
// {-1,0,0,0,0,-0,1,0,0,1,0,0,0,0,-10,1}
// {0.66,-0.74,-0.09,0,-0.17,-0.03,-0.98,0,0.73,0.67,-0.15,0,0,0,-16,1}
var view_json='\
{ "view" : [\
  { \
    "matrix": [ 0.3939458131790161, -0.14428237080574036, 0.9077383279800415, 0, 0.6927173733711243, -0.6025053858757019, -0.3963961601257324, 0, 0.6041101813316345, 0.784964919090271, -0.13740763068199158, 0, 0, 0, -10, 1 ] \
  }\
 ]\
}';

// just one for now
function view_load() {
   var _v=$.parseJSON(view_json);
   return _v['view'][0]['matrix'];
}

/**************
not in use yet
**************/
var anno_json='\
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
   return $.parseJSON(anno_json);
}


