/**
 * Editor App - Simple text editor with autosave
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import type { WindowState, FSNode } from '../../types';
import './Editor.css';

interface EditorProps {
  window: WindowState;
}

export function Editor({ window: win }: EditorProps) {
  const fileId = win.data?.fileId as string | undefined;
  const fileName = win.data?.fileName as string || 'Untitled';
  
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load file content
  useEffect(() => {
    if (!fileId) return;
    
    const loadFile = async () => {
      setLoading(true);
      try {
        const node = await api.getNode(fileId) as FSNode;
        setContent(node.content || '');
        setOriginalContent(node.content || '');
      } catch (err) {
        setError('Failed to load file');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadFile();
  }, [fileId]);

  // Autosave with debounce
  const saveContent = useCallback(async () => {
    if (!fileId || content === originalContent) return;
    
    setSaving(true);
    try {
      await api.updateNode(fileId, { content });
      setOriginalContent(content);
      setLastSaved(new Date());
    } catch (err) {
      setError('Failed to save');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [fileId, content, originalContent]);

  // Debounced autosave
  useEffect(() => {
    if (!fileId) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (content !== originalContent) {
        saveContent();
      }
    }, 1000);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, originalContent, fileId, saveContent]);

  // Manual save
  const handleSave = useCallback(() => {
    saveContent();
  }, [saveContent]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const hasChanges = content !== originalContent;

  return (
    <div className="editor">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="editor-title">
          <span className="file-icon">📝</span>
          <span className="file-name">{fileName}</span>
          {hasChanges && <span className="unsaved-dot">●</span>}
        </div>
        
        <div className="editor-actions">
          {lastSaved && (
            <span className="last-saved">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button 
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={saving ? 'saving' : ''}
          >
            {saving ? '⟳ Saving...' : '💾 Save'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div 
          className="editor-error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setError(null)}
        >
          {error}
        </motion.div>
      )}

      {/* Editor area */}
      <div className="editor-content">
        {loading ? (
          <div className="editor-loading">Loading file...</div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={fileId ? 'Start typing...' : 'Create or open a file to start editing'}
            disabled={!fileId}
            spellCheck={false}
          />
        )}
      </div>

      {/* Status bar */}
      <div className="editor-statusbar">
        <span>Lines: {content.split('\n').length}</span>
        <span>Characters: {content.length}</span>
        <span className={hasChanges ? 'modified' : ''}>
          {hasChanges ? 'Modified' : 'Saved'}
        </span>
      </div>
    </div>
  );
}
