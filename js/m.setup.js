//**************************************************************
//   m.setup.js
//
// model.json attributes
//    label is used for legend 
//    id, group are used for internal keys
//
//**************************************************************
var hasLandmarks=false;
var hasViews=false;


var model_label='Default Mesh';
var model_id='model id';
var model_caption=null;
var model_color=[1,1,1];
var model_bbox=[0,0,0];
var model_clip=null;
var model_measurement='mm';
var model_unitconversion=1.0;

// Most URLs for meshes and landmarks expect to fetch resources from the server
// they're on, and default to the server's hostname. If you're working locally,
// this will set the URL to pull data from that remote location instead.
// You MUST disable CORS on your browser for this to work properly.
var development_hostname = ''
if (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  var development_hostname = 'https://dev.facebase.org';

// All arguments here are HTTP URLs. Each GET will fetch JSON.
const URL_ARGUMENTS = {
  'model': setupModel,
  'mesh': setupMeshes,
  'landmark': setupLandmarks,
}

// Other fragment arguments, simply passed to the function defined below
const GENERAL_ARGUMENTS = {
  'resolver': rawValue,
  'target': rawValue,
  'showmeshes': rawValue,
}

// Arguments that can be passed to the mesh viewer. These are the defaults if
// no value is given. Arguments must be passed as fragments, not query params
// Example:
// example.com/view.html#model=<model>&meshes=<mesh>
const MESH_VIEWER_ARGUMENT_DEFAULTS = {
  'model': {},
  'mesh': [],
  'landmark': [],
  'resolver': null,
  'target': null,
  'showmeshes': false,
}

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

function processArguments() {
  const urlParams = new URLSearchParams(window.location.hash);
  var processedArgs = {}
  Array.from(urlParams.keys()).forEach(function(arg) {
    var argValue = decodeURIComponent(urlParams.get(arg));
    // URLSearchParams was intended for queryparams and not fragments. As such it
    // will keep the '#' attached to the first arg passed in. Remove it!
    if (arg[0] == '#') {arg = arg.substr(1);}

    // If the fragment is a URL, fetch the JSON and call the corresponding function
    // with the result
    if (URL_ARGUMENTS[arg] != null) {
      var promise = $.getJSON(argValue).then(function(result) {
          return result;
        }).then(function(data) {
          return URL_ARGUMENTS[arg](data)
        });
      processedArgs[arg] = promise;
    } else if (GENERAL_ARGUMENTS[arg] != null) {
      var promise = Promise.resolve(GENERAL_ARGUMENTS[arg](argValue));
      processedArgs[arg] = promise;
    } else {
      console.warn('The following argument is not supported: ', arg);
    }
  });

  // Promise.all() requires an iterable, but our promises are tracked through an object.
  // The following keeps two lists for keys and values and rebuilds the relationships
  // after the promises have been resolved. There may be a better way to do this.
  const promiseKeys = Object.keys(processedArgs);
  var promiseValues = [];
  promiseKeys.forEach(function(key) {promiseValues.push(processedArgs[key]);});
  return Promise.all(promiseValues).then(function(values) {
    var mappedResults = setupDefaults();
    for(var i = 0; i < promiseKeys.length; i++) {
      mappedResults[promiseKeys[i]] = values[i];
    }
    return postSetup(mappedResults);
  }).catch(function(response) {
    console.error('Failed to process all arguments. Please fix the failing argument before continuing.', response)
  });
}

// Defaults if not present
function setupDefaults() {
  return MESH_VIEWER_ARGUMENT_DEFAULTS;
}

// Do no processing on the arg itself, this will be handled in postSetup()
function rawValue(option) {
  return option;
}

function setupModel(model) {
  if (model.length > 1) {
    console.warning('Multiple model settings, settings are ambiguous', model)
  }
  if (model.length == 1) {
    const model_settings = model[0];
    model_id = model_settings.RID || model_id;
    model_caption = model_settings.caption || model_caption;
    model_color = parseColor(model_settings['BG_Color_R'],
                             model_settings['BG_Color_G'],
                             model_settings['BG_Color_B'],
                             ) || model_color;
    model_bbox = parseColor(model_settings['Bounding_Box_Color_R'],
                            model_settings['Bounding_Box_Color_G'],
                            model_settings['Bounding_Box_Color_B'],
                             ) || model_bbox;
    model_clip = model_settings.Clip || model_clip;
    model_measurement = model_settings.Units || model_measurement;
    model_unitconversion = model_settings.Unit_Conversion || model_unitconversion;
    return 'Global Variables for model id "' + model_id + '" have been set.'
  }
  console.warning('Model not properly set, continuing with defaults...')
}

function setupMeshes(meshes) {
  var formattedMeshes = []
  meshes.forEach(function (mesh) {
    var formattedMesh = {
      'id': mesh['RID'],
      'link': {'url': null, 'label': null},
      'label': mesh['Label'] || mesh['Label_Alt'],
      'url': development_hostname + mesh['URL'],
      'opacity': mesh['Opacity'],
      'color': parseColor(mesh.Color_R, mesh.Color_G, mesh.Color_B)
    }
    formattedMeshes.push(formattedMesh);
  });
  return formattedMeshes;
}

function setupLandmarks(landmarks) {
  var formattedLandmarks = []
  landmarks.forEach(function (landmark) {
    var formattedLandmark = {
      'id': landmark.RID,
      'link': {'url': null, 'label': null},
      'label': mesh['Label'] || mesh['Label_Alt'],
      'labelRID': landmark['Label_RID'] ,
      'group': landmark['Mesh'],
      'point': [landmark['Point_X'], landmark['Point_Y'], landmark['Point_Z']],
      'radius': landmark['Radius'] || 0.1,
      'color': parseColor(landmark['Color_R'], landmark['Color_G'], landmark['Color_B']),
    }
    formattedLandmarks.push(formattedLandmark);
  });
  if (formattedLandmarks.length > 0) {
    // Global variable that determines whether landmarks should show up in mesh list
    // Currently in m.viewer.js, meshes and landmarks have a bit of a circular dependency
    // on one another when both are collected, and currently require meshes to be constructed
    // first and landmarks second, with 'hasLandmarks' existing so that meshes know landmarks
    // do exist before they're ready. m.viewer.js will need to be refactored before 'hasLandmarks'
    // can be removed.
    hasLandmarks = true;
  }
  return formattedLandmarks;
}

function postSetup(model) {
  var formattedModel = {
    'model': model['model'],
    'meshes': model['mesh'],
    'landmarks': model['landmark'],
    'showmeshes': model['showmeshes'],
    'targetURL': model['target'],
    'resolver': model['resolver'],
  }
  if (formattedModel.resolver) {
    function setURL(meshOrLandmark) {
      if (meshOrLandmark['Label_RID']) {
        meshOrLandmark.link.url = formattedModel.resolver + meshOrLandmark['Label_RID'];
      }
    }
    formattedModel.meshes.forEach(setURL);
    formattedModel.landmarks.forEach(setURL);
  }
  return formattedModel;
}

function parseColor(r, b, g) {
  if (r == null || b == null || g == null)
    return null
  return [r/255.0, g/255.0, b/255.0];
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
