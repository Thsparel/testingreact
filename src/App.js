import React, { useState, useEffect } from 'react';
import { Upload, Download, Eye, Folder, File, Users, Shield, LogOut, User } from 'lucide-react';

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
      { name: 'index.html', content: '<!DOCTYPE html><html><head><title>McWeb</title></head><body><h1>Welcome to McWeb</h1><p>This is a sample webpage.</p></body></html>' },
      { name: 'style.css', content: 'body { font-family: Arial, sans-serif; margin: 40px; } h1 { color: #333; }' },
      { name: 'script.js', content: 'console.log("McWeb loaded successfully!");' }
    ],
    uploadedBy: 'admin',
    uploadDate: '2024-01-15'
  },
  {
    id: 2,
    name: 'Portfolio',
    type: 'folder',
    files: [
      { name: 'index.html', content: '<!DOCTYPE html><html><head><title>Portfolio</title></head><body><h1>My Portfolio</h1><div>Welcome to my portfolio site!</div></body></html>' },
      { name: 'about.html', content: '<!DOCTYPE html><html><head><title>About</title></head><body><h1>About Me</h1><p>I am a web developer.</p></body></html>' }
    ],
    uploadedBy: 'admin',
    uploadDate: '2024-01-10'
  },
  {
    id: 3,
    name: 'Document.pdf',
    type: 'file',
    content: 'Sample PDF content...',
    uploadedBy: 'admin',
    uploadDate: '2024-01-12'
  }
];

const EssCloudApp = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [files, setFiles] = useState(mockFiles);
  const [activeTab, setActiveTab] = useState('files');
  const [previewFile, setPreviewFile] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  // Login handler
  const handleLogin = () => {
    const user = mockUsers.find(u => 
      u.username === loginForm.username && u.password === loginForm.password
    );
    if (user) {
      setCurrentUser(user);
      setActiveTab('files');
    } else {
      alert('Username atau password salah!');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setLoginForm({ username: '', password: '' });
    setPreviewFile(null);
  };

  // File upload handler (untuk admin)
  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);
    const newFiles = uploadedFiles.map((file, index) => ({
      id: files.length + index + 1,
      name: file.name,
      type: file.type.startsWith('text/') ? 'file' : 'file',
      content: 'File content...',
      uploadedBy: currentUser.username,
      uploadDate: new Date().toISOString().split('T')[0]
    }));
    setFiles([...files, ...newFiles]);
    alert(`${uploadedFiles.length} file berhasil diupload!`);
  };

  // Download handler
  const handleDownload = (file) => {
    if (file.type === 'folder') {
      // Simulasi download folder sebagai ZIP
      const zipContent = file.files.map(f => `${f.name}: ${f.content}`).join('\n\n');
      const blob = new Blob([zipContent], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Download file biasa
      const blob = new Blob([file.content || 'File content...'], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Preview handler
  const handlePreview = (file) => {
    if (file.type === 'folder' && file.files) {
      const htmlFile = file.files.find(f => f.name.endsWith('.html'));
      if (htmlFile) {
        setPreviewFile({ ...file, previewContent: htmlFile.content });
      } else {
        setPreviewFile({ ...file, previewContent: 'No HTML file found for preview' });
      }
    } else {
      setPreviewFile({ ...file, previewContent: file.content || 'No preview available' });
    }
  };

  // Delete file handler (untuk admin)
  const handleDeleteFile = (fileId) => {
    if (window.confirm('Yakin ingin hapus file ini?')) {
      setFiles(files.filter(f => f.id !== fileId));
    }
  };

  // Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">EssCloud</h1>
            <p className="text-gray-600">Cloud Storage Platform</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Login
            </button>
          </div>
          
          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>Demo accounts:</p>
            <p>Admin: admin / admin123</p>
            <p>User: user1 / user123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">EssCloud</h1>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {currentUser.role === 'admin' ? <Shield className="w-4 h-4 inline mr-1" /> : <User className="w-4 h-4 inline mr-1" />}
                {currentUser.role === 'admin' ? 'Admin' : 'User'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {currentUser.username}</span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-sm p-4">
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
          <div className="flex-1">
            {activeTab === 'files' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Files & Projects</h2>
                  <p className="text-sm text-gray-600 mt-1">Browse and download available files</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {files.map((file) => (
                      <div key={file.id} className="border rounded-lg p-4 hover:shadow-md transition duration-200">
                        <div className="flex items-center mb-3">
                          {file.type === 'folder' ? (
                            <Folder className="w-8 h-8 text-blue-500 mr-3" />
                          ) : (
                            <File className="w-8 h-8 text-gray-500 mr-3" />
                          )}
                          <div>
                            <h3 className="font-medium text-gray-900">{file.name}</h3>
                            <p className="text-xs text-gray-500">by {file.uploadedBy}</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">{file.uploadDate}</span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handlePreview(file)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition duration-200"
                              title="Preview"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(file)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition duration-200"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Files</h3>
                    <p className="text-gray-600 mb-4">Upload files or folders for users to download</p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="fileUpload"
                    />
                    <label
                      htmlFor="fileUpload"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition duration-200"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </label>
                  </div>

                  {/* File Management */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Files</h3>
                    <div className="space-y-3">
                      {files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center">
                            {file.type === 'folder' ? (
                              <Folder className="w-5 h-5 text-blue-500 mr-3" />
                            ) : (
                              <File className="w-5 h-5 text-gray-500 mr-3" />
                            )}
                            <div>
                              <span className="font-medium">{file.name}</span>
                              <span className="text-sm text-gray-500 ml-2">({file.uploadDate})</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          {previewFile && (
            <div className="w-96 bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold">Preview: {previewFile.name}</h3>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="p-4">
                {previewFile.type === 'folder' && previewFile.previewContent.includes('<html>') ? (
                  <div className="border rounded">
                    <div className="bg-gray-100 p-2 text-sm font-medium">HTML Preview:</div>
                    <iframe
                      srcDoc={previewFile.previewContent}
                      className="w-full h-64 border-0"
                      title="HTML Preview"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded p-4 text-sm font-mono whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {previewFile.previewContent}
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
