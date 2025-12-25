"""Tests for host process service with mocked psutil."""
import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone

from app.hproc import service
from app.hproc.service import TerminationDenied


class MockProcess:
    """Mock psutil.Process for testing."""
    
    def __init__(self, pid=1234, name="test_process", username="testuser"):
        self._pid = pid
        self._name = name
        self._username = username
    
    def as_dict(self, attrs=None):
        return {
            "pid": self._pid,
            "name": self._name,
            "username": self._username,
            "status": "running",
            "create_time": datetime.now(timezone.utc).timestamp(),
            "cmdline": ["test", "process"],
            "num_threads": 4
        }
    
    def cpu_percent(self, interval=None):
        return 5.0
    
    def memory_percent(self):
        return 10.0
    
    def name(self):
        return self._name
    
    def terminate(self):
        pass
    
    def kill(self):
        pass
    
    def wait(self, timeout=None):
        pass
    
    def open_files(self):
        return []
    
    def connections(self):
        return []


def create_mock_process_iter(processes):
    """Create a mock process_iter generator."""
    for p in processes:
        yield p


@patch('app.hproc.service.psutil')
def test_list_processes(mock_psutil):
    """Test listing processes."""
    mock_proc = MockProcess()
    mock_psutil.process_iter.return_value = [mock_proc]
    mock_psutil.cpu_count.return_value = 4
    
    result = service.list_processes()
    
    assert len(result) == 1
    assert result[0]["pid"] == 1234
    assert result[0]["name"] == "test_process"
    assert result[0]["cpu_percent"] <= 100.0  # Should be normalized


@patch('app.hproc.service.psutil')
def test_get_process_details(mock_psutil):
    """Test getting process details."""
    mock_proc = MockProcess()
    mock_psutil.Process.return_value = mock_proc
    mock_psutil.cpu_count.return_value = 4
    
    result = service.get_process_details(1234)
    
    assert result is not None
    assert result["pid"] == 1234


@patch('app.hproc.service.psutil')
@patch('app.hproc.service.os')
def test_terminate_critical_process_denied(mock_os, mock_psutil):
    """Test that critical processes cannot be terminated."""
    mock_os.getpid.return_value = 9999
    mock_os.getppid.return_value = 9998
    
    with pytest.raises(TerminationDenied) as exc_info:
        service.terminate_process(1, "admin")
    
    assert "critical system process" in str(exc_info.value)


@patch('app.hproc.service.psutil')
@patch('app.hproc.service.os')
def test_terminate_self_denied(mock_os, mock_psutil):
    """Test that self process cannot be terminated."""
    mock_os.getpid.return_value = 1234
    mock_os.getppid.return_value = 9998
    
    with pytest.raises(TerminationDenied) as exc_info:
        service.terminate_process(1234, "admin")
    
    assert "self process" in str(exc_info.value)


@patch('app.hproc.service.psutil')
@patch('app.hproc.service.os')
def test_terminate_process_success(mock_os, mock_psutil):
    """Test successful process termination."""
    mock_os.getpid.return_value = 9999
    mock_os.getppid.return_value = 9998
    
    mock_proc = MockProcess(pid=1234)
    mock_psutil.Process.return_value = mock_proc
    
    result = service.terminate_process(1234, "admin")
    
    assert result is True


@patch('app.hproc.service.psutil')
def test_get_system_metrics(mock_psutil):
    """Test getting system metrics."""
    mock_psutil.cpu_percent.return_value = 25.0
    mock_psutil.virtual_memory.return_value = MagicMock(percent=50.0)
    mock_psutil.cpu_count.return_value = 4
    
    mock_proc = MockProcess()
    mock_psutil.process_iter.return_value = [mock_proc]
    
    result = service.get_system_metrics()
    
    assert result["cpu_percent"] == 25.0
    assert result["memory_percent"] == 50.0
    assert len(result["top_processes"]) > 0
