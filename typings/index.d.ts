import { ResolveOptions } from "webpack";

declare namespace IZiuServer {
  interface IConfig {
    webpack?: {
      resolveModules?: ResolveOptions["modules"];
      resolveAlias?: ResolveOptions["alias"];
      resolveMainFields?: ResolveOptions["mainFields"];
    };
    [key: string]: any;
  }
}

export default IZiuServer;

export type IZiuServerConfig = IZiuServer.IConfig;
