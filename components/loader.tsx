import Image from "next/image"

interface LogoLoaderProps {
  size?: number
  text?: string
}

export const LogoLoader = ({ size = 80, text }: LogoLoaderProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <img
          src="/logo.svg"
          alt="Loading"
          className="h-16 w-16 animate-spin bg-gray-600/5 dark:bg-foreground rounded-full"
        />
      </div>
      
    </div>
  )
}
