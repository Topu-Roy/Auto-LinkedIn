"use client"

import { type ReactNode } from "react"
import { QueryClientProvider as Provider, QueryClient } from "@tanstack/react-query"
import { ConvexQueryClient } from "@convex-dev/react-query"
import { ConvexProvider, ConvexReactClient } from "convex/react"

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
const convexQueryClient = new ConvexQueryClient(convex)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
})

convexQueryClient.connect(queryClient)

export function QueryClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <Provider client={queryClient}>{children}</Provider>
    </ConvexProvider>
  )
}
