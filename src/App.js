import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [url, setUrl] = useState('https://falitest.queue-it.net/healthcheck?c=falitest');
  const [logs, setLogs] = useState([]);
  const [isPolling, setIsPolling] = useState(false);
  const pollingInterval = useRef(null);

  const callApi = async () => {
    const startTime = Date.now();
    try {
      const response = await fetch('http://localhost:3001/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();
      
      const logEntry = {
        timestamp: new Date().toLocaleTimeString(),
        status: data.status,
        responseTime: data.responseTime,
        success: data.success,
        response: data.data,
        url
      };

      setLogs(prevLogs => [logEntry, ...prevLogs]);
    } catch (error) {
      console.error('API Error:', error);
      const logEntry = {
        timestamp: new Date().toLocaleTimeString(),
        status: 500,
        error: error.message,
        success: false,
        url
      };

      setLogs(prevLogs => [logEntry, ...prevLogs]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await callApi();
  };

  const startPolling = () => {
    if (!url) {
      alert('Please enter a URL first');
      return;
    }
    setIsPolling(true);
    callApi();
    pollingInterval.current = setInterval(callApi, 60000);
  };

  const stopPolling = () => {
    setIsPolling(false);
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="container mt-4">
      <h2>API Health Check</h2>
      
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="apiUrl" className="form-label">API URL</label>
              <input
                type="url"
                className="form-control"
                id="apiUrl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://falitest.queue-it.net/healthcheck?c=falitest"
                required
              />
            </div>
            <div className="btn-group">
              <button type="submit" className="btn btn-primary">
                Test API
              </button>
              <button 
                type="button" 
                className={`btn ${isPolling ? 'btn-danger' : 'btn-success'} ms-2`}
                onClick={isPolling ? stopPolling : startPolling}
              >
                {isPolling ? 'Stop Auto-Test' : 'Start Auto-Test (1min)'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary ms-2" 
                onClick={clearLogs}
              >
                Clear Logs
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="log-area border rounded mt-4">
        <div className="p-2 bg-light border-bottom">
          <strong>Total Requests:</strong> {logs.length} | 
          <strong> Success:</strong> {logs.filter(log => log.success).length} | 
          <strong> Failed:</strong> {logs.filter(log => !log.success).length}
        </div>
        {logs.map((log, index) => (
          <div
            key={index}
            className={`log-entry p-2 ${log.success ? 'text-success' : 'text-danger'}`}
          >
            [{log.timestamp}] 
            URL: {log.url}<br/>
            Status: {log.status} | 
            {log.success 
              ? `Response Time: ${log.responseTime}ms`
              : `Error: ${log.error}`
            }
            {log.response && (
              <pre className="mt-2 small">
                Response: {log.response}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App; 