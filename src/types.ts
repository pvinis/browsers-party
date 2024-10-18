export type Status = "active" | "under development" | "dormant" | "dead"

export type Browser = {
	name: string
	homepage?: string
	code?: string
	engine?: string
	status?: Status
	os?: string
}
