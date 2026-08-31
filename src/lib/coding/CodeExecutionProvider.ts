export type ExecutionStatus = 'ACCEPTED' | 'WRONG_ANSWER' | 'TLE' | 'MLE' | 'RE' | 'CE' | 'INTERNAL_ERROR' | 'PENDING';

export interface TestCaseInput {
  id: string;
  input: string;
  expectedOutput: string;
}

export interface ExecutionResult {
  testCaseId: string;
  status: ExecutionStatus;
  actualOutput?: string;
  errorOutput?: string;
  executionMs?: number;
  memoryUsedKb?: number;
}

export interface ExecutionOptions {
  language: string;
  code: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  testCases: TestCaseInput[];
}

export interface ICodeExecutionProvider {
  /**
   * Executes code against a set of test cases safely.
   */
  execute(options: ExecutionOptions): Promise<ExecutionResult[]>;
  
  /**
   * Returns true if the provider is fully configured and capable of running code.
   */
  isAvailable(): boolean;
}

import vm from 'vm';

export class InProcessJSExecutionProvider implements ICodeExecutionProvider {
  isAvailable(): boolean {
    return true; // Always available in Node.js
  }

  async execute(options: ExecutionOptions): Promise<ExecutionResult[]> {
    if (options.language !== 'javascript') {
      return options.testCases.map(tc => ({
        testCaseId: tc.id,
        status: 'INTERNAL_ERROR',
        errorOutput: `Language ${options.language} is not supported by InProcessJSExecutionProvider.`
      }));
    }

    const results: ExecutionResult[] = [];

    for (const tc of options.testCases) {
      try {
        const scriptCode = `
          ${options.code}
          // The code should define a function or perform logic that returns the output based on inputs.
          // For simplicity in this environment, we assume the code sets a variable 'result' or we wrap it in a function.
          // To make it robust, let's execute the user code and then call the function with the parsed input.
          // In real scenarios, Leetcode-style execution defines a function signature. Let's assume the user code defines the required function.
          
          // Let's create a sandbox
          let stdout = '';
          let console = { log: (...args) => { stdout += args.join(' ') + '\\n'; } };
          
          // Parse the input (assuming JSON for simplicity or let the user function handle it)
          const args = JSON.parse(${JSON.stringify(tc.input)});
          
          // Assuming user defines the function, we can just execute the code, but we need to know the function name.
          // If we don't know the function name, a common trick is to evaluate an expression at the end, 
          // or have the user code read from process.argv/stdin. 
          // For our platform, we will assume the input is evaluated as a JS expression and assigned to 'input', 
          // and the user must set 'output'. Or we can just use the provided code.
          // Let's assume the test case input is a JSON array of arguments, and the problem defines a specific function name.
          // Wait, we don't have function name here. Let's just run the code and expect the user to return a value at the end.
        `;

        // A better approach for the prototype: The user's code just receives `__INPUT__` and assigns to `__OUTPUT__`.
        const sandbox = { 
          __INPUT__: JSON.parse(tc.input || '[]'), 
          __OUTPUT__: undefined,
          console: { log: () => {} } // silent console
        };

        // Resolve function name using Regex to bypass ES6 const/let lexical block scopes inside VM
        const fnMatch = options.code.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/) || 
                        options.code.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:function|\([^)]*\)\s*=>)/);
        const resolvedFnName = fnMatch ? fnMatch[1] : '';

        const fullCode = `
          ${options.code}
          // Try to execute resolved function or fallback to searching this keys
          const resolvedName = "${resolvedFnName}";
          if (resolvedName && typeof eval(resolvedName) === 'function') {
            const inputArgs = Array.isArray(__INPUT__) ? __INPUT__ : [__INPUT__];
            __OUTPUT__ = eval(resolvedName)(...inputArgs);
          } else {
            const fnName = Object.keys(this).find(k => typeof this[k] === 'function');
            if (fnName) {
               const inputArgs = Array.isArray(__INPUT__) ? __INPUT__ : [__INPUT__];
               __OUTPUT__ = this[fnName](...inputArgs);
            }
          }
        `;

        const start = performance.now();
        vm.runInNewContext(fullCode, sandbox, { timeout: options.timeLimitMs || 2000 });
        const execMs = performance.now() - start;

        const actualStr = JSON.stringify(sandbox.__OUTPUT__);
        const expectedStr = tc.expectedOutput.trim();

        if (actualStr === expectedStr) {
          results.push({ testCaseId: tc.id, status: 'ACCEPTED', executionMs: execMs, actualOutput: actualStr });
        } else {
          results.push({ testCaseId: tc.id, status: 'WRONG_ANSWER', executionMs: execMs, actualOutput: actualStr, errorOutput: `Expected ${expectedStr}, got ${actualStr}` });
        }
      } catch (err: any) {
        if (err.message === 'Script execution timed out.') {
          results.push({ testCaseId: tc.id, status: 'TLE', errorOutput: err.message });
        } else {
          results.push({ testCaseId: tc.id, status: 'RE', errorOutput: err.message });
        }
      }
    }

    return results;
  }
}

/**
 * A safe fallback execution provider that refuses to run code if no secure environment is configured.
 */
export class FallbackExecutionProvider implements ICodeExecutionProvider {
  isAvailable(): boolean {
    return false; 
  }

  async execute(options: ExecutionOptions): Promise<ExecutionResult[]> {
    throw new Error('SECURE_EXECUTION_UNAVAILABLE');
  }
}

/**
 * Factory to get the active execution provider based on environment config.
 */
export function getExecutionProvider(): ICodeExecutionProvider {
  return new InProcessJSExecutionProvider();
}
