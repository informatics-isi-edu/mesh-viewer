//**************************************************************
//   m.setup.js
//   for JI296CCMB
//**************************************************************
var hostname=window.location.hostname;

var initial_mesh_json='\
{ "mesh" : [\
  {\
    "url": "https://'+hostname+'/data/mesh/19dpf/tna.obj",\
    "color": [0.49, 0.49, 0.49],\
    "caption": { "type": "Taenia Marginalis Anterior",\
                 "data":"a TMA mesh",\
                 "link": { "label":"gene expression",\
                           "url":"https://'+hostname+'/meshviewer/gene.html"}\
                }\
  },\
  {\
    "url": "https://'+hostname+'/data/mesh/19dpf/Other_Structures.obj",\
    "color": [0.8, 0.8, 0.8],\
    "caption": { "type": "Other structures",\
                 "data":"a others mesh",\
                 "link": { "label":"gene expression",\
                           "url":"https://'+hostname+'/meshviewer/gene.html"}\
                }\
  },\
  {\
    "url": "https://'+hostname+'/data/mesh/19dpf/Maxilla.obj",\
    "color": [0, 0.25, 0.19],\
    "caption": { "type": "Maxilla Bone",\
                 "data":"a Maxilla mesh",\
                 "link": { "label":"gene expression",\
                           "url":"https://'+hostname+'/meshviewer/gene.html"}\
                }\
  },\
  {\
    "url": "https://'+hostname+'/data/mesh/19dpf/lamina_orbitonasalis.obj",\
    "color": [0, 1, 1],\
    "caption": { "type": "Laminae Orbitonalsis",\
                 "data":"a Laminae mesh",\
                 "link": { "label":"gene expression",\
                           "url":"https://'+hostname+'/meshviewer/gene.html"}\
                }\
  },\
  {\
    "url": "https://'+hostname+'/data/mesh/19dpf/Frontal_Bone.obj",\
    "color": [0.19, 0, 0.19],\
    "caption": { "type": "Frontal Bone",\
                 "data":"a Bone mesh",\
                 "link": { "label":"gene expression",\
                           "url":"https://'+hostname+'/meshviewer/gene.html"}\
                }\
  },\
  {\
    "url": "https://'+hostname+'/data/mesh/19dpf/Epiphyseal_Bar.obj",\
    "color": [0.5, 1, 0],\
    "caption": { "type": "Epiphyseal Bar",\
                 "data":"a Bar mesh",\
                 "link": { "label":"gene expression",\
                           "url":"https://'+hostname+'/meshviewer/gene.html"}\
                }\
  },\
  {\
    "url": "https://'+hostname+'/data/mesh/19dpf/tmp.obj",\
    "color": [0, 0, 0.35],\
    "caption": { "type": "Taenie Marginalis Posterior",\
                 "data":"a tmp mesh",\
                 "link": { "label":"gene expression",\
                           "url":"https://'+hostname+'/meshviewer/gene.html"}\
                }\
  },\
  {\
    "url": "https://'+hostname+'/data/mesh/19dpf/Auditory_Capsule.obj",\
    "color": [1, 0, 1],\
    "caption": { "type": "Auditory Capsule",\
                 "data":"a Auditory mesh",\
                 "link": { "label":"gene expression",\
                           "url":"https://'+hostname+'/meshviewer/gene.html"}\
                }\
  }\
 ]\
}';

var mesh_json='{}';
/*
var mesh_json='\
{ "mesh" : [\
  {\
    "url": "https://'+hostname+'/data/mesh/19dpf/tmp.obj",\
    "color": [0, 0, 0.35],\
    "caption": { "type": "Taenie Marginalis Posterior",\
                 "data":"a tmp mesh",\
                 "link": { "label":"gene expression",\
                           "url":"https://'+hostname+'/meshviewer/gene.html"}\
                }\
  }\
 ]\
}';
*/

function mesh_load() {
window.console.log("initial..");

window.console.log(initial_mesh_json);
window.console.log("mesh_json");
   var _m=$.parseJSON(initial_mesh_json);
   var _mm=$.parseJSON(mesh_json);
   return [_m, _mm];
}

/*
var vol_json='\
{ "volume" : [\
  {\
    "url": "https://'+hostname+'/data/3mesh/JI296CCMB_Control_P0_Hard_Tissue.transformed.nii",\
    "color": [0.00, 0.00, 0.00],\
    "caption": { "type": "Volume",\
                 "data":"nifti vol file for JI296CCMB" }\
  }\
 ]\
}';
*/

var vol_json='{}';

function vol_load() {
   return $.parseJSON(vol_json);
}

var landmark_json='{}';
/*
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
                           "url":"https://'+hostname+'/meshviewer/gene.html"}\
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
                           "url":"https://'+hostname+'/meshviewer/gene.html"}\
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
*/

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
          "url":"https://'+hostname+'/MeshViewer/view.html",\
          "camera": [0, 10, 0],\
          "center": [10.45, 9.94, 70.44],\
          "viewport": { "width": 500, "height": 400 },\
          "mesh" : "url=https://'+hostname+'/data/3mesh/JI296CCMB.obj&url=https://'+hostname+'/data/3mesh/Mandible.obj&url=https://'+hostname+'/data/3mesh/Maxilla.obj",\
          "volume" : "url=https://'+hostname+'/data/3mesh/JI296CCMB.nii",\
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


