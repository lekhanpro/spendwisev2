import React, { useState } from 'react';
import { useFinance, RiskProfile } from '../../context/FinanceContext';

interface Question {
  id: number;
  question: string;
  options: { text: string; score: number }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: 'What is your investment time horizon?',
    options: [
      { text: 'Less than 3 years', score: 1 },
      { text: '3-5 years', score: 2 },
      { text: 'More than 5 years', score: 3 }
    ]
  },
  {
    id: 2,
    question: 'How would you react if your investment dropped 20% in value?',
    options: [
      { text: 'Sell immediately to prevent further loss', score: 1 },
      { text: 'Hold and wait for recovery', score: 2 },
      { text: 'Buy more at lower prices', score: 3 }
    ]
  },
  {
    id: 3,
    question: 'What percentage of your savings are you willing to invest in stocks?',
    options: [
      { text: 'Less than 20%', score: 1 },
      { text: '20-50%', score: 2 },
      { text: 'More than 50%', score: 3 }
    ]
  },
  {
    id: 4,
    question: 'What is your primary investment goal?',
    options: [
      { text: 'Capital preservation with steady income', score: 1 },
      { text: 'Balanced growth with moderate risk', score: 2 },
      { text: 'Maximum growth, willing to take high risk', score: 3 }
    ]
  },
  {
    id: 5,
    question: 'How much investment experience do you have?',
    options: [
      { text: 'Beginner - No prior experience', score: 1 },
      { text: 'Intermediate - Some experience', score: 2 },
      { text: 'Advanced - Extensive experience', score: 3 }
    ]
  }
];

interface RiskProfileFormProps {
  onComplete: () => void;
}

export const RiskProfileForm: React.FC<RiskProfileFormProps> = ({ onComplete }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const { setRiskProfile } = useFinance();

  const handleAnswer = (questionId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const calculateProfile = (): RiskProfile => {
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    if (totalScore <= 7) return 'conservative';
    if (totalScore <= 11) return 'moderate';
    return 'aggressive';
  };

  const handleSubmit = () => {
    const profile = calculateProfile();
    setRiskProfile(profile);
    onComplete();
  };

  const isComplete = Object.keys(answers).length === questions.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Risk Profile Assessment
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          Answer 5 questions to determine your investment risk profile
        </p>
        <div className="mt-4 flex justify-center gap-2">
          {questions.map(q => (
            <div
              key={q.id}
              className={`w-3 h-3 rounded-full ${
                answers[q.id] ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => (
          <div
            key={q.id}
            className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700"
          >
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
              {index + 1}. {q.question}
            </h3>
            <div className="space-y-3">
              {q.options.map((option, optIndex) => (
                <button
                  key={optIndex}
                  onClick={() => handleAnswer(q.id, option.score)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers[q.id] === option.score
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        answers[q.id] === option.score
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {answers[q.id] === option.score && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!isComplete}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
          isComplete
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
        }`}
      >
        {isComplete ? 'View My Investment Profile' : `Answer ${questions.length - Object.keys(answers).length} more question(s)`}
      </button>
    </div>
  );
};
