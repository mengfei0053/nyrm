import Registry, { RegistryInitParams } from "./Registry";
import fs from "fs";
import path from "path";
import ini from "ini";
import axios from "axios";
import async from "async";
import osenv from "osenv";
import open from "open";
import which from "which";
import extend from "extend";
import registries from "../registries";
import type npmStatic from "npm";
import { exec } from "child_process";

const home = osenv.home();
process.env.HOME = process.env.HOME || home;

type NpmConfig = typeof npmStatic["config"]["defs"]["defaults"];

class Ynrm {
  registries: Registry[] = [];

  static YRMRC = path.join(process.env.HOME as string, ".yrmrc");
  static YARNRC = path.join(process.env.HOME as string, ".yarnrc");

  constructor() {
    const presetRegistries = Ynrm.GetPresetRegistries();
    this.init(presetRegistries);
  }

  static getNpm() {
    return new Promise<typeof npmStatic>((resolve, reject) => {
      exec("npm root -g", (err, stdout, stderr) => {
        if (err) {
          Ynrm.exit(err);
          reject(err);
          return;
        }
        if (stderr) {
          Ynrm.exit(new Error(stderr));
          reject(new Error(stderr));
          return;
        }
        which("node", (err, nodePath) => {
          if (err) {
            reject(err);
          } else {
            const parseNodePath = path.parse(nodePath || "");
            const npm = require(require.resolve("npm", {
              paths: [stdout, parseNodePath.dir],
            }));
            resolve(npm as typeof npmStatic);
          }
        });
      });
    });
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
        home: registries[item as keyof typeof registries].home,
        registry: registries[item as keyof typeof registries].registry,
      };
    });
    return presets;
  };
  /*
   * get current registry
   */
  static async GetCurrentRegistry(cbk: (currentRegistry: string) => void) {
    const npm = await Ynrm.getNpm();
    npm.load(function (err, conf) {
      if (err) return Ynrm.exit(err);
      cbk(npm.config.get("registry"));
    });
  }

  static printErr(err: Error) {
    console.error("an error occured: " + err);
  }

  static only(registry: string) {
    const allRegistries = Ynrm.getAllRegistry();
    return Object.keys(allRegistries).reduce((preVal, current) => {
      if (current === registry) {
        return {
          [current]: allRegistries[current as keyof typeof preVal],
        };
      }
      return preVal;
    }, {});
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

  static async setCustomRegistry(
    config: NpmConfig,
    cbk: (err: NodeJS.ErrnoException | null) => void
  ) {
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
      Ynrm.getNpm().then((npm) => {
        // 同时更改npm的源
        npm.load(function (err: any) {
          if (err) return Ynrm.exit(err);

          npm.commands.config(
            ["set", "registry", registry.registry],
            function (err: any, data: any) {
              if (err) return Ynrm.exit(err);
              console.log("                        ");
              var newR = npm.config.get("registry");
              Ynrm.printMsg([
                "",
                "   NPM Registry has been set to: " + newR,
                "",
              ]);
            }
          );
        });
      });
    } else {
      Ynrm.printMsg(["", "   Not find registry: " + name, ""]);
    }
  }

  onDel = (name: string) => {
    var customRegistries = Ynrm.getCustomRegistry();
    if (!customRegistries.hasOwnProperty(name)) return;

    Ynrm.GetCurrentRegistry((cur) => {
      if (cur === customRegistries[name].registry) {
        this.onUse("npm");
      }
      delete customRegistries[name];
      Ynrm.setCustomRegistry(customRegistries, function (err) {
        if (err) return Ynrm.exit(err);
        Ynrm.printMsg(["", "    delete registry " + name + " success", ""]);
      });
    });
  };

  onHome(name: string, browser: string) {
    var allRegistries = Ynrm.getAllRegistry();
    var home: string = allRegistries[name] && allRegistries[name].home;
    if (home) {
      open(home, {
        app: browser,
      });
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

  onTest(registry: string | undefined) {
    const allRegistries = Ynrm.getAllRegistry();

    let toTest: Partial<typeof allRegistries> = {};

    if (registry) {
      if (!allRegistries.hasOwnProperty(registry)) {
        return;
      }
      toTest = Ynrm.only(registry);
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
      function (err, results: any) {
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
