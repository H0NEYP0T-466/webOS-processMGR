/**
 * Task Manager App - Virtual OS and Host System Processes
 * Optimized for fast initial render and responsive updates
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, Area, AreaChart, XAxis, Tooltip } from 'recharts';
import { api } from '../../services/api';
import { wsClient, WS_TOPICS } from '../../services/ws';
import { useOSStore } from '../../state/osStore';
import type { VirtualProcess, HostProcess, SystemMetrics } from '../../types';
import './TaskManager.css';

type TabType = 'virtual' | 'host';
type ViewMode = 'table' | 'grid';

// Configuration for grid view display limits
const GRID_VIEW_LIMIT = 20;
// Only show loading spinner for first load, not subsequent updates
const INITIAL_LOAD_DELAY = 100; // ms before showing loading state

export function TaskManager() {
  const [activeTab, setActiveTab] = useState<TabType>('virtual');
  const [virtualProcesses, setVirtualProcesses] = useState<VirtualProcess[]>([]);
  const [hostProcesses, setHostProcesses] = useState<HostProcess[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<{ cpu: number; mem: number; time: string }[]>([]);
  const [sortField, setSortField] = useState<string>('cpu_percent');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<number | string | null>(null);
  const [confirmTerminate, setConfirmTerminate] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode] = useState<ViewMode>('table');
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  
  // Use refs to track if component is mounted and avoid state updates after unmount
  const isMounted = useRef(true);
  const hasLoadedOnce = useRef(false);
  
  const { setSystemMetrics, windows, closeWindow } = useOSStore();

  // Fetch virtual processes - optimized to not block UI
  const fetchVirtualProcesses = useCallback(async () => {
    try {
      const data = await api.listVirtualProcesses();
      if (isMounted.current) {
        setVirtualProcesses(data.processes);
      }
    } catch (err) {
      console.error('Failed to fetch virtual processes:', err);
    }
  }, []);

  // Fetch host processes - optimized to not block UI
  const fetchHostProcesses = useCallback(async () => {
    try {
      const [procData, metricsData] = await Promise.all([
        api.listHostProcesses(),
        api.getHostMetrics()
      ]);
      
      if (isMounted.current) {
        setHostProcesses(procData.processes);
        setMetrics(metricsData);
        setSystemMetrics(metricsData);
        
        // Add to history
        const now = new Date().toLocaleTimeString();
        setMetricsHistory(prev => {
          const newHistory = [...prev, { cpu: metricsData.cpu_percent, mem: metricsData.memory_percent, time: now }];
          return newHistory.slice(-30); // Keep last 30 data points
        });
      }
    } catch (err) {
      if (isMounted.current) {
        setError('Failed to fetch host processes');
      }
      console.error('Failed to fetch host processes:', err);
    }
  }, [setSystemMetrics]);

  // Manual refresh with animation
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (activeTab === 'host') {
      await fetchHostProcesses();
    } else {
      await fetchVirtualProcesses();
    }
    setTimeout(() => {
      if (isMounted.current) {
        setIsRefreshing(false);
      }
    }, 300);
  }, [activeTab, fetchHostProcesses, fetchVirtualProcesses]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Initial fetch - optimized for fast display
  useEffect(() => {
    // Start fetching immediately without waiting
    const loadData = async () => {
      // Show loading only if it takes longer than INITIAL_LOAD_DELAY
      const loadingTimer = setTimeout(() => {
        if (!hasLoadedOnce.current && isMounted.current) {
          setInitialLoading(true);
        }
      }, INITIAL_LOAD_DELAY);
      
      // Fetch both in parallel
      await Promise.all([
        fetchVirtualProcesses(),
        fetchHostProcesses()
      ]);
      
      clearTimeout(loadingTimer);
      
      if (isMounted.current) {
        hasLoadedOnce.current = true;
        setInitialLoading(false);
      }
    };
    
    loadData();
  }, [fetchVirtualProcesses, fetchHostProcesses]);

  // Subscribe to metrics updates
  useEffect(() => {
    const handleMetrics = (data: unknown) => {
      const metricsData = data as SystemMetrics;
      setMetrics(metricsData);
      setSystemMetrics(metricsData);
      
      const now = new Date().toLocaleTimeString();
      setMetricsHistory(prev => {
        const newHistory = [...prev, { cpu: metricsData.cpu_percent, mem: metricsData.memory_percent, time: now }];
        return newHistory.slice(-30);
      });
    };

    if (wsClient.isConnected()) {
      const unsubscribe = wsClient.subscribe(WS_TOPICS.METRICS_HOST, handleMetrics);
      return () => unsubscribe();
    }
  }, [setSystemMetrics]);

  // Periodic refresh for host processes
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'host') {
        fetchHostProcesses();
      } else {
        fetchVirtualProcesses();
      }
    }, 2000); // Faster refresh interval (2 seconds)

    return () => clearInterval(interval);
  }, [activeTab, fetchHostProcesses, fetchVirtualProcesses]);

  // Stop virtual process
  const handleStopVirtualProcess = async (processId: string) => {
    setConfirmTerminate(processId);
  };

  const confirmTerminateProcess = async () => {
    if (confirmTerminate === null) return;
    
    try {
      // Find the process to get its app and metadata
      const processToStop = virtualProcesses.find(p => p.id === confirmTerminate);
      
      await api.deleteVirtualProcess(confirmTerminate);
      
      // Close the associated window if it exists
      if (processToStop) {
        // Try to find by window_id in metadata first
        const windowId = processToStop.metadata?.window_id;
        if (typeof windowId === 'string') {
          closeWindow(windowId);
        } else {
          // Fallback: find window by app name (if there's only one instance)
          const appWindows = windows.filter(w => w.app === processToStop.app);
          if (appWindows.length === 1 && appWindows[0]) {
            closeWindow(appWindows[0].window_id);
          }
        }
      }
      
      fetchVirtualProcesses();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop process');
    } finally {
      setConfirmTerminate(null);
    }
  };

  // Sort and filter processes - memoized for better performance
  const filteredVirtualProcesses = useMemo(() => 
    virtualProcesses.filter(p =>
      searchTerm === '' ||
      p.app.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.includes(searchTerm)
    ), [virtualProcesses, searchTerm]);

  const filteredHostProcesses = useMemo(() => 
    hostProcesses
      .filter(p => 
        searchTerm === '' ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.pid.toString().includes(searchTerm)
      )
      .sort((a, b) => {
        const aVal = (a as unknown as Record<string, unknown>)[sortField];
        const bVal = (b as unknown as Record<string, unknown>)[sortField];
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = String(aVal || '');
        const bStr = String(bVal || '');
        return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      }), [hostProcesses, searchTerm, sortField, sortDir]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const getCpuColor = (cpu: number) => {
    if (cpu > 80) return '#ff6b6b';
    if (cpu > 50) return '#feca57';
    return '#1dd1a1';
  };

  // Get selected process details
  const getSelectedHostProcess = () => hostProcesses.find(p => p.pid === selectedProcess);
  const getSelectedVirtualProcess = () => virtualProcesses.find(p => p.id === selectedProcess);

  // Tab animation variants
  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div className="task-manager">
      {/* Header */}
      <div className="tm-header">
        <div className="tm-tabs">
          <motion.button 
            className={`tm-tab ${activeTab === 'virtual' ? 'active' : ''}`}
            onClick={() => { setActiveTab('virtual'); setSelectedProcess(null); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="tm-tab-icon">🖥️</span>
            Virtual OS
            <motion.span 
              className="tm-tab-count"
              key={virtualProcesses.length}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              {virtualProcesses.length}
            </motion.span>
          </motion.button>
          <motion.button 
            className={`tm-tab ${activeTab === 'host' ? 'active' : ''}`}
            onClick={() => { setActiveTab('host'); setSelectedProcess(null); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="tm-tab-icon">💻</span>
            Host System
            <span className="tm-tab-badge">View Only</span>
          </motion.button>
        </div>
        
        <div className="tm-search">
          <input
            type="text"
            placeholder="Search processes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            className={`tm-refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={initialLoading || isRefreshing}
            title="Refresh processes"
            aria-label="Refresh process list"
          >
            {initialLoading || isRefreshing ? '⟳' : '🔄'}
          </button>
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="tm-error"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            onClick={() => setError(null)}
          >
            <span className="error-icon">⚠️</span>
            {error}
            <span className="error-dismiss">Click to dismiss</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className={`tm-content ${showDetailsPanel ? 'with-panel' : ''}`}>
        <AnimatePresence mode="wait">
          {activeTab === 'virtual' ? (
            <motion.div
              key="virtual"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="tm-tab-content"
            >
              <VirtualProcessesTab
                processes={filteredVirtualProcesses}
                onStop={handleStopVirtualProcess}
                loading={initialLoading}
                viewMode={viewMode}
                selectedProcess={selectedProcess}
                onSelect={(id) => {
                  setSelectedProcess(id);
                  setShowDetailsPanel(!!id);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="host"
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="tm-tab-content"
            >
              {/* System Metrics */}
              {metrics && (
                <motion.div 
                  className="tm-metrics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <motion.div 
                    className="metric-card"
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(79, 172, 254, 0.2)' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="metric-header">
                      <span className="metric-icon">⚡</span>
                      <span className="metric-label">CPU Usage</span>
                    </div>
                    <motion.div 
                      className="metric-value" 
                      style={{ color: getCpuColor(metrics.cpu_percent) }}
                      key={metrics.cpu_percent}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                    >
                      {metrics.cpu_percent.toFixed(1)}%
                    </motion.div>
                    <div className="metric-bar">
                      <motion.div 
                        className="metric-bar-fill cpu"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, metrics.cpu_percent)}%` }}
                        transition={{ type: 'spring', stiffness: 100 }}
                      />
                    </div>
                    <div className="metric-chart">
                      <ResponsiveContainer width="100%" height={60}>
                        <AreaChart data={metricsHistory}>
                          <defs>
                            <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#4facfe" stopOpacity={0.4}/>
                              <stop offset="100%" stopColor="#4facfe" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="time" hide />
                          <Tooltip 
                            contentStyle={{ 
                              background: 'rgba(20, 20, 30, 0.95)', 
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px'
                            }}
                            labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="cpu" 
                            stroke="#4facfe" 
                            strokeWidth={2}
                            fill="url(#cpuGradient)" 
                            isAnimationActive={true}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="metric-card"
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0, 242, 254, 0.2)' }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="metric-header">
                      <span className="metric-icon">🧠</span>
                      <span className="metric-label">Memory Usage</span>
                    </div>
                    <motion.div 
                      className="metric-value" 
                      style={{ color: getCpuColor(metrics.memory_percent) }}
                      key={metrics.memory_percent}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                    >
                      {metrics.memory_percent.toFixed(1)}%
                    </motion.div>
                    <div className="metric-bar">
                      <motion.div 
                        className="metric-bar-fill mem"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, metrics.memory_percent)}%` }}
                        transition={{ type: 'spring', stiffness: 100 }}
                      />
                    </div>
                    <div className="metric-chart">
                      <ResponsiveContainer width="100%" height={60}>
                        <AreaChart data={metricsHistory}>
                          <defs>
                            <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#00f2fe" stopOpacity={0.4}/>
                              <stop offset="100%" stopColor="#00f2fe" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="time" hide />
                          <Tooltip 
                            contentStyle={{ 
                              background: 'rgba(20, 20, 30, 0.95)', 
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px'
                            }}
                            labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="mem" 
                            stroke="#00f2fe" 
                            strokeWidth={2}
                            fill="url(#memGradient)" 
                            isAnimationActive={true}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Host Processes Table - View Only */}
              <HostProcessesTab
                processes={filteredHostProcesses}
                onSort={handleSort}
                sortField={sortField}
                sortDir={sortDir}
                loading={initialLoading}
                viewMode={viewMode}
                selectedProcess={selectedProcess}
                onSelect={(pid) => {
                  setSelectedProcess(pid);
                  setShowDetailsPanel(!!pid);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Details Panel */}
        <AnimatePresence>
          {showDetailsPanel && selectedProcess && (
            <motion.div
              className="tm-details-panel"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="details-header">
                <h3>Process Details</h3>
                <motion.button
                  className="details-close"
                  onClick={() => { setShowDetailsPanel(false); setSelectedProcess(null); }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.button>
              </div>
              
              {activeTab === 'host' && getSelectedHostProcess() && (
                <ProcessDetails process={getSelectedHostProcess()!} type="host" />
              )}
              
              {activeTab === 'virtual' && getSelectedVirtualProcess() && (
                <ProcessDetails process={getSelectedVirtualProcess()!} type="virtual" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirm Terminate Dialog - Only for Virtual Processes */}
      <AnimatePresence>
        {confirmTerminate !== null && (
          <motion.div 
            className="tm-dialog-overlay" 
            onClick={() => setConfirmTerminate(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="tm-dialog"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="dialog-icon">⚠️</div>
              <h3>End Virtual Process</h3>
              <p>Are you sure you want to end this virtual process?</p>
              <p className="process-info">Process ID: {confirmTerminate ? confirmTerminate.slice(0, 8) : ''}...</p>
              <div className="tm-dialog-actions">
                <motion.button 
                  onClick={() => setConfirmTerminate(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button 
                  className="danger" 
                  onClick={confirmTerminateProcess}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  End Task
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Virtual Processes Tab Component
interface VirtualProcessesTabProps {
  processes: VirtualProcess[];
  onStop: (id: string) => void;
  loading: boolean;
  viewMode: ViewMode;
  selectedProcess: number | string | null;
  onSelect: (id: string | null) => void;
}

function VirtualProcessesTab({ processes, onStop, loading, viewMode, selectedProcess, onSelect }: VirtualProcessesTabProps) {
  if (loading && processes.length === 0) {
    return (
      <motion.div 
        className="tm-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          ⚙️
        </motion.div>
        <span>Loading processes...</span>
      </motion.div>
    );
  }

  if (processes.length === 0) {
    return (
      <motion.div 
        className="tm-empty"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="empty-icon">📭</div>
        <h3>No Virtual Processes</h3>
        <p>Open an app from the desktop to start a virtual process</p>
      </motion.div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="tm-grid">
        <AnimatePresence mode="popLayout">
          {processes.map((proc, index) => (
            <motion.div
              key={proc.id}
              className={`tm-grid-card ${selectedProcess === proc.id ? 'selected' : ''}`}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => onSelect(selectedProcess === proc.id ? null : proc.id)}
            >
              <div className="grid-card-header">
                <span className="grid-card-icon">{getAppIcon(proc.app)}</span>
                <span className={`status-dot ${proc.status}`} />
              </div>
              <h4 className="grid-card-title">{proc.app}</h4>
              <div className="grid-card-stats">
                <div className="stat">
                  <span className="stat-label">Started</span>
                  <span className="stat-value">{new Date(proc.started_at).toLocaleTimeString()}</span>
                </div>
              </div>
              {proc.status === 'running' && (
                <motion.button 
                  className="grid-card-action danger"
                  onClick={(e) => { e.stopPropagation(); onStop(proc.id); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  End Task
                </motion.button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="tm-table-container">
      <table className="tm-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>App</th>
            <th>Status</th>
            <th>Started</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {processes.map((proc, index) => (
              <motion.tr 
                key={proc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.02 }}
                className={selectedProcess === proc.id ? 'selected' : ''}
                onClick={() => onSelect(selectedProcess === proc.id ? null : proc.id)}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              >
                <td className="monospace">{proc.id.slice(0, 8)}...</td>
                <td>
                  <span className="app-name">
                    <span className="app-icon">{getAppIcon(proc.app)}</span>
                    {proc.app}
                  </span>
                </td>
                <td>
                  <motion.span 
                    className={`status-badge ${proc.status}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    {proc.status}
                  </motion.span>
                </td>
                <td className="time-cell">{new Date(proc.started_at).toLocaleTimeString()}</td>
                <td>
                  {proc.status === 'running' && (
                    <motion.button 
                      className="tm-action-btn danger"
                      onClick={(e) => { e.stopPropagation(); onStop(proc.id); }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      End Task
                    </motion.button>
                  )}
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
      <div className="tm-footer">
        <span>Running: {processes.length} virtual processes</span>
      </div>
    </div>
  );
}

// Host Processes Tab Component - VIEW ONLY (no terminate actions)
interface HostProcessesTabProps {
  processes: HostProcess[];
  onSort: (field: string) => void;
  sortField: string;
  sortDir: 'asc' | 'desc';
  loading: boolean;
  viewMode: ViewMode;
  selectedProcess: number | string | null;
  onSelect: (pid: number | null) => void;
}

function HostProcessesTab({ 
  processes, 
  onSort, 
  sortField, 
  sortDir,
  loading,
  viewMode,
  selectedProcess,
  onSelect
}: HostProcessesTabProps) {
  if (loading && processes.length === 0) {
    return (
      <motion.div 
        className="tm-loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          ⚙️
        </motion.div>
        <span>Loading system processes...</span>
      </motion.div>
    );
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return '⇅';
    return sortDir === 'asc' ? '↑' : '↓';
  };

  if (viewMode === 'grid') {
    return (
      <>
        <div className="tm-grid host-grid">
          <AnimatePresence mode="popLayout">
            {processes.slice(0, GRID_VIEW_LIMIT).map((proc, index) => (
              <motion.div
                key={proc.pid}
                className={`tm-grid-card host ${selectedProcess === proc.pid ? 'selected' : ''}`}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => onSelect(selectedProcess === proc.pid ? null : proc.pid)}
              >
                <div className="grid-card-header">
                  <span className="grid-card-pid">PID {proc.pid}</span>
                  <span className={`status-dot ${proc.status}`} />
                </div>
                <h4 className="grid-card-title">{proc.name}</h4>
                <div className="grid-card-stats">
                  <div className="stat">
                    <span className="stat-label">CPU</span>
                    <span className="stat-value" style={{ color: proc.cpu_percent > 50 ? '#ff6b6b' : '#4facfe' }}>
                      {proc.cpu_percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">MEM</span>
                    <span className="stat-value" style={{ color: proc.memory_percent > 50 ? '#ff6b6b' : '#00f2fe' }}>
                      {proc.memory_percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="grid-card-info">
                  <span className="info-label">🔒 System Process</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <motion.div 
          className="tm-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span>Showing top {GRID_VIEW_LIMIT} of {processes.length} processes</span>
          <span className="system-note">🔒 System processes cannot be terminated for security</span>
        </motion.div>
      </>
    );
  }

  return (
    <div className="tm-table-container">
      <table className="tm-table host-table">
        <thead>
          <tr>
            <th onClick={() => onSort('pid')}>
              PID <span className="sort-icon">{getSortIcon('pid')}</span>
            </th>
            <th onClick={() => onSort('name')}>
              Name <span className="sort-icon">{getSortIcon('name')}</span>
            </th>
            <th onClick={() => onSort('username')}>
              User <span className="sort-icon">{getSortIcon('username')}</span>
            </th>
            <th onClick={() => onSort('cpu_percent')}>
              CPU % <span className="sort-icon">{getSortIcon('cpu_percent')}</span>
            </th>
            <th onClick={() => onSort('memory_percent')}>
              Memory % <span className="sort-icon">{getSortIcon('memory_percent')}</span>
            </th>
            <th onClick={() => onSort('num_threads')}>
              Threads <span className="sort-icon">{getSortIcon('num_threads')}</span>
            </th>
            <th onClick={() => onSort('status')}>
              Status <span className="sort-icon">{getSortIcon('status')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {processes.map((proc, index) => (
              <motion.tr 
                key={proc.pid}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.01 }}
                className={selectedProcess === proc.pid ? 'selected' : ''}
                onClick={() => onSelect(selectedProcess === proc.pid ? null : proc.pid)}
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
              >
                <td className="monospace">{proc.pid}</td>
                <td className="process-name" title={proc.cmdline || ''}>
                  {proc.name}
                </td>
                <td>{proc.username || '-'}</td>
                <td>
                  <div className="cpu-bar">
                    <motion.div 
                      className="cpu-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, proc.cpu_percent)}%` }}
                      style={{ 
                        backgroundColor: proc.cpu_percent > 50 ? '#ff6b6b' : '#4facfe'
                      }}
                    />
                    <span>{proc.cpu_percent.toFixed(1)}%</span>
                  </div>
                </td>
                <td>
                  <div className="cpu-bar">
                    <motion.div 
                      className="cpu-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, proc.memory_percent)}%` }}
                      style={{ 
                        backgroundColor: proc.memory_percent > 50 ? '#ff6b6b' : '#00f2fe'
                      }}
                    />
                    <span>{proc.memory_percent.toFixed(1)}%</span>
                  </div>
                </td>
                <td>{proc.num_threads}</td>
                <td>
                  <motion.span 
                    className={`status-badge ${proc.status}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    {proc.status}
                  </motion.span>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
      
      <motion.div 
        className="tm-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span>Total: {processes.length} system processes</span>
        <span className="system-note">🔒 System processes are protected and cannot be terminated</span>
      </motion.div>
    </div>
  );
}

// Process Details Component
interface ProcessDetailsProps {
  process: HostProcess | VirtualProcess;
  type: 'host' | 'virtual';
}

function ProcessDetails({ process, type }: ProcessDetailsProps) {
  if (type === 'host') {
    const proc = process as HostProcess;
    return (
      <motion.div 
        className="details-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="detail-section">
          <h4>Process Information</h4>
          <div className="detail-row">
            <span className="detail-label">PID</span>
            <span className="detail-value monospace">{proc.pid}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Name</span>
            <span className="detail-value">{proc.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">User</span>
            <span className="detail-value">{proc.username || 'System'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status</span>
            <span className={`status-badge ${proc.status}`}>{proc.status}</span>
          </div>
        </div>
        
        <div className="detail-section">
          <h4>Resource Usage</h4>
          <div className="detail-row">
            <span className="detail-label">CPU</span>
            <div className="detail-bar">
              <motion.div 
                className="detail-bar-fill cpu"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, proc.cpu_percent)}%` }}
              />
              <span>{proc.cpu_percent.toFixed(2)}%</span>
            </div>
          </div>
          <div className="detail-row">
            <span className="detail-label">Memory</span>
            <div className="detail-bar">
              <motion.div 
                className="detail-bar-fill mem"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, proc.memory_percent)}%` }}
              />
              <span>{proc.memory_percent.toFixed(2)}%</span>
            </div>
          </div>
          <div className="detail-row">
            <span className="detail-label">Threads</span>
            <span className="detail-value">{proc.num_threads}</span>
          </div>
        </div>

        {proc.cmdline && (
          <div className="detail-section">
            <h4>Command Line</h4>
            <div className="detail-cmdline">{proc.cmdline}</div>
          </div>
        )}

        <div className="detail-section system-notice">
          <span className="notice-icon">🔒</span>
          <p>This is a system process and cannot be terminated from the Virtual OS for security reasons.</p>
        </div>
      </motion.div>
    );
  }

  const proc = process as VirtualProcess;
  return (
    <motion.div 
      className="details-content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      <div className="detail-section">
        <h4>Process Information</h4>
        <div className="detail-row">
          <span className="detail-label">ID</span>
          <span className="detail-value monospace">{proc.id}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">App</span>
          <span className="detail-value">
            <span className="app-icon">{getAppIcon(proc.app)}</span>
            {proc.app}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Status</span>
          <span className={`status-badge ${proc.status}`}>{proc.status}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Started</span>
          <span className="detail-value">{new Date(proc.started_at).toLocaleString()}</span>
        </div>
      </div>

      <div className="detail-section virtual-notice">
        <span className="notice-icon">✅</span>
        <p>This is a virtual OS process. You can safely end this task without affecting the host system.</p>
      </div>
    </motion.div>
  );
}

// Helper function to get app icon
function getAppIcon(app: string): string {
  const icons: Record<string, string> = {
    'file-manager': '📁',
    'task-manager': '📊',
    'editor': '📝',
    'settings': '⚙️',
    'terminal': '💻',
  };
  return icons[app] || '📄';
}
