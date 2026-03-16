import React, { useState, useRef, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { Camera, Loader2, Upload, X, Check, RefreshCw } from 'lucide-react';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
  folder?: string;
  label?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onUploadComplete, 
  currentImageUrl, 
  folder = 'general',
  label = 'Adicionar Imagem'
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const uploadFile = async (file: File | Blob) => {
    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const fileName = file instanceof File ? file.name : `capture_${Date.now()}.jpg`;
      const storageRef = ref(storage, `${folder}/${Date.now()}_${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      onUploadComplete(url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Erro ao fazer upload da imagem.");
    } finally {
      setUploading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
          if (blob) {
            stopCamera();
            await uploadFile(blob);
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const removeImage = () => {
    setPreview(null);
    onUploadComplete('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-bold text-slate-700">{label}</label>}
      
      <div className="relative group">
        {isCameraOpen ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-black">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <button
                type="button"
                onClick={stopCamera}
                className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                title="Cancelar"
              >
                <X size={24} />
              </button>
              <button
                type="button"
                onClick={capturePhoto}
                className="p-4 bg-brand-600 rounded-full text-white hover:bg-brand-700 transition-transform active:scale-95 shadow-lg"
                title="Capturar Foto"
              >
                <div className="w-6 h-6 rounded-full border-2 border-white" />
              </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : preview ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white rounded-full text-slate-700 hover:bg-slate-100 transition-colors"
                title="Trocar imagem"
              >
                <Upload size={20} />
              </button>
              <button
                type="button"
                onClick={startCamera}
                className="p-2 bg-white rounded-full text-slate-700 hover:bg-slate-100 transition-colors"
                title="Tirar nova foto"
              >
                <Camera size={20} />
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 transition-colors"
                title="Remover imagem"
              >
                <X size={20} />
              </button>
            </div>
            {uploading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                <Loader2 className="animate-spin text-brand-600" size={32} />
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-brand-500 hover:text-brand-500 transition-all bg-slate-50"
            >
              {uploading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <Upload size={24} />
                  <span className="text-xs font-bold">Galeria</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={startCamera}
              disabled={uploading}
              className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-brand-500 hover:text-brand-500 transition-all bg-slate-50"
            >
              <Camera size={24} />
              <span className="text-xs font-bold">Câmera</span>
            </button>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ImageUpload;


