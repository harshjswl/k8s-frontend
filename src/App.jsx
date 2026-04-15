import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [name, setName] = useState('');
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch subjects', error);
    }
  };

  // Check backend status periodically
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/status');
        if (response.ok) {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        setIsConnected(false);
      }
    };

    // Check immediately, then every 5 seconds
    checkStatus();
    fetchUsers();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id) => {
    if (!id) return;
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const utterance = new SpeechSynthesisUtterance("Subject Terminated");
        utterance.rate = 0.9;
        utterance.pitch = 0.5;
        window.speechSynthesis.speak(utterance);
        
        fetchUsers();
      } else {
        alert('Failed to terminate subject');
      }
    } catch (error) {
      console.error(error);
      alert('Error occurred while deleting from mainframe');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        // Voice "submitted"
        const utterance = new SpeechSynthesisUtterance("System Override: Data Submitted");
        // add a futuristic rate/pitch
        utterance.rate = 0.9;
        utterance.pitch = 0.5;
        window.speechSynthesis.speak(utterance);
        
        setName(''); // Clear form
        fetchUsers(); // Update list after submit
      } else {
        alert('Failed to submit, Neural Link Disconnected');
      }
    } catch (error) {
      console.error(error);
      alert('Error occurred while syncing with mainframe');
    }
  };

  return (
    <div className="app-container">
      <h1>Data Link</h1>
      
      <div className="status-indicator">
        <div className="traffic-light-container">
          <div className={`traffic-light ${isConnected ? 'green' : 'red'}`}></div>
        </div>
        <span>{isConnected ? 'Mainframe Sync: ONLINE' : 'Mainframe Sync: OFFLINE'}</span>
      </div>

      <form onSubmit={handleSubmit} className="entry-form">
        <input 
          type="text" 
          placeholder="Enter Subject Name..." 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <button type="submit">Initialize Sync</button>
      </form>

      <div className="users-list" style={{ marginTop: '30px', textAlign: 'left', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ borderBottom: '1px solid #4ade80', paddingBottom: '10px', color: '#4ade80' }}>Stored Subjects</h2>
        {users.length === 0 ? (
          <p style={{ color: '#aaa', fontStyle: 'italic' }}>No subjects found in the mainframe.</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {users.map((user) => (
              <li key={user.id || user.name} style={{ 
                padding: '12px 15px', 
                margin: '8px 0', 
                background: 'rgba(74, 222, 128, 0.1)', 
                border: '1px solid rgba(74, 222, 128, 0.3)',
                borderRadius: '6px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }}></div>
                  <span style={{ fontWeight: '500', letterSpacing: '0.5px' }}>{user.name}</span>
                </div>
                {user.id && (
                  <button 
                    onClick={() => handleDelete(user.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.5)',
                      color: '#ef4444',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)'; e.currentTarget.style.boxShadow = '0 0 8px rgba(239, 68, 68, 0.6)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.color = '#ef4444'; }}
                  >
                    Terminate
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
