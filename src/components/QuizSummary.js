import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import "../QuizSummary.css";

const QuizSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, questions, answersSummary, badges } = location.state || {};

  return (
    <div className="quiz-summary-layout">
      <Confetti />

      <div className="quiz-summary-left">
        <h2>🎉 Quiz Completed!</h2>
        <p>Your Score: {score} / {questions.length * 10}</p>

        <h3>🏆 Achievements</h3>
        <div className="badges">
          {badges.length > 0 ? (
            badges.map((badge, index) => <span key={index} className="badge">{badge}</span>)
          ) : (
            <p>No achievements unlocked.</p>
          )}
        </div>

        <h3>📊 Leaderboard</h3>
        <ul className="leaderboard">
          {JSON.parse(localStorage.getItem("highScores"))?.map((s, index) => (
            <li  key={index}>{index + 1}. {s} points</li>
          ))}
        </ul>

        
        <div className="retry-button-container">
          <button className="retry-button" onClick={() => navigate("/")}>Try Again</button>
        </div>
      </div>

      
      <div className="quiz-summary-right">
        <h3>📖 Answer Summary</h3>
        <div className="answer-summary-container">
          {answersSummary.map((summary, index) => (
            <div key={index} className={`answer-box ${summary.isCorrect ? "correct" : "incorrect"}`}>
              <h4>Q{index + 1}: {summary.question}</h4>
              <p><strong>Your Answer:</strong> {summary.selectedAnswer}</p>
              <p><strong>Correct Answer:</strong> {summary.correctAnswer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizSummary;
