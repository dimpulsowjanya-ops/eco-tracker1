import React, { useState } from 'react';
import { Send, HelpCircle, Sparkles } from 'lucide-react';
import { answerQuestion } from '../utils/aiEngine.js';

const IMPACT_CONFIG = {
  very_high: { label: 'Very High Impact', color: '#10b981', bg: '#10b98115' },
  high:      { label: 'High Impact',      color: '#3b82f6', bg: '#3b82f615' },
  medium:    { label: 'Medium Impact',    color: '#f59e0b', bg: '#f59e0b15' },
  low:       { label: 'Low Impact',       color: '#94a3b8', bg: '#94a3b815' },
};

/**
 * AI Suggestions panel — rule-based smart assistant with Q&A chat.
 */
export function AISuggestions({ aiResults, logCount, logs = [], currentXP = 0, levelTitle = 'Eco Novice', budget = 50 }) {
  const { suggestions, insight, priority, breakdown, globalComparison } = aiResults;
  const [question, setQuestion] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleAsk = (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsTyping(true);
    setChatResponse('');

    // Simulate smart thinking delay
    setTimeout(() => {
      const response = answerQuestion(question, logs, currentXP, levelTitle, budget);
      setChatResponse(response);
      setIsTyping(false);
      setQuestion('');
    }, 450);
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Check if bullet point
      const isBullet = line.trim().startsWith('- ');
      let content = isBullet ? line.trim().slice(2) : line;

      // Handle bold tags **text**
      const parts = content.split(/(\*\*[^*]+\*\*)/g);
      const elements = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      });

      if (isBullet) {
        return <li key={idx} className="ai-chat-bullet">{elements}</li>;
      }
      if (line.trim() === '') {
        return <div key={idx} style={{ height: '6px' }} />;
      }
      return <p key={idx} className="ai-chat-paragraph">{elements}</p>;
    });
  };

  return (
    <section aria-labelledby="ai-heading" className="card ai-panel">
      <div className="card__header">
        <h2 id="ai-heading" className="card__title">
          <span aria-hidden="true">🤖</span> Smart Eco Assistant
        </h2>
        {priority && (
          <span className="ai-priority-badge" aria-label={`Focus area: ${priority}`}>
            Focus: {priority}
          </span>
        )}
      </div>

      <div className="ai-layout-container">
        {/* Left Side: General Assistant & Tips */}
        <div className="ai-main-insights">
          {/* Insight Summary */}
          <div className="ai-insight" role="status" aria-live="polite" aria-label="Personalised insight">
            <span className="ai-insight__icon" aria-hidden="true">💡</span>
            <p className="ai-insight__text">{renderMarkdown(insight)}</p>
          </div>

          {/* Suggestions List */}
          <div className="ai-suggestions" role="list" aria-label="Personalised recommendations">
            <h3 className="ai-suggestions__title">
              {logCount === 0 ? 'Getting Started Tips' : 'Top Actionable Recommendations'}
            </h3>
            <div className="suggestions-grid">
              {suggestions.map((s, idx) => {
                const impact = IMPACT_CONFIG[s.impact] || IMPACT_CONFIG.low;
                return (
                  <article
                    key={s.id}
                    className="suggestion-card"
                    role="listitem"
                    aria-label={`Recommendation ${idx + 1}: ${s.title}`}
                  >
                    <div className="suggestion-card__header">
                      <span className="suggestion-card__icon" aria-hidden="true">{s.icon}</span>
                      <div className="suggestion-card__meta">
                        <h4 className="suggestion-card__title">{s.title}</h4>
                        <div className="suggestion-card__tags">
                          <span
                            className="tag"
                            style={{ background: impact.bg, color: impact.color }}
                            aria-label={impact.label}
                          >
                            {impact.label}
                          </span>
                          <span className="tag tag--saving" aria-label={`Potential saving: ${s.saving}`}>
                            💰 {s.saving}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="suggestion-card__desc">{s.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Smart Interactive Chat Bot */}
        <div className="ai-chat-box">
          <div className="ai-chat-header">
            <Sparkles size={16} className="chat-sparkle-icon" />
            <span>Interactive Eco Q&A</span>
          </div>

          <div className="ai-chat-display" aria-live="polite">
            {chatResponse ? (
              <div className="ai-chat-bubble ai-chat-bubble--response">
                {renderMarkdown(chatResponse)}
              </div>
            ) : isTyping ? (
              <div className="ai-chat-bubble ai-chat-bubble--typing">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            ) : (
              <div className="ai-chat-placeholder">
                <HelpCircle size={32} className="chat-placeholder-icon" />
                <p>Ask me a question about your footprint! e.g.:</p>
                <div className="suggested-queries">
                  <button onClick={() => setQuestion("How do I reduce my Transport emissions?")} className="suggested-query-btn">"Reduce transport emissions"</button>
                  <button onClick={() => setQuestion("Tell me about green energy grid tariffs")} className="suggested-query-btn">"Green electricity tariffs"</button>
                  <button onClick={() => setQuestion("Show me my emission profile summary")} className="suggested-query-btn">"Show profile summary"</button>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleAsk} className="ai-chat-input-form">
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Ask: 'how to reduce transport' or 'show profile'..."
              className="ai-chat-input"
              aria-label="Ask the Eco Assistant a question"
            />
            <button type="submit" className="ai-chat-send-btn" aria-label="Send question">
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
