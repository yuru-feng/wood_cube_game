import * as THREE from 'three';

class Firework {
  #scene;
  #points;
  #time;
  constructor(scene) {
    this.#scene = scene;
    let x = THREE.MathUtils.randInt(0, 12000) / 1000.0;
    let y = -THREE.MathUtils.randInt(0, 2000) / 1000.0;
    let z = -THREE.MathUtils.randInt(0, 12000) / 1000.0;
    const startPos = new THREE.Vector3(x, y, z);
    const color = new THREE.Color();
    color.setHSL(THREE.MathUtils.randFloat(0.1, 0.9), 1, 0.9);
    const material = new THREE.PointsMaterial({
      size: 2, color: 0xffffff, opacity: 1, vertexColors: true,
      transparent: true, depthTest: false});
    const geometry = new THREE.BufferGeometry();
    geometry.colors = [color];
    geometry.vertices = [startPos];
    this.#points = new THREE.Points(geometry, material);
    this.time = 0.0;
    scene.add(this.#points);
  }
  update(delta) {
    const velocity = 10.0;
    const acceleration = 10.0;
    const expodeTime = 1.0;
    const maxExpode = 100;
    const geo = this.#points.geometry;
    const dy = delta * (velocity - this.#time * acceleration);
    this.#time += delta;
    for (let i = 0; i < geo.vertices.length; i++) {
      geo.vertices[i].y += dy;
    }
    geo.verticesNeedUpdate = true;
    if (geo.vertices.length == 1) {
      if (this.#time >= expodeTime) {
        // 初始爆炸
        const v = geo.vertices[0];
        geo.vertices = [];
        geo.color = [];
        this.expVelocity = [];
        for (let i = 0; i < maxExpode; i++) {
          const vx = THREE.MathUtils.randInt(-10, 10);
          const vy = THREE.MathUtils.randInt(-10, 10);
          const vz = THREE.MathUtils.randInt(-10, 10);
          const vv = new THREE.Vector3(vx, vy, vz);
          this.expVelocity.push(vv);
          const color = new THREE.Color();
          color.setHSL(THREE.MathUtils.randFloat(0.1, 0.9), 1, 0.5);
          geo.color.push(color);
          geo.vertices.push(vv.clone().multiplyScalar(delta).add(v));
        }
      }
      return;
    }
    const fadeTime = 1.5;
    for (let i = 0; i < geo.vertices.length; i++) {
      // 爆炸速度持续
      geo.vertices[i].add(this.expVelocity[i].clone().multiplyScalar(delta));
    }
    this.#points.material.opacity -= delta / (fadeTime - this.#time);
    this.#points.material.colorsNeedUpdate = true;
    if (this.#points.material.opacity < 0.0) {
      this.#scene.remove(this.#points);
    }
  }
}

export { Firework }