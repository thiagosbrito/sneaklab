import { db } from '@/db'
import { showcaseSection, heroSection, aboutUsSection } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

/**
 * Get active showcase section content from the database (server-side)
 */
export async function getActiveShowcaseSectionFromDB() {
  try {
    const result = await db
      .select()
      .from(showcaseSection)
      .where(eq(showcaseSection.isActive, true))
      .limit(1)

    return result[0] || null
  } catch (error) {
    console.error('Error fetching active showcase section from database:', error)
    throw error
  }
}

/**
 * Get all showcase section versions from the database (server-side)
 */
export async function getAllShowcaseSectionsFromDB() {
  try {
    const result = await db
      .select()
      .from(showcaseSection)
      .orderBy(desc(showcaseSection.createdAt))

    return result
  } catch (error) {
    console.error('Error fetching all showcase sections from database:', error)
    throw error
  }
}

/**
 * Create new showcase section content (server-side)
 */
export async function createShowcaseSectionFromDB(data: {
  title: string
  description: string
  imageUrl: string
  subtitleA: string
  subtitleB: string
  subtitleDescriptionA: string
  subtitleDescriptionB: string
  isActive?: boolean
}) {
  try {
    // If setting as active, deactivate all others first
    if (data.isActive) {
      await db
        .update(showcaseSection)
        .set({ isActive: false })
        .where(eq(showcaseSection.isActive, true))
    }

    // Create new record
    const result = await db
      .insert(showcaseSection)
      .values(data)
      .returning()

    return result[0]
  } catch (error) {
    console.error('Error creating showcase section:', error)
    throw error
  }
}

/**
 * Update existing showcase section content (server-side)
 */
export async function updateShowcaseSectionFromDB(id: string, data: {
  title?: string
  description?: string
  imageUrl?: string
  subtitleA?: string
  subtitleB?: string
  subtitleDescriptionA?: string
  subtitleDescriptionB?: string
  isActive?: boolean
}) {
  try {
    // If setting as active, deactivate all others first
    if (data.isActive) {
      await db
        .update(showcaseSection)
        .set({ isActive: false })
        .where(eq(showcaseSection.isActive, true))
    }

    // Update specific record
    const result = await db
      .update(showcaseSection)
      .set(data)
      .where(eq(showcaseSection.id, id))
      .returning()

    return result[0] || null
  } catch (error) {
    console.error('Error updating showcase section:', error)
    throw error
  }
}

/**
 * Activate a specific showcase section version (server-side)
 */
export async function activateShowcaseSectionFromDB(id: string) {
  try {
    // Deactivate all others first
    await db
      .update(showcaseSection)
      .set({ isActive: false })
      .where(eq(showcaseSection.isActive, true))

    // Activate the specific one
    const result = await db
      .update(showcaseSection)
      .set({ isActive: true })
      .where(eq(showcaseSection.id, id))
      .returning()

    return result[0] || null
  } catch (error) {
    console.error('Error activating showcase section:', error)
    throw error
  }
}

/**
 * Get hero section content from the database (server-side)
 */
export async function getHeroSectionFromDB() {
  try {
    const result = await db
      .select()
      .from(heroSection)
      .limit(1)

    return result[0] || null
  } catch (error) {
    console.error('Error fetching hero section from database:', error)
    throw error
  }
}

/**
 * Create or update hero section content (server-side)
 */
export async function upsertHeroSectionFromDB(data: {
  heroTitle: string
  heroSubtitle: string
  backgroundImageUrl: string
  ctaText: string
  ctaRedirectTo: string
}) {
  try {
    // Check if hero section already exists
    const existing = await getHeroSectionFromDB()

    if (existing) {
      // Update existing record
      const result = await db
        .update(heroSection)
        .set(data)
        .where(eq(heroSection.id, existing.id))
        .returning()

      return result[0]
    } else {
      // Create new record
      const result = await db
        .insert(heroSection)
        .values(data)
        .returning()

      return result[0]
    }
  } catch (error) {
    console.error('Error upserting hero section:', error)
    throw error
  }
}

/**
 * Get about us section content from the database (server-side)
 */
export async function getAboutUsSectionFromDB() {
  try {
    const result = await db
      .select()
      .from(aboutUsSection)
      .limit(1)

    return result[0] || null
  } catch (error) {
    console.error('Error fetching about us section from database:', error)
    throw error
  }
}

/**
 * Create or update about us section content (server-side)
 */
export async function upsertAboutUsSectionFromDB(data: {
  title: string
  description: string
}) {
  try {
    // Check if about us section already exists
    const existing = await getAboutUsSectionFromDB()

    if (existing) {
      // Update existing record
      const result = await db
        .update(aboutUsSection)
        .set(data)
        .where(eq(aboutUsSection.id, existing.id))
        .returning()

      return result[0]
    } else {
      // Create new record
      const result = await db
        .insert(aboutUsSection)
        .values(data)
        .returning()

      return result[0]
    }
  } catch (error) {
    console.error('Error upserting about us section:', error)
    throw error
  }
}