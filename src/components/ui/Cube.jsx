"use client"
import React, { useRef } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { TextureLoader } from "three"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

function PinkCube() {
  const ref = useRef()

  // Rotate smoothly on Y-axis
  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.5
    ref.current.rotation.x += delta * 0.2
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[3.2, 3.2, 3.2]} />
      <meshStandardMaterial
        color="#ff00ff"
        emissive="#ff00ff"
        emissiveIntensity={0.4}
        roughness={0.2}
        metalness={0.8}
        wireframe
      />
    </mesh>
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
