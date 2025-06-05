import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import Globe from './Globe'

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#1e4a7a" wireframe opacity={0.5} transparent />
    </mesh>
  )
}

export default function Earth() {
  const handleGlobeClick = (point) => {
    console.log('Clicked at point:', point)
    // Here we'll add country selection logic later
  }

  return (
    <div className="w-full h-full relative">
      {/* Background gradient for atmospheric effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#0A0A0F] pointer-events-none" />
      
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          logarithmicDepthBuffer: true,
          preserveDrawingBuffer: true
        }}
        camera={{
          position: [0, 0, 2.5],
          fov: 45,
          near: 0.1,
          far: 1000
        }}
      >
        <color attach="background" args={['#0A0A0F']} />
        
        <Suspense fallback={<LoadingFallback />}>
          {/* Increased ambient light intensity */}
          <ambientLight intensity={0.5} />
          
          {/* Brighter main directional light */}
          <directionalLight 
            position={[5, 3, 5]} 
            intensity={1.5}
            color="#ffffff"
          />
          
          {/* Brighter rim light */}
          <pointLight
            position={[-10, -10, -10]}
            intensity={0.8}
            color="#ffffff"
          />
          
          {/* Additional front light for better visibility */}
          <pointLight
            position={[0, 0, 5]}
            intensity={0.5}
            color="#ffffff"
          />
          
          <Globe onGlobeClick={handleGlobeClick} />
          
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={3}
            rotateSpeed={0.3}
            zoomSpeed={0.5}
            enableDamping={true}
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>

      {/* Loading overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-blue-400/70 text-lg opacity-0 animate-fade-out">
          Loading Earth...
        </div>
      </div>
    </div>
  )
} 