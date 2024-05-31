# Changelog
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
