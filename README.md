# Leadership Value Cards Sorting Application

An interactive, web-based application designed to help users identify and prioritize their core leadership values through a guided card-sorting exercise.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Setup and Installation](#setup-and-installation)
- [Database Configuration](#database-configuration)
- [Application Structure](#application-structure)
- [Modifying Leadership Values](#modifying-leadership-values)
- [Customization](#customization)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

This application serves as a leadership development lead magnet tool that guides users through a process of sorting and selecting leadership values to identify their core values. The application captures user contact information and provides a personalized PDF with their results, which can be used for follow-up marketing and leadership coaching opportunities.

## Features

- **Multi-step Card Sorting Process**: Users can drag and drop leadership value cards into categories based on their self-assessment.
- **Progressive Selection**: Users narrow down to their top 10 values, and ultimately their top 5 core values.
- **Personalized PDF Generation**: Automatic generation of a personalized PDF with the user's core values and contact information.
- **Admin Dashboard**: Interface for managing leadership value cards, allowing administrators to add, edit, or delete values.
- **Persistent Database Storage**: All leadership values and user submissions are stored in a PostgreSQL database.
- **Responsive Design**: Works on desktop, tablet, and mobile devices with a clean, modern UI.

## Setup and Installation

### Prerequisites

- Node.js (v14+)
- PostgreSQL database

### Installation Steps

1. **Clone the repository**

```bash
git clone <repository-url>
cd leadership-value-cards
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory with the following variables:

```
# Database connection
DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<database>

# Server configuration - Customize the ports as needed
SERVER_PORT=3001
CLIENT_URL=http://localhost:3000

# JWT secret for authentication (generate a secure secret)
JWT_SECRET=your_jwt_secret_here

# Email configuration
RESEND_API_KEY="your_api_key_here"
EMAIL_FROM_ADDRESS="your_email_address_here"
EMAIL_FROM_NAME="your_name_here"
CC_EMAIL="cc_email_address_here"
```

**Generate a secure JWT secret:**
```bash
openssl rand -hex 64
```

Copy the output and use it as your `JWT_SECRET` value.

Create a `.env` file in the `client/` directory with the following variable:

```
# Client environment configuration
VITE_SERVER_URL=http://localhost:3001
```

4. **Set up the database**

```bash
npm run db:push
```

5. **Seed the database with initial leadership values**

```bash
npx tsx server/seed.ts
```

6. **Start the application**

The application is designed to run as two separate services - an API server and a client application

In one terminal, start the API server:
```bash
npm run dev:server
```

In another terminal, start the client:
```bash
npm run dev
```

The API server will be available at `http://localhost:3001`
The client application will be available at `http://localhost:3000`

## Database Configuration

This application uses PostgreSQL with Drizzle ORM for database operations. The database schema is defined in `shared/schema.ts` and includes the following tables:

- `users`: Stores admin information
- `leadership_values`: Stores all leadership value cards
- `submissions`: Stores user submissions with their selected core values

### Migrating the Database

To apply changes to the database schema:

1. Update the schema definitions in `shared/schema.ts`
2. Run the migration command:

```bash
npm run db:push
```

## Application Structure

- `client/`: Frontend code (React)
  - `src/components/`: UI components
  - `src/pages/`: Application pages
  - `src/lib/`: Utility functions
  - `src/hooks/`: Custom React hooks
  - `src/types/`: TypeScript type definitions
- `server/`: Backend code (Express)
  - `routes.ts`: API endpoints
  - `storage.ts`: Storage interface definitions
  - `database-storage.ts`: Database implementation
  - `db.ts`: Database connection
  - `seed.ts`: Database seeding script
- `shared/`: Code shared between frontend and backend
  - `schema.ts`: Database schema definitions

## Modifying Leadership Values

### Through the Admin Dashboard

1. Access the admin dashboard by clicking the "Admin" button in the top-right corner of the main page.
2. From the admin dashboard, you can:
   - Add new leadership values by clicking "Add New Value"
   - Edit existing values by clicking the "Edit" button on any card
   - Delete values by clicking the "Delete" button on any card

## Customization

### Styling

The application uses Tailwind CSS and shadcn/ui for styling. You can customize the appearance by:

1. Modifying `theme.json` to change the color scheme and other theme settings
2. Updating `tailwind.config.ts` for Tailwind-specific customizations
3. Editing component styles in the respective component files

### PDF Generation 

- Modify the PDF template in `client/src/lib/pdf-generator.ts`

## Deployment

The application is designed to be deployed as two separate services:

1. **API Server**: Handles data storage and processing
2. **Client Application**: Serves the user interface

### Deployment Requirements

- Node.js server for the backend API
- Static web hosting for the frontend client
- PostgreSQL database

### Deployment Steps

1. **Prepare the environment**

   Set up the appropriate environment variables on your deployment platforms:

   **For the API server:**
   ```
   DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<database>
   SERVER_PORT=<port> 
   CLIENT_URL=<client-app-url> (for CORS configuration)
   JWT_SECRET=your_jwt_secret_here
   RESEND_API_KEY="your_api_key_here"
   EMAIL_FROM_ADDRESS="your_email_address_here"
   EMAIL_FROM_NAME="your_name_here"
   CC_EMAIL="cc_email_address_here"
   ```

   **Generate a secure JWT secret:**
   ```bash
   openssl rand -hex 64
   ```

   **For the client application:**
   ```
   VITE_SERVER_URL=<api-server-url>
   ```

2. **Build the client application**

   ```bash
   npm run build
   ```

   This creates optimized production files in the `dist` directory.

3. **Deploy the API server**

   Deploy the server code to your Node.js hosting provider.

   ```bash
   npm run build:server
   npm run start:server
   ```

4. **Deploy the client application**

   Upload the contents of the `dist` directory to your static web hosting provider.

5. **Set up the database**

   Run the database migration on your production database:

   ```bash
   npm run db:push
   ```

6. **Verify the deployment**

   - Ensure the API server is accessible from the client application
   - Check that CORS is properly configured to allow requests from the client origin
   - Test the application's functionality in the production environment

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` environment variable is correctly formatted
- Ensure your PostgreSQL server is running and accessible
- Check for any firewall restrictions that might be blocking connections

### Application Errors

- Check the server logs for backend errors
- Look at the browser console for frontend errors
- Verify that all dependencies are installed correctly
- Ensure the `client/.env` file exists with `VITE_SERVER_URL` set correctly

### CORS Issues

- Ensure the `CLIENT_URL` environment variable on the server matches the actual URL where your client is hosted
- Check that the server's CORS configuration is properly allowing requests from the client

### Authentication Issues

- Verify that `JWT_SECRET` is set
- Ensure the JWT secret is strong and secure (use `openssl rand -hex 64`)

### PDF Generation Problems

- If PDF generation fails, ensure that the `jspdf` and `jspdf-autotable` libraries are correctly installed
- Check for any errors in the browser console when generating PDFs
