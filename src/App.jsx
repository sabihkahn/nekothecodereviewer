import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [code, setCode] = useState('');
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeHistory, setActiveHistory] = useState(null);

  // Initialize state from localStorage
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('codeReviewHistory') || '[]');
    setHistory(savedHistory);
    
    // Load last active item if available
    if (savedHistory.length > 0) {
      setActiveHistory(savedHistory[0].id);
      setCode(savedHistory[0].code);
      setReview(savedHistory[0].review);
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('codeReviewHistory', JSON.stringify(history));
  }, [history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('https://codereviewer-jade.vercel.app/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: code + "please make sure to give code in a sequence and dont add to mush strings as i dont want code for md file i am just displaying it" })
      });
      const data = await res.json();
      
      const reviewContent = data.message || 'No review returned';
      setReview(reviewContent);
      
      // Create new history entry
      const newEntry = {
        id: Date.now(),
        code,
        review: reviewContent,
        timestamp: new Date().toLocaleString()
      };
      
      // Update history (keep only last 10 items)
      const updatedHistory = [newEntry, ...history].slice(0, 10);
      setHistory(updatedHistory);
      setActiveHistory(newEntry.id);
    } catch (err) {
      setReview('Error fetching review');
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item) => {
    setCode(item.code);
    setReview(item.review);
    setActiveHistory(item.id);
    setIsHistoryOpen(false);
  };

  const clearHistory = () => {
    setHistory([]);
    setActiveHistory(null);
    localStorage.removeItem('codeReviewHistory');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>CodeReview Pro</h1>
        <button 
          className="history-toggle"
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        >
          {isHistoryOpen ? 'Close History' : 'View History'}
        </button>
      </header>

      <div className="main-content">
        <div className={`history-sidebar ${isHistoryOpen ? 'open' : ''}`}>
          <div className="history-header">
            <h2>Review History</h2>
            {history.length > 0 && (
              <button className="clear-history" onClick={clearHistory}>
                Clear All
              </button>
            )}
          </div>
          
          {history.length === 0 ? (
            <p className="empty-history">No review history yet</p>
          ) : (
            <ul className="history-list">
              {history.map(item => (
                <li 
                  key={item.id} 
                  className={`history-item ${activeHistory === item.id ? 'active' : ''}`}
                  onClick={() => loadHistoryItem(item)}
                >
                  <div className="history-snippet">
                    {item.code.substring(0, 50)}{item.code.length > 50 ? '...' : ''}
                  </div>
                  <div className="history-timestamp">{item.timestamp}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="content-panels">
          <form className="editor-container" onSubmit={handleSubmit}>
            <h2>Paste your code</h2>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code to review..."
            />
            <button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span> Reviewing...
                </>
              ) : 'Review Code'}
            </button>
          </form>

          <div className="review-container">
            <h2>Review</h2>
            <pre>{review}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;