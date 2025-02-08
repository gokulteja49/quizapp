import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QuizApp from "./components/QuizApp";
import QuizSummary from "./components/QuizSummary";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<QuizApp />} />
        <Route path="/quiz-summary" element={<QuizSummary />} />
      </Routes>
    </Router>
  );
}

export default App;
