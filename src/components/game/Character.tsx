'use client'

import { useState, useEffect, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { useTexture } from '@react-three/drei'

const BOUNDARY_SIZE = 20 // Match with MainScene's boundary size
const MOVE_SPEED = 0.05 // Reduced speed for better boundary control

const Character = forwardRef<Group>((props, ref) => {
  const [keys, setKeys] = useState({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
  })
  
  // Load Earth textures
  const [earthMap, bumpMap, specularMap] = useTexture([
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg'
  ])
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key in keys) {
        setKeys(prev => ({ ...prev, [e.key]: true }))
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key in keys) {
        setKeys(prev => ({ ...prev, [e.key]: false }))
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
  
  useFrame((state, delta) => {
    if (ref && 'current' in ref && ref.current) {
      // Calculate new position first
      const newPosition = {
        x: ref.current.position.x,
        z: ref.current.position.z
      }
      
      // Update position based on keys
      if (keys.ArrowUp) {
        newPosition.z -= MOVE_SPEED
      }
      if (keys.ArrowDown) {
        newPosition.z += MOVE_SPEED
      }
      if (keys.ArrowLeft) {
        newPosition.x -= MOVE_SPEED
      }
      if (keys.ArrowRight) {
        newPosition.x += MOVE_SPEED
      }
      
      // Apply boundary constraints
      newPosition.x = Math.max(-BOUNDARY_SIZE, Math.min(BOUNDARY_SIZE, newPosition.x))
      newPosition.z = Math.max(-BOUNDARY_SIZE, Math.min(BOUNDARY_SIZE, newPosition.z))
      
      // Update position
      ref.current.position.x = newPosition.x
      ref.current.position.z = newPosition.z
      
      // Make face look at camera
      const camera = state.camera
      const direction = camera.position.clone().sub(ref.current.position)
      const angle = Math.atan2(direction.x, direction.z)
      ref.current.rotation.y = angle

      // Rotate the Earth
      ref.current.rotation.y += delta * 0.2 // Slow rotation
    }
  })

  return (
    <group ref={ref}>
      {/* Earth sphere with texture */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={earthMap}
          bumpMap={bumpMap}
          bumpScale={0.05}
          specularMap={specularMap}
          specular="#333333"
          shininess={5}
        />
      </mesh>
      {/* Atmosphere effect */}
      <mesh>
        <sphereGeometry args={[1.05, 64, 64]} />
        <meshStandardMaterial 
          color="#1a3a6a"
          emissive="#0a1a3a"
          emissiveIntensity={0.1}
          metalness={0}
          roughness={0.1}
          transparent={true}
          opacity={0.1}
          envMapIntensity={0.8}
        />
      </mesh>
      {/* Clouds */}
      <mesh>
        <sphereGeometry args={[1.02, 64, 64]} />
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#f0f0f0"
          emissiveIntensity={0.2}
          metalness={0}
          roughness={0.9}
          transparent={true}
          opacity={0.2}
          envMapIntensity={0.2}
        />
      </mesh>
      {/* Left Eye */}
      <mesh position={[-0.2, 0.3, 0.51]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Left Pupil */}
      <mesh position={[-0.2, 0.3, 0.52]}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      {/* Right Eye */}
      <mesh position={[0.2, 0.3, 0.51]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Right Pupil */}
      <mesh position={[0.2, 0.3, 0.52]}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      {/* Mouth Opening */}
      <mesh position={[0, -0.2, 0.51]}>
        <boxGeometry args={[0.6, 0.3, 0.1]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      {/* Upper Teeth */}
      <mesh position={[-0.25, -0.1, 0.52]}>
        <boxGeometry args={[0.08, 0.05, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.15, -0.1, 0.52]}>
        <boxGeometry args={[0.08, 0.05, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.05, -0.1, 0.52]}>
        <boxGeometry args={[0.08, 0.05, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.05, -0.1, 0.52]}>
        <boxGeometry args={[0.08, 0.05, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.15, -0.1, 0.52]}>
        <boxGeometry args={[0.08, 0.05, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.25, -0.1, 0.52]}>
        <boxGeometry args={[0.08, 0.05, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Lower Teeth */}
      <mesh position={[-0.25, -0.25, 0.52]}>
        <boxGeometry args={[0.08, 0.05, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.15, -0.25, 0.52]}>
        <boxGeometry args={[0.08, 0.05, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.05, -0.25, 0.52]}>
        <boxGeometry args={[0.08, 0.05, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.05, -0.25, 0.52]}>
        <boxGeometry args={[0.08, 0.05, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.15, -0.25, 0.52]}>
        <boxGeometry args={[0.08, 0.05, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.25, -0.25, 0.52]}>
        <boxGeometry args={[0.08, 0.05, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Tongue */}
      <mesh position={[0, -0.2, 0.52]}>
        <boxGeometry args={[0.3, 0.1, 0.05]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
    </group>
  )
})

Character.displayName = 'Character'

export default Character 