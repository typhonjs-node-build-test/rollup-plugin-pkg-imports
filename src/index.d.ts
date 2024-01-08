import * as rollup from 'rollup';

/**
 * Provides a Rollup plugin that automatically resolves `package.json` import specifiers to NPM packages as external.
 *
 * @param {ImportsPluginOptions}   [options] - Options.
 *
 * @returns {import('rollup').Plugin} Rollup plugin.
 */
declare function importsExternal(options?: ImportsPluginOptions): rollup.Plugin;
/**
 * Provides a Rollup plugin that automatically resolves `package.json` import specifiers to NPM packages.
 *
 * @param {ImportsPluginOptions}   [options] - Options.
 *
 * @returns {import('rollup').Plugin} Rollup plugin.
 */
declare function importsResolve(options?: ImportsPluginOptions): rollup.Plugin;
type ImportsPluginOptions = {
    /**
     * - Defines the `imports` keys in `package.json` to target. If undefined all
     * `imports` entries that are packages are processed.
     */
    importKeys?: string[];
    /**
     * - An explicit target `package.json` object.
     */
    packageObj?: object;
};

export { type ImportsPluginOptions, importsExternal, importsResolve };
