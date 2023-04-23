import * as rollup from 'rollup';

/**
 * @param {ImportsExternalOptions}   [options] - Options.
 *
 * @returns {import('rollup').Plugin} Rollup plugin.
 */
declare function importsExternal(options?: ImportsExternalOptions): rollup.Plugin;
type ImportsExternalOptions = {
    /**
     * - Defines the `imports` keys in `package.json` to target. If undefined all
     * `imports` entries are processed as external.
     */
    importKeys?: string[];
    /**
     * - An explicit target `package.json` object.
     */
    packageObj?: object;
};

export { ImportsExternalOptions, importsExternal };
