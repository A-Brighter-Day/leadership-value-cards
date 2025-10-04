import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

const Documentation = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-4">

        <Link href="/admin">
          <Button variant="outline" size="sm" className="mr-4 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </Link>

        <h1 className="mb-6 text-3xl font-bold text-primary">Documentation</h1>


        <div className="prose prose-slate max-w-none">
          <p className="lead">
            This documentation covers setup, configuration, and usage of the Leadership Value Cards Sorting Application.
          </p>

          <h3>Overview</h3>
          <p>
            This application is designed to help users identify and prioritize their core
            leadership values through a guided card-sorting exercise. It serves as a lead magnet, collecting user contact
            information and delivering a personalized PDF with their selected core values.
          </p>

          <h3>Setup and Configuration</h3>
          <h4>Prerequisites</h4>
          <ul>
            <li>Node.js (v14+)</li>
            <li>PostgreSQL database</li>
          </ul>

          <h4>Installation Steps</h4>
          <ol>
            <li>
              <strong>Clone the repository</strong>
              <pre><code>git clone &lt;repository-url&gt;
                <br />
                cd leadership-value-cards</code></pre>
            </li>
            <li>
              <strong>Install dependencies</strong>
              <pre><code>npm install</code></pre>
            </li>
            <li>
              <strong>Set up environment variables</strong>
              <p>
                Create a <code>.env</code> file in the root directory with the following variables:
              </p>
              <pre><code># Database connection
                <br />
                DATABASE_URL=postgres://&lt;username&gt;:&lt;password&gt;@&lt;host&gt;:&lt;port&gt;/&lt;database&gt;
                <br />
                <br />
                # Server configuration - Customize the ports as needed
                <br />
                SERVER_PORT=3001
                <br />
                CLIENT_URL=http://localhost:3000
                <br />
                <br />
                # JWT secret for authentication (generate a secure secret)
                <br />
                JWT_SECRET=your_jwt_secret_here
                <br />
                <br />
                # Email configuration<br />
                RESEND_API_KEY="your_api_key_here"
                <br />
                EMAIL_FROM_ADDRESS="your_email_address_here"
                <br />
                EMAIL_FROM_NAME="your_name_here"
                <br />
                CC_EMAIL="cc_email_address_here"
                
                </code></pre>
              <p><strong>Generate a secure JWT secret:</strong></p>
              <pre><code>openssl rand -hex 64</code></pre>
              <p>Copy the output and use it as your <code>JWT_SECRET</code> value.</p>
            </li>
            <li>
              <strong>Set up the database</strong>
              <pre><code>npm run db:push</code></pre>
            </li>
            <li>
              <strong>Seed the database with initial leadership values</strong>
              <pre><code>npx tsx server/seed.ts</code></pre>
            </li>
            <li>
              <strong>Create client environment file</strong>
              <p>Create a <code>.env</code> file in the <code>client/</code> directory:</p>
              <pre><code># Client environment configuration
VITE_SERVER_URL=http://localhost:3001</code></pre>
            </li>
            <li>
              <strong>Start the application</strong>
              <p>The application is designed to run as two separate services:</p>
              <p>In one terminal, start the API server:</p>
              <pre><code>npm run dev:server</code></pre>
              <p>In another terminal, start the client:</p>
              <pre><code>npm run dev</code></pre>

              <p>The API server will be available at <code>http://localhost:3001</code><br />
                The client application will be available at <code>http://localhost:3000</code></p>
            </li>
          </ol>

          <h3>Database Configuration</h3>
          <p>
            The application uses PostgreSQL with Drizzle ORM. The database schema is defined in <code>shared/schema.ts</code>
            and includes the following tables:
          </p>
          <ul>
            <li><code>users</code>: Stores admin information</li>
            <li><code>leadership_values</code>: Stores all leadership value cards</li>
            <li><code>submissions</code>: Stores user submissions with their selected core values</li>
          </ul>

          <h4>Migrating the Database</h4>
          <p>To apply changes to the database schema:</p>
          <ol>
            <li>Update the schema definitions in <code>shared/schema.ts</code></li>
            <li>Run the migration command: <code>npm run db:push</code></li>
          </ol>

          <h3>Managing Leadership Values</h3>
          <h4>Using the Admin Dashboard</h4>
          <p>
            The Admin Dashboard provides a user-friendly interface for managing leadership values:
          </p>
          <ol>
            <li>Navigate to the admin dashboard by clicking the "Admin" button in the top-right corner of the home page</li>
            <li>
              <strong>Add a new value:</strong> Click the "Add New Value" button and fill in the value name and description
            </li>
            <li>
              <strong>Edit a value:</strong> Click the "Edit" button on any value card to modify its name or description
            </li>
            <li>
              <strong>Delete a value:</strong> Click the "Delete" button on any value card to remove it from the system
            </li>
          </ol>

          <h3>Customization</h3>
          <h4>Visual Styling</h4>
          <p>
            The application uses Tailwind CSS and shadcn/ui. To customize the appearance:
          </p>
          <ul>
            <li>Edit <code>theme.json</code> to change the color scheme and other theme settings</li>
            <li>Update <code>tailwind.config.ts</code> for Tailwind-specific customizations</li>
            <li>Modify component styles in their respective component files</li>
          </ul>

          <h4>PDF Generation</h4>
          <ul>
            <li>Modify the PDF template in <code>client/src/lib/pdf-generator.ts</code></li>
          </ul>

          <h3>Deployment</h3>
          <p>
            The application is designed to be deployed as two separate services:
          </p>
          <ol>
            <li><strong>API Server</strong>: Handles data storage and processing</li>
            <li><strong>Client Application</strong>: Serves the user interface</li>
          </ol>

          <h4>Deployment Requirements</h4>
          <ul>
            <li>Node.js server for the backend API</li>
            <li>Static web hosting for the frontend client</li>
            <li>PostgreSQL database</li>
          </ul>

          <h4>Deployment Steps</h4>
          <ol>
            <li>
              <strong>Prepare the environment</strong>
              <p>Set up the appropriate environment variables on your deployment platforms:</p>

              <p><strong>For the API server:</strong></p>
              <pre><code>DATABASE_URL=postgres://&lt;username&gt;:&lt;password&gt;@&lt;host&gt;:&lt;port&gt;/&lt;database
                <br />
                SERVER_PORT=&lt;port&gt;
                <br />
                CLIENT_URL=&lt;client-app-url&gt; (for CORS configuration)
                <br />
                JWT_SECRET=your_jwt_secret_here
                <br />
                RESEND_API_KEY="your_api_key_here"
                <br />
                EMAIL_FROM_ADDRESS="your_email_address_here"
                <br />
                EMAIL_FROM_NAME="your_name_here"
                <br />
                CC_EMAIL="cc_email_address_here"
                </code></pre>
              <p><strong>Generate a secure JWT secret:</strong></p>
              <pre><code>openssl rand -hex 64</code></pre>

              <p><strong>For the client application:</strong></p>
              <pre><code>VITE_SERVER_URL=&lt;api-server-url&gt;</code></pre>
            </li>

            <li>
              <strong>Build the client application</strong>
              <pre><code>npm run build</code></pre>
              <p>This creates optimized production files in the <code>dist</code> directory.</p>
            </li>

            <li>
              <strong>Deploy the API server</strong>
              <p>Deploy the server code to your Node.js hosting provider.</p>
              <pre><code>
                npm run build:server
                <br />
                npm run start:server</code></pre>
            </li>

            <li>
              <strong>Deploy the client application</strong>
              <p>Upload the contents of the <code>dist</code> directory to your static web hosting provider.</p>
            </li>

            <li>
              <strong>Set up the database</strong>
              <p>Run the database migration on your production database:</p>
              <pre><code>npm run db:push</code></pre>
            </li>

            <li>
              <strong>Verify the deployment</strong>
              <ul>
                <li>Ensure the API server is accessible from the client application</li>
                <li>Check that CORS is properly configured to allow requests from the client origin</li>
                <li>Test the application's functionality in the production environment</li>
              </ul>
            </li>
          </ol>

          <h3>Troubleshooting</h3>
          <h4>Common Issues</h4>
          <ul>
            <li>
              <strong>Database connection errors:</strong>
              <ul>
                <li>Verify the <code>DATABASE_URL</code> is correct</li>
                <li>Ensure PostgreSQL is running and accessible</li>
                <li>Check for firewall restrictions</li>
              </ul>
            </li>
            <li>
              <strong>CORS Issues:</strong>
              <ul>
                <li>Ensure the <code>CLIENT_URL</code> environment variable on the server matches the actual URL where your client is hosted</li>
                <li>Check that the server's CORS configuration is properly allowing requests from the client</li>
              </ul>
            </li>
            <li>
              <strong>Authentication issues:</strong>
              <ul>
                <li>Verify that <code>JWT_SECRET</code> is set</li>
                <li>Ensure the JWT secret is strong and secure (use <code>openssl rand -hex 64</code>)</li>
              </ul>
            </li>
            <li>
              <strong>PDF generation failures:</strong>
              <ul>
                <li>Verify that <code>jspdf</code> and <code>jspdf-autotable</code> are installed</li>
                <li>Check browser console for specific errors</li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};

export default Documentation;