# mesh-viewer

3D model viewer for rendering surface meshes and landmarks.

## Features

- render 1+ mesh objects in a model
- support for Wavefront Object (.obj) format meshes and to non-standard compressed meshes (.obj.gz)
- automatically computes normals for smooth appearance
- render 1+ landmarks (a.k.a., points of interest)
- specify display names for each mesh or landmark and optionally link to web resources
- zoom in/out/reset
- animated rotation
- specify colors for meshes and landmarks
- simple straight-line distance measurement between landmarks
- and other features

## Interface

The viewer is accessed view its `view.html` page and expects a set of parameters
indicating web resource locations (URL) of the model specification. The parameters are
passed as part of the fragment identifier (i.e., following the `#` of the URL).

## Parameters

The model specification is a combination of JSON documents that describe what to
render in the mesh viewer. The specification is loaded from one or more web resources
indicated by the core parameters. These URLs should be URL-encoded in order to be safely 
passed to the mesh viewer.

### Core Parameters

The core parameters for specifying the model specification are:

* `model` - HTTP URL to the model object
* `mesh` - HTTP URL to JSON list containing mesh objects
* `landmark` - HTTP URL to JSON list containing landmark objects
* `resolver` - The base URL for the site's resolver for which a mesh's or landmark's
  `Label_RID` can be appended to form a complete URL to that mesh's or landmark's 
  associated detail page. Example: `https://example.org/id/` to which an
  id (e.g., `1-3406`) is appended and the client can be redirected to it.

For example:

```
view.html#model=http%3A%2F%2Fexample.org%2Fpath%2Fto%2Fmodel&mesh=http%3A%2F%2Fexample.org%2Fpath%2Fto%2Fmeshes&resolver=http:%2F%2Fexample.org%2Fid%2F
```

### Additional Parameters

In addition to the core parameters for specifying the model, meshes and landmarks, these extra 
options can be passed to modfy the viewer's behavior:

- `showmeshes`: Show the meshes panel on startup. Set to a Boolean value. Default: `false`. 
- `target`: Open URLs provided by *this* Mesh Viewer in another iframe on the same page with the provided HTML class ID as the `target`. This assumes you have two iframes, one running this mesh viewer and another that will change based on the links clicked in this mesh viewer. This applies to all links from mesh and landmark labels that are formed by the `resolver/Label_RID` if given. Default: none.

Example URL with query parameters:

```
<iframe 
  src="view.html#model=http%3A%2F%2Fexample.org%2Fpath%2Fto%2Fmodel&mesh=http%3A%2F%2Fexample.org%2Fpath%2Fto%2Fmeshes&resolver=http:%2F%2Fexample.org%2Fid%2F&showmeshes=true&target=my-other-iframe">
</iframe>
```

### Model Specification

A JSON *singleton* array of an object (if more than one object given only the first will be used). Valid properties for model object:

* RID - (string) The ID of the model
* BG_Color_R, BG_Color_G, BG_Color_B (int [0-255]) - RGB values for the background
* Bounding_Box_Color_R, Bounding_Box_Color_G, Bounding_Box_Color_B (int [0-255]) -
 Color of the Bounding Box
* Units - (string Default: 'mm') type of distance measurement, such as inches. Defaults to 'mm'.
* Unit_Conversion - (float [1.0]) Multiplied by world-space distance to
 convert world-space distances to model_measurement distances

Example:
```
[
  {
    "RID": "1-43KT",
    "BG_Color_R": 0,
    "BG_Color_G": 0,
    "BG_Color_B": 0,
    "Bounding_Box_Color_R": 255,
    "Bounding_Box_Color_G": 255,
    "Bounding_Box_Color_B": 0,
    "Units": "mm",
    "Unit_Conversion": 1.0
  }
]
```

### Mesh Specification

A JSON array of objects. Valid properties for mesh objects:

* RID - (string) The ID of the Mesh.
* URL - (string) The location where the object data resides for this mesh
* Label - (string) The display label for the mesh. *OPTIONAL*: if not given, the `Label_Alt` will be used.
* Label_Alt - (string) Used as the display label *if* the `Label` is `null`. *OPTIONAL*: if not given the basename of the `URL` will be used as the display label.
* Label_RID - (string) The ID for the label. Used with `resolver` for constructing a link for the label. *OPTIONAL*: if not given, the label will be displayed but not linkable.
* Opacity - (float [0-1]) Opacity for this mesh
* Color_R, Color_G, Color_B - (int [0-255]) RGB color values for the mesh color

Example:
```
[
  {
    "RID": "1-444E",
    "URL": "http://mysite.org/my_meshes.obj.gz",
    "Label":"frontal suture",
    "Label_Alt": null,
    "Label_RID":"1-4FC4",
    "Color_R": 66,
    "Color_G": 137,
    "Color_B": 244,
    "Opacity": 1
  }
]
```

### Landmark Specification

A JSON array of objects. Valid properties for landmark objects:

* RID - (string) The ID of the Landmark.
* Mesh - (string) The ID of the Mesh this landmark points.
* Label - (string) The display label for the landmark. *OPTIONAL*: if not given, the `Label_Alt` will be used.
* Label_Alt - (string) Used as the display label *if* the `Label` is `null`. *OPTIONAL*: if not given a display name will be generated (e.g., L1, L2,...).
* Label_RID - (string) The ID for the label. Used with `resolver` for constructing a link for the label. *OPTIONAL*: if not given, the label will be displayed but not linkable.
* Point_X, Point_Y, Point_Z - (float [-inf,inf]) The location of the landmark
* Color_R, Color_G, Color_B - (int [0-255]) RGB color values for the mesh color
* Radius - (float [typically 0.1]) The radius of the spherical marker denoting the landmark.

```
[
  {
    "RID": "1-4452",
    "Mesh": "1-43E0",
    "Label": null,
    "Label_Alt": "Inferior point of mandibular body",
    "Label_RID": null,
    "Point_X": 7.8618,
    "Point_Y": 2.5692,
    "Point_Z": 1.8701,
    "Color_R": 0,
    "Color_G": 0,
    "Color_B": 255,
    "Radius": 0.1,
  }
]
```
