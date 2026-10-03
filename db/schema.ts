import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const profiles = sqliteTable('profiles', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  name:        text('name').notNull(),
  slug:        text('slug').notNull().unique(),
  age:         integer('age').notNull(),
  location:    text('location').notNull(),
  city:        text('city').notNull(),
  tier:        text('tier', { enum: ['VIP', 'VIP Spa', 'Standard'] }).notNull().default('Standard'),
  isNew:       integer('is_new', { mode: 'boolean' }).default(false),
  isVerified:  integer('is_verified', { mode: 'boolean' }).default(false),
  status:      text('status', { enum: ['online', 'recent'] }).notNull().default('recent'),
  picsCount:   integer('pics_count').notNull().default(0),
  vidsCount:   integer('vids_count'),
  photoUrl:    text('photo_url'),
  about:       text('about'),
  phone:       text('phone').notNull(),
  whatsapp:    text('whatsapp').notNull(),
  createdAt:   text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export type Profile    = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
