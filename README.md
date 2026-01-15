# Package Manager Application

A modern package management application built with **Angular 18+** frontend and **ASP.NET Core 9 Web API** backend, using **PostgreSQL** database.

## Features

### Package Management
- Create packages with name and optional box size (26x16x15 or 24x20x20)
- Add items to packages by clicking from available items grid
- Manage quantities with +/- buttons for each item
- Enter manual total weight (in kg) for packages
- Complete packages to mark them as done (prevents further editing)
- Delete packages with confirmation
- Copy package report to clipboard with formatted details

### Item Management
- Full CRUD operations for items (Create, Read, Update, Delete)
- Image upload via file input
- Clipboard paste for images (Ctrl+V) with automatic compression
- Image preview and click-to-enlarge functionality
- Items can be deleted even if used in packages (package history preserved)

### Data Persistence
- PostgreSQL database with Entity Framework Core
- Automatic migrations on startup
- Package items store snapshot of item data for historical accuracy

## Tech Stack

### Backend
- ASP.NET Core 9 Web API
- Entity Framework Core with PostgreSQL (Npgsql)
- Swagger/OpenAPI for API documentation
- RESTful API design

### Frontend
- Angular 18+ with standalone components
- Angular Material for UI components
- TypeScript
- RxJS for reactive programming
- Client-side image compression

### Infrastructure
- Docker & Docker Compose
- PostgreSQL 16
- Nginx for serving Angular app

## Getting Started

### Prerequisites
- Docker Desktop
- .NET 9 SDK (for local development)
- Node.js 20+ (for local development)
- Angular CLI (for local development)

### Running with Docker (Recommended)

1. Clone the repository
2. Navigate to the project root directory
3. Run the application:

```bash
docker-compose up --build
```

4. Access the application:
   - Frontend: http://localhost
   - API: http://localhost:5000
   - Swagger: http://localhost:5000/swagger

### Running Locally (Development)

#### Backend API

```bash
cd PackageManager.Api
dotnet restore
dotnet ef database update
dotnet run
```

The API will be available at http://localhost:5000

#### Frontend

```bash
cd PackageManager.Web
npm install
ng serve
```

The frontend will be available at http://localhost:4200

#### Database

Make sure PostgreSQL is running locally with:
- Host: localhost
- Port: 5432
- Database: packagemanager
- Username: postgres
- Password: postgres

Or update the connection string in `appsettings.json`

## Project Structure

```
PackageManager/
├── PackageManager.Api/          # ASP.NET Core Web API
│   ├── Controllers/             # API controllers
│   ├── Models/                  # Data models and DTOs
│   ├── Data/                    # DbContext and migrations
│   ├── Dockerfile
│   └── Program.cs
├── PackageManager.Web/          # Angular Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/      # Angular components
│   │   │   ├── services/        # API services
│   │   │   ├── models/          # TypeScript models
│   │   │   └── app.routes.ts    # Routing configuration
│   │   └── environments/        # Environment configs
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml           # Docker orchestration
```

## API Endpoints

### Packages
- `GET /api/packages` - Get all packages
- `GET /api/packages/{id}` - Get package by ID
- `POST /api/packages` - Create package
- `POST /api/packages/{id}/items` - Add item to package
- `DELETE /api/packages/{id}/items/{itemId}` - Remove item from package
- `PUT /api/packages/{id}/weight` - Update package weight
- `PUT /api/packages/{id}/complete` - Mark package as complete
- `DELETE /api/packages/{id}` - Delete package

### Items
- `GET /api/items` - Get all items
- `GET /api/items/{id}` - Get item by ID
- `POST /api/items` - Create item
- `PUT /api/items/{id}` - Update item
- `DELETE /api/items/{id}` - Delete item

## Features in Detail

### Image Handling
- **Upload**: Select image files via file input
- **Paste**: Press Ctrl+V to paste images from clipboard
- **Compression**: Images are automatically compressed to:
  - Max width: 600px
  - JPEG quality: 60%
  - Base64 encoded for storage
- **Preview**: Click any image to view full size in modal

### Package Report Format
```
Package: [Name]
Box Size: [Size] (if set)
Total Weight: [X.XX] kg

Items:
  - [Item Name] x[Quantity]
  - [Item Name] x[Quantity]

Total Items: [Count]
```

## Environment Variables

### API
- `DATABASE_URL` - PostgreSQL connection string
- `ASPNETCORE_URLS` - API listening URLs
- `ASPNETCORE_ENVIRONMENT` - Environment (Development/Production)

### Frontend
- `API_URL` - Backend API URL (configured in environment.ts)

## Development

### Adding Migrations

```bash
cd PackageManager.Api
dotnet ef migrations add MigrationName
dotnet ef database update
```

### Building for Production

```bash
# Build all services
docker-compose build

# Run in production mode
docker-compose up -d
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL container is running: `docker ps`
- Check database logs: `docker logs packagemanager-db`
- Verify connection string in environment variables

### API Not Starting
- Check API logs: `docker logs packagemanager-api`
- Ensure database migrations have run
- Verify port 5000 is not in use

### Frontend Not Loading
- Check web logs: `docker logs packagemanager-web`
- Verify API is accessible
- Check browser console for errors

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
