import "./index.css"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { EntryPoint } from "./EntryPoint.tsx"

// biome-ignore lint/style/noNonNullAssertion: just ignore it here
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<EntryPoint />
	</StrictMode>,
)
