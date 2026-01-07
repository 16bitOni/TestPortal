-- Add organization/team support to existing schema

-- Create organizations table
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add organization_id to admins table
ALTER TABLE admins ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE admins ADD COLUMN role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'member'));
ALTER TABLE admins ADD COLUMN invited_by UUID REFERENCES admins(id);
ALTER TABLE admins ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Update exams table to reference organization instead of individual admin
ALTER TABLE exams ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Create a default organization and update existing admin
INSERT INTO organizations (name) VALUES ('Default Organization');

-- Update existing admin to be the owner of default organization
UPDATE admins 
SET organization_id = (SELECT id FROM organizations WHERE name = 'Default Organization' LIMIT 1),
    role = 'owner'
WHERE admin_id = 'admin';

-- Update existing exams to belong to the organization
UPDATE exams 
SET organization_id = (SELECT organization_id FROM admins WHERE admin_id = 'admin' LIMIT 1)
WHERE organization_id IS NULL;