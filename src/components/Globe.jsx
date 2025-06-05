import { useRef, useMemo, useState, useEffect } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

export default function Globe({ onGlobeClick }) {
  const meshRef = useRef()
  const glowRef = useRef()
  const [isTextureLoaded, setIsTextureLoaded] = useState(false)
  const [material, setMaterial] = useState(null)

  // Basic material as fallback
  const basicMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: '#ffffff',
      shininess: 25,
      specular: new THREE.Color('#666666')
    })
  }, [])

  // Load textures in useEffect to prevent re-render loops
  useEffect(() => {
    let isMounted = true

    const loadTextures = async () => {
      try {
        const textureLoader = new THREE.TextureLoader()
        const loadTexture = (url) => {
          return new Promise((resolve, reject) => {
            textureLoader.load(url, resolve, undefined, reject)
          })
        }

        const [dayMap, nightMap] = await Promise.all([
          loadTexture('/textures/earth_daymap.jpg'),
          loadTexture('/textures/earth_nightmap.jpg')
        ])

        if (!isMounted) return

        // Configure textures
        ;[dayMap, nightMap].forEach(texture => {
          if (texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping
          }
        })

        // Create material only after textures are loaded
        const newMaterial = new THREE.MeshPhongMaterial({
          map: dayMap || nightMap,
          shininess: 25,
          specular: new THREE.Color('#666666'),
          emissive: new THREE.Color('#333333'),
          emissiveIntensity: 0.1
        })

        setMaterial(newMaterial)
        setIsTextureLoaded(true)
      } catch (error) {
        console.error('Error loading textures:', error)
        if (isMounted) {
          setMaterial(basicMaterial)
          setIsTextureLoaded(true)
        }
      }
    }

    loadTextures()

    return () => {
      isMounted = false
    }
  }, [basicMaterial])

  // Atmosphere glow material
  const glowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        c: { value: 0.5 },
        p: { value: 4.5 },
        glowColor: { value: new THREE.Color('#4477ff') },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float c;
        uniform float p;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
          gl_FragColor = vec4(glowColor, intensity);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    })
  }, [])

  // Second glow layer for enhanced effect
  const outerGlowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        c: { value: 0.3 },
        p: { value: 3.0 },
        glowColor: { value: new THREE.Color('#1a4dff') },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float c;
        uniform float p;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
          gl_FragColor = vec4(glowColor, intensity * 0.6);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    })
  }, [])

  // Don't render until material is ready
  if (!isTextureLoaded || !material) {
    return null
  }

  return (
    <group>
      {/* Outer atmosphere glow */}
      <mesh ref={glowRef} material={outerGlowMaterial}>
        <sphereGeometry args={[1.4, 64, 64]} />
      </mesh>

      {/* Inner atmosphere glow */}
      <mesh material={glowMaterial}>
        <sphereGeometry args={[1.2, 64, 64]} />
      </mesh>

      {/* Earth sphere */}
      <mesh 
        ref={meshRef}
        material={material}
        onClick={(e) => {
          e.stopPropagation()
          if (onGlobeClick) onGlobeClick(e.point)
        }}
      >
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>
    </group>
  )
} 