
# **Unified Insurance Operations System**

## **Table of Contents**
- [Project Description](#project-description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup and Installation](#setup-and-installation)
- [Running the Project](#running-the-project)
- [Git Workflow](#git-workflow)
- [Continuous Integration (CI)](#continuous-integration-ci)
- [License](#license)

---

## **Project Description**

The **Unified Insurance Operations System** is a comprehensive platform designed to streamline the day-to-day operations of various insurance teams, including Personal Lines, Commercial, Corporate, and Claims. The system integrates document filing, email archiving, task management, and meeting scheduling, all within a single unified platform. The aim is to consolidate the functionalities provided by separate software tools like **Cardinal360**, **PaperCloud**, **Flexi**, and **Microsoft Office** (Teams, SharePoint, Outlook) into one seamless application.

---

## **Features**

### **1. Document Filing**
- Each team can file documents directly into the system, eliminating the need for external file management tools like PaperCloud or SharePoint.
  
### **2. Email Archiving**
- Archive important emails directly from Outlook into the system with support for folder creation, follow-ups, and reminders.

### **3. Task Assignment**
- Assign team members tasks with deadlines, reminders, and the ability to monitor task completion.
  
### **4. Calendar and Meeting Integration**
- Create meetings directly in the system with automatic syncing to Outlook and Microsoft Teams.

### **5. Unified Dashboard**
- A user-friendly dashboard to track operations, documents, tasks, and meetings in one place.

---

## **Tech Stack**

The project uses the following technologies:
- **Backend**: ASP.NET Core (C#)
- **Frontend**: Blazor or ASP.NET MVC (for a web interface)
- **Database**: SQL Server or PostgreSQL (depending on your preference)
- **Version Control**: Git, GitHub
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Other Tools**: 
  - Microsoft Outlook API for email management
  - Microsoft Graph API for meeting and task scheduling
  - SharePoint and OneDrive APIs for document filing integration

---

## **Setup and Installation**

### **Prerequisites**
Before setting up the project, ensure you have the following installed:
- [.NET SDK 7.x](https://dotnet.microsoft.com/download)
- [Git](https://git-scm.com/downloads)
- [Visual Studio Code](https://code.visualstudio.com/) or [Visual Studio](https://visualstudio.microsoft.com/)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (or another database)
  
### **Steps to Clone and Set Up Locally**

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/Unified-Insurance-System.git
   cd Unified-Insurance-System
   ```

2. **Install Dependencies**:
   After cloning, restore dependencies:
   ```bash
   dotnet restore
   ```

3. **Database Setup**:
   Create and configure the database (SQL Server/PostgreSQL):
   - Add your connection string to `appsettings.json` in the `ConnectionStrings` section.
   
4. **Build the Project**:
   Build the project in release mode:
   ```bash
   dotnet build --configuration Release
   ```

5. **Run the Application**:
   Start the application:
   ```bash
   dotnet run
   ```

6. **Access the Application**:
   Open a browser and navigate to `http://localhost:5000` (or the default URL set by Kestrel or IIS).

---

## **Running the Project**

- **Running Locally**:
  After setting up, the project can be run using the `dotnet run` command, which starts the application in your local environment.

- **Running Tests**:
  The project includes unit and integration tests. You can run the tests using the following command:
  ```bash
  dotnet test
  ```

- **Access the CI pipeline**:
  GitHub Actions will run automated tests for each push to the `develop` branch. You can monitor build status and logs under the "Actions" tab in the GitHub repository.

---

## **Git Workflow**

This project follows a Git branching strategy that ensures stability and smooth feature integration.

1. **Main Branches**:
   - **`main`**: Contains stable, production-ready code.
   - **`develop`**: Serves as the integration branch for new features.

2. **Feature Branches**:
   For new features or bug fixes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Merging to `develop`**:
   After completing a feature, push your branch and open a pull request targeting `develop`. After review, merge the branch.

4. **Releases**:
   When ready to deploy, merge `develop` into `main` and tag the release:
   ```bash
   git checkout main
   git merge develop
   git tag -a v1.0 -m "Release version 1.0"
   git push origin main --tags
   ```

---

## **Continuous Integration (CI)**

We use **GitHub Actions** to automate testing and deployment. The CI pipeline is triggered by pushes to the `develop` branch and ensures that:

1. Dependencies are restored.
2. The project builds without errors.
3. Unit tests are run and pass.
   
The configuration is located in the `.github/workflows/ci.yml` file.

---

## **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

### **Contributing**
For contributing to this project, please follow the GitHub Flow:
- Fork the repository.
- Create a feature branch.
- Submit a pull request with your changes.

---

This `README.md` will guide both you and any future collaborators through understanding, setting up, and contributing to the **Unified Insurance Operations System** project.
