export interface RegistryInitParams {
  name: string;
  home?: string;
  registry: string;
}
export default class Registry {
  name: string;
  home?: string;
  registry: string;
  constructor(params: RegistryInitParams) {
    const { name, home, registry } = params;
    this.name = name;
    this.home = home;
    this.registry = registry;
  }
}
