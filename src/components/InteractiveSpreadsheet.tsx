import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Download, 
  Users,
  Eye,
  EyeOff
} from "lucide-react";
// import { 
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

interface Cell {
  id: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'select' | 'formula';
  options?: string[];
  formula?: string;
  locked: boolean;
  editedBy?: string;
  lastEdited?: Date;
}

interface Row {
  id: string;
  cells: Cell[];
  locked: boolean;
}

interface Column {
  id: string;
  header: string;
  type: 'text' | 'number' | 'date' | 'select' | 'formula';
  options?: string[];
  locked: boolean;
  width: number;
}

interface User {
  id: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  color: string;
}

interface CellData {
  value: string | number;
  type: 'text' | 'number' | 'formula';
  formula?: string;
}

interface RowData {
  [key: string]: CellData;
}

interface InteractiveSpreadsheetProps {
  title: string;
  initialData?: RowData[];
  users?: User[];
  currentUser: User;
  onDataChange?: (data: RowData[]) => void;
  onUserPermissionChange?: (userId: string, permission: string) => void;
}

const InteractiveSpreadsheet = ({
  title,
  initialData = [],
  users = [],
  currentUser,
  onDataChange,
  onUserPermissionChange
}: InteractiveSpreadsheetProps) => {
  const [rows, setRows] = useState<Row[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [editingCell, setEditingCell] = useState<{rowId: string, cellId: string} | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [showUserPermissions, setShowUserPermissions] = useState(false);
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnHeader, setNewColumnHeader] = useState('');
  const [newColumnType, setNewColumnType] = useState<'text' | 'number' | 'date' | 'select'>('text');
  const [newColumnOptions, setNewColumnOptions] = useState('');

  const tableRef = useRef<HTMLTableElement>(null);

  // Inicializar dados
  useEffect(() => {
    if (initialData.length > 0) {
      const headers = Object.keys(initialData[0]);
      const newColumns: Column[] = headers.map((header, index) => ({
        id: `col-${index}`,
        header,
        type: 'text',
        locked: false,
        width: 150
      }));

      const newRows: Row[] = initialData.map((row, rowIndex) => ({
        id: `row-${rowIndex}`,
        cells: headers.map((header, cellIndex) => ({
          id: `cell-${rowIndex}-${cellIndex}`,
          value: String(row[header] || ''),
          type: 'text',
          locked: false,
          editedBy: currentUser.name,
          lastEdited: new Date()
        })),
        locked: false
      }));

      setColumns(newColumns);
      setRows(newRows);
    } else {
      // Dados padrão para demonstração
      const defaultColumns: Column[] = [
        { id: 'col-0', header: 'Nome', type: 'text', locked: false, width: 200 },
        { id: 'col-1', header: 'Idade', type: 'number', locked: false, width: 100 },
        { id: 'col-2', header: 'Cargo', type: 'select', locked: false, width: 150, options: ['Professor', 'Aluno', 'Admin'] },
        { id: 'col-3', header: 'Data Cadastro', type: 'date', locked: false, width: 150 },
        { id: 'col-4', header: 'Status', type: 'select', locked: false, width: 120, options: ['Ativo', 'Inativo', 'Pendente'] }
      ];

      const defaultRows: Row[] = [
        {
          id: 'row-0',
          cells: [
            { id: 'cell-0-0', value: 'João Silva', type: 'text', locked: false, editedBy: currentUser.name, lastEdited: new Date() },
            { id: 'cell-0-1', value: '25', type: 'number', locked: false, editedBy: currentUser.name, lastEdited: new Date() },
            { id: 'cell-0-2', value: 'Professor', type: 'select', locked: false, editedBy: currentUser.name, lastEdited: new Date() },
            { id: 'cell-0-3', value: new Date().toISOString().split('T')[0], type: 'date', locked: false, editedBy: currentUser.name, lastEdited: new Date() },
            { id: 'cell-0-4', value: 'Ativo', type: 'select', locked: false, editedBy: currentUser.name, lastEdited: new Date() }
          ],
          locked: false
        },
        {
          id: 'row-1',
          cells: [
            { id: 'cell-1-0', value: 'Maria Santos', type: 'text', locked: false, editedBy: currentUser.name, lastEdited: new Date() },
            { id: 'cell-1-1', value: '22', type: 'number', locked: false, editedBy: currentUser.name, lastEdited: new Date() },
            { id: 'cell-1-2', value: 'Aluno', type: 'select', locked: false, editedBy: currentUser.name, lastEdited: new Date() },
            { id: 'cell-1-3', value: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], type: 'date', locked: false, editedBy: currentUser.name, lastEdited: new Date() },
            { id: 'cell-1-4', value: 'Ativo', type: 'select', locked: false, editedBy: currentUser.name, lastEdited: new Date() }
          ],
          locked: false
        }
      ];

      setColumns(defaultColumns);
      setRows(defaultRows);
    }
  }, [initialData, currentUser.name]);

  const canEdit = currentUser.role === 'admin' || currentUser.role === 'editor';
  const canDelete = currentUser.role === 'admin';

  const handleCellClick = (rowId: string, cellId: string) => {
    if (!canEdit) return;
    
    const cell = rows.find(r => r.id === rowId)?.cells.find(c => c.id === cellId);
    if (cell && !cell.locked) {
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
                  ? {
                      ...cell,
                      value: editingValue,
                      editedBy: currentUser.name,
                      lastEdited: new Date()
                    }
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
    if (!canEdit) return;

    const newRow: Row = {
      id: `row-${Date.now()}`,
      cells: columns.map((col, index) => ({
        id: `cell-${Date.now()}-${index}`,
        value: '',
        type: col.type,
        locked: false,
        editedBy: currentUser.name,
        lastEdited: new Date()
      })),
      locked: false
    };

    setRows(prevRows => [...prevRows, newRow]);
    setIsAddingRow(false);
  };

  const handleDeleteRow = (rowId: string) => {
    if (!canDelete) return;
    setRows(prevRows => prevRows.filter(row => row.id !== rowId));
  };

  const handleAddColumn = () => {
    if (!canEdit) return;

    const newColumn: Column = {
      id: `col-${Date.now()}`,
      header: newColumnHeader,
      type: newColumnType,
      locked: false,
      width: 150,
      options: newColumnType === 'select' ? newColumnOptions.split(',').map(opt => opt.trim()) : undefined
    };

    setColumns(prevCols => [...prevCols, newColumn]);

    // Adicionar célula vazia para cada linha existente
    setRows(prevRows => 
      prevRows.map(row => ({
        ...row,
        cells: [
          ...row.cells,
          {
            id: `cell-${row.id}-${newColumn.id}`,
            value: '',
            type: newColumnType,
            locked: false,
            editedBy: currentUser.name,
            lastEdited: new Date()
          }
        ]
      }))
    );

    setNewColumnHeader('');
    setNewColumnType('text');
    setNewColumnOptions('');
    setIsAddingColumn(false);
  };

  const handleDeleteColumn = (columnId: string) => {
    if (!canDelete) return;
    
    const columnIndex = columns.findIndex(col => col.id === columnId);
    if (columnIndex === -1) return;

    setColumns(prevCols => prevCols.filter(col => col.id !== columnId));
    setRows(prevRows => 
      prevRows.map(row => ({
        ...row,
        cells: row.cells.filter((_, index) => index !== columnIndex)
      }))
    );
  };

  const handleExportData = () => {
    const data = rows.map(row => {
      const rowData: Record<string, string | number> = {};
      row.cells.forEach((cell, index) => {
        const column = columns[index];
        if (column) {
          rowData[column.header] = cell.value;
        }
      });
      return rowData;
    });

    const csv = [
      columns.map(col => col.header).join(','),
      ...data.map(row => 
        columns.map(col => `"${row[col.header] || ''}"`).join(',')
      )
    ].join('\n');

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
      if (cell.type === 'select' && cell.options) {
        return (
          <select 
            value={editingValue} 
            onChange={(e) => setEditingValue(e.target.value)}
            className="h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            {cell.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      }

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
          type={cell.type === 'number' ? 'number' : cell.type === 'date' ? 'date' : 'text'}
        />
      );
    }

    return (
      <div 
        className={`p-2 min-h-[32px] flex items-center cursor-pointer hover:bg-muted/50 ${
          cell.locked ? 'bg-muted/30' : ''
        }`}
        onClick={() => handleCellClick(rowId, cellId)}
      >
        <span className="truncate">{cell.value || ''}</span>
        {cell.editedBy && cell.editedBy !== currentUser.name && (
          <Badge variant="outline" className="ml-2 text-xs">
            {cell.editedBy}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {title}
            <Badge variant="secondary">
              {currentUser.role}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUserPermissions(!showUserPermissions)}
            >
              {showUserPermissions ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              Usuários
            </Button>
            
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingColumn(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Coluna
              </Button>
            )}
            
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingRow(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Linha
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Lista de Usuários */}
        {showUserPermissions && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Usuários Conectados</h4>
            <div className="flex flex-wrap gap-2">
              {users.map(user => (
                <div key={user.id} className="flex items-center gap-2 p-2 bg-background rounded border">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: user.color }}
                  />
                  <span className="text-sm">{user.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table ref={tableRef} className="w-full border-collapse">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column.id}
                    className="border p-2 bg-muted font-semibold text-left"
                    style={{ width: column.width }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{column.header}</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {column.type}
                        </Badge>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteColumn(column.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
                {canDelete && (
                  <th className="border p-2 bg-muted font-semibold text-center w-12">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30">
                  {row.cells.map((cell, cellIndex) => (
                    <td key={cell.id} className="border p-0">
                      {renderCell(cell, row.id, cell.id)}
                    </td>
                  ))}
                  {canDelete && (
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
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal para Adicionar Coluna */}
        {isAddingColumn && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Adicionar Nova Coluna</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome da Coluna</label>
                  <Input
                    value={newColumnHeader}
                    onChange={(e) => setNewColumnHeader(e.target.value)}
                    placeholder="Ex: Email"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Tipo</label>
                  <select 
                    value={newColumnType} 
                    onChange={(e) => setNewColumnType(e.target.value as 'text' | 'number' | 'date' | 'select')}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="text">Texto</option>
                    <option value="number">Número</option>
                    <option value="date">Data</option>
                    <option value="select">Seleção</option>
                  </select>
                </div>

                {newColumnType === 'select' && (
                  <div>
                    <label className="text-sm font-medium">Opções (separadas por vírgula)</label>
                    <Input
                      value={newColumnOptions}
                      onChange={(e) => setNewColumnOptions(e.target.value)}
                      placeholder="Ex: Opção 1, Opção 2, Opção 3"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleAddColumn} disabled={!newColumnHeader}>
                    Adicionar
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingColumn(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal para Adicionar Linha */}
        {isAddingRow && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Adicionar Nova Linha</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Uma nova linha será adicionada com células vazias que você pode preencher.
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleAddRow}>
                    Adicionar Linha
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingRow(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractiveSpreadsheet;