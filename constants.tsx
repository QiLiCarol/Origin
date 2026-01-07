
import { DatabaseTable } from './types';

export const MOCK_TABLES: DatabaseTable[] = [
  {
    id: 't1',
    name: 'Sales_Orders',
    fields: [
      { name: 'order_id', type: 'string' },
      { name: 'customer_name', type: 'string' },
      { name: 'amount', type: 'number' },
      { name: 'date', type: 'date' },
      { name: 'region', type: 'string' },
      { name: 'category', type: 'string' }
    ],
    data: [
      { order_id: 'ORD-001', customer_name: 'TechCorp', amount: 12500, date: '2023-10-01', region: 'North', category: 'Software' },
      { order_id: 'ORD-002', customer_name: 'SoftSystems', amount: 8400, date: '2023-10-02', region: 'West', category: 'Hardware' },
      { order_id: 'ORD-003', customer_name: 'GlobalLogistics', amount: 21000, date: '2023-10-03', region: 'South', category: 'Software' },
      { order_id: 'ORD-004', customer_name: 'CloudScale', amount: 15600, date: '2023-10-04', region: 'North', category: 'Services' },
      { order_id: 'ORD-005', customer_name: 'RetailGiant', amount: 45000, date: '2023-10-05', region: 'East', category: 'Hardware' },
      { order_id: 'ORD-006', customer_name: 'EduLearn', amount: 5200, date: '2023-10-06', region: 'West', category: 'Software' },
      { order_id: 'ORD-007', customer_name: 'HealthPlus', amount: 32000, date: '2023-10-07', region: 'East', category: 'Hardware' },
      { order_id: 'ORD-008', customer_name: 'FinSafe', amount: 18900, date: '2023-10-08', region: 'South', category: 'Services' }
    ]
  },
  {
    id: 't2',
    name: 'Marketing_Campaigns',
    fields: [
      { name: 'campaign_id', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'spend', type: 'number' },
      { name: 'clicks', type: 'number' },
      { name: 'conversions', type: 'number' },
      { name: 'channel', type: 'string' }
    ],
    data: [
      { campaign_id: 'C-001', name: 'Summer Blast', spend: 5000, clicks: 12000, conversions: 450, channel: 'Social' },
      { campaign_id: 'C-002', name: 'Winter Warmth', spend: 8000, clicks: 25000, conversions: 890, channel: 'Search' },
      { campaign_id: 'C-003', name: 'Autumn Deals', spend: 3000, clicks: 8000, conversions: 210, channel: 'Email' },
      { campaign_id: 'C-004', name: 'Flash Sale', spend: 1200, clicks: 4500, conversions: 180, channel: 'Social' },
      { campaign_id: 'C-005', name: 'B2B Connect', spend: 15000, clicks: 3500, conversions: 45, channel: 'LinkedIn' }
    ]
  }
];
