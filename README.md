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

## Model specification

The model specification is a JSON formatted document describing the model
properties, volumes, meshes, and landmarks associated with the model.

The JSON payload must be a serialized object that describes the model:
- `id`: the identifier of the model
- `label`: a short text field for the name or title of the model
- `caption`: a caption for the entire model, which may be longer text content
- `boundingBox`: the default state of the bounding box feature. Set to `True` or `False` to show or hide the bounding box on load. Default: `False`.
- `rotate`: the default state of the rotating animation of the model. Set to `True` or `False` to enable or disable animation on load. Default: `False`.
- `bgcolor`: an array of float values indicating RGB for background color
- `mesh`: an array of `mesh` objects described next
- `volume`: a `volume` object described below
- `landmark`: an array of `landmark` objects described below

The `mesh` objects include the following fields:
- `id`: the identifier of the mesh
- `url`: the web resource location of the mesh file in `.obj` format
- `label`: a short text field for the name or title of the mesh
- `link`: a web resource that the object or label may reference
- `caption`: a (potentially) longer text caption specific to the mesh
- `color`: an array of float values indicating RGB color

The `volume` object includes the following fields:
- `id`: the identifier of the volume
- `url`: the web resource location of the volume file
- `label`: a short text field for the name or title of the volume
- `link`: a web resource that the object or label may reference
- `caption`: a (potentially) longer text caption specific to the volume

The `landmark` objects include the following fields:
- `id`: the identifier of the landmark
- `group`: the group identifier of the landmark which must indicate the object,
  mesh, to which it belongs
- `label`: a short text field for the name or title of the landmark
- `link`: a web resource that the object or label may reference
- `caption`: a (potentially) longer text caption specific to the landmark
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
    "caption": "This is my model. It is very nice. I hope you like it.",
    "bgcolor": [0.00, 0.00, 0.00]
    "mesh" : [ {
        "id": "MESH7890",
        "url": "https://www.example.org/path/to/MOD1234.obj",
        "label": "My Mesh",
        "link": "https://www.example.org/path/to/info/about/MOD1234",
        "caption": "This is a mesh object in a model.",
        "color": [1.00, 0.80, 0.40]
    } ],
    "landmark" : [ {
        "id": "LND5678"
        "group": "MESH7890",
        "label": "A point of something",
        "link": "https://www.example.com/path/to/info/about/LND5678",
        "caption": "This is a point of interest. Please notice it."
        "radius": 0.1,
        "point": [8.502269744873047, 6.578330039978027, 69.94249725341797],
        "color": [1.00, 0.00, 0.00]
    } ]
}
```


