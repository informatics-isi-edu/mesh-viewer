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
//window.console.log("anno_json=>"+anno_json); 
   return $.parseJSON(anno_json);
}

var mesh_json='\
{ "mesh" : [\
  {\
    "url": "http://'+hostname+'/data/3mesh/JI296CCMB.obj",\
    "color": [1.00, 0.80, 0.40],\
    "caption": { "type": "JI296CCMB", "data":"a skull mesh " }\
  },\
  {\
    "url": "http://'+hostname+'/data/3mesh/Mandible.obj",\
    "color": [0.53, 0.90, 0.90],\
    "caption": { "type": "Mandible", "data":"a Mandible mesh " }\
  }\
 ]\
}';

var last_mesh_json='\
{ "mesh" : [\
  {\
    "url": "http://'+hostname+'/data/3mesh/Maxilla.obj",\
    "color": [1.00, 0.46, 0.19],\
    "caption": { "type": "Maxilla", "data":"a Mandible Maxilla" }\
  }\
 ]\
}';

function mesh_load() {
//window.console.log("mesh_json=>"+mesh_json);
   var _m=$.parseJSON(mesh_json);
//window.console.log("last_mesh_json=>"+last_mesh_json);
   var _mm=$.parseJSON(last_mesh_json);
   return [_m, _mm];
}




