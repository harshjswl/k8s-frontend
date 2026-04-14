import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [name, setName] = useState('');

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
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

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
    </div>
  )
}

export default App
