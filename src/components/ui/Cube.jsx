"use client"
import React, { useRef } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { TextureLoader } from "three"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

function PinkCube() {
  const ref = useRef()
  const texture = useLoader(TextureLoader, "/pixel.png")

  // Rotate ONLY horizontally (Y-axis)
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.25
  })

  return (
    <group ref={ref}>
      {/* Main cube */}
      <mesh>
        <boxGeometry args={[3.2, 3.2, 3.2]} />
        <meshStandardMaterial
          map={texture}
          metalness={0.6}
          roughness={0.15}
          emissive="#ff69b4"
          emissiveIntensity={0.25}
          opacity={0.95}
          transparent
        />
      </mesh>

      {/* Metallic Pink Edges */}
      <lineSegments
        geometry={
          new THREE.EdgesGeometry(
            new THREE.BoxGeometry(3.25, 3.25, 3.25)
          )
        }
      >
        <lineBasicMaterial color="#ff85d6" linewidth={2} />
      </lineSegments>
    </group>
  )
}

export default function CubeCanvas() {
  return (
    <div style={{ width: "200px", height: "200px" }}>
      <Canvas>
        <ambientLight intensity={0.7} />
        <pointLight position={[4, 6, 4]} intensity={1.8} />

        <PinkCube />

        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={2}
          enableRotate={false}  // disables manual rotation
        />
      </Canvas>
    </div>
  )
}
