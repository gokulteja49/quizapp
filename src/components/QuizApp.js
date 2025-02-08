import React, { useState, useEffect } from "react";
import "../App.css";
import Confetti from "react-confetti";
import { useNavigate } from "react-router-dom";


const QuizApp = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answersSummary, setAnswersSummary] = useState([]);
  const [badges, setBadges] = useState([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [showConfetti, setShowConfetti] = useState(false);

  const labels = ["A", "B", "C", "D"];
  
  let correctSound, wrongSound;
  if (typeof window !== "undefined") {
    correctSound = new Audio("/sounds/correct.mp3");
    wrongSound = new Audio("/sounds/wrong.mp3");
  }

  useEffect(() => {
    fetch("http://localhost:5000/quiz")
      .then((response) => response.json())
      .then((data) => {
        if (data.questions) {
          const formattedQuestions = data.questions.map((q) => ({
            question: q.description,
            options: q.options.map((opt) => opt.description),
            correctAnswer: q.options.find((opt) => opt.is_correct)?.description || "",
          }));
          setQuestions(formattedQuestions);
        }
      })
      .catch((error) => console.error("Error fetching quiz data:", error));
  }, []);

  
  useEffect(() => {
    if (questions.length === 0 || quizCompleted) return;

    setTimeLeft(10); 
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout(); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, quizCompleted]);

  const handleTimeout = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setQuizCompleted(true);
      checkAchievements();
      updateLeaderboard();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleAnswerSelection = (answer) => {
    setSelectedAnswer(answer);
  };

  const navigate = useNavigate();

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
  
    let points = 10;
    if (selectedAnswer === currentQuestion.correctAnswer) {
      correctSound?.play()?.catch((err) => console.error("Audio play failed:", err));
      setStreak((prev) => prev + 1);
  
      if (streak >= 3) points *= 2;
      if (streak >= 5) points *= 3;
  
      setScore((prevScore) => prevScore + points);
    } else {
      wrongSound?.play()?.catch((err) => console.error("Audio play failed:", err));
      setStreak(0);
    }
  
    setAnswersSummary([...answersSummary, {
      question: currentQuestion.question,
      selectedAnswer: selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer,
    }]);
  
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      checkAchievements();
      updateLeaderboard();
      navigate("/quiz-summary", {
        state: { score, questions, answersSummary, badges },
      });
    }
  };
  

  const checkAchievements = () => {
    let newBadges = [];
    if (streak >= 5) newBadges.push("🔥 Streak Master");
    if (score >= questions.length * 8) newBadges.push("🎯 Perfect Score");
    if (score >= questions.length * 5) newBadges.push("🏅 High Achiever");

    setBadges(newBadges);
  };

  const updateLeaderboard = () => {
    let highScores = JSON.parse(localStorage.getItem("highScores")) || [];
    highScores.push(score);
    highScores.sort((a, b) => b - a);
    localStorage.setItem("highScores", JSON.stringify(highScores.slice(0, 5)));
  };

  return (
    <div className="quiz-container">
      {showConfetti && <Confetti />}
      {quizCompleted ? (
        <div className="quiz-summary">
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
              <li key={index}>{index + 1}. {s} points</li>
            ))}
          </ul>

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
      ) : (
        questions.length > 0 && (
          <div className="quiz-question">
            <h3>{questions[currentQuestionIndex].question}</h3>
            <p className="timer">⏳ Time Left: {timeLeft}s</p>
            <div className="options-container">
              {questions[currentQuestionIndex].options.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${selectedAnswer === option ? "selected" : ""}`}
                  onClick={() => handleAnswerSelection(option)}
                >
                  <span className="option-label">{labels[index]}.</span> {option}
                </button>
              ))}
            </div>
            <button className="next-button" onClick={handleNextQuestion} disabled={selectedAnswer === null}>
              {currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default QuizApp;
