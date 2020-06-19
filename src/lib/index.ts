import Registry, { RegistryInitParams } from "./Registry";
import npm from "npm";
import fs from "fs";
import path from "path";
import ini from "ini";
import axios from "axios";
import async from "async";
import open from "open";
import extend from "extend";
import registries from "../../registries.json";

class Ynrm {
  registries: Registry[] = [];

  static YRMRC = path.join(process.env.HOME, ".yrmrc");
  static YARNRC = path.join(process.env.HOME, ".yarnrc");

  constructor() {
    const presetRegistries = Ynrm.GetPresetRegistries();
    this.init(presetRegistries);
  }

  private init(params: RegistryInitParams[]) {
    this.registries = params.map((item) => new Registry(item));
  }

  /*//////////////// helper methods /////////////////*/
  static GetPresetRegistries = () => {
    let presets: RegistryInitParams[] = [];
    presets = Object.keys(registries).map((item) => {
      return {
        name: item,
        home: registries[item].home,
        registry: registries[item].registry,
      };
    });
    return presets;
  };
  /*
   * get current registry
   */
  static GetCurrentRegistry(cbk: (currentRegistry: string) => void) {
    npm.load(function (err, conf) {
      if (err) return Ynrm.exit(err);
      cbk(npm.config.get("registry"));
    });
  }

  static printErr(err: Error) {
    console.error("an error occured: " + err);
  }

  /*
   * print message & exit
   */
  static exit(err: Error) {
    Ynrm.printErr(err);
    process.exit(1);
  }

  static printMsg(infos: string[]) {
    infos.forEach(function (info) {
      console.log(info);
    });
  }

  static getAllRegistry() {
    return extend({}, registries, Ynrm.getCustomRegistry());
  }
  static getCustomRegistry() {
    return fs.existsSync(Ynrm.YRMRC)
      ? ini.parse(fs.readFileSync(Ynrm.YRMRC, "utf-8"))
      : {};
  }

  static setCustomRegistry(config, cbk) {
    fs.writeFile(Ynrm.YRMRC, ini.stringify(config), cbk);
  }

  static line(str: string, len: number) {
    var line = new Array(Math.max(1, len - str.length)).join("-");
    return " " + line + " ";
  }

  /*//////////////// cmd methods /////////////////*/
  showCurrent() {
    Ynrm.GetCurrentRegistry(function (cur) {
      var allRegistries = Ynrm.getAllRegistry();
      Object.keys(allRegistries).forEach(function (key) {
        var item = allRegistries[key];
        if (item.registry === cur) {
          Ynrm.printMsg([key]);
          return;
        }
      });
    });
  }

  onUse(name: string) {
    var allRegistries = Ynrm.getAllRegistry();
    if (allRegistries.hasOwnProperty(name)) {
      var registry = allRegistries[name];

      fs.writeFile(
        Ynrm.YARNRC,
        'registry "' + registry.registry + '"',
        function (err) {
          if (err) throw err;
          // console.log('It\'s saved!');

          Ynrm.printMsg([
            "",
            "   YARN Registry has been set to: " + registry.registry,
            "",
          ]);
        }
      );

      // 同时更改npm的源
      npm.load(function (err) {
        if (err) return Ynrm.exit(err);

        npm.commands.config(["set", "registry", registry.registry], function (
          err,
          data
        ) {
          if (err) return Ynrm.exit(err);
          console.log("                        ");
          var newR = npm.config.get("registry");
          Ynrm.printMsg(["", "   NPM Registry has been set to: " + newR, ""]);
        });
      });
    } else {
      Ynrm.printMsg(["", "   Not find registry: " + name, ""]);
    }
  }

  onDel(name: string) {
    var customRegistries = Ynrm.getCustomRegistry();
    if (!customRegistries.hasOwnProperty(name)) return;
    Ynrm.GetCurrentRegistry(function (cur) {
      if (cur === customRegistries[name].registry) {
        this.onUse("npm");
      }
      delete customRegistries[name];
      Ynrm.setCustomRegistry(customRegistries, function (err) {
        if (err) return Ynrm.exit(err);
        Ynrm.printMsg(["", "    delete registry " + name + " success", ""]);
      });
    });
  }

  onHome(name: string, browser: string) {
    var allRegistries = Ynrm.getAllRegistry();
    var home = allRegistries[name] && allRegistries[name].home;
    if (home) {
      var args = [home];
      if (browser) args.push(browser);
      open.apply(null, args);
    }
  }

  onList() {
    Ynrm.GetCurrentRegistry(function (cur) {
      var info = [""];
      var allRegistries = Ynrm.getAllRegistry();

      Object.keys(allRegistries).forEach(function (key) {
        var item = allRegistries[key];
        var prefix = item.registry === cur ? "* " : "  ";
        info.push(prefix + key + Ynrm.line(key, 8) + item.registry);
      });

      info.push("");
      Ynrm.printMsg(info);
    });
  }

  onTest(registry) {
    console.log(registry, "registry");

    var allRegistries = Ynrm.getAllRegistry();

    var toTest;

    if (registry) {
      if (!allRegistries.hasOwnProperty(registry)) {
        return;
      }
      // toTest = only(allRegistries, registry);
    } else {
      toTest = allRegistries;
    }

    async.map(
      Object.keys(toTest),
      function (name, cbk) {
        var registry = toTest[name];
        var start = +new Date();
        axios
          .get(registry.registry + "pedding")
          .then(() => {
            cbk(null, {
              name: name,
              registry: registry.registry,
              time: +new Date() - start,
              error: false,
            });
          })
          .catch(() => {
            cbk(null, {
              name: name,
              registry: registry.registry,
              time: +new Date() - start,
              error: true,
            });
          });
      },
      function (err, results) {
        Ynrm.GetCurrentRegistry(function (cur) {
          var msg = [""];
          results.forEach(function (result: any) {
            var prefix = result.registry === cur ? "* " : "  ";
            var suffix = result.error ? "Fetch Error" : result.time + "ms";
            msg.push(prefix + result.name + Ynrm.line(result.name, 8) + suffix);
          });
          msg.push("");
          Ynrm.printMsg(msg);
        });
      }
    );
  }

  onAdd(name: string, url: string, home: string) {
    var customRegistries = Ynrm.getCustomRegistry();
    if (customRegistries.hasOwnProperty(name)) return;
    var config = (customRegistries[name] = {}) as any;
    if (url[url.length - 1] !== "/") url += "/"; // ensure url end with /
    config.registry = url;
    if (home) {
      config.home = home;
    }
    Ynrm.setCustomRegistry(customRegistries, function (err) {
      if (err) return Ynrm.exit(err);
      Ynrm.printMsg(["", "    add registry " + name + " success", ""]);
    });
  }
}

export default Ynrm;
