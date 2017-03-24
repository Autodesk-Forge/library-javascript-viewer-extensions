# library-javascript-viewer-extensions

##Description

A collection of various JavaScript extensions for the viewer, showing what is doable with the client-side JavaScript API.

##Dependencies

Some extensions are dependent on specific files which are placed in the same directory. Dependencies need to be loaded before loading the
extension, using a simple script tag in your html or dynamically using require or equivalent.
The path of dependencies needs to be modified accordingly to your setup.

##Setup/Usage Instructions

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

Please refer to [this sample](https://github.com/Developer-Autodesk/tutorial-aspnet-view.and.data.api/blob/master/FirstViewerWebApp/FirstViewerWebApp/Scripts/Viewer.js) for detail.

* Load extensions dynamically on demand:

		//load extension for SEO
		viewer.loadExtension('Autodesk.ADN.Viewing.Extension.SEO');

Please refer to [this blog post](http://adndevblog.typepad.com/cloud_and_mobile/2014/10/how-to-write-custom-extensions-for-the-large-model-viewer.html) for detail.

##Description

Here is a quick description of what each extension is doing. Click on each extension name to test them directly on the [gallery](http://viewer.autodesk.io/node/gallery/#/home)

* **[Autodesk.ADN.Viewing.Extension.Annotation](http://viewer.autodesk.io/node/gallery/embed?id=546bf4493a5629a0158bc3a4&extIds=Autodesk.ADN.Viewing.Extension.Annotation)**

Creates 2D annotations for selected component using its label. Uses CAMERA_CHANGED_EVENT to update position of the 2D marker when view is updated.

* **[Autodesk.ADN.Viewing.Extension.Basic](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.Basic)**

A basic Hello World extension that displays an alert dialog upon loading and unloading.

* **[Autodesk.ADN.Viewing.Extension.BasicES2015](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.BasicES2015)**

A Hello World extension but written using ES6/ES2015 syntax. Needs transpiling with a tool like Babel or Traceur before being used with the viewer.

* **[Autodesk.ADN.Viewing.Extension.BoundingBox](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.BoundingBox)**

Displays a bounding box around the selected component.

* **[Autodesk.ADN.Viewing.Extension.Chart](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.Chart)**

Displays a PieChart and a dropdown menu listing all available model properties. When a pie is selected in the chart, isolates the specific components.

* **[Autodesk.ADN.Viewing.Extension.ContextMenu](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.ContextMenu)**

Illustrates how to customize the viewer context menu for zero-selection menu or item specific menu.

* **[Autodesk.ADN.Viewing.Extension.CustomTool](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.CustomTool)**

A basic viewer tool that just dumps events in the console, useful for testing and debugging or using as a tool boilerplate.

* **[Autodesk.ADN.Viewing.Extension.DockingPanel](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.DockingPanel)**

A basic docking panel demo.

* **[Autodesk.ADN.Viewing.Extension.EventWatcher](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.EventWatcher)**

Creates a panel which lets user activates any event available in the API. Output event arguments to a section.

* **[Autodesk.ADN.Viewing.Extension.Explorer](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.Explorer)**

Creates a camera animation using a custom tool, rotating eye position around the model.

* **[Autodesk.ADN.Viewing.Extension.GeometrySelector](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.GeometrySelector)**

Illustrates how to snap geometry: vertices, edges, faces and how to create selection commands to let user pick geometry on the model.

* **[Autodesk.ADN.Viewing.Extension.Hotkeys](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.Hotkeys)**

Creates hotkeys to switch viewer to fullscreen.

* **[Autodesk.ADN.Viewing.Extension.IFramePanel](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.IFramePanel)**

Creates a simple docking panel containing an iframe.

* **[Autodesk.ADN.Viewing.Extension.Layers](http://viewer.autodesk.io/node/gallery/embed?id=54464d43af600b5c0a872551&extIds=Autodesk.ADN.Viewing.Extension.Layers)**

Iterates through layers. Valid only for 2D drawings.

* **[Autodesk.ADN.Viewing.Extension.Material](http://viewer.autodesk.io/node/gallery/embed?id=546bf4493a5629a0158bc3a4&extIds=Autodesk.ADN.Viewing.Extension.Material)**

Changes material of selected component. Supports color and textures.

* **[Autodesk.ADN.Viewing.Extension.Measure](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.Measure)**

A wrapper around the Autodesk.Measure extension to enable/disable it from the gallery.

* **[Autodesk.ADN.Viewing.Extension.MeshData](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.MeshData)**

Access mesh data of selected component, vertices and edges to represent them graphically.

* **[Autodesk.ADN.Viewing.Extension.MeshImporter](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.MeshImporter)**

Imports custom json into the viewer and creates three.js meshes from it.

* **[Autodesk.ADN.Viewing.Extension.MetaProperties](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.MetaProperties)**

Adds some extra hardcoded properties to viewer property panel.

* **[Autodesk.ADN.Viewing.Extension.ModelLoader](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.ModelLoader)**

Loads extra models inside current one. Designed to work on the gallery.

* **[Autodesk.ADN.Viewing.Extension.ModelStructure](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.ModelStructure)**

Dumps model structure to browser console.

* **[Autodesk.ADN.Viewing.Extension.ModelStructurePanel](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.ModelStructurePanel)**

Custom model structure panel behavior.

* **[Autodesk.ADN.Viewing.Extension.Move](http://viewer.autodesk.io/node/gallery/embed?id=546bf4493a5629a0158bc3a4&extIds=Autodesk.ADN.Viewing.Extension.Move)**

Transforms selected component based on mouse position.

* **[Autodesk.ADN.Viewing.Extension.Physics](http://physics.autodesk.io)**

Realtime physics with ammo.js

* **[Autodesk.ADN.Viewing.Extension.PropertyDump](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.PropertyDump)**

Dumps properties for selected component in browser console.

* **[Autodesk.ADN.Viewing.Extension.PropertyListPanel](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.PropertyListPanel)**

Custom panel derived from property list panel

* **[Autodesk.ADN.Viewing.Extension.PropertyPanel](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.PropertyPanel)**

Inserts custom data into viewer property panel.

* **[Autodesk.ADN.Viewing.Extension.PropertyTranslator](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.PropertyTranslator)**

Uses microsoft translation API to translate property panel values on the fly.

* **Autodesk.ADN.Viewing.Extension.SEO**

Ouputs the properties values into a hidden div tag so that the properties can be indexed by search engine

* **[Autodesk.ADN.Viewing.Extension.ScreenShotManager](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.ScreenShotManager)**

Creates a panel that lets you manage screenshots taken with the API.

* **[Autodesk.ADN.Viewing.Extension.Section](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.Section)**

A wrapper around the Autodesk.Section extension to enable/disable it from the gallery.

* **[Autodesk.ADN.Viewing.Extension.Toolbar](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.Toolbar)**

Various toolbar controls customization example.

* **[Autodesk.ADN.Viewing.Extension.TransformTool](http://viewer.autodesk.io/node/gallery/embed?id=546bf4493a5629a0158bc3a4&extIds=Autodesk.ADN.Viewing.Extension.TransformTool)**

A 3d controls that lets user precisely move components around along specific plane or axis.

* **[Autodesk.ADN.Viewing.Extension.UIComponent](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.UIComponent)**

Illustrates on to create a docking panel more advanced than the basic docking panel extension.

* **[Autodesk.ADN.Viewing.Extension.Workshop](http://viewer.autodesk.io/node/gallery/embed?id=560c6c57611ca14810e1b2bf&extIds=Autodesk.ADN.Viewing.Extension.Workshop)**

A demo extension which illustrates several concepts of the API. See the complete [tutorial](https://github.com/Developer-Autodesk/tutorial-getting.started-view.and.data) for more details.

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for full details.

##Written by 

Written by [Philippe Leefsma](http://adndevblog.typepad.com/cloud_and_mobile/philippe-leefsma) 



