
export interface CellData {
    value: string | number;
    type: 'text' | 'number' | 'formula';
    formula?: string;
}

export interface RowData {
    [key: string]: CellData;
}
