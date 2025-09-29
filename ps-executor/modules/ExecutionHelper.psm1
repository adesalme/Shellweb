function Invoke-PowerShellScript {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ScriptContent,
        
        [Parameter(Mandatory = $false)]
        [string]$AzureToken,
        
        [Parameter(Mandatory = $false)]
        [string]$UserEmail,
        
        [Parameter(Mandatory = $false)]
        [string]$TenantId
    )
    
    $startTime = Get-Date
    $stdout = @()
    $stderr = @()
    $exitCode = 0
    $status = "success"
    
    try {
        # Create a new PowerShell runspace for isolation
        $runspace = [runspacefactory]::CreateRunspace()
        $runspace.Open()
        
        # Create PowerShell instance
        $powershell = [powershell]::Create()
        $powershell.Runspace = $runspace
        
        # Check if script contains Azure authentication
        $needsAzureAuth = $ScriptContent -match "Connect-AzAccount|Get-AzContext|Az\w+"
        
        # Prepare script with Azure authentication if needed
        $finalScript = ""
        
        if ($needsAzureAuth -and $AzureToken) {
            Write-Host "Script requires Azure authentication, connecting..." -ForegroundColor Blue
            $finalScript += @"
# Azure Authentication
try {
    `$secureToken = ConvertTo-SecureString '$AzureToken' -AsPlainText -Force
    Connect-AzAccount -AccessToken `$secureToken -AccountId '$UserEmail'$(if ($TenantId) { " -TenantId '$TenantId'" })
    Write-Output "Successfully connected to Azure"
} catch {
    Write-Error "Failed to connect to Azure: `$(`$_.Exception.Message)"
    throw
}

"@
        } elseif ($needsAzureAuth -and -not $AzureToken) {
            Write-Host "Script requires Azure authentication but no token provided" -ForegroundColor Yellow
            $stderr += "Warning: Script appears to use Azure cmdlets but no authentication token was provided"
            $status = "warning"
        }
        
        $finalScript += $ScriptContent
        
        # Capture output streams
        $powershell.Streams.Information.Add({
            param($sender, $e)
            $stdout += $e.Record.ToString()
        })
        
        $powershell.Streams.Warning.Add({
            param($sender, $e)
            $stderr += "WARNING: $($e.Record.ToString())"
            if ($status -eq "success") { $status = "warning" }
        })
        
        $powershell.Streams.Error.Add({
            param($sender, $e)
            $stderr += "ERROR: $($e.Record.ToString())"
            $status = "error"
        })
        
        # Add script to PowerShell instance
        $null = $powershell.AddScript($finalScript)
        
        # Execute with timeout (5 minutes max)
        $asyncResult = $powershell.BeginInvoke()
        $completed = $asyncResult.AsyncWaitHandle.WaitOne(300000) # 5 minutes timeout
        
        if ($completed) {
            # Get results
            $results = $powershell.EndInvoke($asyncResult)
            
            # Process output
            foreach ($result in $results) {
                if ($null -ne $result) {
                    $stdout += $result.ToString()
                }
            }
            
            # Check for errors
            if ($powershell.Streams.Error.Count -gt 0) {
                $status = "error"
                $exitCode = 1
                foreach ($error in $powershell.Streams.Error) {
                    $stderr += "ERROR: $($error.ToString())"
                }
            }
            
            # Check for warnings
            if ($powershell.Streams.Warning.Count -gt 0 -and $status -eq "success") {
                $status = "warning"
                foreach ($warning in $powershell.Streams.Warning) {
                    $stderr += "WARNING: $($warning.ToString())"
                }
            }
        } else {
            # Timeout occurred
            $powershell.Stop()
            $status = "error"
            $exitCode = 124
            $stderr += "ERROR: Script execution timed out after 5 minutes"
        }
    }
    catch {
        $status = "error"
        $exitCode = 1
        $stderr += "ERROR: $($_.Exception.Message)"
        $stderr += "ERROR: $($_.ScriptStackTrace)"
    }
    finally {
        # Cleanup
        if ($powershell) {
            $powershell.Dispose()
        }
        if ($runspace) {
            $runspace.Close()
            $runspace.Dispose()
        }
    }
    
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalMilliseconds
    
    # Return execution result
    return @{
        success = ($status -eq "success" -or $status -eq "warning")
        status = $status
        exitCode = $exitCode
        stdout = ($stdout -join "`n")
        stderr = ($stderr -join "`n")
        startedAt = $startTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        finishedAt = $endTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        durationMs = [math]::Round($duration, 2)
        timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
    }
}

Export-ModuleMember -Function Invoke-PowerShellScript