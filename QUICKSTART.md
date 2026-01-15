# Quick Start Guide

## Running the Application with Docker (Easiest Method)

### Prerequisites
- Docker Desktop installed and running
- At least 4GB of RAM available for Docker

### Steps

1. **Clone or navigate to the project directory**
   ```bash
   cd c:\neldevsrc\my\pop
   ```

2. **Start all services with Docker Compose**
   ```bash
   docker-compose up --build
   ```
   
   This will:
   - Build the ASP.NET Core API
   - Build the Angular frontend
   - Start PostgreSQL database
   - Run all services in containers

3. **Access the application**
   - **Frontend**: Open your browser to http://localhost
   - **API**: http://localhost:5000
   - **Swagger API Docs**: http://localhost:5000/swagger

4. **Stop the application**
   ```bash
   docker-compose down
   ```

   To also remove the database volume:
   ```bash
   docker-compose down -v
   ```

## Running Locally for Development

### Prerequisites
- .NET 9 SDK
- Node.js 20+
- PostgreSQL 16
- Angular CLI (`npm install -g @angular/cli`)

### Backend Setup

1. **Start PostgreSQL** (or use Docker for just the database)
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Navigate to API directory**
   ```bash
   cd PackageManager.Api
   ```

3. **Restore packages**
   ```bash
   dotnet restore
   ```

4. **Run migrations** (automatic on startup, but you can run manually)
   ```bash
   dotnet ef database update
   ```

5. **Start the API**
   ```bash
   dotnet run
   ```
   
   API will be available at http://localhost:5000

### Frontend Setup

1. **Navigate to Web directory**
   ```bash
   cd PackageManager.Web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   ng serve
   ```
   
   Frontend will be available at http://localhost:4200

## First Time Usage

1. **Go to Settings** (click the settings icon in top-right)

2. **Create some items**
   - Click "New Item"
   - Enter item name
   - Optionally upload an image or paste from clipboard (Ctrl+V)
   - Click "Create"

3. **Create a package**
   - Go back to main page
   - Click "New Package"
   - Enter package name
   - Select optional box size
   - Click items from the right panel to add them
   - Use +/- buttons to adjust quantities
   - Enter total weight
   - Click "Complete" when done

4. **Copy package report**
   - Click "Copy Report" button
   - Paste into your document or email

## Testing the Application

### Test Image Upload
1. Go to Settings
2. Click "New Item"
3. Copy an image to clipboard
4. Press Ctrl+V in the browser
5. Image should appear compressed and ready to save

### Test Package Creation
1. Create at least 3 items in Settings
2. Return to main page
3. Create a new package
4. Add multiple items with different quantities
5. Set weight and box size
6. Complete the package
7. Verify you cannot edit completed packages
8. Copy the report and verify format

### Test Data Persistence
1. Create packages with items
2. Stop the application
3. Restart the application
4. Verify all data is preserved

### Test Item Deletion
1. Create a package with items
2. Complete the package
3. Go to Settings and delete one of the items
4. Return to the package
5. Verify the item still shows in the package (historical data preserved)

## Common Issues

### Port Already in Use
If you get port conflicts:
- **Port 5000**: Stop any other .NET applications
- **Port 80**: Stop any web servers (IIS, Apache, etc.)
- **Port 5432**: Stop any PostgreSQL instances

### Database Connection Failed
- Ensure PostgreSQL is running
- Check connection string in `appsettings.json`
- Verify database credentials

### Angular Build Warnings
The bundle size warning is expected and can be ignored for development.

### CORS Errors
- Ensure API is running before starting frontend
- Check that CORS is configured for http://localhost:4200

## API Endpoints Reference

### Packages
- `GET /api/packages` - List all packages
- `POST /api/packages` - Create package
  ```json
  { "name": "Package 1", "boxSize": "26x16x15" }
  ```
- `POST /api/packages/{id}/items` - Add item
  ```json
  { "itemId": 1 }
  ```
- `PUT /api/packages/{id}/weight` - Update weight
  ```json
  { "weight": 5.5 }
  ```
- `PUT /api/packages/{id}/complete` - Complete package
- `DELETE /api/packages/{id}` - Delete package

### Items
- `GET /api/items` - List all items
- `POST /api/items` - Create item
  ```json
  { "name": "Item 1", "imageUrl": "data:image/jpeg;base64,..." }
  ```
- `PUT /api/items/{id}` - Update item
- `DELETE /api/items/{id}` - Delete item

## Performance Tips

- Images are automatically compressed to 600px width and 60% quality
- Use JPEG format for photos (automatic when pasting)
- Keep package item counts reasonable (< 100 items per package)
- Completed packages are read-only for better performance

## Next Steps

- Customize box sizes in `PackageEditorComponent`
- Add more item fields (weight, SKU, etc.)
- Implement search and filtering
- Add user authentication
- Export packages to PDF or Excel
- Add barcode scanning support
