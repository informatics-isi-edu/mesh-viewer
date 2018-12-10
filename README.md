# mesh-viewer

This is a 3D model viewer that renders volumes, meshes and landmarks.

## Features

Stable features:
- render one or more meshes in a scene
- each mesh associated with a label and a color
- each label may link to another web resource
- optional bounding box
- optional animation to rotate the model
- reset the model to its original orientation and zoom level
- support for Wavefront Object (.obj) format meshes

In development features:
- render an associated volume
- display landmarks
- support for NIfTI, TIFF, and OME-TIFF volumes

## Interface

The viewer is accessed view its `view.html` page and expects a query parameter
indicating web resource location (URL) of the model specification.

```
http://example.org/view.html?model=path/to/model.json
```

### Query Param Options

Extra options can be passed via query params:

- `showmeshes`: Show the meshes panel on startup. Set to a Boolean value. Default: `false`. 
- `target-url`: Open URLs provided by *this* Mesh Viewer in another iframe on the same page with the provided HTML class ID. This assumes you have two iframes, one running this mesh viewer and another that will change based on the links clicked in this mesh viewer. This applies to all `mesh.link.url` and `landmark.link.url` links in the model loaded by this Mesh Viewer. Default: `None`.

Example URL with query parameters:
```
<iframe 
  src="http://example.org/view.html?model=path/to/model.json&showmeshes=true&target-url=my-other-iframe">
</iframe>
```

## Model specification

The model specification is a combination of URL fragments that describe what to
render in the mesh viewer. The main options do not contain the info directly, but
specify URLs to JSON containing the complete info at a remote location. Note that
CORS is not supported, and all URLs must originate from the main site.

Currently, these options exist:

* `model_url` - HTTP URL to general settings on the mesh-viewer
* `mesh_url` - HTTP URL to JSON list containing mesh objects
* `landmark_url` - HTTP URL to JSON list containing landmark objects
* `anatomy_url_fragment` - Partial URL prefix for which a mesh or landmark _id_
    can be appended to form a complete URL to that mesh or landmarks detail page

### Model URL Specification

Valid options for `model_url`:

* model_id - (string) The id of the model
* model_caption - (string) The caption of the model
* bg_color_r, bg_color_g, bg_color_b (int [0-255]) - RGB values for the background
* bounding_box_color_r, bounding_box_color_g, bounding_box_color_b (int [0-255]) -
 Color of the Bounding Box
* model_measurement - (string [inches, cm]) units of distance measurement
* model_unitconversion - (float [1.0]) Multiplied by world-space distance to
 convert world-space distances to model_measurement distances

Example:
```
[
  {
    "id": 54,
    "label": "E18.5 wildtype mouse - hard tissue",
    "description": null,
    "bg_color_r": 0,
    "bg_color_g": 0,
    "bg_color_b": 0,
    "bounding_box_color_r": 255,
    "bounding_box_color_g": 255,
    "bounding_box_color_b": 0,
    "rotate": false,
    "volume": null,
    "RID": "1-43KT",
    "unit_conversion": null
  }
]
```

### Mesh URL Specification

Valid Options for `mesh_url`:

* RID - (string) The ID of the Mesh.
* url - (string) The location where the object data resides for this mesh
* link - (object) An object containing a URL and label description of the mesh
    * Example ```{"url": "http://example.com", "label": "Mesh URL"}
* anatomy - (string) The label for the anatomy this mesh describes
* description - (string) A description of the Mesh
* opacity - (float [0-1])Opacity for this mesh
* color_r, color_g, color_b - (int [0-255]) RGB color values for the mesh color

Example:
```
[
  {
    "RID": "1-444E",
    "url": "http://mysite.org/my_meshes.obj.gz",
    "label": null,
    "description": null,
    "color_r": 66,
    "color_g": 137,
    "color_b": 244,
    "opacity": 1,
    "anatomy": "occipital bone",
  }
]
```

### Landmark URL Specification


Valid Options for `landmark_url`:

* RID - (string) The ID of the Landmark.
* mesh - (string) The ID of the Mesh this landmark points
* point_x, point_y, point_z - (float [-inf,inf]) The location of the landmark
* url - (string) The location where the object data resides for this mesh
* link - (object) An object containing a URL and label description of the mesh
    * Example ```{"url": "http://example.com", "label": "Mesh URL"}
* anatomy - (string) The label for the anatomy this mesh describes
* description - (string) A description of the Mesh
* opacity - (float [0-1])Opacity for this mesh
* color_r, color_g, color_b - (int [0-255]) RGB color values for the mesh color
* radius - (float [typically 0.1]) The radius of the spherical marker denoting the landmark.

```
[
  {
    "RID": "1-4452",
    "mesh": "1-43E0",
    "label": "Inferior point of mandibular body",
    "description": null,
    "point_x": 7.8618,
    "point_y": 2.5692,
    "point_z": 1.8701,
    "radius": 0.1,
    "color_r": 0,
    "color_g": 0,
    "color_b": 255,
    "anatomy": "mandible",
    "anatomy_id": "1-4646"
  }
]
```

### Examples
An Example with view 

```
view.html#model_url=http://localhost/mymodelsettings.json&mesh_url=http://localhost/mymeshes.json
```


Sample plots are sample1.png, sample2.png
