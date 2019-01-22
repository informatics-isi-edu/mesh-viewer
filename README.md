# mesh-viewer

This is a 3D model viewer that renders meshes and landmarks.

## Features

- render one or more meshes in a scene
- each mesh associated with a label and a color
- labels may be based on anatomy terms and link to web resources detailing the anatomy term
- optional bounding box
- optional animation to rotate the model
- reset the model to its original orientation and zoom level
- support for Wavefront Object (.obj) format meshes and to non-standard compressed meshes (.obj.gz)
- display landmarks
- simple straigh-line distance measurement between landmarks

## Interface

The viewer is accessed view its `view.html` page and expects a set of query parameters
indicating web resource locations (URL) of the model specification. Note that
CORS is not supported, and all URLs must originate from the main site.

## Query Option Parameters

The model specification is a combination of JSON documents that describe what to
render in the mesh viewer. The specification is loaded from one or more web resources
indicated by the core query option parameters. These URLs should be URL-encoded in
order to be safely passed to the mesh viewer.

The core options for specifying the model specification are:

* `model_url` - HTTP URL to the model object
* `mesh_url` - HTTP URL to JSON list containing mesh objects
* `landmark_url` - HTTP URL to JSON list containing landmark objects
* `anatomy_url_fragment` - Partial URL prefix for which a mesh's or landmark's
  `anatomy_id` can be appended to form a complete URL to that mesh's or landmark's 
  associated anatomy detail page. Example: `https://example.org/id/` to which an
  id (e.g., `1-3406`) is appended and the client can be redirected to it.

For example:

```
view.html#model_url=http%3A%2F%2Fexample.org%2Fpath%2Fto%2Fmodel&mesh_url=http%3A%2F%2Fexample.org%2Fpath%2Fto%2Fmeshes&anatomy_url_fragment=http:%2F%2Fexample.org%2Fid%2F
```

### Extra Query Options

In addition to the core query parameters for specifying the model, meshes and landmarks, these extra 
options can be passed to modfy the viewer's behavior:

- `showmeshes`: Show the meshes panel on startup. Set to a Boolean value. Default: `false`. 
- `target-url`: Open URLs provided by *this* Mesh Viewer in another iframe on the same page with the provided HTML class ID. This assumes you have two iframes, one running this mesh viewer and another that will change based on the links clicked in this mesh viewer. This applies to all `mesh.link.url` and `landmark.link.url` links in the model loaded by this Mesh Viewer. Default: `None`.

Example URL with query parameters:

```
<iframe 
  src="view.html#model_url=http%3A%2F%2Fexample.org%2Fpath%2Fto%2Fmodel&mesh_url=http%3A%2F%2Fexample.org%2Fpath%2Fto%2Fmeshes&anatomy_url_fragment=http:%2F%2Fexample.org%2Fid%2F&showmeshes=true&target-url=my-other-iframe">
</iframe>
```

### Model Specification

Valid properties for model specification referenced by `model_url`:

* RID - (string) The id of the model
* bg_color_r, bg_color_g, bg_color_b (int [0-255]) - RGB values for the background
* bounding_box_color_r, bounding_box_color_g, bounding_box_color_b (int [0-255]) -
 Color of the Bounding Box
* measurement - (string [inches, cm]) units of distance measurement
* unitconversion - (float [1.0]) Multiplied by world-space distance to
 convert world-space distances to model_measurement distances

Example:
```
[
  {
    "RID": "1-43KT",
    "bg_color_r": 0,
    "bg_color_g": 0,
    "bg_color_b": 0,
    "bounding_box_color_r": 255,
    "bounding_box_color_g": 255,
    "bounding_box_color_b": 0,
    "measurement": "cm",
    "unitconversion": 1.0
  }
]
```

### Mesh Specification

Valid properties for meshes specification referenced by `mesh_url`:

* RID - (string) The ID of the Mesh.
* url - (string) The location where the object data resides for this mesh
* anatomy - (string) Name of the anatomy this mesh points
* anatomy_id - (string) ID for the anatomy. Used with `anatomy_url_fragment` for constructing a link back to the anatomy.
* label - (string) Can be used instead of `anatomy` as an alternative description.
* opacity - (float [0-1])Opacity for this mesh
* color_r, color_g, color_b - (int [0-255]) RGB color values for the mesh color

Example:
```
[
  {
    "RID": "1-444E",
    "url": "http://mysite.org/my_meshes.obj.gz",
    "anatomy":"frontal suture",
    "anatomy_id":"1-4FC4",
    "label": null,
    "color_r": 66,
    "color_g": 137,
    "color_b": 244,
    "opacity": 1
  }
]
```

### Landmark Specification

Valid properties for landmark specification referenced by `landmark_url`:

* RID - (string) The ID of the Landmark.
* mesh - (string) The ID of the Mesh this landmark points
* anatomy - (string) Name of the anatomy this landmark points
* anatomy_id - (string) ID for the anatomy. Used with `anatomy_url_fragment` for constructing a link back to the anatomy.
* label - (string) Can be used instead of `anatomy` as an alternative description.
* point_x, point_y, point_z - (float [-inf,inf]) The location of the landmark
* color_r, color_g, color_b - (int [0-255]) RGB color values for the mesh color
* radius - (float [typically 0.1]) The radius of the spherical marker denoting the landmark.

```
[
  {
    "RID": "1-4452",
    "mesh": "1-43E0",
    "anatomy": null,
    "anatomy_id": null,
    "label": "Inferior point of mandibular body",
    "point_x": 7.8618,
    "point_y": 2.5692,
    "point_z": 1.8701,
    "color_r": 0,
    "color_g": 0,
    "color_b": 255,
    "radius": 0.1,
  }
]
```
