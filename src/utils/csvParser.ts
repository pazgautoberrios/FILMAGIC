import Papa from 'papaparse';

export interface CSVGuestRow {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  companions: number;
}

export interface ParseResult {
  valid: CSVGuestRow[];
  errors: { row: number; message: string }[];
}

export function parseGuestCSV(csvContent: string): ParseResult {
  const result = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  const valid: CSVGuestRow[] = [];
  const errors: { row: number; message: string }[] = [];

  result.data.forEach((row, i) => {
    const rowNum = i + 2;
    if (!row.firstname || !row.lastname) {
      errors.push({ row: rowNum, message: 'Nombre y apellido son requeridos' });
      return;
    }
    if (!row.phone || !/^\+?[\d\s\-()]{8,}$/.test(row.phone)) {
      errors.push({ row: rowNum, message: `Teléfono inválido: ${row.phone}` });
      return;
    }
    const companions = parseInt(row.companions ?? '0', 10);
    if (isNaN(companions) || companions < 0) {
      errors.push({ row: rowNum, message: 'Cantidad de acompañantes inválida' });
      return;
    }
    valid.push({
      firstName: row.firstname.trim(),
      lastName: row.lastname.trim(),
      phone: row.phone.trim(),
      email: row.email?.trim() || undefined,
      companions,
    });
  });

  return { valid, errors };
}
