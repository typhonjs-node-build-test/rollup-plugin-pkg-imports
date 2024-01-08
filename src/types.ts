export type ImportsPluginOptions = {
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

export type ImportsResolvePluginOptions = {
   /**
    * Specific export conditions to resolve.
    */
   exportConditions?: string[]
} & ImportsPluginOptions
