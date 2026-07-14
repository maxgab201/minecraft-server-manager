export interface LogEntry {
  timestamp?: string;
  level?: string;
  message: string;
  raw: string;
}

export interface LogFilter {
  search?: string;
  level?: string;
  since?: string;
  until?: string;
  limit?: number;
  offset?: number;
}

export interface LogResponse {
  entries: LogEntry[];
  total: number;
  hasMore: boolean;
  offset: number;
}
