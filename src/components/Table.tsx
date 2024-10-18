import { AppleLogo, LinuxLogo, WindowsLogo } from "@phosphor-icons/react"
import {
	type ColumnFiltersState,
	type SortingState,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table"
import { Fragment, useState } from "react"
import { cn } from "../utils"
import type { Browser, Status } from "../types"
import { Filter } from "./Filter"

const columnHelper = createColumnHelper<Browser>()

const columns = [
	columnHelper.accessor("name", {}),
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
	columnHelper.accessor("os", {
		cell: (info) => {
			const oses = []
			if (info.getValue()?.includes("macos")) {
				oses.push(<AppleLogo size={24} />)
			}
			if (info.getValue()?.includes("windows")) {
				oses.push(<WindowsLogo size={24} />)
			}
			if (info.getValue()?.includes("linux")) {
				oses.push(<LinuxLogo size={24} />)
			}
			return (
				<div className="flex">
					{oses.map((os, i) => (
						<Fragment key={String(i)}>{os}</Fragment>
					))}
				</div>
			)
		},
	}),
]

export function Table({ data }: { data: Browser[] }) {
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
		<>
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
												<span className="underline">
													{flexRender(header.column.columnDef.header, header.getContext())}
												</span>
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
		</>
	)
}
