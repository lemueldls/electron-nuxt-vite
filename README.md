# ⚡ Electron Nuxt Vite

Built to be the fastest and most extendable development environment combining
both Electron and NuxtJS using the latest technologies.

## Technologies

- Electron 12
- Nuxt 2.15 + Vite 2
- TypeScript 4.2

## Known Issues

- **Nuxt Configuration** `renderer/nuxt.config`
  - Only supported for `target: "static"`.
  - Setting `ssr: true` may cause routing issues on reload.

## Get Started

### Prerequisites

You need to [install Node.js](https://nodejs.org/en/download/) to run the code.

### Installing

You will then need to install Yarn using

```console
npm install -g yarn
```

After installing Yarn, install the dependencies by simply running

```console
yarn
```

### Running

To run a live development build, run

```console
yarn dev
```

To create a production build, run

```console
yarn build
```

Then, to locally run the production build, use

```console
yarn start
```

To release a publishable version, run

```console
yarn release
```

## File System

### [`renderer/`](renderer)

This is where the nuxt app itself is contained.

Hypothetically, deleting `renderer/` folder, and creating a new nuxt app using

```console
yarn create nuxt-app renderer
```

Will work, just keep in mind the [known limitations](#known-issues), and for an
optimal configuration, choose **Yarn** for Package manager, **Single Page App**
for Rendering mode, and **Static** for Deployment target.

### [`main/`](main)

This is where the main electron instance is created.

Anything imported from the [`index.ts`](main/index.ts) file will be bundled
along for production and development.

The bundled file location will be dependent on the `main` field of
[`package.json`](package.json). If you do change the location, make sure it's
included in [`.gitignore`](.gitignore).

### [`build/`](build)

This contains all the code written to both create and run development and
production builds.

External configuration may come in the future if requested.
