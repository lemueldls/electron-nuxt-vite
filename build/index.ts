import path from "path";

import electronPath from "electron/index";

import { build, BuildResult, WatchMode } from "esbuild";
import { spawn, ChildProcess } from "child_process";

import { Nuxt, Builder, Generator } from "nuxt";
import { loadNuxtConfig } from "@nuxt/config";

import type { NuxtConfig } from "@nuxt/types";

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
    const { isProduction } = this;

    // Build electron and nuxt at the same time and wait for both.
    await Promise.all([this.build(), this.buildNuxt()]);

    // Launch electron if in development.
    if (!isProduction) this.launch();
  }

  /** Esbuild initialization and watching. */
  private async build(): Promise<void> {
    const { isProduction } = this;

    log.info("Building main");

    /** Esbuild's `define` property. */
    const define: { [env: string]: string } = {};

    /** Chosen environmental variables to expose to the electron main files. */
    const exposed = "NODE_ENV".split(" ");
    for (const environment of exposed)
      define[`process.env.${environment}`] = `"${process.env[environment]}"`;

    /** Watch for development build. */
    const watch: WatchMode = {
      /** Kill and relaunch electron process when `main/` files changes. */
      onRebuild: () => {
        const { electron } = this;

        if (!electron) return;

        this.keep = true;

        // Relaunch electron if previous one is successfully killed.
        if (electron.kill()) this.launch();
      },
    };

    this.esbuild = await build({
      define,
      bundle: true,
      // ? Maybe change through configuration
      entryPoints: [path.resolve(__dirname, "../main/index.ts")],
      external: ["electron", "electron-devtools-installer"],
      minify: isProduction,
      outfile: main,
      platform: "node",
      // sourcemap: !isProduction,
      watch: isProduction ? false : watch,
    });
  }

  /** Nuxt build initialization and running. */
  private async buildNuxt(): Promise<void> {
    const { isProduction } = this;

    const config = await this.loadConfig();

    const nuxt = new Nuxt(config);

    await nuxt.ready();

    /** Builder for nuxt app. */
    const builder = new Builder(nuxt);

    if (isProduction) {
      const generator = new Generator(nuxt, builder);

      await generator.generate();
    } else {
      await builder.build();

      // Listen on localhost.
      await nuxt.server.listen();
    }

    this.nuxt = nuxt;
  }

  /** Nuxt configuration creation and validating. */
  private async loadConfig(): Promise<NuxtConfig> {
    const { isProduction } = this;

    const config: NuxtConfig = await loadNuxtConfig({
      rootDir: "renderer",
    });

    Object.assign(config, {
      dev: !isProduction,
      // ? Is `modern` worth it
      modern: isProduction,
      // Necessary router overrides.
      router: Object.assign(config.router || {}, {
        mode: "hash",
        base: isProduction ? "./" : "/",
      }),
    });

    return config;
  }

  /** Electron launch process and exit handling. */
  private launch(): void {
    const { keep, esbuild, nuxt } = this;

    log.info(`${keep ? "Restarting" : "Launching"} electron`);

    // ? Does using "." or `main` matter
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
