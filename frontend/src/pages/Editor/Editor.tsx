import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import { 
  Save, 
  Play, 
  Download, 
  Upload, 
  Settings, 
  Maximize2, 
  Minimize2,
  Terminal,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Editor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);

  const [script, setScript] = useState({
    name: 'Untitled Script',
    content: '# PowerShell Script\n# Write your code here...\n\nWrite-Host "Hello, World!"',
  });
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConsole, setShowConsole] = useState(true);
  const [executionResult, setExecutionResult] = useState<any>(null);

  // Mock script loading
  useEffect(() => {
    if (id) {
      setLoading(true);
      // Simulate loading script
      setTimeout(() => {
        setScript({
          name: 'Sample Azure Script',
          content: `# Azure VM Status Check
# This script checks the status of Azure VMs

# Connect to Azure (requires authentication)
Connect-AzAccount

# Get all VMs
$vms = Get-AzVM

# Display VM information
foreach ($vm in $vms) {
    Write-Host "VM Name: $($vm.Name)"
    Write-Host "Resource Group: $($vm.ResourceGroupName)"
    Write-Host "Location: $($vm.Location)"
    Write-Host "Status: $($vm.PowerState)"
    Write-Host "---"
}

Write-Host "Total VMs found: $($vms.Count)"`,
        });
        setLoading(false);
      }, 1000);
    }
  }, [id]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Configure PowerShell language
    monaco.languages.setLanguageConfiguration('powershell', {
      comments: {
        lineComment: '#',
        blockComment: ['<#', '#>'],
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
    });

    // Add PowerShell keywords
    monaco.languages.setMonarchTokensProvider('powershell', {
      keywords: [
        'if', 'else', 'elseif', 'switch', 'foreach', 'for', 'while', 'do',
        'function', 'filter', 'workflow', 'class', 'enum', 'param', 'begin',
        'process', 'end', 'try', 'catch', 'finally', 'throw', 'return',
        'break', 'continue', 'exit', 'trap', 'data', 'dynamicparam',
      ],
      operators: [
        '=', '+=', '-=', '*=', '/=', '%=', '++', '--',
        '-eq', '-ne', '-lt', '-le', '-gt', '-ge',
        '-like', '-notlike', '-match', '-notmatch',
        '-contains', '-notcontains', '-in', '-notin',
        '-and', '-or', '-not', '-xor', '-band', '-bor', '-bnot', '-bxor',
      ],
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      tokenizer: {
        root: [
          [/[a-zA-Z_$][\w$]*/, {
            cases: {
              '@keywords': 'keyword',
              '@default': 'identifier'
            }
          }],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string'],
          [/'([^'\\]|\\.)*$/, 'string.invalid'],
          [/'/, 'string', '@string_single'],
          [/#.*$/, 'comment'],
          [/<#/, 'comment', '@comment'],
          [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
          [/\d+/, 'number'],
          [/[{}()\[\]]/, '@brackets'],
          [/@symbols/, {
            cases: {
              '@operators': 'operator',
              '@default': ''
            }
          }],
        ],
        string: [
          [/[^\\"]+/, 'string'],
          [/"/, 'string', '@pop']
        ],
        string_single: [
          [/[^\\']+/, 'string'],
          [/'/, 'string', '@pop']
        ],
        comment: [
          [/[^#]+/, 'comment'],
          [/#>/, 'comment', '@pop'],
          [/#/, 'comment']
        ],
      },
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Script saved successfully!');
    } catch (error) {
      toast.error('Failed to save script');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    setExecutionResult(null);
    
    try {
      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult = {
        status: 'success',
        exitCode: 0,
        stdout: `Hello, World!
VM Name: WebServer01
Resource Group: Production-RG
Location: East US
Status: Running
---
VM Name: DatabaseServer01
Resource Group: Production-RG
Location: East US
Status: Running
---
Total VMs found: 2`,
        stderr: '',
        duration: '2.3s',
      };
      
      setExecutionResult(mockResult);
      toast.success('Script executed successfully!');
    } catch (error) {
      const errorResult = {
        status: 'error',
        exitCode: 1,
        stdout: '',
        stderr: 'Error: Failed to connect to Azure. Please check your credentials.',
        duration: '0.5s',
      };
      setExecutionResult(errorResult);
      toast.error('Script execution failed');
    } finally {
      setExecuting(false);
    }
  };

  const handleExport = () => {
    const exportData = {
      metadata: {
        name: script.name,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      },
      script: script.content,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Script exported successfully!');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content);
          setScript({
            name: data.metadata?.name || 'Imported Script',
            content: data.script || content,
          });
        } else {
          setScript({
            name: file.name.replace('.ps1', ''),
            content,
          });
        }
        
        toast.success('Script imported successfully!');
      } catch (error) {
        toast.error('Failed to import script');
      }
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-4' : ''}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={script.name}
            onChange={(e) => setScript({ ...script, name: e.target.value })}
            className="text-xl font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white focus:bg-gray-50 dark:focus:bg-dark-200 px-2 py-1 rounded"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {id ? 'Editing' : 'New Script'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowConsole(!showConsole)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
            title="Toggle Console"
          >
            <Terminal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          <div className="h-4 w-px bg-gray-300 dark:bg-dark-300" />

          <input
            type="file"
            accept=".ps1,.json"
            onChange={handleImport}
            className="hidden"
            id="import-file"
          />
          <label
            htmlFor="import-file"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors cursor-pointer"
            title="Import Script"
          >
            <Upload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </label>

          <button
            onClick={handleExport}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
            title="Export Script"
          >
            <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="btn-secondary flex items-center space-x-2"
          >
            {loading ? (
              <LoadingSpinner size="small" color="gray" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save</span>
          </button>

          <button
            onClick={handleExecute}
            disabled={executing}
            className="btn-primary flex items-center space-x-2"
          >
            {executing ? (
              <LoadingSpinner size="small" color="white" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{executing ? 'Running...' : 'Run'}</span>
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className={`grid gap-4 ${showConsole ? 'grid-rows-2' : 'grid-rows-1'} ${isFullscreen ? 'h-[calc(100vh-8rem)]' : 'h-[600px]'}`}>
        <div className="monaco-editor-container">
          <MonacoEditor
            height="100%"
            language="powershell"
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            value={script.content}
            onChange={(value) => setScript({ ...script, content: value || '' })}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              renderWhitespace: 'selection',
              bracketPairColorization: { enabled: true },
              guides: {
                bracketPairs: true,
                indentation: true,
              },
            }}
          />
        </div>

        {/* Console */}
        {showConsole && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <Terminal className="w-5 h-5" />
                <span>Console Output</span>
              </h3>
              {executionResult && (
                <div className="flex items-center space-x-2">
                  {getStatusIcon(executionResult.status)}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Exit code: {executionResult.exitCode} • Duration: {executionResult.duration}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-gray-900 rounded-lg p-4 min-h-[200px] max-h-[300px] overflow-y-auto">
              {executing ? (
                <div className="flex items-center space-x-2 text-yellow-400">
                  <LoadingSpinner size="small" color="white" />
                  <span className="console-output">Executing script...</span>
                </div>
              ) : executionResult ? (
                <div className="space-y-2">
                  {executionResult.stdout && (
                    <div className={`console-output ${
                      executionResult.status === 'success' ? 'console-success' : 'text-white'
                    }`}>
                      {executionResult.stdout}
                    </div>
                  )}
                  {executionResult.stderr && (
                    <div className="console-output console-error">
                      {executionResult.stderr}
                    </div>
                  )}
                  {!executionResult.stdout && !executionResult.stderr && (
                    <div className="console-output text-gray-400">
                      No output
                    </div>
                  )}
                </div>
              ) : (
                <div className="console-output text-gray-400">
                  Ready to execute script. Click "Run" to start.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;