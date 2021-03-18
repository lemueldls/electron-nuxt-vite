import consola, { FancyReporter } from "consola";

export default consola.create({
  level: 4,
  reporters: [new FancyReporter()],
});
