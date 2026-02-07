import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Play, RotateCcw, ChevronRight, CheckCircle, AlertCircle, Terminal } from 'lucide-react';

/**
 * LabActivity Component
 * Code editor and execution environment for hands-on learning
 * - Interactive code editor with syntax highlighting support
 * - Write, test, and submit code
 * - Test case validation
 * - Points awarded on successful submission
 * - Can be retaken multiple times
 */
export default function LabActivity({
  activityId,
  courseId,
  moduleId,
  userId,
  labTitle = 'Lab Activity',
  description = '',
  initialCode = '',
  testCases = [],
  expectedOutput = '',
  language = 'javascript',
  onComplete = () => {},
}) {
  const { updateUserCoursePoints, recordQuizAttempt } = useApp();

  // Lab state
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [passedTests, setPassedTests] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [errors, setErrors] = useState('');

  // Handle code changes
  const handleCodeChange = (e) => {
    setCode(e.target.value);
    setErrors('');
  };

  // Run tests
  const handleRunTests = async () => {
    setIsRunning(true);
    setErrors('');
    setOutput('');
    setTestResults([]);

    try {
      // Simulate code execution
      // In production, this would call a backend API
      await simulateCodeExecution();
    } catch (error) {
      setErrors('Error executing code: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  // Simulate code execution
  const simulateCodeExecution = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple validation - just checking if code is not empty
        const results = [];
        let passed = 0;

        if (!code.trim()) {
          setErrors('Please write some code before running tests!');
          resolve();
          return;
        }

        // Run test cases
        if (testCases && testCases.length > 0) {
          testCases.forEach((testCase, idx) => {
            const result = {
              id: idx,
              name: testCase.name,
              input: testCase.input,
              expected: testCase.expected,
            };

            // Simulate test result (70% pass rate for demo)
            if (Math.random() > 0.3) {
              result.passed = true;
              result.actual = testCase.expected;
              passed++;
            } else {
              result.passed = false;
              result.actual = 'Different output';
            }

            results.push(result);
          });
        } else {
          // If no test cases defined, mark as passed
          results.push({
            id: 0,
            name: 'Code Execution',
            input: 'N/A',
            expected: 'Success',
            passed: true,
            actual: 'Code executed successfully',
          });
          passed = 1;
        }

        setTestResults(results);
        setPassedTests(passed);
        setOutput(`Tests completed: ${passed}/${results.length} passed`);
        resolve();
      }, 1500);
    });
  };

  // Submit lab
  const handleSubmit = async () => {
    if (passedTests === 0) {
      setErrors('All tests must pass before submitting!');
      return;
    }

    setLoading(true);

    try {
      // Award points based on test performance
      const totalTests = testCases.length || 1;
      const passPercentage = (passedTests / totalTests) * 100;
      let earnedPoints = 0;

      if (passPercentage === 100) {
        earnedPoints = 100; // Full points for all tests passing
      } else if (passPercentage >= 80) {
        earnedPoints = 70; // Partial points for 80%+
      } else if (passPercentage >= 50) {
        earnedPoints = 40; // Minimum points for 50%+
      }

      // Record attempt
      await recordQuizAttempt(userId, activityId, passedTests, 1);

      // Award points
      if (earnedPoints > 0) {
        await updateUserCoursePoints(userId, courseId, earnedPoints, 'lab_completion');
      }

      setIsSubmitted(true);

      // Call completion callback
      setTimeout(() => {
        onComplete({
          activityId,
          passedTests,
          totalTests,
          earnedPoints,
          code,
        });
      }, 1000);
    } catch (error) {
      setErrors('Error submitting lab: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset lab
  const handleReset = () => {
    setCode(initialCode);
    setOutput('');
    setErrors('');
    setTestResults([]);
    setPassedTests(0);
    setIsSubmitted(false);
  };

  // Completion screen
  if (isSubmitted) {
    const totalTests = testCases.length || 1;
    const earnedPoints = passedTests === totalTests ? 100 : passedTests >= totalTests * 0.8 ? 70 : 40;

    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-cyan-500/20 to-sky-500/20 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-cyan-300 mb-2">Lab Complete! 🎉</h2>
          <p className="text-slate-400 text-lg">{labTitle}</p>
        </div>

        {/* Results */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-sky-500/20 border border-sky-500/50 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-sky-400 mb-2">{passedTests}/{totalTests}</div>
            <div className="text-sm text-slate-400">Tests Passed</div>
          </div>
          <div className="bg-cyan-500/20 border border-cyan-500/50 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-cyan-400 mb-2">
              {Math.round((passedTests / totalTests) * 100)}%
            </div>
            <div className="text-sm text-slate-400">Success Rate</div>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">+{earnedPoints}</div>
            <div className="text-sm text-slate-400">Points Earned</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold text-slate-300 whitespace-nowrap transition"
          >
            <RotateCcw className="w-4 h-4" />
            Retry Lab
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 rounded-lg text-sm font-semibold text-white whitespace-nowrap transition"
          >
            Continue Course
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Lab Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-xl p-8">
        <h1 className="text-3xl font-bold text-cyan-300 mb-2">{labTitle}</h1>
        <p className="text-slate-400 text-lg">{description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Code Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Editor Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Code Editor
              </h2>
              <p className="text-xs text-slate-500 mt-1">Language: {language.toUpperCase()}</p>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition"
            >
              Reset Code
            </button>
          </div>

          {/* Editor Area */}
          <div className="bg-slate-950/50 rounded-lg border border-cyan-500/30 overflow-hidden">
            <textarea
              value={code}
              onChange={handleCodeChange}
              disabled={isRunning}
              placeholder={`// Write your ${language} code here...\n\nfunction solution() {\n  // Your code here\n}`}
              className="w-full p-4 bg-slate-950 text-slate-100 font-mono text-sm focus:outline-none disabled:opacity-50 resize-none h-80 border-none"
              style={{
                fontFamily: 'Fira Code, Monaco, Courier New, monospace',
              }}
            />
          </div>

          {/* Run Tests Button */}
          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 disabled:opacity-50 rounded-lg text-sm font-bold text-white whitespace-nowrap transition"
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Tests
              </>
            )}
          </button>

          {/* Output */}
          {output && (
            <div className="bg-slate-950/50 rounded-lg border border-sky-500/30 p-4">
              <p className="text-xs font-semibold text-sky-300 mb-2">Output:</p>
              <p className="text-slate-300 font-mono text-sm">{output}</p>
            </div>
          )}

          {/* Errors */}
          {errors && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{errors}</p>
            </div>
          )}
        </div>

        {/* Test Cases & Info */}
        <div className="space-y-4">
          {/* Test Cases */}
          {testResults.length > 0 && (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-lg p-6">
              <h3 className="text-lg font-bold text-cyan-300 mb-4">Test Results</h3>
              <div className="space-y-2">
                {testResults.map((test) => (
                  <div
                    key={test.id}
                    className={`p-3 rounded-lg border ${
                      test.passed
                        ? 'bg-sky-500/10 border-sky-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {test.passed ? (
                        <CheckCircle className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-300">{test.name}</p>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          Expected: {test.expected}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-lg p-6">
            <h3 className="text-lg font-bold text-cyan-300 mb-4">Requirements</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-slate-300">Write clean, readable code</p>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-slate-300">All test cases must pass</p>
              </div>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-slate-300">Follow best practices</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          {testResults.length > 0 && passedTests > 0 && (
            <button
              onClick={handleSubmit}
              disabled={loading || passedTests === 0}
              className="w-full px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 disabled:opacity-50 rounded-lg text-sm font-bold text-white whitespace-nowrap transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit Lab
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
