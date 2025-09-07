import React, { useState } from 'react';
import './App.css';

function App() {
  const [topic, setTopic] = useState('');
  const [summary, setSummary] = useState('');
  const [history, setHistory] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const getSummary = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setAnswer('');
    try {
      const res = await fetch('/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      setSummary(data.summary);
      setHistory(prev => [{ topic, summary: data.summary }, ...prev]);
    } catch {
      setSummary('❌ Error fetching summary.');
    } finally {
      setLoading(false);
    }
  };

  const askFollowUp = async () => {
    if (!question.trim()) return;
    setAnswer('⏳ Thinking...');
    try {
      const res = await fetch('/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary, question }),
      });
      const data = await res.json();
      setAnswer(data.answer);
    } catch {
      setAnswer('❌ Error getting answer.');
    }
  };

  const formatSummary = (text) => {
    return text
      .split(/\n+/)
      .filter(line => line.trim())
      .map((line, i) => <li key={i}>{line.replace(/^[-•]\s*/, '')}</li>);
  };

  return (
    <div className="container">
      <aside className="sidebar">
        <h2>🕘 History</h2>
        <div id="history">
          {history.map((item, i) => (
            <div className="history-item" key={i}>
              <strong>{item.topic}</strong>
              <ul>{formatSummary(item.summary)}</ul>
            </div>
          ))}
        </div>
      </aside>

      <main className="main">
        <h2>🧠 NewsChat AI</h2>
        <p>Enter a topic to get a summary.</p>

        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. India election, AI policy"
        />
        <button onClick={getSummary}>Get Summary</button>

        <div className="summary-box">
          {loading ? (
            "⏳ Loading..."
          ) : (
            summary && (
              <>
                <strong>Summary:</strong>
                <ul>{formatSummary(summary)}</ul>
              </>
            )
          )}
        </div>

        <div className="followup">
          <h3>💬 Ask a follow-up question</h3>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What are the risks?"
          />
          <button onClick={askFollowUp}>Ask</button>
          <div className="summary-box">
            {answer && (
              <>
                <strong>Answer:</strong>
                <p>{answer}</p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
