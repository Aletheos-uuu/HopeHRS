/**
 * ReportTable.jsx
 *
 * Generic report table shared by HeadcountByDeptPage, SalaryReportPage,
 * and EmployeeHistoryReportPage.
 *
 * Props:
 *   columns  {Array}  - [{ key, label, align?, render? }]
 *              key    - maps to the data row property
 *              label  - column header text
 *              align  - 'left' (default) | 'right' | 'center'
 *              render - optional (value, row) => ReactNode for custom cells
 *   data     {Array}  - array of row objects
 *   emptyMsg {string} - message shown when data is empty
 */
export default function ReportTable({
  columns,
  data,
  emptyMsg = "No records found.",
}) {
  const alignClass = {
    left: "text-left",
    right: "text-right",
    center: "text-center",
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
        <svg
          className="mb-3 h-7 w-7 text-gray-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125V5.625m0 12.75v-1.5m0 1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125-.504-1.125-1.125m0 0V5.625m0 0A1.125 1.125 0 014.5 4.5h15a1.125 1.125 0 011.125 1.125m0 0v12.75m0 0c0 .621-.504 1.125-1.125 1.125h-1.5"
          />
        </svg>
        <p className="text-sm text-gray-400">{emptyMsg}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Desktop */}
      <div className="overflow-x-auto">
        <table className="min-w-[560px] sm:min-w-[720px] lg:min-w-full w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${
                    alignClass[col.align ?? "left"]
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50/40 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-sm text-gray-700 ${
                      alignClass[col.align ?? "left"]
                    }`}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
