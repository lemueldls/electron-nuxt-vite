/* eslint-disable max-classes-per-file */

declare module "electron/index" {
  const path: string;
  export default path;
}

declare module "nuxt" {
  import { NuxtConfig } from "@nuxt/types";

  export class Nuxt {
    public server: { listen(): Promise<void> };

    public options: NuxtConfig;

    public constructor(config: NuxtConfig);

    public ready(): Promise<void>;

    public close(): Promise<void>;
  }

  export class Builder {
    public constructor(nuxt: Nuxt);

    public build(): Promise<void>;
  }

  export interface Route {
    route: string;
    payload: string;
    errors: string[];
  }

  export class Generator {
    public isFullStatic: boolean;

    public staticAssetsBase: string;

    public options: NuxtConfig;

    public routes: Route[];

    public generatedRoutes: Set<string>;

    public _formatErrors(error: string[]): string;

    public normalizeSlash(route: string): string;

    public generateRoute(route: Route): Promise<void>;

    public generateRoutes(routes: Route[]): Promise<string[]>;

    public constructor(nuxt: Nuxt, builder: Builder);

    public generate(): Promise<void>;
  }
}
