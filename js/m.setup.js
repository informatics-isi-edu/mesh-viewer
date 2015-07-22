//**************************************************************
//   m.setup.js
//**************************************************************
var hostname=window.location.hostname;

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
          "mesh" : "url=http://'+hostname+'/data/3mesh/JI296CCMB.obj&url=http://'+hostname+'/data/3mesh/Mandible.obj&url=http://'+hostname+'/data/3mesh/Maxilla.obj"\
      },\
      "text": "this is a annotation for skull of JI296CCMB",\
      "shape": "rect",\
      "x": 0,\
      "y": 0,\
      "width": 0,\
      "height": 0\
    }\
  },\
  {\
    "type": "xtk_mesh",\
    "id": 4124939460,\
    "event": "INFO",\
    "data": {\
      "src": "Mandible",\
      "context": {\
          "url":"http://'+hostname+'/MeshViewer/view.html",\
          "camera": [0, 10, 0],\
          "center": [10.45, 9.94, 70.44],\
          "viewport": { "width": 500, "height": 400 },\
          "mesh" : "url=http://'+hostname+'/data/3mesh/JI296CCMB.obj&url=http://'+hostname+'/data/3mesh/Mandible.obj&url=http://'+hostname+'/data/3mesh/Maxilla.obj"\
      },\
      "text": "this is a Mandible annotation",\
      "shape": "rect",\
      "x": 0,\
      "y": 0,\
      "width": 0,\
      "height": 0\
    }\
  },\
  {\
    "type": "xtk_mesh",\
    "id": 4124939461,\
    "event": "INFO",\
    "data": {\
      "src": "Maxilla",\
      "context": {\
          "url":"http://'+hostname+'/MeshViewer/view.html",\
          "camera": [0, 10, 0],\
          "center": [10.45, 9.94, 70.44],\
          "viewport": { "width": 500, "height": 400 },\
          "mesh" : "url=http://'+hostname+'/data/3mesh/JI296CCMB.obj&url=http://'+hostname+'/data/3mesh/Mandible.obj&url=http://'+hostname+'/data/3mesh/Maxilla.obj"\
      },\
      "text": "this is a Maxilla annotation",\
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

var initial_mesh_json='\
{ "mesh" : [\
  {\
    "url": "http://'+hostname+'/data/3mesh/JI296CCMB.obj",\
    "color": [1.00, 0.80, 0.40],\
    "caption": { "type": "JI296CCMB",\
                 "data":"a skull mesh",\
                 "link":"http://'+hostname+'/meshviewer/gene.html"}\
  },\
  {\
    "url": "http://'+hostname+'/data/3mesh/Mandible.obj",\
    "color": [0.53, 0.90, 0.90],\
    "caption": { "type": "Mandible",\
                 "data":"a Mandible mesh",\
                 "link":"http://'+hostname+'/meshviewer/gene.html"}\
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
                 "link":"http://'+hostname+'/meshviewer/gene.html"}\
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
    "caption": { "type": "Volume", "data":"nifti vol file for JI296CCMB" }\
  }\
 ]\
}';

function vol_load() {
   return $.parseJSON(vol_json);
}

var landmark_json='\
{ "landmark" : [\
  {\
    "color": [0, 0, 0],\
    "radius": 0.06, \
    "point": [xx,yy,zz], \
    "caption": { "type": "Maxilla", "data":"Topmost of Maxilla" }\
  },\
  {\
    "color": [0, 0, 0],\
    "radius": 0.06, \
    "point": [xx,yy,zz], \
    "caption": { "type": "Maxilla", "data":"Lower most of Maxilla" }\
  },\
  {\
    "color": [1, 0, 0],\
    "radius": 0.06, \
    "point": [xx,yy,zz], \
    "caption": { "type": "Mandible", "data":"Lower most of Mandible" }\
  }\
 ]\
}';

function landmark_load() {
   return $.parseJSON(landmark_json);
}

