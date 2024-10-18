import { useEffect, useState } from "react"
import { usePapaParse } from "react-papaparse"
import { Table } from "./components/Table"
import type { Browser } from "./types"

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

	return (
		<div className="p-2">
			<h1 className="font-bold text-2xl">
				Browsers Party <div className="inline-block animate-bounce">🎉</div>
			</h1>
			<p>The ultimate list of desktop browsers.</p>

			<Table data={data} />

			<div className="mt-4">
				<p>
					Made with 💜 by <a href="https://pvinis.com">Pavlos Vinieratos</a>.
					<br />
					Source code and contributions on{" "}
					<a href="https://github.com/pvinis/browsers-party" className="underline">
						GitHub
					</a>
					.
				</p>
			</div>
		</div>
	)
}
