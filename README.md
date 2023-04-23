# @typhonjs-build-test/rollup-external-imports
[![NPM](https://img.shields.io/npm/v/@typhonjs-build-test/rollup-external-imports.svg?label=npm)](https://www.npmjs.com/package/@typhonjs-build-test/rollup-external-imports)
[![Code Style](https://img.shields.io/badge/code%20style-allman-yellowgreen.svg?style=flat)](https://en.wikipedia.org/wiki/Indent_style#Allman_style)
[![License](https://img.shields.io/badge/license-MPLv2-yellowgreen.svg?style=flat)](https://github.com/typhonjs-node-build-test/rollup-external-imports/blob/main/LICENSE)
[![Discord](https://img.shields.io/discord/737953117999726592?label=Discord%20-%20TyphonJS&style=plastic)](https://discord.gg/mnbgN8f)

Provides a Rollup plugin that maps `imports` defined in `package.json` as external packages.

## Overview
This plugin is useful for library authors that develop packages that have peer dependencies that are not directly 
bundled into the library package.

Similar to `@rollup/plugin-node-resolve` this plugin functions as a resolution source
to resolve internal [imports](https://nodejs.org/api/packages.html#imports) from `package.json` automatically 
constructing regular expressions added to the Rollup [external](https://rollupjs.org/configuration-options/#external) 
configuration array in addition to resolving against the value provided for each activated `imports` entry. You may use 
globs in defining the `imports` entries allowing targeting of external peer dependency packages that have sub-path 
exports.

## Examples

Example `package.json` `imports` entry:
```json
{
  "imports": {
    "#external/*": "@my-external-package/*"
  },
  "peerDependencies": {
    "@my-external-package": ">=1.0.0"
  }
}
```

Above the `#external/*` is a shortened key for `@my-external-package`. You can abbreviate the keys however you like. 

-------------------

Example Rollup configuration object
```js
// Both of the following packages are optional.
import resolve             from '@rollup/plugin-node-resolve';
import { generateDTS }     from '@typhonjs-build-test/esm-d-ts';

import { importsExternal } from '@typhonjs-build-test/rollup-external-imports';

const rollupConfig = {
   input: 'src/index.js',
   output: {
      file: 'dist/index.js',
      format: 'esm'
   },
   plugins: [
      importsExternal(),
      resolve(),  // Use `importsExternal` before `@rollup/plugin-node-resolve`.
      generateDTS.plugin() // Optional use of `@typhonjs-build-test/esm-d-ts`.
   ]
}
```

By default the closest `package.json` from the Rollup configuration input source is automatically loaded and all 
`imports` are processed as external. 

You may provide a configuration object to `importsExternal` with the following entries:

| Attribute | Type | Description                              |
|-----------|------|------------------------------------------|
|`importsKeys`| string[] | Only target the provided `imports` keys. |
| `packageObj`| object | A specific `package.json` object to use. | 

-------------------

Usage inside a ESM JS source file (`./src/index.js`):
```js
import { something } from '#external/sub-path';

something('!!!');
```

`#external/sub-path` is connected to `@my-external-package/sub-path` and not included in the bundled output. 

## Synergies
If you are working on ES Modules / modern Javascript and document your code with JSDoc a great optional Rollup plugin 
and tool to use is [@typhonjs-build-test/esm-d-ts](https://www.npmjs.com/package/@typhonjs-build-test/esm-d-ts). 
The Rollup plugin for `esm-d-ts` automatically creates bundled TS declarations from ESM source and is aware of 
`rollup-external-imports` allowing the generated TS declarations to include the correct mapped packages.  

## Roadmap / TODO
- Evaluate any concerns for mono-repo use cases.
- Create a comprehensive testsuite; rest assured though as this plugin is used in production environments. 
