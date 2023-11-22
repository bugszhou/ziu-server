import { ResolveOptions, Optimization } from "webpack";

declare namespace IZiuServer {
  interface IConfig {
    webpack?: {
      resolveModules?: ResolveOptions["modules"];
      resolveAlias?: ResolveOptions["alias"];
      resolveMainFields?: ResolveOptions["mainFields"];
      outputChunkLoadingGlobal?: string;
      optimization?: Optimization;
    };
    splitNodeModules?: boolean;
    [key: string]: any;
  }
}

export default IZiuServer;

export type IZiuServerConfig = IZiuServer.IConfig;
