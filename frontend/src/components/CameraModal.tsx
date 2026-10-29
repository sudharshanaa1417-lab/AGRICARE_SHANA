import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }

    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        setCameraError(null);
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        activeStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err: any) {
        setCameraError('Camera access unavailable. You can use standard image upload instead.');
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen, facingMode]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `crop_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        onClose();
      }
    }, 'image/jpeg', 0.92);
  };

  const toggleFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/20">
        {/* Header bar */}
        <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <span className="text-white font-semibold text-sm flex items-center gap-2">
            <Camera size={16} className="text-emerald-400" />
            AgriCare Crop Camera
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Viewfinder */}
        <div className="relative aspect-3/4 bg-gray-900 flex items-center justify-center">
          {cameraError ? (
            <div className="p-6 text-center text-white space-y-3">
              <AlertCircle size={36} className="mx-auto text-amber-400" />
              <p className="text-xs text-gray-300">{cameraError}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-forest-700 text-white rounded-xl text-xs font-semibold"
              >
                Return to File Upload
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Target Aim Reticle */}
              <div className="absolute inset-16 border-2 border-white/40 rounded-2xl pointer-events-none flex items-center justify-center">
                <span className="text-white/60 text-[11px] tracking-wider uppercase font-semibold bg-black/30 px-2 py-0.5 rounded-full">
                  Align Crop Leaf Here
                </span>
              </div>
            </>
          )}
        </div>

        {/* Shutter controls */}
        {!cameraError && (
          <div className="p-5 bg-black flex items-center justify-around">
            <button
              onClick={toggleFacing}
              className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              title="Switch Camera"
            >
              <RefreshCw size={20} />
            </button>

            <button
              onClick={handleCapture}
              className="w-18 h-18 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition-all shadow-lg"
              title="Capture Leaf Snapshot"
            >
              <div className="w-14 h-14 rounded-full bg-white group-hover:bg-emerald-400 transition-colors" />
            </button>

            <div className="w-11" />
          </div>
        )}
      </div>
    </div>
  );
};
