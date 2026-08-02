'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiLoader, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { taxAssistantApi } from '@/lib/api';
import { TaxAssistantQuestion, TaxAssistantResult, TaxAssistantSession } from '@/types';

export default function TaxAssistantPage() {
  const [session, setSession] = useState<TaxAssistantSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<TaxAssistantQuestion | null>(null);
  const [result, setResult] = useState<TaxAssistantResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsLoading(true);
        const response = await taxAssistantApi.startSession();
        setSession(response.data);
        setCurrentQuestion(response.data.question);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to start tax assistant');
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []);

  const handleAnswer = async (questionId: string, optionValue: string) => {
    if (!session) return;

    setError(null);
    setIsLoading(true);

    try {
      // Store the answer
      const newAnswers = { ...answers, [questionId]: optionValue };
      setAnswers(newAnswers);

      // Send answer to API
      const response = await taxAssistantApi.answerQuestion(
        session.sessionId,
        questionId,
        optionValue
      );

      // Update state based on response
      if (response.data.completed) {
        setResult(response.data.result);
        setCompleted(true);
      } else if (response.data.question) {
        setCurrentQuestion(response.data.question);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to process your answer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCompleted(false);
    setAnswers({});

    try {
      const response = await taxAssistantApi.startSession();
      setSession(response.data);
      setCurrentQuestion(response.data.question);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to restart tax assistant');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !currentQuestion) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500 mx-auto mb-4" />
          <p className="text-gray-400">Initializing Tax Assistant...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <div className="w-16 h-16 rounded-full bg-red-500 bg-opacity-20 flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-red-400">Error</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button onClick={handleRestart} className="btn btn-primary">
              <FiRefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (completed && result) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="container">
          {/* Header */}
          <div className="mb-6">
            <Link href="/" className="flex items-center text-gold-400 hover:text-gold-300 transition-colors">
              <FiArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>

          {/* Result Card */}
          <div className="max-w-3xl mx-auto">
            <div className="card text-center">
              <div className="w-16 h-16 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-3xl font-bold mb-2">{result.title}</h1>
              <p className="text-gray-300 mb-6">{result.description}</p>

              {/* Severity Badge */}
              <div className="mb-6">
                <span
                  className={`badge ${
                    result.severity === 'INFO' ? 'badge-gold' :
                    result.severity === 'WARNING' ? 'badge-warning' :
                    result.severity === 'CRITICAL' ? 'badge-error' :
                    'badge-gold'
                  }`}
                >
                  {result.severity.replace('_', ' ')}
                </span>
              </div>

              {/* Action Button */}
              {result.action && (
                <div className="mb-6">
                  <button className="btn btn-primary">
                    {result.action.replace('_', ' ')}
                  </button>
                </div>
              )}

              {/* Restart Button */}
              <button onClick={handleRestart} className="btn btn-secondary">
                <FiRefreshCw className="w-5 h-5 mr-2" />
                Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="container">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="flex items-center text-gold-400 hover:text-gold-300 transition-colors">
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Progress */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">Tax Assistant</h1>
            <span className="text-gray-400 text-sm">
              Question {Object.keys(answers).length + 1}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gold-500 h-2 rounded-full"
              style={{ width: `${Math.min((Object.keys(answers).length + 1) * 20, 100)}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="max-w-3xl mx-auto">
            <div className="card">
              <h2 className="text-xl font-semibold mb-2">{currentQuestion.question}</h2>
              {currentQuestion.description && (
                <p className="text-gray-400 mb-6">{currentQuestion.description}</p>
              )}

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(currentQuestion.id, option.value)}
                    disabled={isLoading}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                      isLoading 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:border-gold-500 hover:bg-gold-500 hover:bg-opacity-10 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id={option.id}
                        name="answer"
                        value={option.value}
                        checked={answers[currentQuestion.id] === option.value}
                        onChange={() => {}}
                        className="w-5 h-5 text-gold-500 border-gray-600 focus:ring-gold-500 mr-3"
                      />
                      <label htmlFor={option.id} className="cursor-pointer">
                        <span className="font-medium">{option.label}</span>
                        <span className="block text-gray-400 text-sm">{option.value}</span>
                      </label>
                    </div>
                  </button>
                ))}
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="mt-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500 mx-auto" />
                  <p className="text-gray-400 text-sm mt-2">Processing your answer...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
