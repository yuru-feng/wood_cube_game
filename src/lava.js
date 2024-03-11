import * as THREE from 'three';
import basecolorUrl from '../resources/lava2/basecolor.jpg';
import ambientOcclusionUrl from '../resources/lava2/ambientOcclusion.jpg';
import heightUrl from '../resources/lava2/height.png';
import normalUrl from '../resources/lava2/normal.jpg';
import roughnessUrl from '../resources/lava2/roughness.jpg';

class Lava {
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
    console.log(baseColorTexture);
    baseColorTexture.colorSpace = THREE.SRGBColorSpace;
    aoTexture.colorSpace = THREE.SRGBColorSpace;
    heightTexture.colorSpace = THREE.SRGBColorSpace;
    normalTexture.colorSpace = THREE.SRGBColorSpace;
    roughnessTexture.colorSpace = THREE.SRGBColorSpace;
    const geo = new THREE.PlaneGeometry(2.0, 2.0);
    const mat = new THREE.MeshStandardMaterial();
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
    const geo = this.geometry.clone();
    const vertices = geo.attributes.position.array;
    const dx = 1 / 7.0 / 2.0;
    const cx = (x - 1) / 7.0 + dx;
    const cy = (y - 1) / 7.0 + dx;
    const uvPositions = [
      cx - dx, cy + dx, 
      cx + dx, cy + dx, 
      cx - dx, cy - dx,
      cx + dx, cy - dx];
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvPositions, 2 ));
    console.log(vertices);
    
    const mesh = new THREE.Mesh(geo, this.material.clone());
    this.scene.add(mesh);
    mesh.rotation.x = - Math.PI / 2.0;
    const scale = 2.0;
    mesh.position.set(x * scale, -scale, -y * scale);
  }
}

export { Lava }