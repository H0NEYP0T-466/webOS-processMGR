/**
 * File Manager App
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { useOSStore } from '../../state/osStore';
import type { FSNode } from '../../types';
import './FileManager.css';

export function FileManager() {
  const { fileTree, setFileTree, addNode, removeNode } = useOSStore();
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedNode, setSelectedNode] = useState<FSNode | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch file tree
  const fetchFileTree = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getFileTree();
      setFileTree(data.nodes);
    } catch (err) {
      setError('Failed to load files');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setFileTree]);

  useEffect(() => {
    fetchFileTree();
  }, [fetchFileTree]);

  // Get current folder and its contents
  const currentFolder = fileTree.find(n => n.path === currentPath && n.type === 'folder');
  const currentContents = fileTree.filter(n => {
    if (currentPath === '/') {
      return n.parent_id === null && n.path !== '/';
    }
    return n.parent_id === currentFolder?.id;
  });

  // Navigate to folder
  const navigateToFolder = (path: string) => {
    setCurrentPath(path);
    setSelectedNode(null);
  };

  // Navigate up
  const navigateUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    setCurrentPath(parts.length === 0 ? '/' : '/' + parts.join('/'));
    setSelectedNode(null);
  };

  // Create folder
  const handleCreateFolder = async () => {
    if (!newItemName.trim()) return;
    
    try {
      const folder = await api.createFolder(newItemName, currentFolder?.id);
      addNode(folder as FSNode);
      setShowNewFolderDialog(false);
      setNewItemName('');
    } catch {
      setError('Failed to create folder');
    }
  };

  // Create file
  const handleCreateFile = async () => {
    if (!newItemName.trim()) return;
    
    try {
      const file = await api.createFile(newItemName, currentFolder?.id);
      addNode(file as FSNode);
      setShowNewFileDialog(false);
      setNewItemName('');
    } catch {
      setError('Failed to create file');
    }
  };

  // Delete node
  const handleDelete = async (node: FSNode) => {
    if (!confirm(`Delete "${node.name}"?`)) return;
    
    try {
      await api.deleteNode(node.id);
      removeNode(node.id);
      setSelectedNode(null);
    } catch {
      setError('Failed to delete');
    }
  };

  // Handle double click
  const handleDoubleClick = (node: FSNode) => {
    if (node.type === 'folder') {
      navigateToFolder(node.path);
    } else {
      // Open file in editor
      useOSStore.getState().openWindow({
        window_id: `editor-${node.id}`,
        app: 'editor',
        x: 150,
        y: 100,
        w: 700,
        h: 500,
        minimized: false,
        maximized: false,
        data: { fileId: node.id, fileName: node.name }
      });
    }
  };

  // Get breadcrumb parts
  const breadcrumbs = currentPath === '/' 
    ? ['/'] 
    : ['/', ...currentPath.split('/').filter(Boolean)];

  return (
    <div className="file-manager">
      {/* Toolbar */}
      <div className="fm-toolbar">
        <div className="fm-nav">
          <button onClick={navigateUp} disabled={currentPath === '/'}>
            ←
          </button>
          <button onClick={fetchFileTree}>
            ↻
          </button>
        </div>
        
        <div className="fm-breadcrumb">
          {breadcrumbs.map((part, i) => (
            <span key={i}>
              <button 
                className="breadcrumb-part"
                onClick={() => {
                  if (part === '/') {
                    navigateToFolder('/');
                  } else {
                    const path = '/' + breadcrumbs.slice(1, i + 1).join('/');
                    navigateToFolder(path);
                  }
                }}
              >
                {part === '/' ? '🏠 Home' : part}
              </button>
              {i < breadcrumbs.length - 1 && <span className="separator">/</span>}
            </span>
          ))}
        </div>
        
        <div className="fm-actions">
          <button onClick={() => setShowNewFolderDialog(true)}>
            📁 New Folder
          </button>
          <button onClick={() => setShowNewFileDialog(true)}>
            📄 New File
          </button>
          <button 
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            ☰
          </button>
          <button 
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
          >
            ▦
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="fm-error" onClick={() => setError(null)}>
          {error}
        </div>
      )}

      {/* Content */}
      <div className={`fm-content ${viewMode}`}>
        {loading ? (
          <div className="fm-loading">Loading...</div>
        ) : currentContents.length === 0 ? (
          <div className="fm-empty">
            <span className="empty-icon">📂</span>
            <p>This folder is empty</p>
            <button onClick={() => setShowNewFolderDialog(true)}>
              Create a folder
            </button>
          </div>
        ) : (
          currentContents.map(node => (
            <motion.div
              key={node.id}
              className={`fm-item ${selectedNode?.id === node.id ? 'selected' : ''}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSelectedNode(node)}
              onDoubleClick={() => handleDoubleClick(node)}
            >
              <span className="fm-item-icon">
                {node.type === 'folder' ? '📁' : '📄'}
              </span>
              <span className="fm-item-name">{node.name}</span>
              {viewMode === 'list' && (
                <>
                  <span className="fm-item-type">
                    {node.type === 'folder' ? 'Folder' : node.mime_type || 'File'}
                  </span>
                  <span className="fm-item-size">
                    {node.size ? `${(node.size / 1024).toFixed(1)} KB` : '-'}
                  </span>
                  <span className="fm-item-date">
                    {new Date(node.updated_at).toLocaleDateString()}
                  </span>
                </>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Status bar */}
      <div className="fm-statusbar">
        <span>{currentContents.length} items</span>
        {selectedNode && (
          <>
            <span className="selected-info">
              Selected: {selectedNode.name}
            </span>
            <button 
              className="delete-btn"
              onClick={() => handleDelete(selectedNode)}
            >
              🗑️ Delete
            </button>
          </>
        )}
      </div>

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fm-dialog-overlay" onClick={() => setShowNewFolderDialog(false)}>
          <motion.div 
            className="fm-dialog"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <h3>New Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
            />
            <div className="fm-dialog-actions">
              <button onClick={() => setShowNewFolderDialog(false)}>Cancel</button>
              <button className="primary" onClick={handleCreateFolder}>Create</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* New File Dialog */}
      {showNewFileDialog && (
        <div className="fm-dialog-overlay" onClick={() => setShowNewFileDialog(false)}>
          <motion.div 
            className="fm-dialog"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <h3>New File</h3>
            <input
              type="text"
              placeholder="File name (e.g., notes.txt)"
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreateFile()}
            />
            <div className="fm-dialog-actions">
              <button onClick={() => setShowNewFileDialog(false)}>Cancel</button>
              <button className="primary" onClick={handleCreateFile}>Create</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
