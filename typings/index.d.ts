import { ResolveOptions, Configuration } from "webpack";

declare namespace IZiuServer {
  interface IConfig {
    webpack?: {
      resolveModules?: ResolveOptions["modules"];
      resolveAlias?: ResolveOptions["alias"];
      resolveMainFields?: ResolveOptions["mainFields"];
      outputChunkLoadingGlobal?: string;
      optimization?: Configuration["optimization"];
    };
    splitNodeModules?: boolean;
    [key: string]: any;
  }
}

export default IZiuServer;

export type IZiuServerConfig = IZiuServer.IConfig;
