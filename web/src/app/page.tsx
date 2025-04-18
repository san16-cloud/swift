import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-white dark:bg-black">
      <main className="flex flex-col items-center justify-center w-full max-w-4xl text-center space-y-10">
        <div className="relative w-20 h-20 mb-2">
          <Image 
            src="/swift-logo.svg" 
            alt="Swift Logo" 
            fill 
            priority
            className="dark:invert"
          />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
          Swift
        </h1>
        
        <p className="text-xl md:text-2xl max-w-2xl">
          Talk to your codebase.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-md">
          <a 
            href="https://github.com/lumix-labs/swift" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-medium rounded-md hover:opacity-90 transition-opacity text-center"
          >
            Get Started
          </a>
          <a 
            href="https://x.com/ashwani_48" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3 border border-black dark:border-white text-black dark:text-white font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-center"
          >
            Follow @ashwani_48
          </a>
        </div>
      </main>
      
      <footer className="absolute bottom-5 w-full text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Lumix Labs. All rights reserved.</p>
      </footer>
    </div>
  );
}
