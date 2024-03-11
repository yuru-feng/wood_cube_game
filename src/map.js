import { Lava } from './lava.js';
import { Quartz } from './quartz.js';
import { Ice } from './ice.js';

class Map {
  #positionArr;
  #objectArr;
  #map;
  #lavaMap;
  #iceMap;
  #win;
  #start;
  pair(x,y) {
    return x + ',' + y;
  }
  constructor(scene) {
    this.scene = scene;
    this.#map = [
      [1, 1, 1, 1, 1, 1, 0, 0, 0],
      [1, 2, 2, 2, 2, 2, 2, 2, 0],
      [1, 2, 3, 3, 3, 3, 2, 2, 1],
      [1, 2, 3, 3, 3, 3, 3, 2, 1],
      [1, 2, 3, 5, 3, 3, 3, 2, 1],
      [1, 2, 3, 4, 4, 2, 2, 2, 0],
      [1, 2, 2, 2, 2, 2, 1, 1, 0],
      [1, 1, 1, 1, 1, 0, 0, 0, 0]
    ];
    this.#lavaMap = new Set();
    this.#iceMap = new Set();
    this.#win = [];
    this.#start = [];
    for (let i = 0; i < this.#map.length; i++) {
      for (let j = 0; j < this.#map[i].length; j++) {
        switch(this.#map[i][j]) {
          case 2:this.#lavaMap.add(this.pair(i, j));break;
          case 3:this.#iceMap.add(this.pair(i, j));break;
          case 4:this.#iceMap.add(this.pair(i, j));
                 this.#start.push([i, j]);break;
          case 5:this.#win.push([i, j]);break;
          default:break;
        }
      }
    }
  }
  async load() {
    const lava = new Lava(this.scene);
    await lava.load();
    const quartz = new Quartz(this.scene);
    await quartz.load();
    const ice = new Ice(this.scene);
    await ice.load();
    for (let i = 0; i < this.#map.length; i++) {
      for (let j = 0; j < this.#map[i].length; j++) {
        switch(this.#map[i][j]) {
          case 0:quartz.add(i, j);break;
          case 1:quartz.add(i, j);break;
          case 2:lava.add(i, j);break;
          case 3:ice.add(i, j);break;
          case 4:ice.add(i, j);break;
          default:break;
        }
      }
    }
  }
  isLava(x, y) {
    return this.#lavaMap.has(this.pair(x, y));
  }
  isIce(x, y) {
    return this.#iceMap.has(this.pair(x, y));
  }
  isWin(x, y) {
    for (let i = 0; i < this.#win.length; i++) {
      if (x == this.#win[i][0] && y == this.#win[i][1]) {
        return true;
      }
    }
    return false;
  }
  getStart() {
    return this.#start;
  }
}

export { Map }