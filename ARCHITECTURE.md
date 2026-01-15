# Architecture Documentation

## System Overview

The Package Manager is a full-stack web application built with a modern, scalable architecture:

```
┌─────────────────┐
│   Angular SPA   │  (Port 80/4200)
│   (Frontend)    │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  ASP.NET Core   │  (Port 5000)
│   Web API       │
└────────┬────────┘
         │ EF Core
         ▼
┌─────────────────┐
│   PostgreSQL    │  (Port 5432)
│    Database     │
└─────────────────┘
```

## Technology Stack

### Frontend Layer
- **Framework**: Angular 18+ (Standalone Components)
- **UI Library**: Angular Material
- **State Management**: RxJS Observables
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router
- **Build Tool**: Angular CLI with esbuild

### Backend Layer
- **Framework**: ASP.NET Core 9 Web API
- **ORM**: Entity Framework Core 9
- **Database Provider**: Npgsql (PostgreSQL)
- **API Documentation**: Swagger/OpenAPI
- **Architecture Pattern**: Repository pattern via DbContext

### Data Layer
- **Database**: PostgreSQL 16
- **Migration Strategy**: Code-First with EF Core Migrations
- **Connection Pooling**: Built-in with Npgsql

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (for Angular in production)
- **Reverse Proxy**: Nginx (API proxy)

## Database Schema

### Tables

#### Items
```sql
CREATE TABLE Items (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(200) NOT NULL,
    ImageUrl TEXT
);
```

#### Packages
```sql
CREATE TABLE Packages (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(200) NOT NULL,
    BoxSize VARCHAR(50),
    TotalWeight DECIMAL(10,2) DEFAULT 0,
    IsCompleted BOOLEAN DEFAULT FALSE,
    CreatedDate TIMESTAMP DEFAULT NOW()
);
```

#### PackageItems
```sql
CREATE TABLE PackageItems (
    Id SERIAL PRIMARY KEY,
    PackageId INTEGER NOT NULL REFERENCES Packages(Id) ON DELETE CASCADE,
    ItemId INTEGER,
    ItemName VARCHAR(200) NOT NULL,
    ItemImageUrl TEXT,
    Quantity INTEGER DEFAULT 1
);
```

### Relationships
- **Packages → PackageItems**: One-to-Many (Cascade Delete)
- **PackageItems → Items**: Many-to-One (Nullable, for historical data)

### Design Decisions

1. **Denormalized PackageItems**: Item name and image URL are copied to PackageItems to preserve historical data even if the source item is deleted.

2. **Nullable ItemId**: Allows items to be deleted without breaking package history.

3. **Cascade Delete**: When a package is deleted, all its PackageItems are automatically removed.

## API Architecture

### Controller Layer
- **PackagesController**: Manages package CRUD operations
- **ItemsController**: Manages item CRUD operations

### Data Transfer Objects (DTOs)
- **ItemDto**: Simplified item representation
- **PackageDto**: Package with nested items
- **PackageItemDto**: Item within a package context
- Request DTOs for create/update operations

### Service Layer
Implemented directly in controllers for simplicity. For larger applications, consider:
- Separate service classes
- Business logic layer
- Validation services

## Frontend Architecture

### Component Structure

```
app/
├── components/
│   ├── packages-list/          # Main dashboard
│   ├── package-editor/         # Package creation/editing
│   ├── settings/               # Item management
│   ├── confirm-dialog/         # Reusable confirmation
│   └── image-modal/            # Image preview
├── services/
│   ├── package.service.ts      # Package API calls
│   ├── item.service.ts         # Item API calls
│   └── image.service.ts        # Image processing
└── models/
    ├── package.model.ts        # Package interfaces
    └── item.model.ts           # Item interfaces
```

### State Management
- **Local Component State**: For UI-specific state
- **Service State**: For shared data (items, packages)
- **Observable Streams**: For async operations

### Routing Strategy
- **Hash-based**: Not used (using PathLocationStrategy)
- **Server-side rendering**: Disabled for simplicity
- **Lazy Loading**: Not implemented (small app)

## Security Considerations

### Current Implementation
- **CORS**: Configured for localhost development
- **Input Validation**: Basic model validation
- **SQL Injection**: Protected by EF Core parameterization

### Production Recommendations
1. **Authentication**: Add JWT or OAuth2
2. **Authorization**: Role-based access control
3. **HTTPS**: Enable SSL/TLS
4. **Rate Limiting**: Prevent abuse
5. **Input Sanitization**: Validate all inputs
6. **CORS**: Restrict to specific domains
7. **Secrets Management**: Use environment variables or Azure Key Vault

## Performance Optimizations

### Implemented
- **Image Compression**: Client-side compression to 600px, 60% quality
- **Database Indexing**: Primary keys and foreign keys
- **Eager Loading**: Include() for related data
- **Connection Pooling**: Built-in with Npgsql

### Future Optimizations
- **Caching**: Redis for frequently accessed data
- **Pagination**: For large datasets
- **CDN**: For static assets
- **Database Indexes**: On frequently queried columns
- **Lazy Loading**: For Angular routes

## Scalability Considerations

### Horizontal Scaling
- **Stateless API**: Can run multiple instances
- **Load Balancer**: Nginx or cloud load balancer
- **Database**: PostgreSQL read replicas

### Vertical Scaling
- **Database**: Increase PostgreSQL resources
- **API**: Increase container resources
- **Caching**: Add Redis layer

## Deployment Architecture

### Development
```
Developer Machine
├── Angular Dev Server (ng serve)
├── .NET API (dotnet run)
└── PostgreSQL (Docker)
```

### Production (Docker Compose)
```
Docker Host
├── Nginx Container (Port 80)
│   ├── Serves Angular static files
│   └── Proxies /api to API container
├── API Container (Port 5000)
│   └── ASP.NET Core Web API
└── PostgreSQL Container (Port 5432)
    └── Persistent volume
```

### Cloud Deployment Options

#### Azure
- **Frontend**: Azure Static Web Apps
- **API**: Azure App Service or Container Apps
- **Database**: Azure Database for PostgreSQL

#### AWS
- **Frontend**: S3 + CloudFront
- **API**: ECS or App Runner
- **Database**: RDS PostgreSQL

#### Google Cloud
- **Frontend**: Cloud Storage + Cloud CDN
- **API**: Cloud Run
- **Database**: Cloud SQL PostgreSQL

## Monitoring & Logging

### Current Implementation
- **Console Logging**: Basic error logging
- **EF Core Logging**: Database query logging

### Production Recommendations
- **Application Insights**: Azure monitoring
- **Serilog**: Structured logging
- **Health Checks**: API health endpoints
- **Metrics**: Prometheus + Grafana
- **Error Tracking**: Sentry or Rollbar

## Testing Strategy

### Unit Tests
- **Backend**: xUnit for API logic
- **Frontend**: Jasmine/Karma for components

### Integration Tests
- **API**: Test controllers with in-memory database
- **E2E**: Playwright or Cypress

### Manual Testing
- See QUICKSTART.md for testing procedures

## Data Flow Examples

### Creating a Package with Items

1. **User Action**: Click "New Package" button
2. **Frontend**: Navigate to `/package/new`
3. **Component**: Prompt for package name
4. **API Call**: `POST /api/packages`
5. **Backend**: Create package in database
6. **Response**: Return PackageDto with ID
7. **Frontend**: Navigate to `/package/{id}`
8. **Load Items**: `GET /api/items`
9. **User Action**: Click item to add
10. **API Call**: `POST /api/packages/{id}/items`
11. **Backend**: Create PackageItem with snapshot
12. **Response**: Success
13. **Refresh**: `GET /api/packages/{id}`
14. **Display**: Updated package with items

### Image Upload with Compression

1. **User Action**: Paste image (Ctrl+V)
2. **Event Handler**: Capture clipboard data
3. **File Reader**: Convert to data URL
4. **Canvas API**: Draw and compress image
5. **Component State**: Update imageUrl
6. **User Action**: Click "Create"
7. **API Call**: `POST /api/items` with base64
8. **Backend**: Store in database
9. **Response**: Return ItemDto
10. **Frontend**: Refresh items list

## Configuration Management

### Environment Variables

#### API
- `DATABASE_URL`: PostgreSQL connection string
- `ASPNETCORE_URLS`: Listening URLs
- `ASPNETCORE_ENVIRONMENT`: Development/Production

#### Frontend
- `API_URL`: Backend API URL (in environment.ts)

### Configuration Files
- `appsettings.json`: API configuration
- `angular.json`: Build configuration
- `docker-compose.yml`: Container orchestration

## Error Handling

### API
- **400 Bad Request**: Invalid input
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Unexpected errors

### Frontend
- **HTTP Errors**: Caught in service subscriptions
- **User Feedback**: Material snackbar notifications
- **Console Logging**: For debugging

## Future Enhancements

### Features
- User authentication and multi-tenancy
- Package templates
- Barcode scanning
- PDF export
- Email notifications
- Mobile app (Ionic/React Native)

### Technical
- GraphQL API
- Real-time updates (SignalR)
- Offline support (PWA)
- Advanced search and filtering
- Audit logging
- Backup and restore
