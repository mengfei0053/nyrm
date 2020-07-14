YNRM -- YARN/NPM registry manager

Forked from [i5ting/yrm](https://github.com/i5ting/yrm) ---> Forked from [Pana/nrm](https://github.com/Pana/nrm)

ynrm will set up both npm registy and yarn registry

## Ynrm vs. Nrm/Yrm

- Ynrm rewrite using typescript.
- Remove npm from dependency.Ynrm gets npm global path by `npm root -g`, directly introduces global npm.
- Replace the request with axios

---

[![NPM version][npm-image]][npm-url]

`ynrm` can help you easy and fast switch between different npm registries,
now include: `npm`, `cnpm`, `taobao`,`tencent`,`nj(nodejitsu)`, `rednpm`,`skimdb`,`edunpm`,`yarn`.

## Install

```
$ npm install -g ynrm
```

## Example

```
$ ynrm ls

* npm -----  https://registry.npmjs.org/
  cnpm ----  http://r.cnpmjs.org/
  taobao --  https://registry.npm.taobao.org/
  nj ------  https://registry.nodejitsu.com/
  rednpm --  http://registry.mirror.cqupt.edu.cn
  skimdb --  https://skimdb.npmjs.com/registry
  yarn ----  https://registry.yarnpkg.com

```

```shell
# ynrm will set up both npm registy and yarn registry
# switch registry to taobao registry
$ ynrm use cnpm

    YARN Registry has been set to: https://registry.npm.taobao.org/

    NPM Registry has been set to: https://registry.npm.taobao.org/

```

## Usage

```
Usage: ynrm [options] [command]

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
- [tencent](https://mirrors.cloud.tencent.com/npm/)
- [taobao](http://npm.taobao.org/)
- [rednpm](http://npm.mirror.cqupt.edu.cn)
- [yarn](https://registry.yarnpkg.com)

## Notice

When you use an other registry, you can not use the `publish` command.

## TODO

- When publish proxy to npm official registry

## LICENSE

MIT

[npm-image]: https://img.shields.io/npm/v/ynrm.svg?style=flat-square
[npm-url]: https://npmjs.org/package/ynrm
