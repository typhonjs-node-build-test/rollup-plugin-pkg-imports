import * as rollup from 'rollup';

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
declare function importsExternal(options?: {
    importKeys?: string[];
    packageObj?: object;
}): rollup.Plugin;

export { importsExternal };
