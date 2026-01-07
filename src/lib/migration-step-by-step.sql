-- Step 1: Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Add new columns to admins table (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'organization_id') THEN
        ALTER TABLE admins ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'role') THEN
        ALTER TABLE admins ADD COLUMN role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'member'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'invited_by') THEN
        ALTER TABLE admins ADD COLUMN invited_by UUID REFERENCES admins(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'is_active') THEN
        ALTER TABLE admins ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Step 3: Add organization_id to exams table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exams' AND column_name = 'organization_id') THEN
        ALTER TABLE exams ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 4: Create a default organization
INSERT INTO organizations (name) 
SELECT 'Default Organization' 
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Default Organization');

-- Step 5: Update existing admin to be the owner of default organization
UPDATE admins 
SET 
    organization_id = (SELECT id FROM organizations WHERE name = 'Default Organization' LIMIT 1),
    role = 'owner'
WHERE admin_id = 'admin' AND organization_id IS NULL;

-- Step 6: Update existing exams to belong to the organization
UPDATE exams 
SET organization_id = (SELECT organization_id FROM admins WHERE admin_id = 'admin' LIMIT 1)
WHERE organization_id IS NULL;