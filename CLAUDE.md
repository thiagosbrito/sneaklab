# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SneakLab is a Next.js 15 e-commerce application for streetwear and sneakers, built with:
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **State Management**: React Context API + React Query for server state
- **Package Manager**: pnpm

## Development Commands

```bash
# Development
pnpm dev              # Start development server (localhost:3000)
pnpm build            # Production build
pnpm start            # Start production server

# n8n Deployment (WhatsApp Integration)
cd n8n-deployment && ./deploy.sh  # Deploy n8n to Fly.io

# Supabase Management
supabase start        # Start local Supabase
supabase db push      # Push migrations to remote
supabase db reset     # Reset local database

# Testing (Legacy - use API routes instead)
pnpm test:whatsapp    # Test WhatsApp integration (deprecated)
```

## Architecture Overview

### App Structure
- **`/app`**: Next.js App Router with nested layouts
  - `/(main)`: Public storefront with category/product pages
  - `/admin`: Protected admin dashboard with authentication
  - `/api`: API routes for products, bestsellers, categories, **orders**
- **`/components`**: Reusable UI components
  - `/layout`: Header, navbar, footer, product cards
  - `/ui`: shadcn/ui components + custom components
  - `/admin`: Admin-specific forms and components
- **`/contexts`**: React Context providers (auth, bag, menu, login dialog)
- **`/utils`**: Business logic, Supabase clients, models, utilities

### Key Features Architecture

#### Order Management System
- **Centralized API**: `/api/orders` route handles order creation and status updates
- **n8n Integration**: API sends webhooks to n8n for WhatsApp notifications
- **Admin Components**: `OrderStatusForm` for status management with WhatsApp triggers
- **Environment Variables**: `N8N_WEBHOOK_URL`, `N8N_API_KEY` for integration

#### Shopping Bag System
- **Context-based state**: `contexts/bag.tsx` with localStorage persistence
- **Supabase sync**: Optional authentication-based bag synchronization
- **Quantity management**: Full CRUD operations on bag items
- **Persistence**: LocalStorage + optional Supabase backup for authenticated users

#### Authentication & Admin
- **Supabase Auth**: Cookie-based authentication with SSR support
- **Protected routes**: Admin layout checks authentication status
- **Multi-client pattern**: Separate server/client Supabase instances

#### Database Schema
- **Products**: Main inventory with categories, brands, prices
- **Orders**: Custom order workflow with WhatsApp notifications
- **Shopping bags**: User bag persistence (optional, for authenticated users)
- **Wishlist**: Save products for later

### Supabase Integration Patterns

#### Client Management
- **Server client**: `utils/supabase/server.ts` - for server components/actions
- **Browser client**: `utils/supabase/client.ts` - for client components
- **Typed client**: `utils/models/supabase-client.ts` - TypeScript wrapper

#### Database Operations
- **Products**: Read-only public access, admin write access
- **Orders**: User-specific with Row Level Security
- **Real-time**: Supabase subscriptions (not currently implemented)

#### Edge Functions
- **WhatsApp notifications**: Migrated to n8n automation platform
- **Order workflow**: 7-stage process with n8n integration

### WhatsApp Integration (n8n Migration)
The application uses n8n for WhatsApp order notifications triggered by database changes:

#### Order Workflow
1. `pending` → Customer creates order
2. `reviewing` → Team reviews feasibility
3. `confirmed` → Order confirmed ✅ n8n sends WhatsApp message
4. `in_progress` → Work begins
5. `ready` → Product ready ✅ n8n sends WhatsApp message
6. `delivered` → Hand delivered
7. `completed` → Payment collected

#### Technical Implementation
- **Centralized API**: `/api/orders` route handles order creation and status updates
- **n8n Integration**: API sends webhooks to n8n for WhatsApp message processing
- **Webhook Payload**: Structured data with order details and customer information
- **Legacy Code**: Database triggers and Edge Functions are deprecated

## Development Patterns

### Component Organization
- Use shadcn/ui as base, extend with custom components
- Admin components are separate from public-facing components
- Layout components are shared across routes where possible

### State Management
- **Local state**: React useState for component-specific state
- **Global state**: React Context for cross-component state (bag, auth, menu)
- **Server state**: React Query with Supabase integration
- **Persistence**: localStorage for client state, Supabase for server state

### Styling Approach
- **Tailwind CSS**: Utility-first styling
- **Component variants**: Using `class-variance-authority` for component styling
- **Theme support**: next-themes with system/dark/light modes
- **Responsive**: Mobile-first responsive design

### Authentication Flow
- **Public routes**: Storefront accessible without authentication
- **Protected routes**: Admin panel requires authentication
- **Conditional rendering**: UI adapts based on authentication state
- **Server-side checks**: Admin layout validates user server-side

## Important Notes

### Environment Setup
- Requires Supabase project with proper environment variables
- WhatsApp Business API setup for order notifications
- Local development uses localhost:3000 by default

### Database Migrations
- Sequential numbered migrations in `supabase/migrations/`
- Some migrations have duplicate numbers (legacy) - use latest versions
- Order matters: run migrations in numerical sequence

### WhatsApp Integration
- WhatsApp messaging handled by n8n deployed on Fly.io
- Centralized `/api/orders` route sends webhooks to n8n
- Database triggers have been disabled (migration 009)
- Test order creation and status updates via API routes
- n8n webhook URL: `https://sneaklab.fly.dev/webhook/whatsapp-notifications`

### Key Dependencies
- Next.js 15 with App Router (latest features)
- React 19 (latest)
- Supabase v2 with SSR support
- shadcn/ui for consistent UI components
- React Query for server state management
- TypeScript for type safety