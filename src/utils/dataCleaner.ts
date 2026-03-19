import { DataRow, DataStats, CleaningReport } from '../types';

export const cleanData = (data: DataRow[]): { cleanedData: DataRow[], report: CleaningReport } => {
  let cleaned = [...data];
  let duplicatesRemoved = 0;
  let missingValuesHandled = 0;
  const normalizedColumns: string[] = [];

  // 1. Remove Duplicates
  const initialCount = cleaned.length;
  const seen = new Set();
  cleaned = cleaned.filter(row => {
    const serialized = JSON.stringify(row);
    if (seen.has(serialized)) return false;
    seen.add(serialized);
    return true;
  });
  duplicatesRemoved = initialCount - cleaned.length;

  // 2. Handle Missing Values & Normalize
  const columns = Object.keys(cleaned[0] || {});
  
  cleaned = cleaned.map(row => {
    const newRow = { ...row };
    columns.forEach(col => {
      const val = newRow[col];
      
      // Detect missing
      if (val === null || val === undefined || val === '') {
        missingValuesHandled++;
        // Simple imputation: empty string for strings, 0 for numbers (if we can detect)
        newRow[col] = ''; 
      }

      // Normalize strings
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed !== val) {
          if (!normalizedColumns.includes(col)) normalizedColumns.push(col);
          newRow[col] = trimmed;
        }
      }
    });
    return newRow;
  });

  return { cleanedData: cleaned, report: { duplicatesRemoved, missingValuesHandled, normalizedColumns } };
};

export const calculateCorrelationMatrix = (data: DataRow[], numericColumns: string[]) => {
  if (numericColumns.length < 2) return undefined;

  const matrix: number[][] = [];
  const n = data.length;

  // Pre-calculate means and deviations for each column
  const colData = numericColumns.map(col => {
    const values = data.map(row => Number(row[col]) || 0);
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const diffs = values.map(v => v - mean);
    const sqDiffSum = diffs.reduce((a, b) => a + b * b, 0);
    return { diffs, sqDiffSum };
  });

  for (let i = 0; i < numericColumns.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < numericColumns.length; j++) {
      if (i === j) {
        matrix[i][j] = 1;
        continue;
      }
      
      const colI = colData[i];
      const colJ = colData[j];
      
      let numerator = 0;
      for (let k = 0; k < n; k++) {
        numerator += colI.diffs[k] * colJ.diffs[k];
      }
      
      const denominator = Math.sqrt(colI.sqDiffSum * colJ.sqDiffSum);
      matrix[i][j] = denominator === 0 ? 0 : numerator / denominator;
    }
  }

  return { columns: numericColumns, matrix };
};

export const calculateStats = (data: DataRow[]): DataStats => {
  if (data.length === 0) return { totalRows: 0, totalColumns: 0, columnStats: {} };

  const columns = Object.keys(data[0]);
  const stats: DataStats = {
    totalRows: data.length,
    totalColumns: columns.length,
    columnStats: {}
  };

  const numericCols: string[] = [];

  columns.forEach(col => {
    const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined && v !== '');
    const isNumeric = values.every(v => !isNaN(Number(v)));
    
    const uniqueValues = new Set(values).size;
    const missingValues = data.length - values.length;

    if (isNumeric && values.length > 0) {
      numericCols.push(col);
      const numValues = values.map(v => Number(v));
      const sum = numValues.reduce((a, b) => a + b, 0);
      stats.columnStats[col] = {
        type: 'numeric',
        sum,
        mean: sum / values.length,
        count: values.length,
        uniqueValues,
        missingValues
      };
    } else {
      const counts: { [key: string]: number } = {};
      values.forEach(v => {
        counts[v] = (counts[v] || 0) + 1;
      });
      const topValues = Object.entries(counts)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      stats.columnStats[col] = {
        type: 'categorical',
        count: values.length,
        uniqueValues,
        missingValues,
        topValues
      };
    }
  });

  if (numericCols.length >= 2) {
    stats.correlationMatrix = calculateCorrelationMatrix(data, numericCols);
  }

  return stats;
};
