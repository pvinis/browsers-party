import type { PropsWithChildren } from "react"
import { App } from "./App"
import { PostHogProvider } from "posthog-js/react"

export function EntryPoint() {
	return (
		<Providers>
			<App />
		</Providers>
	)
}

function Providers({ children }: PropsWithChildren) {
	return (
		<PostHogProvider
			apiKey={import.meta.env.VITE_POSTHOG_API_KEY}
			options={{ api_host: import.meta.env.VITE_POSTHOG_HOST_URL }}
		>
			{children}
		</PostHogProvider>
	)
}
