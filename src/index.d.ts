import * as rollup from 'rollup';

type ImportsPluginOptions = {
    /**
     * Defines the `imports` keys in `package.json` to target. If undefined all `imports` entries that are packages
     * are processed.
     */
    importKeys?: string[];
    /**
     * An explicit target `package.json` object.
     */
    packageObj?: object;
};
type ImportsResolvePluginOptions = {
    /**
     * Specific export conditions to resolve.
     */
    exportConditions?: string[];
} & ImportsPluginOptions;

/**
 * Provides a Rollup plugin that automatically resolves `package.json` import specifiers as the local package and
 * sub-path exports. The import specifier must be the fully qualified local package name including the base package.
 *
 * @param {import('./types').ImportsPluginOptions}   [options] - Options.
 *
 * @returns {import('rollup').Plugin} Rollup plugin.
 */
declare function importsLocal(options?: ImportsPluginOptions): rollup.Plugin;
/**
 * Provides a Rollup plugin that automatically resolves `package.json` import specifiers to NPM packages as external.
 *
 * @param {import('./types').ImportsPluginOptions}   [options] - Options.
 *
 * @returns {import('rollup').Plugin} Rollup plugin.
 */
declare function importsExternal(options?: ImportsPluginOptions): rollup.Plugin;
/**
 * Provides a Rollup plugin that automatically resolves `package.json` import specifiers to NPM packages.
 *
 * @param {import('./types').ImportsResolvePluginOptions}   [options] - Options.
 *
 * @returns {import('rollup').Plugin} Rollup plugin.
 */
declare function importsResolve(options?: ImportsResolvePluginOptions): rollup.Plugin;

export { type ImportsPluginOptions, type ImportsResolvePluginOptions, importsExternal, importsLocal, importsResolve };
