
import { Loader2 } from 'lucide-react'

export default function Loading() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background gap-4">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-primary border-l-transparent opacity-20 animate-pulse"></div>
            </div>
            <div className="flex flex-col items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">Attendance System</h2>
                <p className="text-muted-foreground animate-pulse">Loading...</p>
            </div>
        </div>
    )
}
