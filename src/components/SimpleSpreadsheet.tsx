import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Download, 
  Save,
  FileSpreadsheet
} from "lucide-react";

interface Cell {
  id: string;
  value: string;
  editing: boolean;
}

interface Row {
  id: string;
  cells: Cell[];
}

interface SimpleSpreadsheetProps {
  title: string;
}

const SimpleSpreadsheet = ({ title }: SimpleSpreadsheetProps) => {
  const [rows, setRows] = useState<Row[]>([
    {
      id: 'row-1',
      cells: [
        { id: 'cell-1-1', value: 'Nome', editing: false },
        { id: 'cell-1-2', value: 'Idade', editing: false },
        { id: 'cell-1-3', value: 'Cargo', editing: false },
        { id: 'cell-1-4', value: 'Status', editing: false }
      ]
    },
    {
      id: 'row-2',
      cells: [
        { id: 'cell-2-1', value: 'João Silva', editing: false },
        { id: 'cell-2-2', value: '25', editing: false },
        { id: 'cell-2-3', value: 'Professor', editing: false },
        { id: 'cell-2-4', value: 'Ativo', editing: false }
      ]
    },
    {
      id: 'row-3',
      cells: [
        { id: 'cell-3-1', value: 'Maria Santos', editing: false },
        { id: 'cell-3-2', value: '22', editing: false },
        { id: 'cell-3-3', value: 'Aluna', editing: false },
        { id: 'cell-3-4', value: 'Ativo', editing: false }
      ]
    }
  ]);

  const [editingCell, setEditingCell] = useState<{rowId: string, cellId: string} | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleCellClick = (rowId: string, cellId: string) => {
    const cell = rows.find(r => r.id === rowId)?.cells.find(c => c.id === cellId);
    if (cell) {
      setEditingCell({ rowId, cellId });
      setEditingValue(cell.value);
    }
  };

  const handleCellSave = () => {
    if (!editingCell) return;

    setRows(prevRows => 
      prevRows.map(row => 
        row.id === editingCell.rowId 
          ? {
              ...row,
              cells: row.cells.map(cell => 
                cell.id === editingCell.cellId 
                  ? { ...cell, value: editingValue }
                  : cell
              )
            }
          : row
      )
    );

    setEditingCell(null);
    setEditingValue('');
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditingValue('');
  };

  const handleAddRow = () => {
    const newRow: Row = {
      id: `row-${Date.now()}`,
      cells: rows[0].cells.map((_, index) => ({
        id: `cell-${Date.now()}-${index}`,
        value: '',
        editing: false
      }))
    };
    setRows(prevRows => [...prevRows, newRow]);
  };

  const handleDeleteRow = (rowId: string) => {
    setRows(prevRows => prevRows.filter(row => row.id !== rowId));
  };

  const handleExportData = () => {
    const csv = rows.map(row => 
      row.cells.map(cell => `"${cell.value}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderCell = (cell: Cell, rowId: string, cellId: string) => {
    if (editingCell?.rowId === rowId && editingCell?.cellId === cellId) {
      return (
        <Input
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          onBlur={handleCellSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCellSave();
            if (e.key === 'Escape') handleCellCancel();
          }}
          autoFocus
          className="h-8"
        />
      );
    }

    return (
      <div 
        className="p-2 min-h-[32px] flex items-center cursor-pointer hover:bg-muted/50 border"
        onClick={() => handleCellClick(rowId, cellId)}
      >
        <span className="truncate">{cell.value || ''}</span>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            {title}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddRow}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Linha
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {rows[0]?.cells.map((cell, index) => (
                  <th
                    key={cell.id}
                    className="border p-2 bg-muted font-semibold text-left min-w-[150px]"
                  >
                    {cell.value}
                  </th>
                ))}
                <th className="border p-2 bg-muted font-semibold text-center w-12">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row) => (
                <tr key={row.id} className="hover:bg-muted/30">
                  {row.cells.map((cell) => (
                    <td key={cell.id} className="border p-0">
                      {renderCell(cell, row.id, cell.id)}
                    </td>
                  ))}
                  <td className="border p-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRow(row.id)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2">Como usar:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Clique em qualquer célula para editar</li>
            <li>• Pressione Enter para salvar ou Escape para cancelar</li>
            <li>• Use "Adicionar Linha" para criar novas entradas</li>
            <li>• Use "Exportar CSV" para baixar os dados</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleSpreadsheet;

