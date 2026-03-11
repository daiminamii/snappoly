import { useEffect, useRef, useState } from 'react';
import type { MeshData, ProcessingStatus } from '../types/Mesh';
import { runMeshPipeline } from '../services/meshPipeline';

interface UseFaceMeshResult {
  mesh: MeshData | null;
  status: ProcessingStatus;
  error: string | null;
}

const ERROR_MESSAGES: Record<string, string> = {
  color_sample_failed: 'いろがよめなかったよ。\nもういっかいやってみよう！',
  unknown: 'うまくいかなかったよ。\nもういっかいやってみよう！',
};

export function useFaceMesh(imageUri: string | undefined): UseFaceMeshResult {
  const [mesh, setMesh] = useState<MeshData | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!imageUri) return;

    cancelledRef.current = false;
    setMesh(null);
    setError(null);
    setStatus('idle');

    const run = async () => {
      try {
        const result = await runMeshPipeline(imageUri, (s) => {
          if (!cancelledRef.current) setStatus(s);
        });

        if (cancelledRef.current) return;

        if (result.mesh) {
          setMesh(result.mesh);
        } else {
          setStatus('error');
          setError(
            ERROR_MESSAGES[result.error ?? 'unknown'] ??
              ERROR_MESSAGES.unknown,
          );
        }
      } catch (e) {
        if (cancelledRef.current) return;
        setStatus('error');
        setError(ERROR_MESSAGES.unknown);
        console.error('meshPipeline error:', e);
      }
    };

    run();

    return () => {
      cancelledRef.current = true;
    };
  }, [imageUri]);

  return { mesh, status, error };
}
