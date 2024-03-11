import * as THREE from 'three';
import basecolorUrl from '../resources/quartz/basecolor.jpg';
import ambientOcclusionUrl from '../resources/quartz/ambientOcclusion.jpg';
import heightUrl from '../resources/quartz/height.png';
import normalUrl from '../resources/quartz/normal.jpg';
import roughnessUrl from '../resources/quartz/roughness.jpg';

class Quartz {
  #positionArr;
  #objectArr;
  constructor(scene) {
    this.scene = scene;
  }

  async load() {
    const loader = new THREE.TextureLoader();
    const [baseColorTexture, aoTexture, heightTexture, normalTexture, roughnessTexture] = 
      await Promise.all([
        loader.loadAsync(basecolorUrl),
	      loader.loadAsync(ambientOcclusionUrl),
        loader.loadAsync(heightUrl),
	      loader.loadAsync(normalUrl),
	      loader.loadAsync(roughnessUrl)
    ]);  
    baseColorTexture.colorSpace = THREE.SRGBColorSpace;
    aoTexture.colorSpace = THREE.SRGBColorSpace;
    heightTexture.colorSpace = THREE.SRGBColorSpace;
    normalTexture.colorSpace = THREE.SRGBColorSpace;
    roughnessTexture.colorSpace = THREE.SRGBColorSpace;
    const geo = new THREE.BoxGeometry(2.0, 2.0, 2.0);
    const mat = new THREE.MeshStandardMaterial();
    mat.metalness = 0;
    mat.roughness = 1;
    mat.map = baseColorTexture;
    mat.aoMap = aoTexture;
    mat.aoMapIntensity = 1;
    mat.displacementMap = heightTexture;
    mat.displacementScale = 0.05;
    mat.roughnessMap = roughnessTexture;
    mat.normalMap = normalTexture;
    mat.normalScale.set(0.5, 0.5);
    this.material = mat;
    this.geometry = geo;
  }

  add(x, y) {
    const mesh = new THREE.Mesh(this.geometry.clone(), this.material.clone());
    this.scene.add(mesh);
    mesh.receiveShadow = true;
    const scale = 2.0;
    mesh.position.set(x * scale, -1.5 * scale, -y * scale);
  }
}

export { Quartz }