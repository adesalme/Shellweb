# PowerShell HTTP Server for script execution
param(
    [int]$Port = 5001
)

# Import required modules
Import-Module ./modules/ExecutionHelper.psm1

# Create HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://*:$Port/")
$listener.Start()

Write-Host "PowerShell Executor started on port $Port" -ForegroundColor Green

try {
    while ($listener.IsListening) {
        # Get the request
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Set CORS headers
        $response.Headers.Add("Access-Control-Allow-Origin", "*")
        $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        try {
            # Handle preflight OPTIONS request
            if ($request.HttpMethod -eq "OPTIONS") {
                $response.StatusCode = 200
                $response.Close()
                continue
            }
            
            # Handle POST /run endpoint
            if ($request.HttpMethod -eq "POST" -and $request.Url.LocalPath -eq "/run") {
                # Read request body
                $reader = New-Object System.IO.StreamReader($request.InputStream)
                $requestBody = $reader.ReadToEnd()
                $reader.Close()
                
                # Parse JSON
                $requestData = $requestBody | ConvertFrom-Json
                
                # Validate required fields
                if (-not $requestData.script) {
                    $errorResponse = @{
                        success = $false
                        error = "Script content is required"
                        timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
                    } | ConvertTo-Json
                    
                    $response.StatusCode = 400
                    $response.ContentType = "application/json"
                    $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorResponse)
                    $response.OutputStream.Write($buffer, 0, $buffer.Length)
                    $response.Close()
                    continue
                }
                
                Write-Host "Executing script: $($requestData.script.Substring(0, [Math]::Min(50, $requestData.script.Length)))..." -ForegroundColor Yellow
                
                # Execute the PowerShell script
                $executionResult = Invoke-PowerShellScript -ScriptContent $requestData.script -AzureToken $requestData.azureToken -UserEmail $requestData.userEmail -TenantId $requestData.tenantId
                
                # Return result as JSON
                $jsonResponse = $executionResult | ConvertTo-Json -Depth 10
                $response.StatusCode = 200
                $response.ContentType = "application/json"
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($jsonResponse)
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
            # Handle GET /health endpoint
            elseif ($request.HttpMethod -eq "GET" -and $request.Url.LocalPath -eq "/health") {
                $healthResponse = @{
                    status = "healthy"
                    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
                    version = $PSVersionTable.PSVersion.ToString()
                } | ConvertTo-Json
                
                $response.StatusCode = 200
                $response.ContentType = "application/json"
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($healthResponse)
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
            else {
                # 404 for unknown endpoints
                $errorResponse = @{
                    success = $false
                    error = "Endpoint not found"
                    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
                } | ConvertTo-Json
                
                $response.StatusCode = 404
                $response.ContentType = "application/json"
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorResponse)
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
        }
        catch {
            Write-Host "Error processing request: $($_.Exception.Message)" -ForegroundColor Red
            
            $errorResponse = @{
                success = $false
                error = $_.Exception.Message
                timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
            } | ConvertTo-Json
            
            $response.StatusCode = 500
            $response.ContentType = "application/json"
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorResponse)
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        finally {
            $response.Close()
        }
    }
}
finally {
    $listener.Stop()
    Write-Host "PowerShell Executor stopped" -ForegroundColor Red
}