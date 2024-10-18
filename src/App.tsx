import {
	type Column,
	type ColumnFiltersState,
	type SortingState,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { usePapaParse } from "react-papaparse"
import { cn } from "./utils"

type Status = "active" | "under development" | "dormant" | "dead"

type Browser = {
	name: string
	homepage?: string
	code?: string
	engine?: string
	status?: Status
}

const columnHelper = createColumnHelper<Browser>()

const columns = [
	columnHelper.accessor("name", {
		// cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("homepage", {
		cell: (info) => {
			if (info.getValue()?.startsWith("http")) {
				return <a href={info.getValue()}>{info.getValue()}</a>
			}
			return info.getValue()
		},
	}),
	columnHelper.accessor("code", {
		cell: (info) => {
			if (info.getValue()?.startsWith("http")) {
				return <a href={info.getValue()}>{info.getValue()}</a>
			}
			return info.getValue()
		},
	}),
	columnHelper.accessor("engine", {}),
	columnHelper.accessor("status", {
		cell: (info) => {
			const colorMap: Record<Status, string> = {
				active: "bg-green-200",
				"under development": "bg-yellow-200",
				dormant: "bg-gray-200",
				dead: "bg-red-200",
			}
			const status = info.getValue()
			const color = status ? colorMap[status as Status] : ""
			return (
				<div className={cn(color)}>
					<span>{status}</span>
				</div>
			)
		},
		sortingFn: (rowA, rowB, columnId) => {
			const statusA = rowA.getValue(columnId) as Status | undefined
			const statusB = rowB.getValue(columnId) as Status | undefined

			const statusOrder: Record<Status, number> = {
				active: 1,
				"under development": 2,
				dormant: 3,
				dead: 4,
				// undefined: 5
			}
			return (statusA ? statusOrder[statusA] : 5) - (statusB ? statusOrder[statusB] : 5)
		},
	}),
]

export function App() {
	const { readString } = usePapaParse()
	const [data, setData] = useState<Browser[]>([])

	useEffect(() => {
		const loadData = async () => {
			const csvContent = await (await fetch("/db.csv")).text()

			readString<Browser>(csvContent, {
				header: true,
				skipEmptyLines: true,
				complete: (results) => {
					if (results.errors.length > 0) {
						console.log(results.errors)
					}
					setData(results.data)
				},
			})
		}
		loadData()
	}, [readString])

	const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		filterFns: {},
		state: { sorting, columnFilters },
		// enableMultiSort: false, //Don't allow shift key to sort multiple columns - default on/true
		// isMultiSortEvent: (e) => true, //Make all clicks multi-sort - default requires `shift` key
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		// debugTable: true,
		// debugHeaders: true,
		// debugColumns: false,
	})

	return (
		<div className="p-2">
			<h1 className="font-bold text-2xl">
				Browsers Party <div className="inline-block animate-bounce">🎉</div>
			</h1>
			<p>The ultimate list of desktop browsers.</p>

			<p>You can sort by clicking on the column headers.</p>
			<table className="border-separate ">
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<th key={header.id} colSpan={header.colSpan}>
									{header.isPlaceholder ? null : (
										<>
											<div
												className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
												onClick={header.column.getToggleSortingHandler()}
												title={
													header.column.getCanSort()
														? header.column.getNextSortingOrder() === "asc"
															? "Sort ascending"
															: header.column.getNextSortingOrder() === "desc"
																? "Sort descending"
																: "Clear sort"
														: undefined
												}
											>
												{flexRender(header.column.columnDef.header, header.getContext())}
												{{
													asc: " 🔼",
													desc: " 🔽",
												}[header.column.getIsSorted() as string] ?? null}
											</div>
											{header.column.getCanFilter() ? (
												<div>
													<Filter column={header.column} />
												</div>
											) : null}
										</>
									)}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr key={row.id} className="even:bg-slate-100 ">
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="px-2">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
				<tfoot>
					{table.getFooterGroups().map((footerGroup) => (
						<tr key={footerGroup.id}>
							{footerGroup.headers.map((header) => (
								<th key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(header.column.columnDef.footer, header.getContext())}
								</th>
							))}
						</tr>
					))}
				</tfoot>
			</table>
			<div className="h-4" />

			<div>
				<p>
					Made with 💜 by <a href="https://pvinis.com">Pavlos Vinieratos</a>.
					<br />
					Source code and contributions on{" "}
					<a href="https://github.com/pvinis/browsers-party">GitHub</a>.
				</p>
			</div>
		</div>
	)
}

function Filter({ column }: { column: Column<Browser, unknown> }) {
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

function DebouncedInput({
	value: initialValue,
	onChange,
	debounce = 500,
	...props
}: {
	value: string | number
	onChange: (value: string | number) => void
	debounce?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
	const [value, setValue] = useState(initialValue)

	useEffect(() => {
		setValue(initialValue)
	}, [initialValue])

	useEffect(() => {
		const timeout = setTimeout(() => {
			onChange(value)
		}, debounce)

		return () => clearTimeout(timeout)
	}, [value, debounce, onChange])

	return <input {...props} value={value} onChange={(e) => setValue(e.target.value)} />
}
