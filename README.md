# MovieVault

# Backend

## Prerequisites

- Python 3.10 or later
- pip (Python package manager)
- PostgreSQL (installed and running)

## Setup Instructions

1. Clone the repository
2. Navigate to the project directory: `cd MovieVault`
3. Create a virtual environment: `python -m venv venv`
4. Activate the virtual environment:

   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

5. Database Setup:

   - Start your local PostgreSQL server
   - Create a new database: `movie_vault_db`
   - Create a `.env` file in the root directory and add:
     ```
     DB_NAME=movie_vault_db
     DB_USER=postgres
     DB_PASSWORD=password
     DB_HOST=localhost
     DB_PORT=5432
     ```

6. Install Dependencies:

   - Navigate to backend: `cd server`
   - Install requirements: `pip install -r requirements.txt`

7. Run Migrations:

   ```bash
   python manage.py migrate
   ```

8. Start the Server:
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://127.0.0.1:8000/`

## Optional: Seed the Database

- Navigate to the backend directory: `cd server`
- Run the seed script: `python manage.py seed_movies`
- Run the seed script: `python manage.py seed_events`

To populate the database with initial test data:
