-- Fix admin policies for content tables
-- The issue is UUID vs TEXT comparison in the admin check

CREATE POLICY "Admins can manage hero sections" ON hero_section
    FOR ALL TO public USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
        )
    );

CREATE POLICY "Admins can manage about us sections" ON about_us_section
    FOR ALL TO public USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
        )
    );

CREATE POLICY "Admins can manage showcase sections" ON showcase_section
    FOR ALL TO public USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
        )
    );