"use server";

import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';
import { profiles } from '@/db/schema/profiles';
import { eq, ilike, or, and } from 'drizzle-orm';

interface ServerActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface CustomerSearchResult {
  id: string;
  fullName: string | null;
  phone: string | null;
  role: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  address: any;
  orderCount?: number;
  lastOrderDate?: string;
  totalSpent?: number;
}

/**
 * Search customers by name or phone (admin only)
 */
export async function searchCustomersAction(
  searchTerm: string
): Promise<ServerActionResult<CustomerSearchResult[]>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: 'Authentication required' };
    }

    // Verify admin access
    const adminProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id)
    });

    if (!adminProfile || adminProfile.role !== 'ADMIN') {
      return { success: false, error: 'Admin access required' };
    }

    if (!searchTerm || searchTerm.trim().length < 2) {
      return { success: true, data: [] };
    }

    const term = searchTerm.trim();

    // Search customers by name or phone, only return CUSTOMER role
    const customers = await db.query.profiles.findMany({
      where: and(
        eq(profiles.role, 'CUSTOMER'),
        or(
          ilike(profiles.fullName, `%${term}%`),
          ilike(profiles.phone, `%${term}%`)
        )
      ),
      limit: 10,
      orderBy: (profiles, { asc }) => [asc(profiles.fullName)]
    });

    // TODO: Add order statistics by joining with orders table
    const customersWithStats: CustomerSearchResult[] = customers.map(customer => ({
      ...customer,
      orderCount: 0, // TODO: Implement actual order count query
      lastOrderDate: undefined, // TODO: Implement actual last order date
      totalSpent: 0 // TODO: Implement actual total spent calculation
    }));

    return { success: true, data: customersWithStats };

  } catch (error) {
    console.error('Search customers error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search customers'
    };
  }
}