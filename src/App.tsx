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

type Browser = {
	name: string
	homepage?: string
	code?: string
	engine?: string
}

const columnHelper = createColumnHelper<Browser>()

const columns = [
	columnHelper.accessor("name", {
		// cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("homepage", {}),
	columnHelper.accessor("code", {
		// cell: (info) => info.renderValue(),
	}),
	columnHelper.accessor("engine", {}),
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

	const [sorting, setSorting] = useState<SortingState>([])
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
			<table>
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
						<tr key={row.id} className="even:bg-slate-100">
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
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
					Made with ❤️ by <a href="https://pvinis.com">Pavlos Vinieratos</a>.
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
					className="w-24 border shadow rounded"
				/>
				<DebouncedInput
					type="number"
					value={(columnFilterValue as [number, number])?.[1] ?? ""}
					onChange={(value) => column.setFilterValue((old: [number, number]) => [old?.[0], value])}
					placeholder="Max"
					className="w-24 border shadow rounded"
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
			className="w-36 border shadow rounded"
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
