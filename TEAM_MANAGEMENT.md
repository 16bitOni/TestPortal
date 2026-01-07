# Team Management Feature

## Overview
The team management feature allows organizations to have multiple admin users who can collaborate on creating and managing exams. All team members share the same dashboard and can access the same exams.

## User Roles

### 1. **Owner**
- Full administrative privileges
- Can add/remove team members
- Can promote members to admin role
- Can activate/deactivate members
- Cannot be deactivated

### 2. **Admin** 
- Can create and manage exams
- Can add new team members (but not other admins)
- Can activate/deactivate regular members
- Cannot manage other admins or owners

### 3. **Member**
- Can create and manage exams
- Can view all organization exams
- Cannot manage other team members
- Can be managed by owners and admins

## Setup Instructions

### 1. Run the Database Migration
Execute the SQL in `src/lib/updated-schema.sql` in your Supabase SQL Editor:

```sql
-- This will add organization support to your existing database
-- Run this after your initial setup
```

### 2. Access Team Management
- Login as an admin
- Click "Team" in the top navigation
- Add new team members with their roles

### 3. Team Member Login
New team members can login with their generated credentials and will see the same dashboard with all organization exams.

## Features

### Team Dashboard
- View all team members
- See member roles and status
- Add new members with auto-generated credentials
- Activate/deactivate members

### Shared Exam Access
- All team members see the same exams
- Any member can create new exams
- Exams belong to the organization, not individual users
- Results are accessible to all team members

### Permission System
- Role-based access control
- Owners have full control
- Admins can manage members
- Members can only create/manage exams

## Usage Examples

### Adding a Team Member
1. Go to Team Management
2. Click "Add Member"
3. Fill in name and role
4. Use "Generate" for automatic credentials
5. Share the credentials with the new member

### Managing Member Access
- **Activate/Deactivate**: Control member access without deleting accounts
- **Role Assignment**: Set appropriate permissions for each member
- **Audit Trail**: See who invited each member

### Collaborative Exam Management
- Multiple members can work on different exams
- Shared access to all exam results
- Consistent branding and organization

## Security Features

- **Organization Isolation**: Members can only see their organization's data
- **Role-based Permissions**: Different access levels for different roles
- **Audit Trail**: Track who added each member
- **Account Management**: Activate/deactivate without data loss

## API Endpoints

- `GET /api/admin/team` - List team members
- `POST /api/admin/team/add` - Add new team member
- `PATCH /api/admin/team/toggle` - Activate/deactivate member

## Database Schema Changes

The feature adds:
- `organizations` table for grouping admins
- `organization_id` field to admins and exams
- `role` field for permission levels
- `invited_by` field for audit trail
- `is_active` field for account management