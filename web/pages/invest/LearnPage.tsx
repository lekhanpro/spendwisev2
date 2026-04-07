import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import learningTopics from '../../data/learningTopics.json';

interface Topic {
  id: string;
  title: string;
  icon: string;
  content: string;
  keyTakeaway: string;
  quiz: {
    question: string;
    options: string[];
    correct: number;
  }[];
}

export const LearnPage: React.FC = () => {
  const { learnProgress, updateLearnProgress, learnStreak, updateLearnStreak } = useFinance();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  const topics = learningTopics as Topic[];

  useEffect(() => {
    updateLearnStreak();
  }, []);

  useEffect(() => {
    const completedCount = Object.values(learnProgress).filter(Boolean).length;
    if (completedCount === topics.length && !showBadge) {
      setShowBadge(true);
    }
  }, [learnProgress, topics.length]);

  const progressPercentage = Math.round((Object.values(learnProgress).filter(Boolean).length / topics.length) * 100);

  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    setQuizAnswers({});
    setShowResults(false);
  };

  const handleQuizAnswer = (questionIndex: number, optionIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleQuizSubmit = () => {
    if (!selectedTopic) return;
    
    const correctAnswers = selectedTopic.quiz.filter(
      (q, index) => quizAnswers[index] === q.correct
    ).length;

    const passed = correctAnswers >= 2; // Need 2/3 correct to pass
    
    if (passed) {
      updateLearnProgress(selectedTopic.id, true);
    }
    
    setShowResults(true);
  };

  const isQuizComplete = selectedTopic && Object.keys(quizAnswers).length === selectedTopic.quiz.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Financial Learning Center
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Master the basics of personal finance and investing
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📚</div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Progress</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{progressPercentage}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="text-3xl">✅</div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {Object.values(learnProgress).filter(Boolean).length}/{topics.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🔥</div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Streak</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{learnStreak} days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Badge */}
        {showBadge && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 mb-6 text-white text-center">
            <div className="text-6xl mb-2">🏆</div>
            <h2 className="text-2xl font-bold mb-1">Finance Literate!</h2>
            <p>Congratulations! You've completed all learning modules.</p>
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden sticky top-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <h3 className="font-semibold text-slate-900 dark:text-white">Topics</h3>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {topics.map((topic, index) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicSelect(topic)}
                    className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                      selectedTopic?.id === topic.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{topic.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {index + 1}. {topic.title}
                        </p>
                      </div>
                      {learnProgress[topic.id] && (
                        <span className="text-green-500">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {selectedTopic ? (
              <div className="space-y-6">
                {/* Article */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{selectedTopic.icon}</span>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {selectedTopic.title}
                    </h2>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {selectedTopic.content}
                    </p>
                  </div>
                </div>

                {/* Key Takeaway */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <span>💡</span> Key Takeaway
                  </h3>
                  <p className="text-blue-800 dark:text-blue-300">
                    {selectedTopic.keyTakeaway}
                  </p>
                </div>

                {/* Quiz */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                    Test Your Knowledge
                  </h3>
                  <div className="space-y-6">
                    {selectedTopic.quiz.map((q, qIndex) => (
                      <div key={qIndex}>
                        <p className="font-medium text-slate-900 dark:text-white mb-3">
                          {qIndex + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((option, oIndex) => (
                            <button
                              key={oIndex}
                              onClick={() => !showResults && handleQuizAnswer(qIndex, oIndex)}
                              disabled={showResults}
                              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                showResults
                                  ? oIndex === q.correct
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : quizAnswers[qIndex] === oIndex
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-slate-200 dark:border-slate-700'
                                  : quizAnswers[qIndex] === oIndex
                                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    showResults && oIndex === q.correct
                                      ? 'border-green-500 bg-green-500'
                                      : quizAnswers[qIndex] === oIndex
                                      ? 'border-blue-600 bg-blue-600'
                                      : 'border-slate-300 dark:border-slate-600'
                                  }`}
                                >
                                  {((showResults && oIndex === q.correct) || quizAnswers[qIndex] === oIndex) && (
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                  )}
                                </div>
                                <span className="text-slate-700 dark:text-slate-300">{option}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!showResults ? (
                    <button
                      onClick={handleQuizSubmit}
                      disabled={!isQuizComplete}
                      className={`w-full mt-6 py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                        isQuizComplete
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                      }`}
                    >
                      Submit Quiz
                    </button>
                  ) : (
                    <div className="mt-6">
                      {learnProgress[selectedTopic.id] ? (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                          <p className="text-green-800 dark:text-green-200 font-semibold">
                            ✓ Great job! Topic completed.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                          <p className="text-red-800 dark:text-red-200 font-semibold mb-2">
                            Need 2/3 correct answers to pass. Try again!
                          </p>
                          <button
                            onClick={() => {
                              setQuizAnswers({});
                              setShowResults(false);
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                          >
                            Retry Quiz
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-12 border border-slate-200 dark:border-slate-700 text-center">
                <span className="text-6xl mb-4 block">📚</span>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Select a Topic to Start Learning
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Choose a topic from the sidebar to begin your financial education journey
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
