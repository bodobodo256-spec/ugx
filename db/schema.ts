import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const profiles = sqliteTable('profiles', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  name:        text('name').notNull(),
  slug:        text('slug').notNull().unique(),
  age:         integer('age').notNull(),
  location:    text('location').notNull(),
  city:        text('city').notNull(),
  tier:          text('tier', { enum: ['VIP', 'VIP Spa', 'Standard', 'Premium'] }).notNull().default('Standard'),
  isNew:         integer('is_new', { mode: 'boolean' }).default(false),
  isVerified:    integer('is_verified', { mode: 'boolean' }).default(false),
  isApproved:    integer('is_approved', { mode: 'boolean' }).default(false),
  isArchived:    integer('is_archived', { mode: 'boolean' }).default(false),
  isPremium:     integer('is_premium', { mode: 'boolean' }).default(false),
  paymentStatus: text('payment_status', { enum: ['pending', 'verified', 'unpaid', 'failed'] }).default('pending'),
  paymentAmount: integer('payment_amount').default(0),
  paymentRef:    text('payment_ref'),
  status:        text('status', { enum: ['online', 'recent'] }).notNull().default('recent'),
  picsCount:     integer('pics_count').notNull().default(0),
  vidsCount:     integer('vids_count'),
  photoUrl:      text('photo_url'),
  about:         text('about'),
  phone:         text('phone').notNull(),
  whatsapp:      text('whatsapp').notNull(),
  createdAt:     text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export type Profile    = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
