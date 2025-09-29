FROM mcr.microsoft.com/powershell:latest

# Install additional PowerShell modules
RUN pwsh -Command "Install-Module -Name Microsoft.PowerShell.ConsoleGuiTools -Force -Scope AllUsers"
RUN pwsh -Command "Install-Module -Name Az -Force -Scope AllUsers"

# Create app directory
WORKDIR /app

# Copy PowerShell server script
COPY server.ps1 /app/
COPY modules/ /app/modules/

# Expose port
EXPOSE 5001

# Run the PowerShell HTTP server
CMD ["pwsh", "-File", "/app/server.ps1"]