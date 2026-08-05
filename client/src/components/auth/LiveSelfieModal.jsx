import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const LiveSelfieModal = ({ isOpen, onClose, onCapture }) => {
  const { showToast } = useNotifications();
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('[Webcam Error]', err);
      setCameraError('Unable to access camera. Please allow camera permissions in your browser to take a live selfie.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;

    setCapturing(true);
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      // Mirror horizontal flip for front camera
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const capturedBase64 = canvas.toDataURL('image/jpeg', 0.85);

      showToast('✅ Live Selfie Captured Successfully!', 'success');
      stopCamera();
      onCapture(capturedBase64);
      onClose();
    } catch (err) {
      showToast('Failed to capture photo. Please try again.', 'error');
    } finally {
      setCapturing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-card p-6 rounded-3xl border border-slate-800 space-y-5 shadow-2xl text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-white flex items-center justify-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            Mandatory Live Selfie Verification
          </h3>
          <p className="text-xs text-slate-400">
            Center your face inside the circle and click snap photo.
          </p>
        </div>

        {/* Camera Viewfinder */}
        <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-3xl overflow-hidden bg-slate-950 border-2 border-emerald-500/50 shadow-inner flex items-center justify-center">
          {cameraError ? (
            <div className="p-4 text-xs text-amber-400 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-amber-400" />
              <p>{cameraError}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />

              {/* Face Oval Overlay */}
              <div className="absolute inset-0 border-[3px] border-dashed border-emerald-400/80 rounded-full m-6 pointer-events-none animate-pulse flex items-center justify-center">
                <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest bg-slate-950/60 px-2 py-0.5 rounded-full">
                  Align Face Here
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="space-y-3 pt-2">
          {!cameraError && (
            <button
              onClick={handleCapture}
              disabled={capturing}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/20 hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {capturing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Capturing Live Photo...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  Snap Live Selfie Photo
                </>
              )}
            </button>
          )}

          <p className="text-[11px] text-slate-400">
            🔒 Live camera photo ensures 100% student safety on CampusRide.
          </p>
        </div>

      </div>
    </div>
  );
};

export default LiveSelfieModal;
