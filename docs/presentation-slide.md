# HOPEHRS Project Presentation - Slide Outline

**Project Title + Team**
- **Hope, Inc. HR Management System (HOPEHRS)**
- **Development Team**:
  - **Scrum Master**: [Aletheos Peñarubia](https://github.com/Aletheos-uuu)
  - **Frontend Developer (UI/UX)**: [Sean Orioque](https://github.com/seanorioque)
  - **DB Engineer**: [Angelyn Bondoc](https://github.com/angelynbondoc)
  - **Rights & Authentication Specialist**: [Julia Rodrigo](https://github.com/engr-julia)
  - **QA / Documentation Specialist**: [Tricia Labbao](https://github.com/tricialabbao)
- **Client**: Hope, Inc. HR Department
- **Technologies**: React, Vite, Supabase, PostgreSQL

---

## Slide 2: System Overview
**HOPEHRS - Complete HR Management Solution**
- **Purpose**: Streamline HR operations for Hope, Inc.
- **Core Functionality**:
  - Employee lifecycle management
  - Job history and salary tracking
  - Department organization
  - User administration with role-based access
- **Key Benefits**:
  - Centralized employee data
  - Improved data security and audit trails
  - Mobile-responsive design
  - Real-time reporting capabilities
- **Target Users**: HR Staff, Department Managers, System Administrators

---

## Slide 3: Tech Stack & Architecture
**Modern Technology Stack**
- **Frontend**:
  - React 19.2.4 - Component-based architecture
  - Vite 8.0.1 - Fast development and build
  - Tailwind CSS - Responsive design
  - React Router DOM - Client-side routing
- **Backend & Database**:
  - Supabase 2.101.1 - BaaS platform
  - PostgreSQL - Robust relational database
  - Row Level Security (RLS) - Data protection
  - Supabase Auth - Google Workspace SSO
- **Architecture Pattern**:
  - Client-server architecture
  - RESTful API design
  - Component-based frontend
  - Role-based access control

---

## Slide 4: Database Design (ERD)
**Entity Relationship Diagram**
- **Core HR Tables**:
  - `employee` - Employee master data
  - `job` - Job positions and descriptions
  - `department` - Organizational structure
  - `jobHistory` - Employee job assignments
- **Access Control Tables**:
  - `user` - System user accounts
  - `Module` - System modules
  - `rights` - Granular permissions
  - `user_module` - User-module assignments
  - `UserModule_Rights` - Detailed permissions
- **Key Relationships**:
  - Employee ↔ JobHistory (1:N)
  - Job ↔ JobHistory (1:N)
  - Department ↔ JobHistory (1:N)
  - User ↔ User_Module ↔ UserModule_Rights
- **ERD Diagrams**:
  - **HR Core ERD**: [Access Diagram](https://github.com/Aletheos-uuu/HopeHRS/blob/dev/docs/HRCoreERDiagram.png)
  - **Access Control ERD**: [Access Control Diagram](https://github.com/Aletheos-uuu/HopeHRS/blob/dev/docs/AccessControlERDiagram.png)

---

## Slide 5: User Types & Rights Matrix
**Three-Tier Role System**
- **SUPERADMIN**:
  - Full system access
  - User management capabilities
  - All CRUD operations
  - System administration
- **ADMIN**:
  - Employee, Job, Department management
  - Limited deletion rights
  - No user management access
  - Reporting capabilities
- **USER**:
  - Read-only access to all modules
  - View reports and dashboards
  - No data modification rights
- **Rights Matrix Visualization**:
  - 17 granular rights across 5 modules
  - Role-based permission enforcement
  - Access control at UI and database levels

---

## Slide 6: Authentication Flow
**Secure Google Workspace SSO**
- **Authentication Process**:
  1. User clicks "Login with Google"
  2. Redirect to Google OAuth
  3. Domain restriction (@neu.edu.ph)
  4. JWT token generation
  5. Session management
- **Security Features**:
  - Domain-based access control
  - Session timeout handling
  - Automatic logout on inactivity
  - Secure token storage
- **User Experience**:
  - Single sign-on convenience
  - No password management
  - Seamless integration with Google Workspace

---

## Slide 7: HR Module Demo (CRUD + Soft Delete)
**Employee Management Demonstration**
- **Create Operations**:
  - New employee registration
  - Data validation and error handling
  - Automatic audit logging
- **Read Operations**:
  - Employee search and filtering
  - Profile viewing with role-based access
  - Export functionality
- **Update Operations**:
  - Real-time data synchronization
  - Change tracking and audit trails
  - Validation before save
- **Delete Operations**:
  - Soft delete implementation
  - Confirmation dialogs
  - Recovery capabilities
- **Live Demo**: Show complete CRUD workflow

---

## Slide 8: Soft-Delete Cascade Behavior
**Data Integrity & Recovery System**
- **Soft Delete Implementation**:
  - `record_status` field (ACTIVE/INACTIVE)
  - No permanent data loss
  - Audit trail preservation
- **Cascade Behavior**:
  - Employee delete → JobHistory records affected
  - Department delete → Employee associations updated
  - Job delete → JobHistory records updated
- **Recovery Process**:
  - Deleted Items module
  - Bulk recovery operations
  - Permission-based restoration
- **Benefits**:
  - Data safety and compliance
  - Audit trail completeness
  - User error recovery

---

## Slide 9: Deleted Items & Recovery
**Comprehensive Recovery System**
- **Deleted Items Dashboard**:
  - Filter by date, user, item type
  - Search functionality
  - Preview before recovery
- **Recovery Features**:
  - Single item recovery
  - Bulk recovery operations
  - Selective restoration
- **Access Control**:
  - SUPERADMIN only access
  - Audit logging of recovery actions
  - Permission validation
- **Data Integrity**:
  - Referential integrity checks
  - Conflict resolution
  - Rollback capabilities

---

## Slide 10: HR Reports
**Comprehensive Reporting System**
- **Employee Reports**:
  - Active employee listings
  - Department-wise distribution
  - Joining/termination trends
- **Job History Reports**:
  - Salary progression analysis
  - Job change patterns
  - Performance metrics
- **Department Reports**:
  - Headcount analysis
  - Budget allocation
  - Organizational charts
- **Administrative Reports**:
  - User activity logs
  - System usage statistics
  - Security audit reports

---

## Slide 11: Admin Module & SUPERADMIN Protection
**System Administration & Security**
- **User Management**:
  - Create, edit, deactivate users
  - Role assignment and permissions
  - Activity monitoring
- **System Configuration**:
  - Module settings
  - Security policies
  - Backup schedules
- **SUPERADMIN Protection**:
  - Multi-factor authentication
  - IP whitelisting
  - Session monitoring
  - Emergency access procedures
- **Security Features**:
  - Failed login tracking
  - Session management
  - Audit trail completeness
  - Compliance reporting

---

## Slide 12: Lessons Learned + Live URL
**Project Insights & Deployment**
- **Technical Lessons Learned**:
  - RLS implementation challenges
  - Complex permission matrix design
  - Performance optimization strategies
  - Mobile responsiveness best practices
- **Project Management Insights**:
  - Agile methodology effectiveness
  - Cross-team collaboration
  - Requirements gathering importance
  - Testing strategy improvements
- **Future Enhancements**:
  - Mobile app development
  - AI-powered analytics
  - Advanced reporting features
  - Integration with payroll systems
- **Live Deployment**:
  - **URL**: https://hope-hrs-beta.vercel.app
  - **Status**: Production Ready
  - **Access**: Google Workspace SSO
  - **Support**: [Contact Information]

---
