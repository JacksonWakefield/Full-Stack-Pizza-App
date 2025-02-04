

##Pizza Store Management##

##Project Overview##

This is a full-stack application for managing pizza toppings and pizza creations. It allows store owners to manage available toppings and pizza chefs to create and update pizzas with selected toppings.

Technical Stack
Frontend: Next.js
Backend: Django
Database: AWS RDS (MySQL)
Deployment: Frontend on Vercel, Backend on AWS
Styling: Tailwind CSS
Features
Toppings Management
View a list of available toppings
Add, update, and delete toppings
Prevent duplicate toppings
Pizzas Management
View a list of existing pizzas and their toppings
Create new pizzas with selected toppings
Update existing pizzas and their toppings
Delete pizzas
Prevent duplicate pizza names
Getting Started
Prerequisites
Node.js
Python 3.x
MySQL
AWS CLI configured
Setup Instructions
Backend (Django API)
Clone the repository:
bash
Copy
Edit
git clone https://github.com/yourusername/pizza-store-management.git
cd pizza-store-management/backend
Set up a virtual environment and activate it:
bash
Copy
Edit
python3 -m venv venv  
source venv/bin/activate  
Install dependencies:
bash
Copy
Edit
pip install -r requirements.txt  
Set up environment variables in .env:
ini
Copy
Edit
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
Run database migrations:
bash
Copy
Edit
python manage.py migrate  
Start the development server:
bash
Copy
Edit
python manage.py runserver  
Frontend (Next.js)
Navigate to the frontend directory:
bash
Copy
Edit
cd ../frontend  
Install dependencies:
bash
Copy
Edit
npm install  
Start the development server:
bash
Copy
Edit
npm run dev  
Running Tests
Backend Tests
bash
Copy
Edit
cd backend
python manage.py test  
Frontend Tests
bash
Copy
Edit
cd frontend  
npm run test  
Deployment
Backend Deployment (AWS)
Provide detailed steps on how to deploy the backend to AWS.

Frontend Deployment (Vercel)
Provide detailed steps on how to deploy the frontend to Vercel.

API Documentation
List your API endpoints and describe their functionalities.

Thought Process
Explain your reasoning for technical choices and how you structured the project.

Future Improvements
 Enhanced error handling
 Pagination for large data sets
 Additional UI enhancements
Contact
Provide your contact information or GitHub profile.

