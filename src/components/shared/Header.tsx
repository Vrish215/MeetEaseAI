import Link from "next/link";
import { Bot } from "lucide-react";
import HeaderNav from "@/components/shared/HeaderNav";

export default function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <Link href="/" className="flex items-center justify-center gap-2">
        <Bot className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg font-headline">MeetEase AI</span>
      </Link>
      <HeaderNav />
    </header>
  );
}
