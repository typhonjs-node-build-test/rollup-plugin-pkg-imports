![@typhonjs-build-test/rollup-plugin-pkg-imports](https://i.imgur.com/b4q7JaV.jpg)

[![NPM](https://img.shields.io/npm/v/@typhonjs-build-test/rollup-plugin-pkg-imports.svg?label=npm)](https://www.npmjs.com/package/@typhonjs-build-test/rollup-plugin-pkg-imports)
[![Code Style](https://img.shields.io/badge/code%20style-allman-yellowgreen.svg?style=flat)](https://en.wikipedia.org/wiki/Indent_style#Allman_style)
[![License](https://img.shields.io/badge/license-MPLv2-yellowgreen.svg?style=flat)](https://github.com/typhonjs-node-build-test/rollup-plugin-pkg-imports/blob/main/LICENSE)
[![API Docs](https://img.shields.io/badge/API%20Documentation-476ff0)](https://typhonjs-node-build-test.github.io/rollup-plugin-pkg-imports/)
[![Discord](https://img.shields.io/discord/737953117999726592?label=TyphonJS%20Discord)](https://typhonjs.io/discord/)
[![Twitch](https://img.shields.io/twitch/status/typhonrt?style=social)](https://www.twitch.tv/typhonrt)

Provides three Rollup plugins that resolve import specifiers defined in `package.json` 
[imports](https://nodejs.org/api/packages.html#imports) that link other NPM packages.

- `importsLocal` - Resolves import specifiers as local packages w/ fully qualified sub-path exports via a special 
`replace` condition allowing referencing local source during development with fully qualified sub-path exports 
substituted in the bundled build. 


- `importsExternal` - Resolves NPM packages from import specifiers substituting the fully qualified name in addition to
adding a regular expression to the Rollup [external](https://rollupjs.org/configuration-options/#external) configuration.


- `importsResolve` - Resolves NPM package paths to the associated import specifier.

[API documentation](https://typhonjs-node-build-test.github.io/rollup-plugin-pkg-imports/)

## Overview
These plugins are useful for library authors and general developers for a variety of use cases. `importsExternal` in particular is helpful 
when developing packages that have peer dependencies that are not directly bundled into the library package or 
dependencies between sub-path exports. The plugins are similar to `@rollup/plugin-node-resolve` and function as a 
resolution source to resolve internal [imports](https://nodejs.org/api/packages.html#imports) from `package.json`. 

`importsExternal` automatically constructs regular expressions added to the Rollup [external](https://rollupjs.org/configuration-options/#external) 
configuration array in addition to resolving against the value provided for each activated `imports` entry. You may use 
globs in defining the `imports` entries allowing targeting of external peer dependency packages that have sub-path 
exports.

`importsLocal` automatically constructs regular expressions added to the Rollup [external](https://rollupjs.org/configuration-options/#external)
configuration array for all values that have a unique `replace` condition defined. The value of `replace` is the final
resolved package / sub-path export. `importsLocal` works best for Typescript oriented packages in terms of generating 
types and being able to reference the source of different sub-path exports during development, but the final bundled 
build has the substituted local sub-path exports.  

By default, for `importsExternal` and `importsResolve` all `imports` entries that refer to a local path starting 
with `./` are ignored. `importsLocal` will register keys that have values that start with `./` signifying a local
path. 

You may use `importsExternal` and `importsResolve` together, but usage of `importsLocal` should be exclusive and 
not paired with the former plugins without careful consideration as they serve different purposes. 

----
## Examples `importsLocal`:

### Example #1 `package.json` `imports` entry:

```json
{
  "name": "@some-really-long-org-name/my-package",
  "imports": {
    "#my-package": {
      "types": "./src/index.ts",
      "import": "./src/index.ts",
      "replace": "@some-really-long-org-name/my-package"
    },
    "#my-package/*": {
      "types": "./src/*/index.ts",
      "import": "./src/*/index.ts",
      "replace": "@some-really-long-org-name/my-package/*"
    }
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./sub": {
      "types": "/dist/sub/index.d.ts",
      "import": "/dist/sub/index.js"
    },
    "./sub/depth": {
      "types": "/dist/sub/depth/index.d.ts",
      "import": "/dist/sub/depth/index.js"
    }
  }
}
```

Above the main package `#my-package` refers to the source code of the main export and `#my-package/*` refers to the
source code of any wild card sub-path export. When developing a local package split across independent sub-path
exports you are able to reference the local packages with the import specifier and `importsLocal` will replace it
with the value of the `replace` condition. When bundling each import specifier will be marked as external and not 
included in the respective bundles of the main or sub-path exports.

## Examples `importsExternal`:

### Example #1 `package.json` `imports` entry:
```json
{
  "imports": {
    "#shortname/*": "@my-org-name/a-long-package-name/*"
  },
  "peerDependencies": {
    "@my-org-name/a-long-package-name": ">=1.0.0"
  }
}
```

Above the `#shortname/*` is a shortened import key for `@my-org-name/a-long-package-name`. You can abbreviate the keys 
however you like. This allows the use of `import { thing } from '#shortname/thing';` rather than the fully qualified 
name: `import { thing } from '@my-org-name/a-long-package-name/thing';`.

### Variation on Example #1:

When developing a package with sub-path exports where there are cross-linked dependencies between various sub-path 
exports you can map an import specifier to the local package. When independently bundling each sub-path export 
`importsExternal` will automatically handle creating the appropriate Rollup 
[external](https://rollupjs.org/configuration-options/#external) configuration to exclude bundling cross-linked sub-path 
exports together.    

-------------------

Example Rollup configuration object
```js
// Both of the following packages are optional.
import resolve             from '@rollup/plugin-node-resolve';
import { generateDTS }     from '@typhonjs-build-test/esm-d-ts';

import { importsExternal } from '@typhonjs-build-test/rollup-plugin-pkg-imports';

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
import { something } from '#shortname/sub-path';
```

`#shortname/sub-path` is connected to `@my-external-package/a-long-package-name/sub-path` and is not included in the 
bundled output. 

---

## Example `importsResolve`:

### Example #2 `package.json` `imports` entry:
```json
{
  "imports": {
    "#shortname/*": "@my-org-name/a-long-package-name/*"
  }
}
```

Above the `#shortname/*` is a shortened import key for `@my-org-name/a-long-package-name`. You can abbreviate the keys
however you like. This allows the use of `import { thing } from '#shortname/thing';` rather than the fully qualified
name: `import { thing } from '@my-org-name/a-long-package-name/thing';`.

Essentially, `importsResolve` is a convenience mechanism when using Rollup to automatically resolve import specifiers. 
The referenced packages are included in the bundle generated without having to manually configure 
`@rollup/plugin-replace` or `@rollup/plugin-alias`.

Additionally, you may provide a string array `exportConditions` in the plugin options to resolve specific export 
conditions. The default is `['node', 'import', 'default']`.  

For instance if you are using `Vite 4.2+` import specifiers are automatically resolved in production / Rollup builds. 
This plugin functions in a similar manner, but handy for direct Rollup builds.   

---

## Synergies
If you are working on ES Modules / modern Javascript and document your code with JSDoc a great optional Rollup plugin 
and tool to use is [@typhonjs-build-test/esm-d-ts](https://www.npmjs.com/package/@typhonjs-build-test/esm-d-ts). 
The Rollup plugin for `esm-d-ts` automatically creates bundled TS declarations from ESM source and is aware of 
`rollup-plugin-pkg-imports` allowing the generated TS declarations to include the correct mapped packages.  

## Roadmap / TODO
- Evaluate any concerns for mono-repo use cases.
- Create a comprehensive testsuite; rest assured though as these plugins are used in production environments. 
