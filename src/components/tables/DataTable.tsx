import { useState } from 'react';
import {
  Card, Typography, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, Chip, Button, Box, TablePagination,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import type { ReactNode } from 'react';
import * as XLSX from 'xlsx';

interface Column {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => ReactNode;
}

interface DataTableProps {
  title: string;
  columns: Column[];
  rows: Record<string, unknown>[];
  titleIcon?: ReactNode;
  titleColor?: string;
  actionLabel?: string;
  onAction?: () => void;
  rowsPerPage?: number;
}

function downloadXlsx(columns: Column[], rows: Record<string, unknown>[], filename: string) {
  const headers = columns.map(c => c.label);
  const data = rows.map(r => columns.map(c => {
    const val = r[c.key];
    if (val == null) return '';
    const str = String(val);
    if (str.startsWith('[object') || str.startsWith('{') || str.startsWith('<')) return '';
    return str;
  }));
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Datos');
  XLSX.writeFile(wb, `${filename.replace(/\s+/g, '_')}.xlsx`);
}

export default function DataTable({ title, columns, rows, titleIcon, titleColor, actionLabel, onAction, rowsPerPage = 5 }: DataTableProps) {
  const [page, setPage] = useState(0);

  const pageRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider',
        bgcolor: 'grey.50',
      }}>
        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {titleIcon && <Box sx={{ color: titleColor || 'text.primary', display: 'flex' }}>{titleIcon}</Box>}
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {rows.length > 0 && (
            <Button
              size="small"
              startIcon={<Download />}
              sx={{ textTransform: 'none', fontSize: 12 }}
              onClick={() => downloadXlsx(columns, rows, title)}
            >
              XLSX
            </Button>
          )}
          {actionLabel && (
            <Button size="small" sx={{ textTransform: 'none', fontSize: 12 }} onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </Box>
      </Box>
      <TableContainer sx={{ flexGrow: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary' }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.map((row, i) => (
              <TableRow key={i} hover>
                {columns.map((col) => (
                  <TableCell key={col.key} sx={{ fontSize: 13 }}>
                    {col.render ? col.render(row) : String(row[col.key] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Sin datos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {rows.length > rowsPerPage && (
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
          labelRowsPerPage=""
        />
      )}
    </Card>
  );
}

export function StatusChip({ label, color }: { label: string; color: 'success' | 'error' | 'warning' | 'default' }) {
  const chipColor = color === 'default' ? undefined : color;
  return (
    <Chip
      label={label}
      color={chipColor}
      size="small"
      sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
    />
  );
}
