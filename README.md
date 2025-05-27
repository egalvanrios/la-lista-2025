# La Lista 2025

A platform connecting homeowners with service providers for home maintenance and improvement services.

## Features

- User authentication (Homeowners and Service Providers)
- Service listing and management
- Review system
- Real-time messaging
- Service booking and scheduling

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Socket.io Client

### Backend
- Node.js
- Express
- TypeScript
- TypeORM
- PostgreSQL
- Socket.io
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/egalvanrios/la-lista-2025.git
cd la-lista-2025
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables:
```bash
# Server
cd server
cp .env.example .env
# Edit .env with your configuration

# Client
cd ../client
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development servers:
```bash
# Start server (from server directory)
npm run dev

# Start client (from client directory)
npm run dev
```

## Development

- Server runs on: http://localhost:3000
- Client runs on: http://localhost:5174

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
