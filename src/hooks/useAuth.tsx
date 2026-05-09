"use client"
import { useAuthContext } from "@/lib/auth/AuthProvider";

export default function useAuth() {
  return useAuthContext();
}
