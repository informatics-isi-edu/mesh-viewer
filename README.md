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

The model specification is a JSON formatted document describing the model
properties, volumes, meshes, and landmarks associated with the model.

The JSON payload must be a serialized object that describes the model:
- `id`: the identifier of the model
- `label`: a short text field for the name or title of the model
- `boundingBox`: the default state of the bounding box feature. Set to `True` or `False` to show or hide the bounding box on load. Default: `False`.
- `rotate`: the default state of the rotating animation of the model. Set to `True` or `False` to enable or disable animation on load. Default: `False`.
- `measurement`: the units of distance measurement. Set to a string "cm", "inches", "kilometers"
- `unitconversion`: the conversion of mesh-viewer units to real world measurement for distance. Computed as unitconversion * Unit distance between points.
- `bgcolor`: an array of float values indicating RGB for background color
- `mesh`: an array of `mesh` objects described next
- `volume`: a `volume` object described below
- `landmark`: an array of `landmark` objects described below

The `mesh` objects include the following fields:
- `id`: the identifier of the mesh
- `url`: the web resource location of the mesh file in `.obj` format
- `label`: a short text field for the name or title of the mesh
- `link`: a web resource that this object may reference
  - `label`: the display label for the link
  - `url`: the URL for the link
- `color`: an array of float values indicating RGB color

The `volume` object includes the following fields:
- `id`: the identifier of the volume
- `url`: the web resource location of the volume file
- `label`: a short text field for the name or title of the volume
- `link`: a web resource that this object may reference
  - `label`: the display label for the link
  - `url`: the URL for the link

The `landmark` objects include the following fields:
- `id`: the identifier of the landmark
- `group`: the group identifier of the landmark which must indicate the object,
  mesh, to which it belongs
- `label`: a short text field for the name or title of the landmark
- `link`: a web resource that this object may reference
  - `label`: the display label for the link
  - `url`: the URL for the link
- `radius`: a float value indicating the radius of the landmark
- `point`: an array of float values indicating the XYZ coordinates of the
  landmark
- `color`: an array of float values indicating RGB color

## Example

An example model specification for a model with one mesh and one landmark.

```
{
    "id": "MOD1234",
    "label": "My Model",
    "bgcolor": [0.00, 0.00, 0.00]
    "mesh" : [ {
        "id": "MESH7890",
        "url": "https://www.example.org/path/to/MOD1234.obj",
        "label": "My Mesh",
        "link": {
            "label": "ANATOMICAL STRUCTURE",
            "url": "https://www.example.org/path/to/info/about/ANATOMICALSTRUCTURE"
        },
        "caption": "This is a mesh object in a model.",
        "color": [1.00, 0.80, 0.40]
    } ],
    "landmark" : [ {
        "id": "LND5678"
        "group": "MESH7890",
        "label": "A point of interest",
        "link": {
            "label": "ANATOMICAL SITE",
            "url": "https://www.example.org/path/to/info/about/ANATOMICALSITE"
        },
        "radius": 0.1,
        "point": [8.502269744873047, 6.578330039978027, 69.94249725341797],
        "color": [1.00, 0.00, 0.00]
    } ]
}
```

An Example with view 

```
view.html?model=http://localhost/data/3mesh/3model.json&view=http://localhost/data/3mesh/3view.json
```

the 3view.json

```
{
  "view" : [ {
      "matrix": [ -0.39207977056503296, -0.29684534668922424, 0.8707215785980225, 0, 0.6848435401916504, -0.7261472940444946, 0.06082262843847275, 0, 0.6142174601554871, 0.620155394077301, 0.48800042271614075, 0, 0, 0, -10.206781387329102, 1 ]
}]
}

```

Sample plots are sample1.png, sample2.png
