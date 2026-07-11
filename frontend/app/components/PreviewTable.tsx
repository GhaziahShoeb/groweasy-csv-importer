export default function PreviewTable({ rows, headers }: { rows: any[]; headers: string[] }) {
  return (
    <div className="overflow-auto max-h-[500px] border rounded-lg mt-4">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 bg-buttercup-400 z-10">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 text-left whitespace-nowrap border-b text-gray-900 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-buttercup-50">
              {headers.map((h) => (
                <td key={h} className="px-3 py-2 whitespace-nowrap border-b text-gray-900">{row[h]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}