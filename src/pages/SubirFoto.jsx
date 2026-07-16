import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function SubirFoto() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [recentUploads, setRecentUploads] = useState([]);
  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('El archivo no debe exceder 10MB');
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError('');
    setUploadResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setError('');
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setUploadResult(null);

    const formData = new FormData();
    formData.append('foto', file);

    try {
      const response = await api.post('/reportes-estadisticos/subir-foto', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const result = response.data;
      setUploadResult(result);
      setRecentUploads((prev) => [
        {
          name: file.name,
          fecha: new Date().toLocaleString('es-ES'),
          url: result.url || result.filename || file.name,
        },
        ...prev.slice(0, 9),
      ]);
      clearFile();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Subir Foto</h1>

      {/* Success message */}
      {uploadResult && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          Imagen subida exitosamente{uploadResult.filename ? `: ${uploadResult.filename}` : ''}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !file && fileInputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
            : 'hover:border-blue-400'
        }`}
        style={{
          backgroundColor: dragOver ? undefined : 'var(--color-surface)',
          borderColor: dragOver ? undefined : 'var(--color-border)',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Vista previa"
                className="max-h-64 rounded-lg mx-auto object-contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {file?.name} ({(file?.size / 1024 / 1024).toFixed(2)} MB)
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                uploadFile();
              }}
              disabled={uploading}
              className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 mx-auto"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Subir Imagen
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full" style={{ backgroundColor: 'var(--color-bg)' }}>
              <Image className="w-7 h-7" style={{ color: 'var(--color-text-secondary)' }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                Arrastre una imagen aqui o haga clic para seleccionar
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                JPG, PNG, GIF - Maximo 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recent uploads */}
      {recentUploads.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="px-4 py-3 font-semibold text-sm border-b" style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
            Subidas Recientes
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {recentUploads.map((upload, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                    {upload.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {upload.fecha}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
