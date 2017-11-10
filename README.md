# library-javascript-viewer-extensions

## Deprecation Warning

This repo is no longer maintained, most of the extensions are still valid however use them at your own risk.

For a more up-to-date set of Forge Viewer extensions take a look there:

[Viewer.Extensions.Dynamic](https://github.com/Autodesk-Forge/forge-rcdb.nodejs/tree/master/src/client/viewer.components/Viewer.Extensions.Dynamic) from the [Forge RCDB](https://forge-rcdb.autodesk.io/configurator) project.


## Description

A collection of various JavaScript extensions for the viewer, showing what is doable with the client-side JavaScript API.

## Dependencies

Some extensions are dependent on specific files which are placed in the same directory. Dependencies need to be loaded before loading the
extension, using a simple script tag in your html or dynamically using require or equivalent.
The path of dependencies needs to be modified accordingly to your setup.

## Setup

The extensions on this sample were written with ES6 sytanx, so it needs transpiling before it can be used.

Install [NodeJS](https://nodejs.org). 

Clone this project or download it. It's recommended to install [GitHub desktop](https://desktop.github.com/). To clone it via command line, use the following (**Terminal** on MacOSX/Linux, **Git Shell** on Windows):

    git clone https://github.com/Autodesk-Forge/library-javascript-viewer-extensions
    
Navigate to the folder and run **install** to download all the required dependencies:

    npm install

By default, right after **install**, the build script should will run automatically, which will build the minified JavaScript files. If not (or to run in manually later), use the following:

    npm run build-prod

This will create a folder */App/dynamic/extensions/* with one folder for each extension, inside will be a minified version, for instance **Viewing.Extension.Markup3D.min.js** (note the suffix .min.js).

Once build, the extension file can be copied to your project, regardless the backend programming language used. NodeJS is not required to run them. For instance, it's safe to copy to a ASP.NET project and use the **.min.js** extension file. Some extensions may require a backend implementation, see comments for each extension.

## Usage Instructions

There are two ways to load an extension with viewer API:

* Load extensions when viewer is initialized:

		var viewerElement = document.getElementById('viewer');

        viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerElement, {
            extensions: ['BasicExtension']
        });
        

        Autodesk.Viewing.Initializer(options, function () {
            viewer.start();
            loadDocument(viewer, options.document);
        });

* Load extensions dynamically on demand:

		//load extension for SEO
		viewer.loadExtension('Autodesk.ADN.Viewing.Extension.SEO');

Please refer to [this blog post](http://adndevblog.typepad.com/cloud_and_mobile/2014/10/how-to-write-custom-extensions-for-the-large-model-viewer.html) for detail.

Depending on the extension, some additional parameters may be required to properly load it. In these cases, the **loadExtension** method is prefered. See comments below for each extension.

## Description

Here is a quick description of what each extension is doing:


* **Autodesk.ADN.Viewing.Extension.Basic

A basic Hello World extension that displays an alert dialog upon loading and unloading.

* **Autodesk.ADN.Viewing.Extension.BasicES2015

A Hello World extension but written using ES6/ES2015 syntax. Needs transpiling with a tool like Babel or Traceur before being used with the viewer.

* **Autodesk.ADN.Viewing.Extension.BoundingBox

Displays a bounding box around the selected component.

* **Autodesk.ADN.Viewing.Extension.Chart

Displays a PieChart and a dropdown menu listing all available model properties. When a pie is selected in the chart, isolates the specific components.

* **Autodesk.ADN.Viewing.Extension.ContextMenu

Illustrates how to customize the viewer context menu for zero-selection menu or item specific menu.

* **Autodesk.ADN.Viewing.Extension.CustomTool

A basic viewer tool that just dumps events in the console, useful for testing and debugging or using as a tool boilerplate.

* **Autodesk.ADN.Viewing.Extension.DockingPanel

A basic docking panel demo.

* **Autodesk.ADN.Viewing.Extension.EventWatcher

Creates a panel which lets user activates any event available in the API. Output event arguments to a section.

* **Autodesk.ADN.Viewing.Extension.Explorer

Creates a camera animation using a custom tool, rotating eye position around the model.

* **Autodesk.ADN.Viewing.Extension.GeometrySelector

Illustrates how to snap geometry: vertices, edges, faces and how to create selection commands to let user pick geometry on the model.

* **Autodesk.ADN.Viewing.Extension.Hotkeys

Creates hotkeys to switch viewer to fullscreen.

* **Autodesk.ADN.Viewing.Extension.IFramePanel

Creates a simple docking panel containing an iframe.

* **Autodesk.ADN.Viewing.Extension.Layers

Iterates through layers. Valid only for 2D drawings.

* **Autodesk.ADN.Viewing.Extension.Markup3D**

Add 3D markups on a 3D model. Uses StateManager extension to save & restore markups.

* **Autodesk.ADN.Viewing.Extension.Material

Changes material of selected component. Supports color and textures.

* **Autodesk.ADN.Viewing.Extension.MeshData

Access mesh data of selected component, vertices and edges to represent them graphically.

* **Autodesk.ADN.Viewing.Extension.MeshImporter

Imports custom json into the viewer and creates three.js meshes from it.

* **Autodesk.ADN.Viewing.Extension.MetaProperties

Adds some extra hardcoded properties to viewer property panel.

* **Autodesk.ADN.Viewing.Extension.ModelStructure

Dumps model structure to browser console.

* **Autodesk.ADN.Viewing.Extension.ModelStructurePanel

Custom model structure panel behavior.

* **Autodesk.ADN.Viewing.Extension.PropertyDump

Dumps properties for selected component in browser console.

* **Autodesk.ADN.Viewing.Extension.PropertyListPanel

Custom panel derived from property list panel

* **Autodesk.ADN.Viewing.Extension.PropertyPanel

Inserts custom data into viewer property panel.

* **Autodesk.ADN.Viewing.Extension.PropertyTranslator

Uses microsoft translation API to translate property panel values on the fly.

* **Autodesk.ADN.Viewing.Extension.StateManager**

Save and restore states of the viewer (position, markups, rotation, zoom, etc). This extension requires a backend implementation to store the states. To load it on viewer, use the **loadExtension** method with the following parameters: **apiUrl** that specifies the endpoints to call to save & restore states; and model._id that is passed to identify the model.

    viewer.loadExtension('Viewing.Extension.StateManager', 
      {
        apiUrl: 'http://localhost:3000/api/',
        model: {_id: 'YourModelUrn'}
      }
    );

* **Autodesk.ADN.Viewing.Extension.ScreenShotManager

Creates a panel that lets you manage screenshots taken with the API.

* **Autodesk.ADN.Viewing.Extension.Toolbar

Various toolbar controls customization example.

* **Autodesk.ADN.Viewing.Extension.UIComponent

Illustrates on to create a docking panel more advanced than the basic docking panel extension.

* **Autodesk.ADN.Viewing.Extension.Workshop

A demo extension which illustrates several concepts of the API. See the complete [tutorial](https://github.com/Developer-Autodesk/tutorial-getting.started-view.and.data) for more details.

![thumbnail](/default.png)

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for full details.

## Written by 

Written by [Philippe Leefsma](https://forge.autodesk.com/author/philippe-leefsma) 



