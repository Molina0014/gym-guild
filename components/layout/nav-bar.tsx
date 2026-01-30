"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Scroll, Swords, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/home", label: "Início", icon: Home },
  { href: "/quests", label: "Quests", icon: Scroll },
  { href: "/raids", label: "Raids", icon: Swords },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/character", label: "Herói", icon: User },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a2e] border-t-4 border-primary-700">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors",
                isActive
                  ? "text-primary-400"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform",
                  isActive && "animate-bounce-pixel"
                )}
              />
              <span className="font-pixel text-[8px] uppercase">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
