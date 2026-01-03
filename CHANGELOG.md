# Changelog
## 0.7.0 release (major / breaking)
- Switched to new fork [@es-joy/resolve.exports](https://github.com/es-joy/resolve.exports) allowing an upgrade to 
`importsLocal` to really work as intended. There was a limitation in the original 
[resolve.exports](https://github.com/lukeed/resolve.exports/issues/30#issuecomment-3438020713) that prevented a cleaner
implementation. The breaking change is that you now provide a special `replace` condition and that package value is
replaced at build / bundling. 

## 0.6.0 release
- Update dependencies.

## 0.5.0 release
- Hardened `imports` lookup. Added more documentation for `importsLocal`.

## 0.4.0 release
- Added `importsLocal` for working with local mapping of import specifiers to the local / sub-path exports.

## 0.3.0 release
- Support import conditions. It is now possible to define compound import conditions. You must have a `default` 
condition. For instance, this allows `types` to be defined along with a default condition.


## 0.2.0 release
- Small fix for default export conditions for `importsResolve`. The new default conditions are: 
`['node', 'import', 'default']`

## 0.1.0 release
- Initial Release
