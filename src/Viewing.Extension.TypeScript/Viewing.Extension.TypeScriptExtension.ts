

export = class TypeScriptExtension {

    constructor(viewer, options) {

    }

    load(): boolean {

        console.log('Viewing.Extension.TypeScript loaded');

        return true;
    }

    unload(): boolean {

        console.log('Viewing.Extension.TypeScript unloaded');

        return true;
    }
}