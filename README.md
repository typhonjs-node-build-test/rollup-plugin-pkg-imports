# @typhonjs-build-test/rollup-plugin-pkg-imports
[![NPM](https://img.shields.io/npm/v/@typhonjs-build-test/rollup-plugin-pkg-imports.svg?label=npm)](https://www.npmjs.com/package/@typhonjs-build-test/rollup-plugin-pkg-imports)
[![Code Style](https://img.shields.io/badge/code%20style-allman-yellowgreen.svg?style=flat)](https://en.wikipedia.org/wiki/Indent_style#Allman_style)
[![License](https://img.shields.io/badge/license-MPLv2-yellowgreen.svg?style=flat)](https://github.com/typhonjs-node-build-test/rollup-plugin-pkg-imports/blob/main/LICENSE)
[![Discord](https://img.shields.io/discord/737953117999726592?label=Discord%20-%20TyphonJS&style=plastic)](https://discord.gg/mnbgN8f)

Provides two Rollup plugins that resolve import specifiers defined in `package.json` 
[imports](https://nodejs.org/api/packages.html#imports).

- `importsResolve` - Resolves NPM package paths to the associated import specifier.


- `importsExternal` - Resolves NPM packages from import specifiers substituting the fully qualified name in addition to 
adding a regular expression to the Rollup [external](https://rollupjs.org/configuration-options/#external) 
configuration.

## Overview
These plugins are useful for library authors for a variety of use cases. `importsExternal` in particular is helpful 
when developing packages that have peer dependencies that are not directly bundled into the library package or 
dependencies between sub-path exports. Both plugins are similar to `@rollup/plugin-node-resolve` and function as a 
resolution source to resolve internal [imports](https://nodejs.org/api/packages.html#imports) from `package.json`. 

`importsExternal` in particular automatically constructs regular expressions added to the Rollup [external](https://rollupjs.org/configuration-options/#external) 
configuration array in addition to resolving against the value provided for each activated `imports` entry. You may use 
globs in defining the `imports` entries allowing targeting of external peer dependency packages that have sub-path 
exports.

By default, all `imports` entries that refer to a local path starting with `.` are ignored.

----
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
