import path from "path";

import electronPath from "electron/index";

import { build, BuildResult } from "esbuild";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";

import { Nuxt, Builder, Generator } from "nuxt";
import type { NuxtConfig } from "@nuxt/types";
import { loadNuxtConfig } from "@nuxt/config";

import chalk from "chalk";
import log from "./util/log";

export default class ElectronNuxt {
  /** Check if we need to run Nuxt in development mode. */
  private isProduction = process.env.NODE_ENV === "production";

  private outfile = path.join(__dirname, ".start.js");

  private esbuild!: BuildResult;

  private nuxt!: Nuxt;

  private electron!: ChildProcessWithoutNullStreams;

  private keep = false;

  public constructor() {
    this.build();
  }

  private async build(): Promise<void> {
    const { outfile, isProduction } = this;

    log.info("Building main");

    const watch = {
      onRebuild: () => {
        const { electron } = this;

        if (!electron) return;

        this.keep = true;

        electron.kill();
        this.launch();
      },
    };

    this.esbuild = await build({
      entryPoints: [path.resolve(__dirname, "../main/index.ts")],
      outfile,
      platform: "node",
      format: "cjs",
      bundle: true,
      external: ["electron"],
      define: {
        "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`,
      },
      minify: isProduction,
      watch: isProduction ? false : watch,
    });

    // Get a ready to use Nuxt instance
    await this.buildNuxt();

    if (!isProduction) this.launch();
  }

  private async buildNuxt(): Promise<void> {
    const config = await this.loadConfig();

    const nuxt = new Nuxt(config);

    await nuxt.ready();

    const builder = new Builder(nuxt);

    if (this.isProduction) {
      const generator = new Generator(nuxt, builder);

      await generator.generate();
    } else {
      await builder.build();

      await nuxt.server.listen();
    }

    this.nuxt = nuxt;
  }

  private async loadConfig(): Promise<NuxtConfig> {
    const { isProduction } = this;

    const config = await loadNuxtConfig({
      rootDir: "renderer",
    });

    if (config.target === "server")
      log.warn(
        `Target will be set to ${chalk.bold.cyan(
          "static"
        )}, as ${chalk.bold.cyan("server")} is not supported.`
      );

    Object.assign(config, {
      dev: !isProduction,
      server: {},
      modern: isProduction,
      router: {
        mode: "hash",
        base: isProduction ? "./" : "/",
      },
      build: {
        publicPath: "_nuxt/",
        extend(config) {
          if (config.performance) {
            config.performance.maxEntrypointSize = 5e6;
            config.performance.maxAssetSize = 5e6;
          }

          // if (!isDev && config.output) config.output.publicPath = "_nuxt/";
        },
      },
      app: {
        assetsPath: "_nuxt/",
        cdnURL: "./",
      },
      generate: {
        staticAssets: {
          base: "_nuxt/static",
        },
      },
    } as NuxtConfig);

    return config;
  }

  private launch(): void {
    const { outfile, esbuild, nuxt } = this;

    log.info("Launching electron");

    const electron = spawn(electronPath, [outfile]);

    electron.stderr.on("data", data => log.debug(data.toString()));

    electron.stdout.on("close", async () => {
      if (this.keep) {
        this.keep = false;
        return;
      }

      esbuild.stop?.();

      await nuxt.close();
    });

    this.electron = electron;
  }
}
