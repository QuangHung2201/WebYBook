import { Component, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useProgress } from '@react-three/drei';
import './Hero3D.css';

const MODEL_URL = '/book_stack.glb';

useGLTF.preload(MODEL_URL);

/**
 * Tải mô hình 3D tĩnh từ /book_stack.glb.
 * `useGLTF` sẽ "suspend" cho tới khi file tải xong, nhờ vậy phần còn lại
 * của trang chủ vẫn render bình thường.
 */
function HeroModel() {
  const { scene } = useGLTF(MODEL_URL);

  return (
    <group position={[0, -0.35, 0]} scale={2}>
      <primitive object={scene} />
    </group>
  );
}

/**
 * Mô hình dự phòng bằng hình khối cơ bản, dùng khi file .glb không tải được
 * để banner vẫn có nội dung 3D thay vì trống trơn.
 */
function PlaceholderModel() {
  return (
    <group position={[0, -0.35, 0]} scale={0.6}>
      <mesh position={[0, 0.28, 0]} rotation={[0, 0.12, 0]}>
        <boxGeometry args={[2.6, 0.56, 3.6]} />
        <meshStandardMaterial color="#0f766e" roughness={0.55} metalness={0.12} />
      </mesh>
      <mesh position={[-0.06, 0.81, 0.04]} rotation={[0, -0.22, 0]}>
        <boxGeometry args={[2.36, 0.5, 3.3]} />
        <meshStandardMaterial color="#e8590c" roughness={0.55} metalness={0.12} />
      </mesh>
      <mesh position={[0.04, 1.29, -0.02]} rotation={[0, 0.34, 0]}>
        <boxGeometry args={[2.1, 0.46, 3.0]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.55} metalness={0.12} />
      </mesh>
    </group>
  );
}

class ModelErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn('[Hero3D] Không thể tải mô hình 3D:', error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function HeroScene() {
  return (
    <>
      {/* Ánh sáng nền + đèn điểm nhấn chiếu vào giữa mô hình để tạo chiều sâu. */}
      <ambientLight intensity={0.55} />
      <spotLight
        position={[6, 8, 6]}
        angle={0.45}
        penumbra={0.9}
        intensity={300}
        distance={30}
        color="#fff3e0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <spotLight
        position={[-6, 4, -5]}
        angle={0.6}
        penumbra={1}
        intensity={90}
        color="#99f6e4"
      />

      <Suspense fallback={null}>
        <ModelErrorBoundary fallback={<PlaceholderModel />}>
          <HeroModel />
        </ModelErrorBoundary>
      </Suspense>

      {/* Bệ đỡ mờ giúp mô hình "đứng" trên nền thay vì lơ lửng. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.37, 0]} receiveShadow>
        <circleGeometry args={[3.4, 64]} />
        <shadowMaterial transparent opacity={0.16} />
      </mesh>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate
        autoRotateSpeed={0.9}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, 0, 0]}
      />
    </>
  );
}

function LoadingBadge() {
  const { active } = useProgress();

  return (
    <div className={`hero3d__loading${active ? ' is-visible' : ''}`} aria-hidden={!active}>
      <span className="hero3d__spinner" />
      Đang tải mô hình 3D…
    </div>
  );
}

export default function Hero3D() {
  return (
    <section className="hero3d" aria-label="Không gian sách 3D">
      <div className="hero3d__canvas">
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 1.6, 7.5], fov: 42 }}
        >
          <HeroScene />
        </Canvas>
      </div>

      <div className="hero3d__overlay">
        <span className="hero3d__eyebrow">Trải nghiệm 3D</span>
        <h1 className="hero3d__title">
          Khám phá Kho sách <span>Không giới hạn</span>
        </h1>
        <p className="hero3d__hint">Kéo chuột để xoay mô hình</p>
      </div>

      <LoadingBadge />
    </section>
  );
}
