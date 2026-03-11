import { forwardRef, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  Canvas,
  Vertices,
  vec,
  type SkiaDomView,
} from '@shopify/react-native-skia';
import type { MeshData } from '../../types/Mesh';

interface FaceMeshCanvasProps {
  mesh: MeshData;
}

// Int32 ARGB → CSS rgb 変換
function int32ToRgb(c: number): string {
  /* eslint-disable no-bitwise */
  const r = (c >> 16) & 0xff;
  const g = (c >> 8) & 0xff;
  const b = c & 0xff;
  /* eslint-enable no-bitwise */
  return `rgb(${r},${g},${b})`;
}

// MeshData を画面幅にフィットさせて Skia Vertices で描画
export const FaceMeshCanvas = forwardRef<SkiaDomView, FaceMeshCanvasProps>(
  function FaceMeshCanvas({ mesh }, ref) {
    const { width: screenWidth } = useWindowDimensions();

    // 画面幅に合わせたスケール
    const scale = screenWidth / mesh.width;
    const displayHeight = mesh.height * scale;

    // MeshData → Skia 頂点・カラー配列
    const { vertices, colors } = useMemo(() => {
      const count = mesh.positions.length / 2;
      const verts = new Array(count);
      const cols = new Array<string>(count);

      for (let i = 0; i < count; i++) {
        verts[i] = vec(mesh.positions[i * 2] * scale, mesh.positions[i * 2 + 1] * scale);
        cols[i] = int32ToRgb(mesh.colors[i]);
      }

      return { vertices: verts, colors: cols };
    }, [mesh, scale]);

    return (
      <Canvas ref={ref} style={{ width: screenWidth, height: displayHeight }}>
        <Vertices vertices={vertices} colors={colors} mode="triangles" />
      </Canvas>
    );
  },
);
