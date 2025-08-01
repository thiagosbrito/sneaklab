import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const aboutUsSection = pgTable('about_us_section', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const heroSection = pgTable('hero_section', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  heroTitle: text('hero_title').notNull(),
  heroSubtitle: text('hero_subtitle').notNull(),
  backgroundImageUrl: text('background_image_url').notNull(),
  ctaText: text('cta_text').notNull(),
  ctaRedirectTo: text('cta_redirect_to').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const showcaseSection = pgTable('showcase_section', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  subtitleA: text('subtitle_a').notNull(),
  subtitleB: text('subtitle_b').notNull(),
  subtitleDescriptionA: text('subtitle_description_a').notNull(),
  subtitleDescriptionB: text('subtitle_description_b').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export type AboutUsSection = typeof aboutUsSection.$inferSelect
export type NewAboutUsSection = typeof aboutUsSection.$inferInsert
export type HeroSection = typeof heroSection.$inferSelect
export type NewHeroSection = typeof heroSection.$inferInsert
export type ShowcaseSection = typeof showcaseSection.$inferSelect
export type NewShowcaseSection = typeof showcaseSection.$inferInsert