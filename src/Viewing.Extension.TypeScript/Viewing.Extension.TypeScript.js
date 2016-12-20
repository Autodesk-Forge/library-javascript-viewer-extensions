
import TypeScriptExtension from './Viewing.Extension.TypeScriptExtension.ts'

Autodesk.Viewing.theExtensionManager.registerExtension(
  'Viewing.Extension.TypeScript',
  TypeScriptExtension);