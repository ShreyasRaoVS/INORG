import { useState } from 'react';
import { Plus, Trash2, Download, Upload } from 'lucide-react';

interface Cell {
  value: string;
}

export default function Excel() {
  const [rows, setRows] = useState(20);
  const [cols, setCols] = useState(10);
  const [cells, setCells] = useState<Record<string, Cell>>({});
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  const getCellId = (row: number, col: number) => `${row}-${col}`;

  const getCellValue = (row: number, col: number) => {
    return cells[getCellId(row, col)]?.value || '';
  };

  const setCellValue = (row: number, col: number, value: string) => {
    setCells({
      ...cells,
      [getCellId(row, col)]: { value }
    });
  };

  const getColumnLabel = (col: number) => {
    let label = '';
    let num = col;
    while (num >= 0) {
      label = String.fromCharCode(65 + (num % 26)) + label;
      num = Math.floor(num / 26) - 1;
    }
    return label;
  };

  const addRow = () => setRows(rows + 1);
  const addColumn = () => setCols(cols + 1);

  const exportToCSV = () => {
    let csv = '';
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        row.push(getCellValue(r, c));
      }
      csv += row.join(',') + '\n';
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spreadsheet.csv';
    a.click();
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 p-4 flex items-center gap-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Spreadsheet</h2>
        <div className="flex-1" />
        <button onClick={addRow} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Row
        </button>
        <button onClick={addColumn} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Column
        </button>
        <div className="w-px h-6 bg-slate-200" />
        <button className="px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Import
        </button>
        <button onClick={exportToCSV} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Formula Bar */}
      {selectedCell && (
        <div className="bg-white border-b border-slate-200 p-3 flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">{selectedCell}:</span>
          <input
            type="text"
            value={getCellValue(parseInt(selectedCell.split('-')[0]), parseInt(selectedCell.split('-')[1]))}
            onChange={(e) => setCellValue(parseInt(selectedCell.split('-')[0]), parseInt(selectedCell.split('-')[1]), e.target.value)}
            className="flex-1 px-3 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter value..."
          />
        </div>
      )}

      {/* Spreadsheet */}
      <div className="flex-1 overflow-auto p-4">
        <div className="inline-block min-w-full bg-white rounded-lg shadow-lg">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="w-16 h-10 bg-slate-100 border border-slate-300 sticky left-0 z-10"></th>
                {Array.from({ length: cols }).map((_, col) => (
                  <th key={col} className="min-w-[120px] h-10 bg-slate-100 border border-slate-300 text-sm font-semibold text-slate-700">
                    {getColumnLabel(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, row) => (
                <tr key={row}>
                  <td className="w-16 h-10 bg-slate-100 border border-slate-300 text-center text-sm font-semibold text-slate-700 sticky left-0 z-10">
                    {row + 1}
                  </td>
                  {Array.from({ length: cols }).map((_, col) => (
                    <td
                      key={col}
                      className={`min-w-[120px] h-10 border border-slate-300 p-0 ${
                        selectedCell === getCellId(row, col) ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedCell(getCellId(row, col))}
                    >
                      <input
                        type="text"
                        value={getCellValue(row, col)}
                        onChange={(e) => setCellValue(row, col, e.target.value)}
                        className="w-full h-full px-2 outline-none bg-transparent"
                        onFocus={() => setSelectedCell(getCellId(row, col))}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
