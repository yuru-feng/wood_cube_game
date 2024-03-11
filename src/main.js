import { World } from './world.js';

async function main() {
  const container = document.querySelector('canvas.webgl');
  const world = new World(container);
  await world.init();
  world.start();
}

main().catch((err) => {
  console.error(err);
});
