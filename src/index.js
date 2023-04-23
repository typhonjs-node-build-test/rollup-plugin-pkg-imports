import path                   from 'path';

import { getPackageWithPath } from '@typhonjs-utils/package-json';
import globToRegExp           from 'glob-to-regexp';
import * as r                 from 'resolve.exports';

/**
 * @param {object}   [options] - Options.
 *
 * @param {string[]} [options.importKeys] - Defines the `imports` keys in `package.json` to target. If undefined all
 *        `imports` entries are processed as external.
 *
 * @param {object}   [options.packageObj] - An explicit target `package.json` object.
 *
 * @returns {import('rollup').Plugin} Rollup plugin.
 */
export function importsExternal(options)
{
   if (options !== void 0 && typeof options !== 'object') { throw new TypeError(`'options' is not an object.`); }

   if (options?.importKeys !== void 0 && !Array.isArray(options?.importKeys))
   {
      throw new TypeError(`importsExternal error: 'options.importKeys' is not an array.`);
   }

   if (options?.packageObj !== void 0)
   {
      if (typeof options?.packageObj !== 'object')
      {
         throw new TypeError(
          `importsExternal error: Provided target 'options.packageObj' is not an object.`);
      }

      if (typeof options?.packageObj.imports !== 'object')
      {
         throw new TypeError(
          `importsExternal error: Provided target 'options.packageObj' does not have an 'imports' attribute.`);
      }
   }

   let packageObj = options?.packageObj;

   const regexImportKeys = [];
   const regexImportValues = [];

   return {
      name: '@typhonjs-build-test/rollup-external-imports',

      // Store the options so that `@typhonjs-build-test/esm-d-ts can also automatically configure `importsExternal`.
      importsExternalOptions: options,

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
         if (typeof rollupOptions.input !== 'string')
         {
            throw new TypeError(
             `importsExternal error: only a single entry point is supported; Rollup 'input' option not a string.`);
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
                `importsExternal error: Could not resolve closest 'package.json' from Rollup options 'input': ${
                 rollupOptions.input}.`);
            }

            if (typeof packageObj.imports !== 'object')
            {
               throw new TypeError(
                `importsExternal error: The loaded 'package.json' does not contain an 'imports' attribute; filepath\n${
                 filepath}.`);
            }
         }

         // Create `imports` entry regexes ---------------------------------------------------------------------------

         // Only explicit keys provided in `options`.
         if (options?.importKeys)
         {
            for (const key of options?.importKeys)
            {
               if (typeof packageObj.imports[key] !== 'string')
               {
                  throw new Error(
                   `importsExternal error: Could not find match in target 'package.json' for import key: ${key}`);
               }

               regexImportKeys.push(globToRegExp(key));
               regexImportValues.push(globToRegExp(packageObj.imports[key]));
            }
         }
         else // Process all `imports` entries.
         {
            for (const [key, value] of Object.entries(packageObj.imports))
            {
               regexImportKeys.push(globToRegExp(key));
               regexImportValues.push(globToRegExp(value));
            }
         }

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
 * Resolves an imported `source` to the `imports` of the target `package.json` via `resolve.exports`.
 *
 * @param {string}   source - Target resolveId source to replace from matched `imports` in `package.json`.
 *
 * @param {object}   packageObj - Target `package.json` object.
 *
 * @returns {string | null}   Resolved import.
 */
function resolveImportId(source, packageObj)
{
   let result = null;

   try
   {
      const importPackage = r.imports(packageObj, source)?.[0];
      if (!importPackage) { return null; }
      result = importPackage;
   }
   catch (err)
   {
      console.error(err);
   }

   return result;
}
