export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      brands: {
        Row: {
          created_at: string
          id: number
          logo: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          logo: string
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          logo?: string
          name?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          imageURL: string[] | null
          name: string
          showInMenu: boolean
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          imageURL?: string[] | null
          name: string
          showInMenu: boolean
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          imageURL?: string[] | null
          name?: string
          showInMenu?: boolean
          slug?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          base_price: number
          created_at: string | null
          customization_details: Json | null
          customization_fee: number | null
          id: string
          item_total: number
          order_id: string | null
          product_id: number | null
          quantity: number | null
        }
        Insert: {
          base_price: number
          created_at?: string | null
          customization_details?: Json | null
          customization_fee?: number | null
          id?: string
          item_total: number
          order_id?: string | null
          product_id?: number | null
          quantity?: number | null
        }
        Update: {
          base_price?: number
          created_at?: string | null
          customization_details?: Json | null
          customization_fee?: number | null
          id?: string
          item_total?: number
          order_id?: string | null
          product_id?: number | null
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_with_user_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          delivered_at: string | null
          feasibility_notes: string | null
          id: string
          notes: string | null
          production_notes: string | null
          ready_at: string | null
          status: string | null
          total_amount: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          feasibility_notes?: string | null
          id?: string
          notes?: string | null
          production_notes?: string | null
          ready_at?: string | null
          status?: string | null
          total_amount: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          feasibility_notes?: string | null
          id?: string
          notes?: string | null
          production_notes?: string | null
          ready_at?: string | null
          status?: string | null
          total_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          brandID: number | null
          categoryID: number
          created_at: string
          description: string | null
          id: number
          imageURL: string[] | null
          isAvailable: boolean
          name: string
          price: number | null
          promoPrice: number | null
        }
        Insert: {
          brandID?: number | null
          categoryID: number
          created_at?: string
          description?: string | null
          id?: number
          imageURL?: string[] | null
          isAvailable: boolean
          name: string
          price?: number | null
          promoPrice?: number | null
        }
        Update: {
          brandID?: number | null
          categoryID?: number
          created_at?: string
          description?: string | null
          id?: number
          imageURL?: string[] | null
          isAvailable?: boolean
          name?: string
          price?: number | null
          promoPrice?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brandID_fkey"
            columns: ["brandID"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_categoryID_fkey"
            columns: ["categoryID"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: Json | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shopping_bags: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      orders_with_user_details: {
        Row: {
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          customer_address: Json | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          feasibility_notes: string | null
          id: string | null
          notes: string | null
          production_notes: string | null
          ready_at: string | null
          status: string | null
          total_amount: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
