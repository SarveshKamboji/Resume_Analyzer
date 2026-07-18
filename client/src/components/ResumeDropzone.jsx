import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function ResumeDropzone({ onFileDrop, file }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles[0]) onFileDrop(acceptedFiles[0]);
  }, [onFileDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  return (
    <div
      {...getRootProps()}
      className={`dropzone ${isDragActive ? 'active' : ''}`}
      id="resume-dropzone"
    >
      <input {...getInputProps()} />
      {file ? (
        <div>
          <div className="dropzone-icon">✅</div>
          <div className="dropzone-title">{file.name}</div>
          <div className="dropzone-subtitle">
            {(file.size / 1024 / 1024).toFixed(2)} MB · Click or drag to replace
          </div>
        </div>
      ) : isDragActive ? (
        <div>
          <div className="dropzone-icon">📂</div>
          <div className="dropzone-title">Drop it here!</div>
        </div>
      ) : (
        <div>
          <div className="dropzone-icon">📄</div>
          <div className="dropzone-title">Drag & drop your resume here</div>
          <div className="dropzone-subtitle">Supports PDF and DOCX · Max 5MB</div>
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-ghost btn-sm" type="button">Browse Files</button>
          </div>
        </div>
      )}
    </div>
  );
}
