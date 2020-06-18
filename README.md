Nyrm -- YARN/NPM registry manager

Forked from [i5ting/yrm](https://github.com/i5ting/yrm) ---> Forked from [Pana/nrm](https://github.com/Pana/nrm)

===

[![NPM version][npm-image]][npm-url]

`yrm` can help you easy and fast switch between different npm registries,
now include: `npm`, `cnpm`, `taobao`, `nj(nodejitsu)`, `rednpm`, `yarn`.

## Install

```
$ npm install -g yrm
```

## Example

```
$ yrm ls

* npm -----  https://registry.npmjs.org/
  cnpm ----  http://r.cnpmjs.org/
  taobao --  https://registry.npm.taobao.org/
  nj ------  https://registry.nodejitsu.com/
  rednpm --  http://registry.mirror.cqupt.edu.cn
  skimdb --  https://skimdb.npmjs.com/registry
  yarn ----  https://registry.yarnpkg.com

```

```
$ yrm use cnpm  //switch registry to cnpm

    Registry has been set to: http://r.cnpmjs.org/

```

## Usage

```
Usage: yrm [options] [command]

  Commands:

    ls                           List all the registries
    use <registry>               Change registry to registry
    add <registry> <url> [home]  Add one custom registry
    del <registry>               Delete one custom registry
    home <registry> [browser]    Open the homepage of registry with optional browser
    test [registry]              Show the response time for one or all registries
    help                         Print this help

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

## Registries

- [npm](https://www.npmjs.org)
- [cnpm](http://cnpmjs.org)
- [nodejitsu](https://www.nodejitsu.com)
- [taobao](http://npm.taobao.org/)
- [rednpm](http://npm.mirror.cqupt.edu.cn)
- [yarn](https://registry.yarnpkg.com)

## Notice

When you use an other registry, you can not use the `publish` command.

## TODO

- When publish proxy to npm official registry

## LICENSE

MIT

[npm-image]: https://img.shields.io/npm/v/yrm.svg?style=flat-square
[npm-url]: https://npmjs.org/package/yrm
