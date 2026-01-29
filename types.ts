
export enum Module {
  DATA_WORKBENCH = 'DATA_WORKBENCH',
  CHART_WORKBENCH = 'CHART_WORKBENCH',
  ASSET_PREVIEW = 'ASSET_PREVIEW'
}

export enum Language {
  EN = 'en',
  ZH = 'zh'
}

export type TableField = {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
};

export type DatabaseTable = {
  id: string;
  name: string;
  fields: TableField[];
  data: any[];
};

export type DatabaseConnection = {
  id: string;
  name: string;
  type: 'PostgreSQL' | 'MySQL' | 'Oracle';
  status: 'connected' | 'error';
  tables: DatabaseTable[];
};

export type VirtualTable = {
  id: string;
  name: string;
  sourceTableIds: string[];
  fields: string[]; // Field names (namespaced)
  data: any[];
  createdAt: string;
};

export enum ChartType {
  BAR = 'BAR',
  LINE = 'LINE',
  PIE = 'PIE',
  TABLE = 'TABLE',
  KPI = 'KPI',
  AI_CARD = 'AI_CARD'
}

export type DashboardWidget = {
  id: string;
  title: string;
  type: ChartType;
  dataSourceId: string;
  config: {
    xAxis?: string;
    yAxis?: string;
    valueKey?: string;
    color?: string;
    content?: string; // For AI Cards
  };
  layout: {
    w: number;
    h: number;
    x: number;
    y: number;
  };
};

export type Dashboard = {
  id: string;
  name: string;
  widgets: DashboardWidget[];
};
