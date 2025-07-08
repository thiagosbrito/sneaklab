"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSupabaseBrowser from "@/utils/supabase/client";
import { useAuth } from "@/contexts/auth";
import { User } from "lucide-react";

export default function UserDropdown() {
  const router = useRouter();
  const supabase = useSupabaseBrowser();
  const { user } = useAuth();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/admin/(auth)/sign-in");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-8 h-8 bg-gray-300 dark:bg-muted rounded-full flex items-center justify-center focus:outline-none">
          <User className="w-4 h-4 text-gray-600 dark:text-gray-200" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1 text-xs text-muted-foreground">
          {user?.email || "Conta"}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/dashboard/account">Minha Conta</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/dashboard/invite-members">Convidar membros</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/dashboard/settings">Configurações</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
