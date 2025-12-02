```
frontend/
│
├── src/
│   ├── api/
│   │   ├── apiClient.js            # Axios instance setup
│   │   ├── aiService.js            # Functions for AI endpoints
│   │   ├── deployService.js        # Functions for deployment API
│   │   └── metricsService.js       # Functions for metrics API
│   │
│   ├── components/
│   │   ├── Chat/
│   │   │   ├── ChatBox.jsx
│   │   │   ├── ChatMessage.jsx
│   │   │   └── ChatInput.jsx
│   │   ├── Dashboard/
│   │   │   ├── Metrics.jsx
│   │   │   ├── DeploymentStatus.jsx
│   │   │   └── HistoryTable.jsx
│   │   ├── Layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Footer.jsx
│   │   └── UI/
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       └── Modal.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.js          # For future authentication
│   │   └── ThemeContext.js         # Dark/light theme
│   │
│   ├── hooks/
│   │   ├── useFetch.js
│   │   ├── useChat.js
│   │   └── useDeploy.js
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Deployments.jsx
│   │   ├── MetricsPage.jsx
│   │   └── Login.jsx
│   │
│   ├── styles/
│   │   ├── global.css
│   │   ├── dashboard.css
│   │   └── chat.css
│   │
│   ├── utils/
│   │   ├── formatDate.js
│   │   ├── constants.js
│   │   └── logger.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   ├── router.jsx
│   └── index.html
│
├── public/
│   ├── favicon.ico
│   ├── logo192.png
│   ├── manifest.json
│   └── robots.txt
│
├── .env
├── package.json
├── vite.config.js
└── Dockerfile
```
