'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useRef, useState } from 'react'
import { Group, ShaderMaterial, Color } from 'three'
import Character from '../components/game/Character'

const BOUNDARY_SIZE = 20 // Match this with the Character component's boundary size

// Fire shader
const fireVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fireFragmentShader = `
  uniform float time;
  uniform vec3 color1;
  uniform vec3 color2;
  varying vec2 vUv;
  
  void main() {
    float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
    float timeNoise = fract(sin(time * 0.1) * 43758.5453);
    float fire = noise * timeNoise;
    
    vec3 color = mix(color1, color2, fire);
    gl_FragColor = vec4(color, 1.0);
  }
`

const Sun = () => {
  const sunRef = useRef<Group>(null)
  const fireMaterialRef = useRef<ShaderMaterial>(null)
  const [time, setTime] = useState(0)

  useFrame((_state: any, delta: number) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.1
    }
    if (fireMaterialRef.current) {
      setTime(prev => prev + delta)
      fireMaterialRef.current.uniforms.time.value = time
    }
  })

  return (
    <group ref={sunRef}>
      {/* Base sun sphere */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial
          color="#ff6600"
          emissive="#ff3300"
          emissiveIntensity={2}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      {/* Fire effect */}
      <mesh>
        <sphereGeometry args={[2.1, 32, 32]} />
        <shaderMaterial
          ref={fireMaterialRef}
          vertexShader={fireVertexShader}
          fragmentShader={fireFragmentShader}
          uniforms={{
            time: { value: 0 },
            color1: { value: new Color('#ff6600') },
            color2: { value: new Color('#ff3300') }
          }}
          transparent={true}
          opacity={0.8}
        />
      </mesh>
      {/* Glow effect */}
      <mesh>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshStandardMaterial
          color="#ff6600"
          emissive="#ff3300"
          emissiveIntensity={1}
          transparent={true}
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}

function CameraController({ characterRef }: { characterRef: React.RefObject<Group | null> }) {
  const cameraRef = useRef<PerspectiveCamera>(null)
  const targetPosition = new Vector3()
  const currentPosition = new Vector3()
  
  useFrame((state, delta) => {
    if (cameraRef.current && characterRef.current) {
      // Calculate target position high above the character
      const cameraOffset = new Vector3(0, 8, 5) // Adjusted position for better view
      targetPosition.copy(characterRef.current.position).add(cameraOffset)
      
      // Get current camera position
      currentPosition.copy(cameraRef.current.position)
      
      // Smoothly interpolate between current and target position
      currentPosition.lerp(targetPosition, delta * 2)
      
      // Update camera position
      cameraRef.current.position.copy(currentPosition)
      
      // Make camera look down at character
      const lookAtPosition = new Vector3()
      lookAtPosition.copy(characterRef.current.position)
      cameraRef.current.lookAt(lookAtPosition)
    }
  })

  return <perspectiveCamera ref={cameraRef} fov={60} />
}

function PlayAreaBorder() {
  return (
    <group>
      {/* Bottom border */}
      <mesh position={[0, 0, -BOUNDARY_SIZE]}>
        <boxGeometry args={[BOUNDARY_SIZE * 2, 0.1, 0.1]} />
        <meshStandardMaterial color="#4a4a8a" emissive="#1a1a3a" emissiveIntensity={0.5} />
      </mesh>
      {/* Top border */}
      <mesh position={[0, 0, BOUNDARY_SIZE]}>
        <boxGeometry args={[BOUNDARY_SIZE * 2, 0.1, 0.1]} />
        <meshStandardMaterial color="#4a4a8a" emissive="#1a1a3a" emissiveIntensity={0.5} />
      </mesh>
      {/* Left border */}
      <mesh position={[-BOUNDARY_SIZE, 0, 0]}>
        <boxGeometry args={[0.1, 0.1, BOUNDARY_SIZE * 2]} />
        <meshStandardMaterial color="#4a4a8a" emissive="#1a1a3a" emissiveIntensity={0.5} />
      </mesh>
      {/* Right border */}
      <mesh position={[BOUNDARY_SIZE, 0, 0]}>
        <boxGeometry args={[0.1, 0.1, BOUNDARY_SIZE * 2]} />
        <meshStandardMaterial color="#4a4a8a" emissive="#1a1a3a" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

const EarthOrbit = () => {
  const orbitRef = useRef<Group>(null)
  const earthRef = useRef<Group>(null)

  useFrame((_state: any, delta: number) => {
    if (orbitRef.current) {
      // Rotate the orbit around the sun
      orbitRef.current.rotation.y += delta * 0.2 // Adjust speed as needed
    }
    if (earthRef.current) {
      // Rotate the Earth on its axis
      earthRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <group ref={orbitRef}>
      {/* Position Earth at orbit radius */}
      <group position={[8, 0, 0]} ref={earthRef}>
        <Character />
      </group>
    </group>
  )
}

const MainScene = () => {
  return (
    <Canvas
      camera={{ position: [0, 15, 0], fov: 90 }}
      style={{ width: '100%', height: '100vh' }}
    >
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 10, 30]} />
      
      {/* Ambient light */}
      <ambientLight intensity={0.5} color="#ffffff" />
      
      {/* Directional lights */}
      <directionalLight
        position={[0, 20, 0]}
        intensity={3}
        color="#ffffff"
      />
      <directionalLight
        position={[0, -20, 0]}
        intensity={1}
        color="#ffffff"
      />
      
      {/* Hemisphere light */}
      <hemisphereLight
        intensity={0.8}
        groundColor="#1a1a3a"
        skyColor="#ffffff"
      />
      
      {/* Sun */}
      <Sun />
      
      {/* Earth in orbit */}
      <EarthOrbit />
      
      {/* Stars */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
      />
      
      {/* Controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        zoomSpeed={0.6}
        panSpeed={0.5}
        rotateSpeed={0.4}
        minPolarAngle={Math.PI / 2} // Prevent camera from going below horizontal
        maxPolarAngle={Math.PI / 2} // Keep camera looking straight down
      />
    </Canvas>
  )
}

export default MainScene 