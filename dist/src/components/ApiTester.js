"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ApiTester;
const react_1 = require("react");
const axios_1 = __importDefault(require("axios"));
const fa_1 = require("react-icons/fa");
function ApiTester() {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [results, setResults] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)('');
    const testApi = async () => {
        setLoading(true);
        setError('');
        setResults(null);
        try {
            const response = await axios_1.default.get('/api/test');
            setResults(response.data);
        }
        catch (err) {
            console.error('Test error:', err);
            setError(`API test failed: ${err.message}`);
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="mt-8 p-6 bg-gray-800 rounded-lg">
      <h3 className="text-xl font-bold mb-4">API Connection Tester</h3>
      
      <button onClick={testApi} disabled={loading} className="mb-4 bg-fpl-dark hover:bg-opacity-90 text-white px-4 py-2 rounded">
        {loading ? (<span className="flex items-center">
            <fa_1.FaSpinner className="animate-spin mr-2"/>
            Testing...
          </span>) : ('Test FPL API Connection')}
      </button>
      
      {error && (<div className="mb-4 p-3 bg-red-900 bg-opacity-30 text-red-400 border border-red-700 rounded">
          {error}
        </div>)}
      
      {results && (<div>
          <div className="mb-2 p-2 bg-gray-700 rounded">
            <p>Status: <span className={results.success ? "text-green-500" : "text-red-500"}>
              {results.success ? "Success" : "Failed"}
            </span></p>
            <p>HTTP Status: {results.status}</p>
          </div>
          
          {results.teams && (<div className="mb-2">
              <h4 className="font-medium mb-1">Teams Sample:</h4>
              <div className="p-2 bg-gray-700 rounded overflow-x-auto">
                <pre className="text-xs">{JSON.stringify(results.teams, null, 2)}</pre>
              </div>
            </div>)}
          
          {results.gameSettings && (<div className="mb-2">
              <h4 className="font-medium mb-1">Game Settings:</h4>
              <div className="p-2 bg-gray-700 rounded overflow-x-auto">
                <pre className="text-xs">{JSON.stringify(results.gameSettings, null, 2)}</pre>
              </div>
            </div>)}
          
          {!results.success && results.response && (<div className="mb-2">
              <h4 className="font-medium mb-1">Error Details:</h4>
              <div className="p-2 bg-gray-700 rounded overflow-x-auto">
                <pre className="text-xs">{JSON.stringify(results.response, null, 2)}</pre>
              </div>
            </div>)}
        </div>)}
    </div>);
}
