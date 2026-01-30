import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#22c55e]" />
        <h2 className="mt-4 text-xl font-semibold text-[#0f172a]">
          Loading...
        </h2>
      </div>
    </div>
  )
}
