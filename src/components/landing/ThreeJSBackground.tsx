/* eslint-disable react/no-unknown-property */
import React, { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text3D, Center, RoundedBox, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Global variables for shared melt uniforms and lerp targets
const targetMouse = new THREE.Vector3(9999, 9999, 9999);
const currentMouse = new THREE.Vector3(9999, 9999, 9999);

const meltUniforms = {
  uMouse: { value: new THREE.Vector3(9999, 9999, 9999) },
  uTime: { value: 0 },
  uRadius: { value: 1.2 },
  uStrength: { value: 0.55 },
};

const meltParsVertex = `
  uniform vec3 uMouse;
  uniform float uTime;
  uniform float uRadius;
  uniform float uStrength;

  float liquid(float t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
  }

  vec3 melt(vec3 pos, vec3 worldPos) {
    float dist = distance(worldPos, uMouse);
    float t = 1.0 - clamp(dist / uRadius, 0.0, 1.0);
    float influence = liquid(t);

    float drip = influence * uStrength;
    pos.y -= drip;

    float lateral = sin(uTime * 0.8) * influence * 0.08;
    pos.x += lateral;

    vec3 dir = worldPos - uMouse;
    float bulge = influence * 0.1;
    pos += normalize(dir + 0.001) * bulge;

    return pos;
  }
`;

const meltVertex = `
  vec4 meltWorldPos = modelMatrix * vec4(position, 1.0);
  transformed = melt(transformed, meltWorldPos.xyz);
`;

function LiquidCube({ cubeRef }: { cubeRef: React.RefObject<THREE.Mesh | null> }) {
  const [hovered, setHovered] = useState(false);
  const { viewport } = useThree();
  
  // Scale down the cube size on narrow viewports to match typography scaling
  const scaleFactor = Math.min(1.1, (viewport.width / 6.5) * 1.1);

  useFrame((state) => {
    if (!cubeRef.current) return;
    const t = state.clock.getElapsedTime();
    // Continuous rotation as in CodePen
    cubeRef.current.rotation.y = t * 0.25;
    cubeRef.current.rotation.x = t * 0.2;
  });

  return (
    <RoundedBox 
      ref={cubeRef} 
      args={[1.5 * scaleFactor, 1.5 * scaleFactor, 1.5 * scaleFactor]} 
      radius={0.09 * scaleFactor} 
      smoothness={80} // High subdivisions for smooth vertex melting
      position={[0, 0, 0.7]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshPhysicalMaterial 
        envMapIntensity={hovered ? 0.85 : 0.5}
        metalness={0}
        roughness={0}
        thickness={1.0275}
        transmission={1}
        ior={2.2566}
        iridescence={0.3486}
        iridescenceIOR={1.2025}
        iridescenceThicknessRange={[100, 800]}
        color="#ffffff"
        onBeforeCompile={(shader) => {
          shader.uniforms.uMouse = meltUniforms.uMouse;
          shader.uniforms.uTime = meltUniforms.uTime;
          shader.uniforms.uRadius = meltUniforms.uRadius;
          shader.uniforms.uStrength = meltUniforms.uStrength;

          shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `#include <common>\n${meltParsVertex}`
          );

          shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>\n${meltVertex}`
          );
        }}
      />
    </RoundedBox>
  );
}

function Typography() {
  const words = ["Visualize", "your", "flows"];
  const lineHeight = 1.0;
  const totalHeight = (words.length - 1) * lineHeight;
  const { viewport } = useThree();
  
  // Responsive scaling factor based on the three.js viewport width
  // This prevents the text from clipping on narrow screens (e.g. mobile)
  const scaleFactor = Math.min(1.1, (viewport.width / 6.5) * 1.1);

  return (
    <group position={[0, (totalHeight / 2) * scaleFactor, 0]} scale={scaleFactor}>
      {words.map((word, i) => (
        <group key={word} position={[0, -i * lineHeight, 0]}>
          <Center>
            <Text3D
              font="/fonts/helvetiker_regular.typeface.json"
              size={0.9}
              height={0.01}
              curveSegments={20}
              bevelEnabled={false}
            >
              {word}
              <meshBasicMaterial 
                color="#ffffff"
                onBeforeCompile={(shader) => {
                  shader.uniforms.uMouse = meltUniforms.uMouse;
                  shader.uniforms.uTime = meltUniforms.uTime;
                  shader.uniforms.uRadius = meltUniforms.uRadius;
                  shader.uniforms.uStrength = meltUniforms.uStrength;

                  shader.vertexShader = shader.vertexShader.replace(
                    '#include <common>',
                    `#include <common>\n${meltParsVertex}`
                  );

                  shader.vertexShader = shader.vertexShader.replace(
                    '#include <begin_vertex>',
                    `#include <begin_vertex>\n${meltVertex}`
                  );
                }}
              />
            </Text3D>
          </Center>
        </group>
      ))}
    </group>
  );
}

function MouseTracker({ cubeRef }: { cubeRef: React.RefObject<THREE.Mesh | null> }) {
  const { camera } = useThree();

  useEffect(() => {
    const handleMouseLeave = () => {
      targetMouse.set(9999, 9999, 9999);
    };
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => window.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  useFrame((state) => {
    const raycaster = state.raycaster;
    raycaster.setFromCamera(state.pointer, camera);

    if (cubeRef.current) {
      const intersects = raycaster.intersectObject(cubeRef.current);
      if (intersects.length > 0) {
        targetMouse.copy(intersects[0].point);
      } else {
        // Project onto the plane at z = 0.7
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.7);
        const mouseWorld = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, mouseWorld);
        targetMouse.copy(mouseWorld);
      }
    }

    // Smooth viscous easing
    currentMouse.lerp(targetMouse, 0.025);
    meltUniforms.uMouse.value.copy(currentMouse);
    meltUniforms.uTime.value = state.clock.getElapsedTime();
  });

  return null;
}

export function ThreeJSBackground() {
  const cubeRef = useRef<THREE.Mesh>(null);

  return (
    <div className="absolute inset-0 z-0 pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <color attach="background" args={['#000']} />
        
        {/* Subtle ambient light */}
        <ambientLight intensity={0.5} />
        
        {/* Directional light to give some highlights */}
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <directionalLight position={[-10, -10, -10]} intensity={0.5} color="#ffffff" />

        <Suspense fallback={null}>
          <Typography />
          <LiquidCube cubeRef={cubeRef} />
          <MouseTracker cubeRef={cubeRef} />
          
          {/* Procedural local Environment map for premium glass reflection (offline-friendly) */}
          <Environment resolution={512}>
            <color attach="background" args={['#000000']} />
            
            {/* Bright light panels/spheres to create crisp glossy reflections on the cube */}
            <mesh position={[5, 5, 5]} scale={[2, 2, 2]}>
              <sphereGeometry />
              <meshBasicMaterial color="#ffffff" toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[-5, 5, -5]} scale={[3, 3, 3]}>
              <sphereGeometry />
              <meshBasicMaterial color="#ffffff" toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, -5, 5]} scale={[2, 2, 2]}>
              <sphereGeometry />
              <meshBasicMaterial color="#ffffff" toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[5, -5, -5]} scale={[3, 3, 3]}>
              <sphereGeometry />
              <meshBasicMaterial color="#ffffff" toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
          </Environment>
        </Suspense>
      </Canvas>
    </div>
  );
}

