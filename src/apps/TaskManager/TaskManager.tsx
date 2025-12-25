/**
 * Task Manager App - Virtual OS and Host System Processes
 */
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, Area, AreaChart } from 'recharts';
import { api } from '../../services/api';
import { wsClient, WS_TOPICS } from '../../services/ws';
import { useOSStore } from '../../state/osStore';
import type { VirtualProcess, HostProcess, SystemMetrics } from '../../types';
import './TaskManager.css';

type TabType = 'virtual' | 'host';

export function TaskManager() {
  const [activeTab, setActiveTab] = useState<TabType>('virtual');
  const [virtualProcesses, setVirtualProcesses] = useState<VirtualProcess[]>([]);
  const [hostProcesses, setHostProcesses] = useState<HostProcess[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<{ cpu: number; mem: number; time: string }[]>([]);
  const [sortField, setSortField] = useState<string>('cpu_percent');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<number | string | null>(null);
  const [confirmTerminate, setConfirmTerminate] = useState<number | null>(null);
  
  const { user, setSystemMetrics } = useOSStore();
  const isAdmin = user?.roles.includes('admin');

  // Fetch virtual processes
  const fetchVirtualProcesses = useCallback(async () => {
    try {
      const data = await api.listVirtualProcesses();
      setVirtualProcesses(data.processes);
    } catch (err) {
      console.error('Failed to fetch virtual processes:', err);
    }
  }, []);

  // Fetch host processes
  const fetchHostProcesses = useCallback(async () => {
    setLoading(true);
    try {
      const [procData, metricsData] = await Promise.all([
        api.listHostProcesses(),
        api.getHostMetrics()
      ]);
      setHostProcesses(procData.processes);
      setMetrics(metricsData);
      setSystemMetrics(metricsData);
      
      // Add to history
      const now = new Date().toLocaleTimeString();
      setMetricsHistory(prev => {
        const newHistory = [...prev, { cpu: metricsData.cpu_percent, mem: metricsData.memory_percent, time: now }];
        return newHistory.slice(-30); // Keep last 30 data points
      });
    } catch (err) {
      setError('Failed to fetch host processes');
      console.error('Failed to fetch host processes:', err);
    } finally {
      setLoading(false);
    }
  }, [setSystemMetrics]);

  // Initial fetch
  useEffect(() => {
    fetchVirtualProcesses();
    fetchHostProcesses();
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
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTab, fetchHostProcesses, fetchVirtualProcesses]);

  // Stop virtual process
  const handleStopVirtualProcess = async (processId: string) => {
    try {
      await api.stopVirtualProcess(processId);
      fetchVirtualProcesses();
    } catch {
      setError('Failed to stop process');
    }
  };

  // Terminate host process
  const handleTerminateHostProcess = async (pid: number) => {
    if (!isAdmin) {
      setError('Admin access required to terminate host processes');
      return;
    }

    setConfirmTerminate(pid);
  };

  const confirmTerminateProcess = async () => {
    if (confirmTerminate === null) return;
    
    try {
      await api.terminateHostProcess(confirmTerminate);
      fetchHostProcesses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to terminate process');
    } finally {
      setConfirmTerminate(null);
    }
  };

  // Sort and filter host processes
  const filteredHostProcesses = hostProcesses
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
    });

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

  return (
    <div className="task-manager">
      {/* Header */}
      <div className="tm-header">
        <div className="tm-tabs">
          <button 
            className={`tm-tab ${activeTab === 'virtual' ? 'active' : ''}`}
            onClick={() => setActiveTab('virtual')}
          >
            Virtual OS
          </button>
          <button 
            className={`tm-tab ${activeTab === 'host' ? 'active' : ''}`}
            onClick={() => setActiveTab('host')}
          >
            Host System
          </button>
        </div>
        
        <div className="tm-search">
          <input
            type="text"
            placeholder="Search processes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <motion.div 
          className="tm-error"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setError(null)}
        >
          {error}
        </motion.div>
      )}

      {/* Content */}
      <div className="tm-content">
        {activeTab === 'virtual' ? (
          <VirtualProcessesTab
            processes={virtualProcesses}
            onStop={handleStopVirtualProcess}
            loading={loading}
          />
        ) : (
          <>
            {/* System Metrics */}
            {metrics && (
              <div className="tm-metrics">
                <div className="metric-card">
                  <div className="metric-label">CPU Usage</div>
                  <div className="metric-value" style={{ color: getCpuColor(metrics.cpu_percent) }}>
                    {metrics.cpu_percent.toFixed(1)}%
                  </div>
                  <div className="metric-chart">
                    <ResponsiveContainer width="100%" height={60}>
                      <AreaChart data={metricsHistory}>
                        <Area 
                          type="monotone" 
                          dataKey="cpu" 
                          stroke="#4facfe" 
                          fill="rgba(79, 172, 254, 0.2)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="metric-label">Memory Usage</div>
                  <div className="metric-value" style={{ color: getCpuColor(metrics.memory_percent) }}>
                    {metrics.memory_percent.toFixed(1)}%
                  </div>
                  <div className="metric-chart">
                    <ResponsiveContainer width="100%" height={60}>
                      <AreaChart data={metricsHistory}>
                        <Area 
                          type="monotone" 
                          dataKey="mem" 
                          stroke="#00f2fe" 
                          fill="rgba(0, 242, 254, 0.2)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Host Processes Table */}
            <HostProcessesTab
              processes={filteredHostProcesses}
              onTerminate={handleTerminateHostProcess}
              onSort={handleSort}
              sortField={sortField}
              sortDir={sortDir}
              loading={loading}
              isAdmin={isAdmin ?? false}
              selectedProcess={selectedProcess}
              onSelect={setSelectedProcess}
            />
          </>
        )}
      </div>

      {/* Confirm Terminate Dialog */}
      {confirmTerminate !== null && (
        <div className="tm-dialog-overlay" onClick={() => setConfirmTerminate(null)}>
          <motion.div 
            className="tm-dialog"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <h3>⚠️ Confirm Termination</h3>
            <p>Are you sure you want to terminate process {confirmTerminate}?</p>
            <p className="warning">This may cause system instability.</p>
            <div className="tm-dialog-actions">
              <button onClick={() => setConfirmTerminate(null)}>Cancel</button>
              <button className="danger" onClick={confirmTerminateProcess}>Terminate</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Virtual Processes Tab Component
interface VirtualProcessesTabProps {
  processes: VirtualProcess[];
  onStop: (id: string) => void;
  loading: boolean;
}

function VirtualProcessesTab({ processes, onStop, loading }: VirtualProcessesTabProps) {
  if (loading && processes.length === 0) {
    return <div className="tm-loading">Loading processes...</div>;
  }

  if (processes.length === 0) {
    return <div className="tm-empty">No virtual processes running</div>;
  }

  return (
    <div className="tm-table-container">
      <table className="tm-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>App</th>
            <th>Status</th>
            <th>CPU %</th>
            <th>Memory %</th>
            <th>Started</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {processes.map(proc => (
            <motion.tr 
              key={proc.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <td className="monospace">{proc.id.slice(0, 8)}...</td>
              <td>{proc.app}</td>
              <td>
                <span className={`status-badge ${proc.status}`}>
                  {proc.status}
                </span>
              </td>
              <td>{proc.cpu.toFixed(1)}%</td>
              <td>{proc.mem.toFixed(1)}%</td>
              <td>{new Date(proc.started_at).toLocaleTimeString()}</td>
              <td>
                {proc.status === 'running' && (
                  <button 
                    className="tm-action-btn danger"
                    onClick={() => onStop(proc.id)}
                  >
                    End Task
                  </button>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Host Processes Tab Component
interface HostProcessesTabProps {
  processes: HostProcess[];
  onTerminate: (pid: number) => void;
  onSort: (field: string) => void;
  sortField: string;
  sortDir: 'asc' | 'desc';
  loading: boolean;
  isAdmin: boolean;
  selectedProcess: number | string | null;
  onSelect: (pid: number | string | null) => void;
}

function HostProcessesTab({ 
  processes, 
  onTerminate, 
  onSort, 
  sortField, 
  sortDir,
  loading,
  isAdmin,
  selectedProcess,
  onSelect
}: HostProcessesTabProps) {
  if (loading && processes.length === 0) {
    return <div className="tm-loading">Loading processes...</div>;
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return '⇅';
    return sortDir === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="tm-table-container">
      <table className="tm-table">
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {processes.map(proc => (
            <motion.tr 
              key={proc.pid}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={selectedProcess === proc.pid ? 'selected' : ''}
              onClick={() => onSelect(selectedProcess === proc.pid ? null : proc.pid)}
            >
              <td className="monospace">{proc.pid}</td>
              <td className="process-name" title={proc.cmdline || ''}>
                {proc.name}
              </td>
              <td>{proc.username || '-'}</td>
              <td>
                <div className="cpu-bar">
                  <div 
                    className="cpu-bar-fill"
                    style={{ 
                      width: `${Math.min(100, proc.cpu_percent)}%`,
                      backgroundColor: proc.cpu_percent > 50 ? '#ff6b6b' : '#4facfe'
                    }}
                  />
                  <span>{proc.cpu_percent.toFixed(1)}%</span>
                </div>
              </td>
              <td>
                <div className="cpu-bar">
                  <div 
                    className="cpu-bar-fill"
                    style={{ 
                      width: `${Math.min(100, proc.memory_percent)}%`,
                      backgroundColor: proc.memory_percent > 50 ? '#ff6b6b' : '#00f2fe'
                    }}
                  />
                  <span>{proc.memory_percent.toFixed(1)}%</span>
                </div>
              </td>
              <td>{proc.num_threads}</td>
              <td>
                <span className={`status-badge ${proc.status}`}>
                  {proc.status}
                </span>
              </td>
              <td>
                {isAdmin ? (
                  <button 
                    className="tm-action-btn danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTerminate(proc.pid);
                    }}
                  >
                    End Task
                  </button>
                ) : (
                  <span className="no-access">🔒</span>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      
      <div className="tm-footer">
        <span>Total: {processes.length} processes</span>
        {!isAdmin && (
          <span className="admin-note">ℹ️ Admin access required to terminate host processes</span>
        )}
      </div>
    </div>
  );
}
