export interface DataRow {
  [key: string]: any;
}

export interface CorrelationMatrix {
  columns: string[];
  matrix: number[][];
}

export interface DataStats {
  totalRows: number;
  totalColumns: number;
  columnStats: {
    [key: string]: {
      type: 'numeric' | 'categorical';
      mean?: number;
      sum?: number;
      count: number;
      uniqueValues: number;
      missingValues: number;
      topValues?: { value: any; count: number }[];
    };
  };
  correlationMatrix?: CorrelationMatrix;
}

export interface CleaningReport {
  duplicatesRemoved: number;
  missingValuesHandled: number;
  normalizedColumns: string[];
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string[];
  timestamp: number;
  type?: 'welcome' | 'analysis' | 'chat';
}
