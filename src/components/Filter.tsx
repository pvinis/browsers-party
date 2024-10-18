import type { Column } from "@tanstack/react-table"
import type { Browser } from "../types"
import { DebouncedInput } from "./DebouncedInput"

export function Filter({ column }: { column: Column<Browser, unknown> }) {
	const columnFilterValue = column.getFilterValue()
	const { filterVariant } = (column.columnDef.meta ?? {}) as {
		filterVariant: "range" | "select" | "text"
	}

	return filterVariant === "range" ? (
		<div>
			<div className="flex space-x-2">
				<DebouncedInput
					type="number"
					value={(columnFilterValue as [number, number])?.[0] ?? ""}
					onChange={(value) => column.setFilterValue((old: [number, number]) => [value, old?.[1]])}
					placeholder="Min"
					className="w-24 rounded border shadow"
				/>
				<DebouncedInput
					type="number"
					value={(columnFilterValue as [number, number])?.[1] ?? ""}
					onChange={(value) => column.setFilterValue((old: [number, number]) => [old?.[0], value])}
					placeholder="Max"
					className="w-24 rounded border shadow"
				/>
			</div>
			<div className="h-1" />
		</div>
	) : filterVariant === "select" ? (
		<select
			onChange={(e) => column.setFilterValue(e.target.value)}
			value={columnFilterValue?.toString()}
		>
			<option value="">All</option>
			<option value="complicated">complicated</option>
			<option value="relationship">relationship</option>
			<option value="single">single</option>
		</select>
	) : (
		<DebouncedInput
			className="w-36 rounded border shadow"
			onChange={(value) => column.setFilterValue(value)}
			placeholder="Search..."
			type="text"
			value={(columnFilterValue ?? "") as string}
		/>
	)
}
