-- Table for Hero Section
CREATE TABLE hero_section (
    id SERIAL PRIMARY KEY,
    background_image_url TEXT NOT NULL,
    hero_title TEXT NOT NULL,
    hero_subtitle TEXT NOT NULL,
    cta_text TEXT NOT NULL,
    cta_redirect_to TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Showcase Section
CREATE TABLE showcase_section (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    subtitle_a TEXT NOT NULL,
    subtitle_description_a TEXT NOT NULL,
    subtitle_b TEXT NOT NULL,
    subtitle_description_b TEXT NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for About Us Section
CREATE TABLE about_us_section (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Updated Policies for secure access
CREATE POLICY "Admins can manage all hero sections" ON hero_section
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can manage all showcase sections" ON showcase_section
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can manage all about us sections" ON about_us_section
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'ADMIN'
    )
  );
