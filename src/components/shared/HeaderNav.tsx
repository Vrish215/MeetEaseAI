
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeaderNav() {
    return (
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
            <Button asChild>
                <Link href="/#features">Dashboard</Link>
            </Button>
        </nav>
    );
}
