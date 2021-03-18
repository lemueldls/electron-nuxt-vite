import path from "path";

import electronPath from "electron/index";

import { build, BuildResult, WatchMode } from "esbuild";
import { spawn, ChildProcess } from "child_process";

import { Nuxt, Builder, Generator } from "nuxt";
import { loadNuxtConfig } from "@nuxt/config";

import type { NuxtConfig } from "@nuxt/types";

import chalk from "chalk";
import log from "./util/log";

import { main } from "../package.json";

/** Main class used to initialize nuxt and electron. */
export default class ElectronNuxt {
  /** Check if we need to run Nuxt in development mode. */
  private isProduction = process.env.NODE_ENV === "production";

  /** The esbuild build result instance. */
  private esbuild!: BuildResult;

  /** The nuxt build instance. */
  private nuxt!: Nuxt;

  /** Electron's spawned child process. */
  private electron!: ChildProcess;

  /** Whether to keep running on the next closed instance of electron. */
  private keep = false;

  public constructor() {
    log.info("Starting electron nuxt");

    this.load();
  }

  /** Asynchronously builds esbuild and nuxt to then launch. */
  private async load(): Promise<void> {
    await Promise.all([this.build(), this.buildNuxt()]);

    if (!this.isProduction) this.launch();
  }

  /** Esbuild initialization and watching. */
  private async build(): Promise<void> {
    const { isProduction } = this;

    log.info("Building main");

    const watch: WatchMode = {
      /** Kill and relaunch electron process when `main/` files changes. */
      onRebuild: () => {
        const { electron } = this;

        this.keep = true;

        log.info("Restarting build");

        if (electron.kill()) this.launch();
      },
    };

    this.esbuild = await build({
      // ? Maybe change through configuration
      entryPoints: [path.resolve(__dirname, "../main/index.ts")],
      outfile: main,
      platform: "node",
      bundle: true,
      external: ["electron", "electron-devtools-installer"],
      define: {
        "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`,
      },
      minify: isProduction,
      watch: isProduction ? false : watch,
    });
  }

  /** Nuxt build initialization and running. */
  private async buildNuxt(): Promise<void> {
    const config = await this.loadConfig();

    const nuxt = new Nuxt(config);

    await nuxt.ready();

    const builder = new Builder(nuxt);

    if (this.isProduction)
      if (config.target === "static") {
        const generator = new Generator(nuxt, builder);

        // Full Static warning.
        if (generator.isFullStatic)
          log.warn(
            chalk`Going {bold.blue Full Static} is unsupported, set {bold.green ssr} to {bold.red false}, or {bold.green target} to {bold.cyan server}.`
          );

        await generator.generate();
      } else await builder.build();
    else {
      await builder.build();

      await nuxt.server.listen();
    }

    this.nuxt = nuxt;
  }

  /** Nuxt configuration creation and validating. */
  private async loadConfig(): Promise<NuxtConfig> {
    const { isProduction } = this;

    const config = await loadNuxtConfig({
      rootDir: "renderer",
    });

    Object.assign(config, {
      dev: !isProduction,
      // ? Is `modern` worth it
      modern: isProduction,
      router: Object.assign(config.router || {}, {
        mode: "hash",
        base: isProduction ? "./" : "/",
      }),
    } as NuxtConfig);

    return config;
  }

  /** Electron launch process and exit handling. */
  private launch(): void {
    const { esbuild, nuxt } = this;

    log.info("Launching electron");

    // ? Does "." or main matter
    const electron = spawn(electronPath, ["."], {
      stdio: "inherit",
    });

    electron.on("close", async () => {
      const { keep } = this;

      if (keep) this.keep = false;
      else {
        log.info("Closing build");

        esbuild.stop?.();

        await nuxt.close();
      }
    });

    this.electron = electron;
  }
}
