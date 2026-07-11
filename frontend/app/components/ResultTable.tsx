export default function ResultTable({ result }: { result: any }) {
  if (!result) return null;
  const { imported = [], skipped = [], total_imported = 0, total_skipped = 0 } = result;
  const headers = imported.length > 0 ? Object.keys(imported[0]) : [];

  return (
    <div className="mt-8">
      <div className="flex gap-4 mb-4">
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
          Imported: {total_imported}
        </div>
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-semibold">
          Skipped: {total_skipped}
        </div>
      </div>

      {imported.length > 0 && (
        <>
          <h2 className="font-bold text-buttercup-700 mb-2">Imported Records</h2>
          <div className="overflow-auto max-h-[400px] border rounded-lg mb-6">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-buttercup-400 z-10">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="px-3 py-2 text-left whitespace-nowrap border-b text-gray-900 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {imported.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-buttercup-50">
                    {headers.map((h) => (
                      <td key={h} className="px-3 py-2 whitespace-nowrap border-b text-gray-900">{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {skipped.length > 0 && (
        <>
          <h2 className="font-bold text-red-700 mb-2">Skipped Records</h2>
          <div className="overflow-auto max-h-[300px] border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-red-100 z-10">
                <tr>
                  <th className="px-3 py-2 text-left border-b text-gray-900 font-semibold">Row</th>
                  <th className="px-3 py-2 text-left border-b text-gray-900 font-semibold">Reason</th>
                </tr>
              </thead>
              <tbody>
                {skipped.map((s: any, i: number) => (
                  <tr key={i} className="hover:bg-red-50">
                    <td className="px-3 py-2 text-gray-900">{JSON.stringify(s.row)}</td>
                    <td className="px-3 py-2 text-gray-900">{s.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}