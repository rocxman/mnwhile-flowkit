import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, MeshTransmissionMaterial, RoundedBox, Environment } from '@react-three/drei';
import * as THREE from 'three';

function LiquidCube() {
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const [hovered, setHovered] = useState(false);

  // Responsive size based on viewport
  const size = Math.min(viewport.width, viewport.height) * 0.35;

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime();
    
    // Smooth, liquid-like rotation and float
    mesh.current.rotation.x = Math.sin(t / 4) / 2;
    mesh.current.rotation.y = t * 0.2;
    mesh.current.position.y = Math.sin(t / 1.5) / 10;

    // Interactive mouse rotation tracking
    const targetX = (state.pointer.x * viewport.width) / 10;
    const targetY = (state.pointer.y * viewport.height) / 10;
    
    mesh.current.rotation.z += (targetX - mesh.current.rotation.z) * 0.05;
    mesh.current.position.x += (targetX - mesh.current.position.x) * 0.02;
    mesh.current.position.y += (targetY - mesh.current.position.y) * 0.02;
  });

  return (
    <RoundedBox 
      ref={mesh} 
      args={[size, size, size]} 
      radius={size * 0.15} 
      smoothness={16}
      position={[0, 0, 2]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <MeshTransmissionMaterial 
        backside
        backsideThickness={1}
        thickness={size * 0.5}
        chromaticAberration={0.06}
        anisotropicBlur={0.1}
        clearcoat={1}
        clearcoatRoughness={0.1}
        envMapIntensity={hovered ? 2.5 : 1.5}
        resolution={1024}
        transmission={1}
        roughness={0}
        ior={1.5}
        color="#ffffff"
      />
    </RoundedBox>
  );
}

function Typography() {
  const { viewport } = useThree();
  const fontSize = Math.min(viewport.width, viewport.height) * 0.22;
  
  return (
    <Text 
      position={[0, 0, -2]} 
      fontSize={fontSize} 
      letterSpacing={-0.08} 
      lineHeight={0.85} 
      font="/fonts/inter/inter-400-700-latin.woff2"
      color="white"
      textAlign="center"
      anchorX="center"
      anchorY="middle"
    >
      {`Explore\nnew\nideas`}
    </Text>
  );
}

export function ThreeJSBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 10], fov: 40 }}>
        <color attach="background" args={['#000']} />
        
        {/* Subtle ambient light */}
        <ambientLight intensity={0.5} />
        
        {/* Directional light to give some highlights */}
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[-10, -10, -10]} intensity={0.5} color="#4444ff" />

        <Typography />
        <LiquidCube />
        
        {/* Environment map for realistic glass reflection */}
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
