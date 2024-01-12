import path                   from 'node:path';
import { fileURLToPath }      from 'node:url';

import { getPackageWithPath } from '@typhonjs-utils/package-json';
import globToRegExp           from 'glob-to-regexp';
import { moduleResolve }      from 'import-meta-resolve';
import * as r                 from 'resolve.exports';

/**
 * Provides a Rollup plugin that automatically resolves `package.json` import specifiers to NPM packages as external.
 *
 * @param {import('./types').ImportsPluginOptions}   [options] - Options.
 *
 * @returns {import('rollup').Plugin} Rollup plugin.
 */
export function importsExternal(options)
{
   validateOptions(options, 'importsExternal');

   let packageObj;
   let regexImportKeys;
   let regexImportValues;

   return {
      name: '@typhonjs-build-test/rollup-plugin-pkg-imports/importsExternal',

      // Store the options so that `@typhonjs-build-test/esm-d-ts can also automatically configure `importsExternal`.
      importsPluginOptions: options,

      /**
       * Create or add to the Rollup `external` option.
       *
       * @this {import('rollup').PluginContext}
       *
       * @param {import('rollup').InputOptions} rollupOptions - Rollup input options.
       *
       * @returns {import('rollup').InputOptions | import('rollup').NullValue} Rollup options.
       *
       * @see https://rollupjs.org/configuration-options/#external
       */
      options(rollupOptions)
      {
         ({ packageObj, regexImportKeys, regexImportValues } = processOptions(options, rollupOptions,
          'importsExternal'));

         // Process `external` ---------------------------------------------------------------------------------------

         const newExternal = [];

         for (const regex of regexImportValues) { newExternal.push(regex); }

         if (Array.isArray(rollupOptions.external))   // Push all existing values to new externals.
         {
            newExternal.push(...rollupOptions.external);
         }
         else if (rollupOptions.external !== void 0)  // Handle the case for a single existing string or RegExp.
         {
            newExternal.push(rollupOptions.external);
         }

         rollupOptions.external = newExternal;

         return rollupOptions;
      },

      /**
       * Based on the configured `imports` from the target `package.json` substitute any imported identifiers with a
       * lookup against the glob defined in the `imports` object.
       *
       * @param {string} source - The import source to resolve.
       *
       * @returns {string} Resolved import source.
       * @see https://rollupjs.org/plugin-development/#resolveid
       */
      async resolveId(source)
      {
         let foundMatch = false;
         for (const regex of regexImportKeys)
         {
            if (regex.test(source))
            {
               foundMatch = true;
               break;
            }
         }

         return foundMatch ? resolveImportId(source, packageObj) : null;
      }
   };
}

/**
 * Provides a Rollup plugin that automatically resolves `package.json` import specifiers to NPM packages.
 *
 * @param {import('./types').ImportsResolvePluginOptions}   [options] - Options.
 *
 * @returns {import('rollup').Plugin} Rollup plugin.
 */
export function importsResolve(options)
{
   validateOptions(options, 'importsResolve');

   let packageObj;
   let regexImportKeys;

   return {
      name: '@typhonjs-build-test/rollup-plugin-pkg-imports/importsResolve',

      // Store the options so that `@typhonjs-build-test/esm-d-ts can also automatically configure `importsResolve`.
      importsPluginOptions: options,

      /**
       * Processes options.
       *
       * @this {import('rollup').PluginContext}
       *
       * @param {import('rollup').InputOptions} rollupOptions - Rollup input options.
       *
       * @returns {import('rollup').InputOptions | import('rollup').NullValue} Rollup options.
       */
      options(rollupOptions)
      {
         ({ packageObj, regexImportKeys } = processOptions(options, rollupOptions, 'importsResolve'));

         return rollupOptions;
      },

      /**
       * Based on the configured `imports` from the target `package.json` substitute any imported identifiers with a
       * lookup against the glob defined in the `imports` object.
       *
       * @param {string} source - The import source to resolve.
       *
       * @returns {string} Resolved import source.
       * @see https://rollupjs.org/plugin-development/#resolveid
       */
      async resolveId(source)
      {
         let foundMatch = false;
         for (const regex of regexImportKeys)
         {
            if (regex.test(source))
            {
               foundMatch = true;
               break;
            }
         }

         return foundMatch ? await resolveImportPath(source, packageObj, options?.exportConditions) : null;
      }
   };
}

/**
 * @param {import('./types').ImportsPluginOptions} options - Imports plugin options.
 *
 * @param {import('rollup').InputOptions} rollupOptions - Rollup input options.
 *
 * @param {string}   name - plugin name.
 *
 * @returns {{ regexImportKeys: RegExp[], regexImportValues: RegExp[], packageObj: object }} Processed data.
 */
function processOptions(options, rollupOptions, name)
{
   let packageObj = options?.packageObj;
   const regexImportKeys = [];
   const regexImportValues = [];

   if (typeof rollupOptions.input !== 'string')
   {
      throw new TypeError(`${name} error: Only a single entry point is supported; Rollup 'input' option not a string.`);
   }

   if (packageObj !== void 0 && typeof packageObj !== 'object' && typeof packageObj.imports !== 'object')
   {
      throw new TypeError(`${name} error: Provided 'package.json' in options does not contain an 'imports' attribute.`);
   }

   // If not already defined load the nearest `package.json` from the `input` Rollup option. -------------------

   if (packageObj === void 0)
   {
      const { packageObj: loadedObj, filepath } = getPackageWithPath({
         filepath: path.resolve(rollupOptions.input)
      });

      packageObj = loadedObj;

      if (typeof packageObj !== 'object')
      {
         throw new TypeError(
          `${name} error: Could not resolve closest 'package.json' from Rollup options 'input': ${
           rollupOptions.input}.`);
      }

      if (typeof packageObj.imports !== 'object')
      {
         throw new TypeError(
          `${name} error: The loaded 'package.json' does not contain an 'imports' attribute; filepath\n${
           filepath}.`);
      }
   }

   // Create `imports` entry regexes ---------------------------------------------------------------------------

   // Only explicit keys provided in `options`.
   if (options?.importKeys)
   {
      for (const key of options.importKeys)
      {
         if (typeof packageObj.imports[key] !== 'string')
         {
            throw new Error(`${name} error: Could not find match in target 'package.json' for import key: ${key}`);
         }

         regexImportKeys.push(globToRegExp(key));
         regexImportValues.push(globToRegExp(packageObj.imports[key]));
      }
   }
   else // Process all `imports` entries.
   {
      for (const [key, value] of Object.entries(packageObj.imports))
      {
         // Skip all local path mappings for imports as the goal is to map packages as external.
         if (value.startsWith('.')) { continue; }

         regexImportKeys.push(globToRegExp(key));
         regexImportValues.push(globToRegExp(value));
      }
   }

   return { packageObj, regexImportKeys, regexImportValues };
}

/**
 * Resolves an imported `source` to the `imports` of the target `package.json` via `resolve.exports`.
 *
 * @param {string}   source - Target resolveId source to replace from matched `imports` in `package.json`.
 *
 * @param {object}   packageObj - Target `package.json` object.
 *
 * @returns {string | null}   Resolved import value.
 */
function resolveImportId(source, packageObj)
{
   let result = null;

   try
   {
      const importPackage = r.imports(packageObj, source)?.[0];
      if (!importPackage)
      {
         console.warn(
          `@typhonjs-build-test/rollup-plugin-pkg-imports error: Failure to find imports specifier '${source}'.`);
         return null;
      }

      result = importPackage;
   }
   catch (err)
   {
      console.warn('@typhonjs-build-test/rollup-plugin-pkg-imports error: Failure to find imports specifier.');
      throw err;
   }

   return result;
}

/**
 * Resolves an imported `source` to the `imports` of the target `package.json` via `import-meta-resolve`.
 *
 * @param {string}   source - Target resolveId source to replace from matched `imports` in `package.json`.
 *
 * @param {object}   packageObj - Target `package.json` object.
 *
 * @param {string}   [exportConditions] - Export conditions to resolve.
 *
 * @returns {string | null}   Resolved import path.
 */
async function resolveImportPath(source, packageObj, exportConditions)
{
   let result = null;

   let importPackage;

   try
   {
      importPackage = r.imports(packageObj, source)?.[0];
      if (!importPackage)
      {
         console.warn(
          `@typhonjs-build-test/rollup-plugin-pkg-imports error: Failure to find imports specifier '${source}'.`);
         return null;
      }
   }
   catch (err)
   {
      console.warn('@typhonjs-build-test/rollup-plugin-pkg-imports error: Failure to find imports specifier.');
      throw err;
   }

   try
   {
      // Resolves full path to package / subpath export.
      result = fileURLToPath(moduleResolve(importPackage, import.meta.url,
       exportConditions ? new Set(exportConditions) : new Set(['node', 'import', 'default'])));
   }
   catch (err)
   {
      console.warn(`@typhonjs-build-test/rollup-plugin-pkg-imports error: Failure to resolve '${
       importPackage}' from import specifier '${source}'.`);
   }

   return result;
}

/**
 * @param {import('./types').ImportsPluginOptions | import('./types').ImportsResolvePluginOptions} options - Import
 *        plugin options.
 *
 * @param {string}   name - name of plugin.
 */
function validateOptions(options, name)
{
   if (options !== void 0 && typeof options !== 'object') { throw new TypeError(`'options' is not an object.`); }

   if (options?.importKeys !== void 0 && !Array.isArray(options?.importKeys))
   {
      throw new TypeError(`${name} error: 'options.importKeys' is not an array.`);
   }

   if (options?.packageObj !== void 0)
   {
      if (typeof options?.packageObj !== 'object')
      {
         throw new TypeError(`${name} error: Provided target 'options.packageObj' is not an object.`);
      }

      if (typeof options?.packageObj.imports !== 'object')
      {
         throw new TypeError(
          `${name} error: Provided target 'options.packageObj' does not have an 'imports' attribute.`);
      }
   }

   if (options?.exportConditions !== void 0 && !Array.isArray(options.exportConditions))
   {
      throw new TypeError(`${name} error: Provided target 'options.exportConditions' is not an array.`);
   }
}
