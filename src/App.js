import React, { useState, useEffect } from 'react';
import { Upload, Download, Eye, Folder, File, Users, Shield, LogOut, User, Archive, FileText } from 'lucide-react';

// Mock data untuk simulasi
const mockUsers = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'user1', password: 'user123', role: 'user' }
];

const mockFiles = [
  {
    id: 1,
    name: 'McWeb',
    type: 'folder',
    files: [
      { name: 'index.html', content: '<!DOCTYPE html><html><head><title>McWeb</title><style>body{font-family:Arial;padding:40px;background:#f5f5f5}h1{color:#2563eb;text-align:center}</style></head><body><h1>Welcome to McWeb</h1><p>This is a sample webpage from a folder upload.</p><div style="background:white;padding:20px;border-radius:8px;margin:20px 0;box-shadow:0 2px 4px rgba(0,0,0,0.1)"><h3>Features:</h3><ul><li>Modern design</li><li>Responsive layout</li><li>Clean code</li></ul></div></body></html>' },
      { name: 'style.css', content: 'body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; } h1 { color: #2563eb; text-align: center; }' },
      { name: 'script.js', content: 'console.log("McWeb loaded successfully!"); document.addEventListener("DOMContentLoaded", function() { alert("Welcome to McWeb!"); });' }
    ],
    uploadedBy: 'admin',
    uploadDate: '2024-01-15'
  },
  {
    id: 2,
    name: 'Portfolio.zip',
    type: 'zip',
    files: [
      { name: 'index.html', content: '<!DOCTYPE html><html><head><title>My Portfolio</title><style>body{font-family:system-ui;margin:0;padding:40px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;min-height:100vh}h1{text-align:center;margin-bottom:40px}</style></head><body><h1>My Portfolio</h1><div style="background:rgba(255,255,255,0.1);padding:30px;border-radius:15px;backdrop-filter:blur(10px)"><h2>About Me</h2><p>I am a passionate web developer with experience in modern technologies.</p></div></body></html>' },
      { name: 'about.html', content: '<!DOCTYPE html><html><head><title>About</title></head><body><h1>About Me</h1><p>I am a web developer with passion for creating amazing experiences.</p></body></html>' },
      { name: 'styles.css', content: 'body { font-family: system-ui; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }' }
    ],
    uploadedBy: 'admin',
    uploadDate: '2024-01-10'
  }
];

const EssCloudApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [files, setFiles] = useState(mockFiles);
  const [activeTab, setActiveTab] = useState('files');
  const [previewFile, setPreviewFile] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [isUploading, setIsUploading] = useState(false);

  // Helper function to create zip content
  const createZipBlob = (files) => {
    // Simple text-based zip simulation
    let zipContent = '';
    files.forEach(file => {
      zipContent += `=== ${file.name} ===\n${file.content}\n\n`;
    });
    return new Blob([zipContent], { type: 'text/plain' });
  };

  // Helper function to extract files from uploaded zip
  const extractZipFiles = async (zipFile) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        // Simple simulation - in real app, you'd use JSZip library
        const mockExtractedFiles = [
          { name: 'index.html', content: '<!DOCTYPE html><html><head><title>Uploaded Site</title></head><body><h1>Hello from uploaded ZIP!</h1></body></html>' },
          { name: 'style.css', content: 'body { font-family: Arial; padding: 20px; }' },
          { name: 'README.txt', content: 'This is a file from the uploaded ZIP archive.' }
        ];
        resolve(mockExtractedFiles);
      };
      reader.readAsText(zipFile);
    });
  };

  // Login handler
  const handleLogin = () => {
    if (!loginForm.username || !loginForm.password) {
      alert('Please enter both username and password!');
      return;
    }
    
    const user = mockUsers.find(u => 
      u.username === loginForm.username && u.password === loginForm.password
    );
    if (user) {
      setCurrentUser(user);
      setActiveTab('files');
      setLoginForm({ username: '', password: '' });
    } else {
      alert('Username atau password salah!');
    }
  };

  // Handle Enter key on login
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setLoginForm({ username: '', password: '' });
    setPreviewFile(null);
    setActiveTab('files');
  };

  // File upload handler (untuk admin)
  const handleFileUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      const processedFiles = await Promise.all(uploadedFiles.map(async (file, index) => {
        const isZip = file.name.endsWith('.zip') || file.type === 'application/zip';
        
        let fileData = {
          id: files.length + index + 1,
          name: file.name,
          type: isZip ? 'zip' : 'file',
          uploadedBy: currentUser.username,
          uploadDate: new Date().toISOString().split('T')[0],
          size: file.size
        };

        if (isZip) {
          // Extract files from zip
          try {
            const extractedFiles = await extractZipFiles(file);
            fileData.files = extractedFiles;
          } catch (error) {
            console.error('Error extracting zip:', error);
            fileData.files = [];
          }
        } else {
          // Read file content
          const content = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsText(file);
          });
          fileData.content = content;
        }

        return fileData;
      }));

      setFiles([...files, ...processedFiles]);
      alert(`${uploadedFiles.length} file berhasil diupload!`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setIsUploading(false);
      // Clear the input
      event.target.value = '';
    }
  };

  // Download handler
  const handleDownload = (file) => {
    try {
      let blob;
      let filename = file.name;

      if (file.type === 'folder' || file.type === 'zip') {
        // Create zip-like content
        blob = createZipBlob(file.files || []);
        filename = file.name.endsWith('.zip') ? file.name : `${file.name}.zip`;
      } else {
        // Regular file download
        blob = new Blob([file.content || 'Empty file'], { type: 'text/plain' });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  // Preview handler
  const handlePreview = (file) => {
    if ((file.type === 'folder' || file.type === 'zip') && file.files) {
      // Look for HTML file to preview
      const htmlFile = file.files.find(f => 
        f.name.toLowerCase().endsWith('.html') || f.name.toLowerCase().endsWith('.htm')
      );
      
      if (htmlFile) {
        setPreviewFile({ 
          ...file, 
          previewContent: htmlFile.content,
          previewType: 'html',
          allFiles: file.files
        });
      } else {
        // Show file structure if no HTML
        const fileList = file.files.map(f => `📄 ${f.name}`).join('\n');
        setPreviewFile({ 
          ...file, 
          previewContent: `Files in this ${file.type}:\n\n${fileList}`,
          previewType: 'text',
          allFiles: file.files
        });
      }
    } else {
      // Regular file preview
      const isHtml = file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm');
      setPreviewFile({ 
        ...file, 
        previewContent: file.content || 'No content available',
        previewType: isHtml ? 'html' : 'text'
      });
    }
  };

  // Delete file handler (untuk admin)
  const handleDeleteFile = (fileId) => {
    if (window.confirm('Yakin ingin hapus file ini?')) {
      setFiles(files.filter(f => f.id !== fileId));
      if (previewFile && previewFile.id === fileId) {
        setPreviewFile(null);
      }
    }
  };

  // Get file icon
  const getFileIcon = (file) => {
    if (file.type === 'folder') return <Folder className="w-8 h-8 text-blue-500" />;
    if (file.type === 'zip') return <Archive className="w-8 h-8 text-orange-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">EssCloud</h1>
            <p className="text-gray-600">Cloud Storage Platform</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                placeholder="Enter password"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={!loginForm.username || !loginForm.password}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-medium"
            >
              Login
            </button>
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-medium mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-sm text-gray-700">
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>User:</strong> user1 / user123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">EssCloud</h1>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center">
                {currentUser.role === 'admin' ? <Shield className="w-4 h-4 mr-1" /> : <User className="w-4 h-4 mr-1" />}
                {currentUser.role === 'admin' ? 'Admin' : 'User'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:inline">Welcome, <strong>{currentUser.username}</strong></span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 bg-white rounded-lg shadow-sm p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('files')}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition duration-200 ${
                  activeTab === 'files' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Folder className="w-5 h-5 mr-3" />
                Files
              </button>
              
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition duration-200 ${
                    activeTab === 'admin' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-5 h-5 mr-3" />
                  Admin Panel
                </button>
              )}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'files' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Files & Projects</h2>
                  <p className="text-sm text-gray-600 mt-1">Browse and download available files</p>
                </div>
                
                <div className="p-6">
                  {files.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Folder className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No files available</p>
                      <p className="text-sm">Admin hasn't uploaded any files yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {files.map((file) => (
                        <div key={file.id} className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300">
                          <div className="flex items-start mb-3">
                            {getFileIcon(file)}
                            <div className="ml-3 flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate" title={file.name}>{file.name}</h3>
                              <p className="text-xs text-gray-500">by {file.uploadedBy}</p>
                              {file.size && <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">{file.uploadDate}</span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handlePreview(file)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition duration-200"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDownload(file)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded transition duration-200"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'admin' && currentUser.role === 'admin' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Admin Panel</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage files and users</p>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Upload Section */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition duration-200">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Files</h3>
                    <p className="text-gray-600 mb-4">Upload files or ZIP archives for users to download</p>
                    <p className="text-sm text-gray-500 mb-4">Supports: .zip, .html, .css, .js, .txt, and more</p>
                    
                    <input
                      type="file"
                      multiple
                      accept=".zip,.html,.htm,.css,.js,.txt,.json,.xml,.md"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                      id="fileUpload"
                    />
                    <label
                      htmlFor="fileUpload"
                      className={`inline-flex items-center px-6 py-3 ${
                        isUploading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                      } text-white rounded-lg transition duration-200`}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploading ? 'Uploading...' : 'Choose Files'}
                    </label>
                  </div>

                  {/* File Management */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Files ({files.length})</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {files.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No files uploaded yet.</p>
                      ) : (
                        files.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center min-w-0 flex-1">
                              {getFileIcon(file)}
                              <div className="ml-3 min-w-0 flex-1">
                                <span className="font-medium truncate block">{file.name}</span>
                                <div className="text-sm text-gray-500">
                                  <span>{file.uploadDate}</span>
                                  {file.size && <span className="ml-2">• {formatFileSize(file.size)}</span>}
                                  {(file.type === 'zip' || file.type === 'folder') && file.files && (
                                    <span className="ml-2">• {file.files.length} files</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => handlePreview(file)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition duration-200"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteFile(file.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition duration-200"
                                title="Delete"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          {previewFile && (
            <div className="lg:w-96 w-full bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b flex justify-between items-center">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate" title={previewFile.name}>Preview: {previewFile.name}</h3>
                  {previewFile.allFiles && (
                    <p className="text-xs text-gray-500">{previewFile.allFiles.length} files inside</p>
                  )}
                </div>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition duration-200"
                  title="Close preview"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                {previewFile.previewType === 'html' ? (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-2 text-sm font-medium border-b">HTML Preview:</div>
                    <iframe
                      srcDoc={previewFile.previewContent}
                      className="w-full h-64 border-0"
                      title="HTML Preview"
                      sandbox="allow-scripts"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="bg-gray-100 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap max-h-64 overflow-y-auto border">
                      {previewFile.previewContent}
                    </div>
                    {previewFile.allFiles && previewFile.allFiles.length > 1 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">All Files:</h4>
                        <div className="space-y-1">
                          {previewFile.allFiles.map((file, index) => (
                            <div key={index} className="text-sm text-gray-600 flex items-center">
                              <FileText className="w-3 h-3 mr-2" />
                              {file.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EssCloudApp;
