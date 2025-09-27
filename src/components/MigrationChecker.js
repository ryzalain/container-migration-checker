import React, { useState, useEffect } from 'react';

// Define TypeScript interfaces for the application's data structures
interface MigrationCheckResult {
  id: string;
  containerIdentifier: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string[];
}

type CloudProvider = 'none' | 'aws' | 'azure' | 'local';
type OSType = 'linux' | 'windows' | 'other';

const MigrationChecker = () => {
  // State for user inputs
  const [cloudProvider, setCloudProvider] = useState<CloudProvider>('none');
  const [accessKeyId, setAccessKeyId] = useState<string>('');
  const [secretAccessKey, setSecretAccessKey] = useState<string>('');
  const [containerIdentifiers, setContainerIdentifiers] = useState<string>(''); // Comma-separated or newline-separated
  const [sourceOs, setSourceOs] = useState<OSType>('linux');
  const [targetOs, setTargetOs] = useState<OSType>('windows');

  // State for application logic and results
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [migrationResults, setMigrationResults] = useState<MigrationCheckResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Simulate a delay for the checking process
  useEffect(() => {
    if (isChecking) {
      const timer = setTimeout(() => {
        simulateMigrationCheck();
        setIsChecking(false);
      }, 3000); // Simulate network latency and processing time
      return () => clearTimeout(timer);
    }
  }, [isChecking]);

  const handleStartCheck = () => {
    setErrorMessage('');
    if (cloudProvider === 'none') {
      setErrorMessage('Please select a cloud provider or "Local/Other".');
      return;
    }
    if (containerIdentifiers.trim() === '') {
      setErrorMessage('Please enter at least one container identifier.');
      return;
    }

    // Reset previous results
    setMigrationResults([]);
    setIsChecking(true);
  };

  // This function simulates the backend logic for checking containers
  const simulateMigrationCheck = () => {
    const identifiers = containerIdentifiers.split(/[\n,]/)
      .map(id => id.trim())
      .filter(id => id.length > 0);

    const results: MigrationCheckResult[] = identifiers.map((id, index) => {
      // Simulate various scenarios based on container ID, OS, and provider
      let status: 'success' | 'warning' | 'error' = 'success';
      let message: string = 'No critical issues found for migration.';
      let details: string[] = [];

      // Example 1: Incompatible OS combination (e.g., Linux container directly to Windows OS migration)
      if (sourceOs === 'linux' && targetOs === 'windows') {
        status = 'error';
        message = 'Significant OS architecture mismatch detected. Direct migration highly discouraged.';
        details.push('Linux kernel dependencies will not function on Windows natively.');
        details.push('Container runtime differences (e.g., Docker Desktop for Windows may use WSL2, but core container image is Linux).');
      } else if (sourceOs === 'windows' && targetOs === 'linux') {
        status = 'error';
        message = 'Windows container images are incompatible with Linux-based hosts.';
        details.push('Windows-specific executables and system libraries cannot run on Linux.');
      }

      // Example 2: Specific identifier patterns indicating potential issues
      if (id.toLowerCase().includes('legacy')) {
        status = 'warning';
        message = 'Container identified as "legacy". May contain outdated dependencies.';
        details.push('Suggest a thorough review of application dependencies and libraries.');
        details.push('Check for end-of-life software components.');
      }
      if (id.toLowerCase().includes('sqlserver') && targetOs === 'linux') {
        if (sourceOs === 'windows') {
          status = 'error';
          message = 'Windows SQL Server container cannot be migrated to Linux host directly.';
          details.push('Consider migrating data and deploying a new SQL Server on Linux container.');
        } else if (sourceOs === 'linux') {
          status = 'success'; // SQL Server on Linux is fine
          message = 'SQL Server on Linux container detected. Generally compatible with Linux target.';
        }
      }
      if (id.toLowerCase().includes('dotnetframework') && targetOs === 'linux') {
        status = 'error';
        message = '.NET Framework applications are Windows-specific. Migrate to .NET Core/5+ for Linux compatibility.';
        details.push('Requires significant application refactoring or running in a Windows container on a Linux host (via specific solutions).');
      } else if (id.toLowerCase().includes('dotnetcore') || id.toLowerCase().includes('dotnet')) {
         if ((sourceOs === 'linux' && targetOs === 'windows') || (sourceOs === 'windows' && targetOs === 'linux')) {
            status = 'success';
            message = '.NET Core/.NET 5+ application detected. Generally cross-platform compatible.';
            details.push('Verify any OS-specific native dependencies used by the application.');
         }
      }


      // Example 3: Cloud provider specific checks (simulated)
      if (cloudProvider === 'aws' && id.toLowerCase().includes('rds')) {
        status = 'warning';
        message = 'RDS instance detected. Database migration requires separate strategy.';
        details.push('Ensure database backup, restoration, and connectivity are planned.');
      }
      if (cloudProvider === 'azure' && id.toLowerCase().includes('blob')) {
        status = 'warning';
        message = 'Azure Blob Storage connection detected. Review access and regional compatibility.';
        details.push('Verify IAM roles/service principals for cross-OS access.');
      }

      // Random additional warnings/errors for variety
      if (Math.random() < 0.2 && status !== 'error') { // 20% chance of an additional warning
        status = 'warning';
        message = message === 'No critical issues found for migration.' ? 'Minor compatibility warnings.' : message;
        details.push('Check for hardcoded file paths that are OS-specific (e.g., `C:\\` vs `/var/`).');
        details.push('Review network configurations and firewall rules for target environment.');
      }
      if (Math.random() < 0.05 && status !== 'error' && status !== 'warning') { // 5% chance of a critical error
        status = 'error';
        message = 'Critical unsupported feature detected!';
        details.push('Specific kernel modules or system calls are incompatible.');
        details.push('Requires re-architecting or alternative solution.');
      }


      return {
        id: `result-${index}`,
        containerIdentifier: id,
        status,
        message,
        details: details.length > 0 ? details : undefined,
      };
    });

    setMigrationResults(results);
  };

  const getStatusColor = (status: MigrationCheckResult['status']) => {
    switch (status) {
      case 'success': return 'border-green-500 bg-green-50 text-green-700';
      case 'warning': return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      case 'error': return 'border-red-500 bg-red-50 text-red-700';
      default: return 'border-gray-300 bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-6 sm:p-8 lg:p-10 border border-gray-200">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center leading-tight">
          Cross-OS Container Migration Checker
        </h1>
        <p className="text-center text-gray-600 mb-8 max-w-prose mx-auto">
          Proactively identify potential issues for a smooth and clean container migration
          between different operating systems, ensuring no bugs or data corruption.
        </p>

        {/* Input Section */}
        <div className="space-y-8 mb-8">
          {/* Cloud Provider Selection */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">1. Select Environment</h2>
            <div className="flex flex-wrap gap-4 mb-4">
              {['aws', 'azure', 'local', 'none'].map((provider) => (
                <button
                  key={provider}
                  onClick={() => setCloudProvider(provider as CloudProvider)}
                  className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-200 ease-in-out
                    ${cloudProvider === provider
                      ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                    }`}
                >
                  {provider === 'aws' ? 'AWS Cloud' :
                   provider === 'azure' ? 'Azure Cloud' :
                   provider === 'local' ? 'Local/Other Network' : 'Select Provider'}
                </button>
              ))}
            </div>

            {(cloudProvider === 'aws' || cloudProvider === 'azure') && (
              <div className="space-y-4 pt-4 border-t border-gray-200 mt-4">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-red-500">Note:</span> For this demo, actual credentials are not processed or stored. These inputs are for simulation context.
                </p>
                <div>
                  <label htmlFor="accessKeyId" className="block text-sm font-medium text-gray-700 mb-2">
                    Access Key ID (e.g., AWS_ACCESS_KEY_ID / AZURE_CLIENT_ID)
                  </label>
                  <input
                    type="text"
                    id="accessKeyId"
                    value={accessKeyId}
                    onChange={(e) => setAccessKeyId(e.target.value)}
                    placeholder="Enter access key ID"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base placeholder-gray-400"
                  />
                </div>
                <div>
                  <label htmlFor="secretAccessKey" className="block text-sm font-medium text-gray-700 mb-2">
                    Secret Access Key (e.g., AWS_SECRET_ACCESS_KEY / AZURE_CLIENT_SECRET)
                  </label>
                  <input
                    type="password"
                    id="secretAccessKey"
                    value={secretAccessKey}
                    onChange={(e) => setSecretAccessKey(e.target.value)}
                    placeholder="Enter secret access key"
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base placeholder-gray-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Container Identifiers and OS Selection */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">2. Define Migration Scope</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="containerIdentifiers" className="block text-sm font-medium text-gray-700 mb-2">
                  Container Identifiers (Names, IDs, or IPs - one per line or comma-separated)
                </label>
                <textarea
                  id="containerIdentifiers"
                  value={containerIdentifiers}
                  onChange={(e) => setContainerIdentifiers(e.target.value)}
                  rows={5}
                  placeholder="e.g., my-linux-app&#10;web-server-01&#10;192.168.1.100, backend-service"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base placeholder-gray-400"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="sourceOs" className="block text-sm font-medium text-gray-700 mb-2">
                    Source Operating System of Containers
                  </label>
                  <select
                    id="sourceOs"
                    value={sourceOs}
                    onChange={(e) => setSourceOs(e.target.value as OSType)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
                  >
                    <option value="linux">Linux</option>
                    <option value="windows">Windows</option>
                    <option value="other">Other / Mixed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="targetOs" className="block text-sm font-medium text-gray-700 mb-2">
                    Target Operating System for Migration
                  </label>
                  <select
                    id="targetOs"
                    value={targetOs}
                    onChange={(e) => setTargetOs(e.target.value as OSType)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
                  >
                    <option value="windows">Windows</option>
                    <option value="linux">Linux</option>
                    <option value="other">Other / Mixed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleStartCheck}
            disabled={isChecking || cloudProvider === 'none' || containerIdentifiers.trim() === ''}
            className={`px-8 py-4 rounded-full text-xl font-bold transition-all duration-200 ease-in-out transform
              ${isChecking || cloudProvider === 'none' || containerIdentifiers.trim() === ''
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:scale-105'
              }`}
          >
            {isChecking ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking...
              </span>
            ) : (
              'Start Migration Check'
            )}
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{errorMessage}</span>
          </div>
        )}

        {/* Results Section */}
        {migrationResults.length > 0 && (
          <div className="mt-8 pt-8 border-t-2 border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Migration Check Results</h2>
            <div className="space-y-6">
              {migrationResults.map((result) => (
                <div key={result.id} className={`p-6 rounded-lg border-l-8 shadow-md transition-all duration-300 ease-in-out ${getStatusColor(result.status)}`}>
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    {result.status === 'success' && (
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    )}
                    {result.status === 'warning' && (
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    )}
                    {result.status === 'error' && (
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    )}
                    <span className="font-bold text-gray-800">Container:</span> {result.containerIdentifier} - <span className="capitalize">{result.status}</span>
                  </h3>
                  <p className="text-gray-700 text-lg ml-9">{result.message}</p>
                  {result.details && result.details.length > 0 && (
                    <div className="mt-4 ml-9">
                      <p className="font-medium text-gray-800 mb-2">Detailed Findings:</p>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {result.details.map((detail, idx) => (
                          <li key={idx} className="text-base">{detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MigrationChecker;
