# Lumo - PowerShell Web Editor

A modern web application for editing, executing, and managing PowerShell scripts with Azure AD integration and comprehensive analytics.

![Lumo Dashboard](https://via.placeholder.com/800x400/3b82f6/ffffff?text=Lumo+Dashboard)

## ✨ Features

### 🎯 Core Functionality
- **ISE-style Editor**: Monaco Editor with PowerShell syntax highlighting and IntelliSense
- **Script Execution**: Secure PowerShell script execution in isolated Docker containers
- **Azure Integration**: Seamless Azure AD authentication and Azure PowerShell support
- **Script Management**: Organize, version, and share your PowerShell scripts
- **Real-time Console**: Live output streaming with color-coded results

### 📊 Analytics & Monitoring
- **Dashboard**: Comprehensive statistics and execution metrics
- **Charts**: Visual representation of script usage and performance
- **Execution History**: Detailed logs and execution tracking
- **User Analytics**: Individual and team performance insights

### 🔐 Security & Authentication
- **Azure AD Integration**: Enterprise-grade authentication with MSAL
- **Standalone Mode**: Local JWT authentication for smaller deployments
- **Role-based Access**: Admin, Developer, and Viewer roles
- **Secure Execution**: Isolated PowerShell execution environment

### 🎨 Modern UI/UX
- **Dark/Light Theme**: Automatic theme switching with user preferences
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Notifications**: Toast notifications for all operations
- **Accessibility**: WCAG compliant with keyboard navigation support

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │  PS Executor    │
│   React + TS    │◄──►│  Node.js + TS   │◄──►│  PowerShell     │
│   Monaco Editor │    │   Express API   │    │   Container     │
│   Chart.js      │    │   PostgreSQL    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│  Azure AD (MSAL)│◄─────────────┘
                        └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- Azure AD App Registration (optional, for Azure integration)

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/lumo.git
cd lumo
```

### 2. Environment Configuration
Create `.env` files for each service:

**Backend (.env)**:
```env
DATABASE_URL=postgres://lumo:secretpassword@postgres:5432/lumo_db
JWT_SECRET=your-super-secret-jwt-key
POWERSHELL_EXECUTOR_URL=http://ps-executor:5001
NODE_ENV=production
```

**Frontend (.env)**:
```env
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_AZURE_CLIENT_ID=your-azure-client-id
REACT_APP_AZURE_TENANT_ID=your-azure-tenant-id
REACT_APP_STANDALONE_MODE=true
```

### 3. Start the Application
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Database**: localhost:5432

## 🛠️ Development Setup

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### PowerShell Executor Development
```bash
cd ps-executor
# Modify server.ps1 and test locally
pwsh -File server.ps1
```

## 🔧 Configuration

### Azure AD Setup
1. Create an App Registration in Azure AD
2. Configure redirect URIs:
   - `http://localhost:3000` (development)
   - `https://your-domain.com` (production)
3. Add required API permissions:
   - Microsoft Graph: `User.Read`
   - Azure Service Management: `user_impersonation`
4. Update environment variables with your Client ID and Tenant ID

### Standalone Mode
For environments without Azure AD:
1. Set `REACT_APP_STANDALONE_MODE=true`
2. Users will be created automatically on first login
3. JWT tokens are used for authentication

## 📁 Project Structure

```
lumo/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth, validation, etc.
│   │   └── server.ts       # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── ps-executor/            # PowerShell execution service
│   ├── server.ps1          # PowerShell HTTP server
│   ├── modules/            # PowerShell modules
│   └── Dockerfile
├── database/               # Database initialization
│   └── init.sql
└── docker-compose.yml      # Container orchestration
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Local authentication
- `POST /api/auth/azure/verify` - Azure AD token verification
- `GET /api/auth/me` - Get current user

### Scripts
- `GET /api/scripts` - List scripts (paginated)
- `POST /api/scripts` - Create new script
- `GET /api/scripts/:id` - Get script details
- `PUT /api/scripts/:id` - Update script
- `DELETE /api/scripts/:id` - Delete script (admin only)
- `GET /api/scripts/:id/export` - Export script
- `POST /api/scripts/import` - Import script

### Executions
- `POST /api/execute` - Execute script
- `GET /api/executions/:id` - Get execution details
- `GET /api/executions/script/:scriptId` - Get script executions
- `GET /api/executions/user/history` - User execution history

### Dashboard
- `GET /api/dashboard/stats` - System statistics
- `GET /api/dashboard/user-stats` - User statistics

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### E2E Tests
```bash
# Using Playwright or Cypress
npm run test:e2e
```

## 🚀 Deployment

### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Azure Container Instances
```bash
# Deploy to Azure
az container create --resource-group myResourceGroup \
  --file docker-compose.yml
```

### Kubernetes
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure CORS properly for your domain
4. **Rate Limiting**: API endpoints are rate-limited
5. **Input Validation**: All inputs are validated and sanitized
6. **Script Isolation**: PowerShell scripts run in isolated containers
7. **Token Security**: JWT tokens have expiration times

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow the existing code style
- Use conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/your-org/lumo/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-org/lumo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/lumo/discussions)
- **Email**: support@lumo-editor.com

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VS Code editor for the web
- [React](https://reactjs.org/) - UI framework
- [Express.js](https://expressjs.com/) - Backend framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Docker](https://www.docker.com/) - Containerization
- [Azure AD](https://azure.microsoft.com/en-us/services/active-directory/) - Authentication

## 📊 Roadmap

- [ ] **v1.1**: Script templates and snippets
- [ ] **v1.2**: Collaborative editing
- [ ] **v1.3**: Git integration
- [ ] **v1.4**: Advanced debugging tools
- [ ] **v1.5**: Custom PowerShell modules marketplace
- [ ] **v2.0**: Multi-tenant support

---

**Made with ❤️ by the Lumo Team**