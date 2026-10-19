import * as THREE from 'three';
import type { SkyState } from '../sky';
import {
  BARN_PAD_HEIGHT,
  forestDensity,
  seededRandom,
  smoothstep,
  terrainHeight,
} from './terrain';

/**
 * The 3D world behind the /experience page: a shader sky that follows the
 * scroll-driven time of day, fog-layered mountains, the barn on its hilltop
 * with windows that light up at dusk, a forest, fireflies, and a camera that
 * glides from a dawn vista down to the barn doors at night.
 */

export interface WorldOptions {
  /** Phones get fewer polygons, trees and pixels. */
  lite: boolean;
}

export interface WorldFrame {
  sky: SkyState;
  /** Whole-page scroll progress, 0 to 1. */
  progress: number;
  /** Pointer position, -1 to 1 on each axis. */
  pointer: { x: number; y: number };
}

const SKY_VERTEX = /* glsl */ `
  varying vec3 vDirection;
  void main() {
    vDirection = normalize(position);
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = clip.xyww;
  }
`;

const SKY_FRAGMENT = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uMiddle;
  uniform vec3 uBottom;
  uniform vec3 uSunDirection;
  uniform float uSunVisible;
  uniform float uGlow;
  uniform float uStars;
  uniform float uTime;
  varying vec3 vDirection;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  void main() {
    vec3 direction = normalize(vDirection);
    float height = direction.y;
    vec3 color = height < 0.0
      ? uBottom
      : height < 0.22
        ? mix(uBottom, uMiddle, height / 0.22)
        : mix(uMiddle, uTop, smoothstep(0.22, 0.85, height));

    float facing = max(dot(direction, uSunDirection), 0.0);
    vec3 warm = mix(vec3(1.0, 0.94, 0.82), vec3(1.0, 0.5, 0.25), uGlow);
    float halo = pow(facing, 6.0) * 0.28 + pow(facing, 48.0) * 0.55;
    color += warm * halo * uSunVisible * (0.55 + uGlow * 0.7);

    // A warm band along the horizon on the sun's side at golden hour.
    vec2 across = normalize(direction.xz + 1e-5);
    vec2 sunFlat = normalize(uSunDirection.xz + 1e-5);
    float band = exp(-abs(height) * 10.0) * pow(max(dot(across, sunFlat), 0.0), 3.0);
    color += warm * band * uGlow * clamp(uSunVisible + 0.35, 0.0, 1.0) * 0.32;

    float disk = smoothstep(0.99935, 0.99965, facing);
    color = mix(color, vec3(1.0, 0.97, 0.9), disk * uSunVisible);

    if (uStars > 0.01 && height > 0.0) {
      vec3 cell = floor(direction * 260.0);
      float pick = hash(cell);
      if (pick > 0.9955) {
        vec3 local = fract(direction * 260.0) - 0.5;
        float star = smoothstep(0.32, 0.0, length(local));
        float twinkle = 0.55 + 0.45 * sin(uTime * (0.8 + pick * 3.0) + pick * 60.0);
        color += vec3(star * twinkle * uStars * smoothstep(0.0, 0.18, height));
      }
    }

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

const FIREFLY_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aPhase;
  varying float vPulse;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.35 + aPhase * 6.0) * 2.2;
    p.y += sin(uTime * 0.6 + aPhase * 9.0) * 0.8;
    p.z += cos(uTime * 0.3 + aPhase * 4.0) * 2.2;
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * view;
    gl_PointSize = 16.0 * uPixelRatio * (40.0 / -view.z);
    vPulse = max(0.0, sin(uTime * 1.6 + aPhase * 30.0));
  }
`;

const FIREFLY_FRAGMENT = /* glsl */ `
  uniform float uOpacity;
  varying float vPulse;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.12, 0.0, d);
    vec3 color = mix(vec3(0.95, 0.78, 0.3), vec3(1.0, 0.96, 0.7), core);
    gl_FragColor = vec4(color, (glow * 0.6 + core) * vPulse * uOpacity);
  }
`;

const linear = (rgb: readonly [number, number, number], target: THREE.Color) =>
  target.setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, THREE.SRGBColorSpace);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Hand-painted barn doors: cedar planks with the X brace from the photos. */
const doorTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const g = canvas.getContext('2d');
  if (g) {
    g.fillStyle = '#b8743d';
    g.fillRect(0, 0, 256, 256);
    for (let x = 0; x < 256; x += 21) {
      g.fillStyle = x % 42 === 0 ? '#a9672f' : '#c27f45';
      g.fillRect(x, 0, 20, 256);
    }
    g.strokeStyle = '#d99a5c';
    g.lineWidth = 18;
    g.strokeRect(9, 9, 238, 238);
    g.beginPath();
    g.moveTo(128, 0);
    g.lineTo(128, 256);
    g.moveTo(14, 14);
    g.lineTo(242, 242);
    g.moveTo(242, 14);
    g.lineTo(14, 242);
    g.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

export class World {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(42, 1, 0.5, 2400);
  private readonly fog = new THREE.FogExp2(0xffffff, 0.0024);
  private readonly sky: THREE.Mesh<THREE.SphereGeometry, THREE.ShaderMaterial>;
  private readonly sun = new THREE.DirectionalLight(0xffffff, 2);
  private readonly moon = new THREE.DirectionalLight(0x9fb4ff, 0);
  private readonly hemisphere = new THREE.HemisphereLight(
    0xffffff,
    0x3a3826,
    0.8
  );
  private readonly porchLight = new THREE.PointLight(0xffc477, 0, 60, 1.6);
  private readonly windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x1b1d22,
    emissive: new THREE.Color(0xffc56b),
    emissiveIntensity: 0,
  });
  private readonly bulbMaterial = new THREE.MeshBasicMaterial({
    color: 0xfff1c4,
    transparent: true,
    opacity: 0,
  });
  private readonly fireflies: THREE.Points<
    THREE.BufferGeometry,
    THREE.ShaderMaterial
  >;
  private readonly path: THREE.CatmullRomCurve3;
  private readonly aim: THREE.CatmullRomCurve3;
  private readonly timer = new THREE.Timer();
  private readonly disposables: Array<{ dispose: () => void }> = [];
  private progress = 0;
  private drawn = false;
  private lastSky: SkyState | null = null;
  private pointerX = 0;
  private pointerY = 0;
  private readonly sunDirection = new THREE.Vector3();
  private readonly scratch = new THREE.Color();
  private readonly lookTarget = new THREE.Vector3();

  constructor(
    canvas: HTMLCanvasElement,
    private readonly options: WorldOptions
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !options.lite,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.scene.fog = this.fog;

    this.sky = this.buildSky();
    this.scene.add(this.sky);
    this.scene.add(this.buildTerrain());
    this.scene.add(this.buildForest());
    this.scene.add(this.buildBarn());
    this.fireflies = this.buildFireflies();
    this.scene.add(this.fireflies);

    this.sun.position.set(0, 100, -200);
    this.moon.position.set(-120, 160, 80);
    this.porchLight.position.set(0, BARN_PAD_HEIGHT + 3, 13);
    this.scene.add(this.sun, this.moon, this.hemisphere, this.porchLight);

    // Dawn vista, a descent over the fields, a slow orbit of the barn, and
    // finally the front doors at night with the ridges behind.
    const y = BARN_PAD_HEIGHT;
    this.path = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(10, y + 70, 190),
        new THREE.Vector3(70, y + 34, 120),
        new THREE.Vector3(78, y + 14, 46),
        new THREE.Vector3(30, y + 9, 52),
        new THREE.Vector3(-48, y + 11, 44),
        new THREE.Vector3(-40, y + 7, 30),
        new THREE.Vector3(-8, y + 5, 46),
        new THREE.Vector3(0, y + 4.5, 40),
      ],
      false,
      'centripetal'
    );
    this.aim = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, y + 48, -260),
        new THREE.Vector3(0, y + 18, -60),
        new THREE.Vector3(0, y + 9, -10),
        new THREE.Vector3(0, y + 8, -6),
        new THREE.Vector3(0, y + 8, -6),
        new THREE.Vector3(0, y + 7.5, -4),
        new THREE.Vector3(0, y + 8, -20),
        new THREE.Vector3(0, y + 9, -40),
      ],
      false,
      'centripetal'
    );
    this.resize();
  }

  private track<T extends { dispose: () => void }>(item: T): T {
    this.disposables.push(item);
    return item;
  }

  private buildSky() {
    const material = this.track(
      new THREE.ShaderMaterial({
        vertexShader: SKY_VERTEX,
        fragmentShader: SKY_FRAGMENT,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        toneMapped: false,
        uniforms: {
          uTop: { value: new THREE.Color() },
          uMiddle: { value: new THREE.Color() },
          uBottom: { value: new THREE.Color() },
          uSunDirection: { value: new THREE.Vector3(0, 0.2, -1) },
          uSunVisible: { value: 1 },
          uGlow: { value: 0.5 },
          uStars: { value: 0 },
          uTime: { value: 0 },
        },
      })
    );
    const mesh = new THREE.Mesh(
      this.track(new THREE.SphereGeometry(1800, 48, 24)),
      material
    );
    mesh.renderOrder = -1;
    mesh.frustumCulled = false;
    return mesh;
  }

  private buildTerrain() {
    const segments = this.options.lite ? 140 : 230;
    const geometry = this.track(
      new THREE.PlaneGeometry(2600, 2600, segments, segments)
    );
    geometry.rotateX(-Math.PI / 2);
    const positions = geometry.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(positions.count * 3);
    const meadow = new THREE.Color('#8b9f62');
    const forest = new THREE.Color('#4a5b39');
    const rock = new THREE.Color('#77736a');
    const mixed = new THREE.Color();
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const height = terrainHeight(x, z);
      positions.setY(i, height);
      mixed
        .copy(meadow)
        .lerp(forest, Math.max(forestDensity(x, z), smoothstep(10, 40, height)))
        .lerp(rock, smoothstep(90, 170, height) * 0.7);
      colors.set([mixed.r, mixed.g, mixed.b], i * 3);
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    const material = this.track(
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 1,
        metalness: 0,
        flatShading: true,
      })
    );
    return new THREE.Mesh(geometry, material);
  }

  private buildForest() {
    const count = this.options.lite ? 700 : 2400;
    const cone = this.track(new THREE.ConeGeometry(1.6, 6, 6));
    cone.translate(0, 3, 0);
    const material = this.track(
      new THREE.MeshStandardMaterial({
        color: '#3f5236',
        roughness: 1,
        flatShading: true,
      })
    );
    const trees = new THREE.InstancedMesh(cone, material, count);
    const random = seededRandom(1977);
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const position = new THREE.Vector3();
    const tint = new THREE.Color();
    let placed = 0;
    for (
      let attempt = 0;
      attempt < count * 12 && placed < count;
      attempt += 1
    ) {
      const x = (random() - 0.5) * 1400;
      const z = (random() - 0.5) * 1300 - 220;
      if (random() > forestDensity(x, z)) continue;
      const size = 0.7 + random() * 1.1;
      position.set(x, terrainHeight(x, z) - 0.4, z);
      quaternion.setFromAxisAngle(
        THREE.Object3D.DEFAULT_UP,
        random() * Math.PI
      );
      scale.set(size, size * (0.8 + random() * 0.6), size);
      trees.setMatrixAt(placed, matrix.compose(position, quaternion, scale));
      trees.setColorAt(
        placed,
        tint.set('#3f5236').offsetHSL(0, 0, (random() - 0.5) * 0.08)
      );
      placed += 1;
    }
    trees.count = placed;
    return trees;
  }

  private buildBarn() {
    const barn = new THREE.Group();
    const wall = this.track(
      new THREE.MeshStandardMaterial({ color: '#2b3033', roughness: 0.9 })
    );
    const roof = this.track(
      new THREE.MeshStandardMaterial({
        color: '#3d444c',
        roughness: 0.55,
        metalness: 0.35,
      })
    );
    const cedar = this.track(
      new THREE.MeshStandardMaterial({ color: '#a8693a', roughness: 0.8 })
    );
    const doors = this.track(
      new THREE.MeshStandardMaterial({
        map: this.track(doorTexture()),
        roughness: 0.75,
        emissive: new THREE.Color('#ffb35c'),
        emissiveIntensity: 0,
      })
    );
    this.disposables.push(this.windowMaterial, this.bulbMaterial);

    // Gambrel body, extruded front to back.
    const profile = new THREE.Shape();
    profile.moveTo(-6, 0);
    profile.lineTo(-6, 5);
    profile.lineTo(-4.5, 8);
    profile.lineTo(0, 9.6);
    profile.lineTo(4.5, 8);
    profile.lineTo(6, 5);
    profile.lineTo(6, 0);
    profile.closePath();
    const body = new THREE.Mesh(
      this.track(
        new THREE.ExtrudeGeometry(profile, { depth: 18, bevelEnabled: false })
      ),
      wall
    );
    body.position.z = -9;
    barn.add(body);

    // A metal roof that overhangs the walls.
    const outer = [
      [-6.5, 4.9],
      [-4.8, 8.35],
      [0, 10.05],
      [4.8, 8.35],
      [6.5, 4.9],
    ] as const;
    const inner = [
      [6.05, 5],
      [4.5, 8.05],
      [0, 9.65],
      [-4.5, 8.05],
      [-6.05, 5],
    ] as const;
    const roofShape = new THREE.Shape();
    roofShape.moveTo(outer[0][0], outer[0][1]);
    for (const [x, y] of outer.slice(1)) roofShape.lineTo(x, y);
    for (const [x, y] of inner) roofShape.lineTo(x, y);
    roofShape.closePath();
    const roofMesh = new THREE.Mesh(
      this.track(
        new THREE.ExtrudeGeometry(roofShape, {
          depth: 19.4,
          bevelEnabled: false,
        })
      ),
      roof
    );
    roofMesh.position.z = -9.7;
    barn.add(roofMesh);

    // Cupolas on the ridge.
    const cupolaBox = this.track(new THREE.BoxGeometry(1.5, 1.6, 1.5));
    const cupolaCap = this.track(new THREE.ConeGeometry(1.3, 1, 4));
    for (const z of [-4.5, 4.5]) {
      const box = new THREE.Mesh(cupolaBox, wall);
      box.position.set(0, 10.4, z);
      const cap = new THREE.Mesh(cupolaCap, roof);
      cap.position.set(0, 11.7, z);
      cap.rotation.y = Math.PI / 4;
      const light = new THREE.Mesh(
        this.track(new THREE.PlaneGeometry(0.8, 0.7)),
        this.windowMaterial
      );
      light.position.set(0, 10.45, z + 0.76);
      barn.add(box, cap, light);
    }

    // Big sliding doors, the hayloft balcony door, and lit windows.
    const front = new THREE.Mesh(
      this.track(new THREE.PlaneGeometry(4.6, 4.6)),
      doors
    );
    front.position.set(0, 2.3, 9.02);
    const loft = new THREE.Mesh(
      this.track(new THREE.PlaneGeometry(2.2, 2)),
      doors
    );
    loft.position.set(0, 6.6, 9.02);
    barn.add(front, loft);
    const balcony = new THREE.Mesh(
      this.track(new THREE.BoxGeometry(4, 0.2, 1.4)),
      cedar
    );
    balcony.position.set(0, 5.5, 9.7);
    barn.add(balcony);
    const windowGeometry = this.track(new THREE.PlaneGeometry(1.1, 1.4));
    for (const z of [-6, -2, 2, 6]) {
      for (const side of [-1, 1]) {
        const pane = new THREE.Mesh(windowGeometry, this.windowMaterial);
        pane.position.set(side * 6.02, 3, z);
        pane.rotation.y = (side * Math.PI) / 2;
        barn.add(pane);
      }
    }
    for (const x of [-3.6, 3.6]) {
      const pane = new THREE.Mesh(windowGeometry, this.windowMaterial);
      pane.position.set(x, 6.4, 9.02);
      barn.add(pane);
    }

    // The covered porch along one side: deck, posts, shed roof, string lights.
    const deck = new THREE.Mesh(
      this.track(new THREE.BoxGeometry(4.6, 0.5, 19)),
      cedar
    );
    deck.position.set(8.3, 0.6, 0);
    const shed = new THREE.Mesh(
      this.track(new THREE.BoxGeometry(5.2, 0.25, 19.6)),
      roof
    );
    shed.position.set(8.5, 4.5, 0);
    shed.rotation.z = -0.16;
    barn.add(deck, shed);
    const post = this.track(new THREE.CylinderGeometry(0.16, 0.16, 3.8, 6));
    for (let z = -9; z <= 9; z += 3.6) {
      const column = new THREE.Mesh(post, cedar);
      column.position.set(10.4, 2.6, z);
      barn.add(column);
    }
    const bulbs = new THREE.InstancedMesh(
      this.track(new THREE.SphereGeometry(0.12, 6, 4)),
      this.bulbMaterial,
      34
    );
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < 34; i += 1) {
      const z = -9.5 + (i / 33) * 19;
      const sag = Math.sin(((z + 9.5) / 3.8) * Math.PI) * 0.25;
      bulbs.setMatrixAt(
        i,
        matrix.makeTranslation(10.6, 3.95 - Math.abs(sag), z)
      );
    }
    barn.add(bulbs);

    barn.position.y = BARN_PAD_HEIGHT;
    barn.rotation.y = -0.22;
    return barn;
  }

  private buildFireflies() {
    const count = this.options.lite ? 60 : 160;
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const random = seededRandom(424242);
    for (let i = 0; i < count; i += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 10 + random() * 46;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius + 8;
      positions.set([x, terrainHeight(x, z) + 0.6 + random() * 4.5, z], i * 3);
      phases[i] = random();
    }
    const geometry = this.track(new THREE.BufferGeometry());
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    const material = this.track(
      new THREE.ShaderMaterial({
        vertexShader: FIREFLY_VERTEX,
        fragmentShader: FIREFLY_FRAGMENT,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uOpacity: { value: 0 },
        },
      })
    );
    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    return points;
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const ratio = Math.min(
      window.devicePixelRatio || 1,
      this.options.lite ? 1.25 : 1.75
    );
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    // Keep the landscape framed on tall phone screens.
    this.camera.fov = width < height ? 58 : 42;
    this.camera.updateProjectionMatrix();
    this.fireflies.material.uniforms.uPixelRatio.value = ratio;
  }

  /**
   * Draws a frame only when something on screen would change: the camera
   * is still easing, the sky moved, the pointer moved, or it is dark enough
   * for twinkling stars and fireflies. A still daytime page costs nothing.
   */
  render({ sky, progress, pointer }: WorldFrame) {
    const animating = sky.stars > 0.02 || sky.fireflies > 0.02;
    const easing =
      Math.abs(progress - this.progress) > 0.0002 ||
      Math.abs(pointer.x - this.pointerX) > 0.002 ||
      Math.abs(pointer.y - this.pointerY) > 0.002;
    if (this.drawn && !animating && !easing && sky === this.lastSky) return;
    this.drawn = true;
    this.lastSky = sky;
    this.timer.update();
    const time = this.timer.getElapsed();
    const night = sky.stars;
    const uniforms = this.sky.material.uniforms;
    linear(sky.top, uniforms.uTop.value);
    linear(sky.middle, uniforms.uMiddle.value);
    linear(sky.bottom, uniforms.uBottom.value);
    linear(sky.bottom, this.fog.color);

    // Sun across the far side of the valley: left at dawn, right at sunset.
    this.sunDirection
      .set((sky.sunX - 0.5) * 2.4, sky.sun * 1.1 - 0.05, -1)
      .normalize();
    uniforms.uSunDirection.value.copy(this.sunDirection);
    uniforms.uSunVisible.value = smoothstep(-0.12, 0.08, sky.sun);
    uniforms.uGlow.value = sky.glow;
    uniforms.uStars.value = night;
    uniforms.uTime.value = time;

    const daylight = smoothstep(-0.1, 0.35, sky.sun);
    this.sun.position.copy(this.sunDirection).multiplyScalar(300);
    this.sun.color.set('#fff3dc').lerp(this.scratch.set('#ff9a55'), sky.glow);
    this.sun.intensity = daylight * 2.6;
    this.moon.intensity = night * 0.55;
    linear(sky.middle, this.hemisphere.color);
    this.hemisphere.intensity = lerp(0.35, 0.95, daylight);
    this.fog.density = lerp(0.0024, 0.0019, night);

    // Lights come on through dusk.
    const lit = smoothstep(0.1, 0.8, night + sky.glow * 0.35 - 0.2);
    this.windowMaterial.emissiveIntensity = lit * 2.4;
    this.bulbMaterial.opacity = smoothstep(0.35, 0.9, sky.glow + night * 0.5);
    this.porchLight.intensity = lit * 90;
    this.fireflies.material.uniforms.uOpacity.value = sky.fireflies;
    this.fireflies.material.uniforms.uTime.value = time;

    // Ease toward the scroll position so the camera glides, never jumps.
    this.progress += (progress - this.progress) * 0.06;
    this.pointerX += (pointer.x - this.pointerX) * 0.05;
    this.pointerY += (pointer.y - this.pointerY) * 0.05;
    const t = Math.min(1, Math.max(0, this.progress));
    this.path.getPointAt(t, this.camera.position);
    this.aim.getPointAt(t, this.lookTarget);
    this.camera.position.x += this.pointerX * 3;
    this.camera.position.y += this.pointerY * 1.5;
    // Through the middle chapters, keep the barn right of centre on wide
    // screens, away from the copy, which mostly sits on the left.
    const middle = smoothstep(0.06, 0.2, t) * (1 - smoothstep(0.85, 0.97, t));
    this.lookTarget.x *= 1 - middle;
    this.lookTarget.z *= 1 - middle;
    this.camera.lookAt(this.lookTarget);
    if (this.camera.aspect > 1) {
      const halfWidth =
        Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) *
        this.camera.aspect;
      this.camera.rotateOnWorldAxis(
        THREE.Object3D.DEFAULT_UP,
        Math.atan(0.42 * halfWidth) * middle
      );
    }
    this.sky.position.copy(this.camera.position);

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    for (const item of this.disposables) item.dispose();
    this.renderer.dispose();
  }
}
