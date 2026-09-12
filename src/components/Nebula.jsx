import { useMemo } from 'react'
import * as THREE from 'three'

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  varying vec3 vDir;
  uniform vec3 uTop;
  uniform vec3 uBottom;
  uniform vec3 uGlowA;
  uniform vec3 uGlowB;
  uniform vec3 uDirA;
  uniform vec3 uDirB;

  void main() {
    vec3 d = normalize(vDir);
    float t = smoothstep(-0.3, 0.9, d.y);
    vec3 col = mix(uBottom, uTop, t);
    col += uGlowA * pow(max(dot(d, uDirA), 0.0), 5.0) * 0.6;
    col += uGlowB * pow(max(dot(d, uDirB), 0.0), 7.0) * 0.5;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export default function Nebula() {
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color('#1a1040') },
      uBottom: { value: new THREE.Color('#05060f') },
      uGlowA: { value: new THREE.Color('#3b1f7a') },
      uGlowB: { value: new THREE.Color('#0d4a5c') },
      uDirA: { value: new THREE.Vector3(-0.6, 0.35, -0.7).normalize() },
      uDirB: { value: new THREE.Vector3(0.7, 0.2, 0.6).normalize() },
    }),
    []
  )

  return (
    <mesh scale={150} frustumCulled={false}>
      <sphereGeometry args={[1, 32, 16]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}
