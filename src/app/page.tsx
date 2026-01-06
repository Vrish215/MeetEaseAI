import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Video, ListChecks, Bot, FileText, Share2, Zap, Target, Send } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const RobotIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 6.5C16 5.11929 14.8807 4 13.5 4H10.5C9.11929 4 8 5.11929 8 6.5V8.5C8 9.88071 9.11929 11 10.5 11H13.5C14.8807 11 16 9.88071 16 8.5V6.5Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 11V15" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 15H14" stroke="currentColor" strokeWidth="2"/>
        <path d="M7 12H4C3.44772 12 3 12.4477 3 13V17C3 17.5523 3.44772 18 4 18H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M17 12H20C20.5523 12 21 12.4477 21 13V17C21 17.5523 20.5523 18 20 18H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="10.5" cy="7.5" r="1" fill="currentColor"/>
        <circle cx="13.5" cy="7.5" r="1" fill="currentColor"/>
    </svg>
);


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline">
                  Transform Your Meetings with AI
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  MeetEase AI listens to your meetings, provides concise summaries, and extracts key action items so you can focus on what matters.
                </p>
              </div>
              <div className="flex justify-center">
                 <RobotIcon className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 text-primary" data-ai-hint="robot illustration" />
              </div>
            </div>
          </div>
        </section>

        <section id="benefits" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                     <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Focus on the Conversation, Not the Notes</h2>
                     <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        MeetEase AI provides the tools you need to stay engaged while ensuring every detail is captured.
                     </p>
                </div>
                <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
                    <div className="grid gap-1 text-center">
                        <Zap className="w-10 h-10 mx-auto text-primary"/>
                        <h3 className="text-xl font-bold">Smart Summarization</h3>
                        <p className="text-muted-foreground">Get the gist of the entire meeting in a few concise paragraphs.</p>
                    </div>
                    <div className="grid gap-1 text-center">
                        <Target className="w-10 h-10 mx-auto text-primary"/>
                        <h3 className="text-xl font-bold">Action Item Extraction</h3>
                        <p className="text-muted-foreground">Never miss a to-do. The AI intelligently identifies tasks, assignees, and deadlines.</p>
                    </div>
                    <div className="grid gap-1 text-center">
                        <Send className="w-10 h-10 mx-auto text-primary"/>
                        <h3 className="text-xl font-bold">Seamless Sharing</h3>
                        <p className="text-muted-foreground">Export your summary and action items to email or copy them to your clipboard.</p>
                    </div>
                </div>
            </div>
        </section>


        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">Key Features</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Everything You Need for Productive Meetings</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                From automated transcription to intelligent analysis, we've got you covered.
              </p>
            </div>
            <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-2">
              <Card className="hover:shadow-lg transition-shadow bg-card">
                 <Link href="/dashboard" className="block h-full">
                    <CardHeader className="flex flex-row items-center gap-4">
                    <FileText className="w-8 h-8 text-primary" />
                    <CardTitle>Transcript Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <CardDescription>Paste any meeting transcript and our AI will instantly extract key insights, decisions, and action items.</CardDescription>
                    </CardContent>
                </Link>
              </Card>
              <Card className="hover:shadow-lg transition-shadow bg-card">
                <Link href="/dashboard?action=analyze" className="block h-full">
                    <CardHeader className="flex flex-row items-center gap-4">
                    <Video className="w-8 h-8 text-primary" />
                    <CardTitle>Live Meeting AI</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <CardDescription>Connect your Google Meet or Zoom account and get a live summary and action items as your meeting happens.</CardDescription>
                    </CardContent>
                </Link>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2025 MeetEase AI. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
