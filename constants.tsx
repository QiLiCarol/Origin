
import { DatabaseTable } from './types';

export const MOCK_TABLES: DatabaseTable[] = [
  {
    id: 't1',
    name: 'Sales_Orders',
    fields: [
      { name: 'order_id', type: 'string' },
      { name: 'campaign_id', type: 'string' },
      { name: 'customer_name', type: 'string' },
      { name: 'amount', type: 'number' },
      { name: 'date', type: 'date' },
      { name: 'region', type: 'string' },
      { name: 'category', type: 'string' }
    ],
    data: [
      { order_id: 'ORD-101', campaign_id: 'C-001', customer_name: 'TechCorp', amount: 12500, date: '2023-10-01', region: 'North', category: 'Software' },
      { order_id: 'ORD-102', campaign_id: 'C-002', customer_name: 'SoftSystems', amount: 8400, date: '2023-10-02', region: 'West', category: 'Hardware' },
      { order_id: 'ORD-103', campaign_id: 'C-001', customer_name: 'GlobalLogistics', amount: 21000, date: '2023-10-03', region: 'South', category: 'Software' },
      { order_id: 'ORD-104', campaign_id: 'C-003', customer_name: 'CloudScale', amount: 15600, date: '2023-10-04', region: 'North', category: 'Services' },
      { order_id: 'ORD-105', campaign_id: 'C-002', customer_name: 'RetailGiant', amount: 45000, date: '2023-10-05', region: 'East', category: 'Hardware' },
      { order_id: 'ORD-106', campaign_id: 'C-004', customer_name: 'EduLearn', amount: 5200, date: '2023-10-06', region: 'West', category: 'Software' },
      { order_id: 'ORD-107', campaign_id: 'C-001', customer_name: 'HealthPlus', amount: 32000, date: '2023-10-07', region: 'East', category: 'Hardware' },
      { order_id: 'ORD-108', campaign_id: 'C-005', customer_name: 'FinSafe', amount: 18900, date: '2023-10-08', region: 'South', category: 'Services' },
      { order_id: 'ORD-109', campaign_id: 'C-003', customer_name: 'BioGen', amount: 27400, date: '2023-10-09', region: 'North', category: 'Software' },
      { order_id: 'ORD-110', campaign_id: 'C-004', customer_name: 'AlphaLog', amount: 11200, date: '2023-10-10', region: 'West', category: 'Services' }
    ]
  },
  {
    id: 't2',
    name: 'Marketing_Campaigns',
    fields: [
      { name: 'campaign_id', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'date', type: 'date' },
      { name: 'spend', type: 'number' },
      { name: 'clicks', type: 'number' },
      { name: 'conversions', type: 'number' },
      { name: 'channel', type: 'string' }
    ],
    data: [
      { campaign_id: 'C-001', name: 'Summer Blast', date: '2023-10-01', spend: 5000, clicks: 12000, conversions: 450, channel: 'Social' },
      { campaign_id: 'C-002', name: 'Winter Warmth', date: '2023-10-02', spend: 8000, clicks: 25000, conversions: 890, channel: 'Search' },
      { campaign_id: 'C-001', name: 'Summer Blast', date: '2023-10-03', spend: 3000, clicks: 8000, conversions: 210, channel: 'Email' },
      { campaign_id: 'C-003', name: 'Autumn Deals', date: '2023-10-04', spend: 1200, clicks: 4500, conversions: 180, channel: 'Social' },
      { campaign_id: 'C-002', name: 'Winter Warmth', date: '2023-10-05', spend: 15000, clicks: 3500, conversions: 45, channel: 'LinkedIn' },
      { campaign_id: 'C-004', name: 'Flash Sale', date: '2023-10-06', spend: 4200, clicks: 9000, conversions: 320, channel: 'Social' },
      { campaign_id: 'C-001', name: 'Summer Blast', date: '2023-10-07', spend: 2500, clicks: 6000, conversions: 150, channel: 'Email' },
      { campaign_id: 'C-005', name: 'B2B Connect', date: '2023-10-08', spend: 11000, clicks: 2800, conversions: 35, channel: 'LinkedIn' },
      { campaign_id: 'C-003', name: 'Autumn Deals', date: '2023-10-09', spend: 5500, clicks: 11000, conversions: 410, channel: 'Search' },
      { campaign_id: 'C-004', name: 'Flash Sale', date: '2023-10-10', spend: 1800, clicks: 5200, conversions: 195, channel: 'Social' }
    ]
  }
];
