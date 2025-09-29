import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  User,
  Terminal,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";

const ExecutionDetails: React.FC = () => {
  const { id } = useParams();

  // Mock execution data
  const execution = {
    id: id || "1",
    scriptName: "Azure VM Status Check",
    scriptId: "1",
    executor: "John Doe",
    startedAt: "2024-01-20T10:30:00Z",
    finishedAt: "2024-01-20T10:30:02Z",
    status: "success" as const,
    exitCode: 0,
    duration: "2.3s",
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
Total VMs found: 2

Script execution completed successfully.`,
    stderr: "",
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "success":
        return {
          icon: CheckCircle,
          color:
            "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20",
          bgColor: "bg-green-50 dark:bg-green-900/10",
          borderColor: "border-green-200 dark:border-green-800",
        };
      case "warning":
        return {
          icon: AlertCircle,
          color:
            "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20",
          bgColor: "bg-yellow-50 dark:bg-yellow-900/10",
          borderColor: "border-yellow-200 dark:border-yellow-800",
        };
      case "error":
        return {
          icon: XCircle,
          color: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20",
          bgColor: "bg-red-50 dark:bg-red-900/10",
          borderColor: "border-red-200 dark:border-red-800",
        };
      default:
        return {
          icon: Clock,
          color:
            "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800",
          bgColor: "bg-gray-50 dark:bg-gray-900/10",
          borderColor: "border-gray-200 dark:border-gray-800",
        };
    }
  };

  const statusInfo = getStatusInfo(execution.status);
  const StatusIcon = statusInfo.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/library"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Execution Details
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View detailed execution results and logs
          </p>
        </div>
      </div>

      {/* Execution Overview */}
      <div
        className={`card border-l-4 ${statusInfo.borderColor} ${statusInfo.bgColor}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${statusInfo.color}`}>
              <StatusIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {execution.scriptName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Execution ID: {execution.id}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
            >
              <StatusIcon className="w-4 h-4 mr-1" />
              {execution.status.charAt(0).toUpperCase() +
                execution.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Execution Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Executed by
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {execution.executor}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Duration
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {execution.duration}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Terminal className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Exit Code
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {execution.exitCode}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Started At
              </p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {formatDate(execution.startedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Execution Timeline
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                Execution Started
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(execution.startedAt)}
              </p>
            </div>
          </div>
          <div className="ml-1.5 w-0.5 h-8 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center space-x-4">
            <div
              className={`w-3 h-3 rounded-full ${
                execution.status === "success"
                  ? "bg-green-500"
                  : execution.status === "warning"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            ></div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                Execution Completed
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(execution.finishedAt)} • Duration:{" "}
                {execution.duration}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="space-y-4">
        {/* Standard Output */}
        {execution.stdout && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Terminal className="w-5 h-5" />
              <span>Standard Output</span>
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="console-output console-success text-sm">
                {execution.stdout}
              </pre>
            </div>
          </div>
        )}

        {/* Standard Error */}
        {execution.stderr && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span>Error Output</span>
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="console-output console-error text-sm">
                {execution.stderr}
              </pre>
            </div>
          </div>
        )}

        {/* No Output */}
        {!execution.stdout && !execution.stderr && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Terminal className="w-5 h-5" />
              <span>Output</span>
            </h3>
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="console-output text-gray-400 text-sm">
                No output was generated by this execution.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Actions
          </h3>
          <div className="flex items-center space-x-3">
            <Link
              to={`/editor/${execution.scriptId}`}
              className="btn-secondary"
            >
              View Script
            </Link>
            <button className="btn-primary">Re-run Script</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionDetails;
