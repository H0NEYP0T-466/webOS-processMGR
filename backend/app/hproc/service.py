"""Host process service using psutil."""
import os
import psutil
from datetime import datetime, timezone
from typing import List, Optional

from ..logging_config import info_emoji, warning_emoji


class TerminationDenied(Exception):
    """Exception raised when process termination is denied."""
    pass


# Critical PIDs that should never be terminated
CRITICAL_PIDS = {0, 1}

# Critical process names that should be protected
CRITICAL_PROCESS_NAMES = {
    'init', 'systemd', 'launchd', 'kernel', 'kthreadd',
    'System', 'csrss', 'wininit', 'services', 'lsass',
    'smss', 'svchost'
}


def list_processes() -> List[dict]:
    """List all running processes on the host system."""
    procs = []
    
    for p in psutil.process_iter(attrs=["pid", "name", "username", "status"]):
        try:
            info = p.as_dict(attrs=[
                "pid", "name", "username", "status", 
                "create_time", "cmdline", "num_threads"
            ])
            
            # Get CPU and memory percent (with small interval for CPU)
            info["cpu_percent"] = p.cpu_percent(interval=0.0)
            info["memory_percent"] = p.memory_percent()
            
            # Convert create_time to datetime
            if info.get("create_time"):
                info["create_time"] = datetime.fromtimestamp(
                    info["create_time"], 
                    tz=timezone.utc
                )
            
            # Convert cmdline list to string
            cmdline = info.get("cmdline")
            if cmdline is not None:
                info["cmdline"] = " ".join(cmdline) if cmdline else None
            else:
                info["cmdline"] = None
            
            procs.append(info)
            
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue
    
    return procs


def get_process_details(pid: int) -> Optional[dict]:
    """Get detailed information about a specific process."""
    try:
        p = psutil.Process(pid)
        info = p.as_dict()
        
        # Add CPU and memory
        info["cpu_percent"] = p.cpu_percent(interval=0.1)
        info["memory_percent"] = p.memory_percent()
        
        # Try to get open files and connections
        try:
            info["open_files"] = [f.path for f in p.open_files()]
        except (psutil.AccessDenied, psutil.NoSuchProcess):
            info["open_files"] = []
        
        try:
            info["connections"] = len(p.connections())
        except (psutil.AccessDenied, psutil.NoSuchProcess):
            info["connections"] = 0
        
        # Convert create_time
        if info.get("create_time"):
            info["create_time"] = datetime.fromtimestamp(
                info["create_time"],
                tz=timezone.utc
            )
        
        info_emoji("🧵", f"Host process observed: pid={pid} name={info.get('name')} cpu={info.get('cpu_percent')}% mem={info.get('memory_percent', 0):.1f}%")
        
        return info
        
    except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
        return None


def terminate_process(pid: int, by_user: str) -> bool:
    """
    Terminate a process by PID.
    
    First attempts graceful termination (SIGTERM), then forces kill (SIGKILL)
    if the process doesn't terminate within timeout.
    """
    # Check for critical processes
    if pid in CRITICAL_PIDS:
        warning_emoji("⚠️", f"Host process termination denied: pid={pid} reason=critical system process")
        raise TerminationDenied(f"Cannot terminate critical system process: PID {pid}")
    
    # Don't allow terminating ourselves
    if pid == os.getpid():
        warning_emoji("⚠️", f"Host process termination denied: pid={pid} reason=self process")
        raise TerminationDenied("Cannot terminate self process")
    
    # Don't allow terminating parent process
    if pid == os.getppid():
        warning_emoji("⚠️", f"Host process termination denied: pid={pid} reason=parent process")
        raise TerminationDenied("Cannot terminate parent process")
    
    try:
        proc = psutil.Process(pid)
        proc_name = proc.name()
        
        # Check for critical process names
        if proc_name.lower() in {name.lower() for name in CRITICAL_PROCESS_NAMES}:
            warning_emoji("⚠️", f"Host process termination denied: pid={pid} name={proc_name} reason=critical process name")
            raise TerminationDenied(f"Cannot terminate critical system process: {proc_name}")
        
        # Try graceful termination first
        proc.terminate()
        
        try:
            proc.wait(timeout=3)
            info_emoji("⛔", f"Host process terminated: pid={pid} by={by_user} result=success")
            return True
            
        except psutil.TimeoutExpired:
            # Force kill if graceful termination didn't work
            proc.kill()
            proc.wait(timeout=2)
            info_emoji("⛔", f"Host process killed (forced): pid={pid} by={by_user} result=success")
            return True
            
    except psutil.NoSuchProcess:
        warning_emoji("⚠️", f"Host process termination failed: pid={pid} reason=process not found")
        raise TerminationDenied(f"Process {pid} not found")
        
    except psutil.AccessDenied:
        warning_emoji("⚠️", f"Host process termination denied: pid={pid} reason=access denied")
        raise TerminationDenied(f"Access denied to terminate process {pid}")
        
    except Exception as e:
        warning_emoji("⚠️", f"Host process termination failed: pid={pid} reason={str(e)}")
        raise TerminationDenied(f"Failed to terminate process: {str(e)}")


def get_system_metrics() -> dict:
    """Get system-wide CPU and memory metrics."""
    cpu = psutil.cpu_percent(interval=0.1)
    mem = psutil.virtual_memory().percent
    
    # Get top processes by CPU
    procs = list_processes()
    top_by_cpu = sorted(procs, key=lambda x: x.get("cpu_percent", 0), reverse=True)[:5]
    
    return {
        "cpu_percent": cpu,
        "memory_percent": mem,
        "top_processes": top_by_cpu
    }
