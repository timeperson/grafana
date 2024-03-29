import { SelectableValue, TimeOption } from '@grafana/data';

export const quickOptions: TimeOption[] = [
  { from: 'now-5m', to: 'now', display: '最后5分钟' },
  { from: 'now-15m', to: 'now', display: '最后15分钟' },
  { from: 'now-30m', to: 'now', display: '最后30分钟' },
  { from: 'now-1h', to: 'now', display: '最后1小时' },
  { from: 'now-3h', to: 'now', display: '最后3小时' },
  { from: 'now-6h', to: 'now', display: '最后6小时' },
  { from: 'now-12h', to: 'now', display: '最后12小时' },
  { from: 'now-24h', to: 'now', display: '最后24小时' },
  { from: 'now-2d', to: 'now', display: '最后2天' },
  { from: 'now-7d', to: 'now', display: '最后7天' },
  { from: 'now-30d', to: 'now', display: '最后30天' },
  { from: 'now-90d', to: 'now', display: '最后90天' },
  { from: 'now-6M', to: 'now', display: '最后6个月' },
  { from: 'now-1y', to: 'now', display: '最后1年' },
  { from: 'now-2y', to: 'now', display: '最后2年' },
  { from: 'now-5y', to: 'now', display: '最后5年' },
  { from: 'now-1d/d', to: 'now-1d/d', display: '昨天' },
  { from: 'now-2d/d', to: 'now-2d/d', display: '前天' },
  { from: 'now-7d/d', to: 'now-7d/d', display: '上一周的今日' },
  { from: 'now-1w/w', to: 'now-1w/w', display: '上周' },
  { from: 'now-1M/M', to: 'now-1M/M', display: '上月' },
  { from: 'now-1Q/fQ', to: 'now-1Q/fQ', display: '上一财政季度' },
  { from: 'now-1y/y', to: 'now-1y/y', display: '上一年' },
  { from: 'now-1y/fy', to: 'now-1y/fy', display: '上一财政年' },
  { from: 'now/d', to: 'now/d', display: '今天' },
  { from: 'now/d', to: 'now', display: '今天到目前为止' },
  { from: 'now/w', to: 'now/w', display: '本周' },
  { from: 'now/w', to: 'now', display: '本周到目前为止' },
  { from: 'now/M', to: 'now/M', display: '本月' },
  { from: 'now/M', to: 'now', display: '本月到目前为止' },
  { from: 'now/y', to: 'now/y', display: '今年' },
  { from: 'now/y', to: 'now', display: '今年到目前为止' },
  { from: 'now/fQ', to: 'now', display: '本财政季度到目前为止' },
  { from: 'now/fQ', to: 'now/fQ', display: '本财政季度' },
  { from: 'now/fy', to: 'now', display: '本财政年到目前为止' },
  { from: 'now/fy', to: 'now/fy', display: '本财政年' },
];

export const monthOptions: Array<SelectableValue<number>> = [
  { label: '1月', value: 0 },
  { label: '2月', value: 1 },
  { label: '3月', value: 2 },
  { label: '4月', value: 3 },
  { label: '5月', value: 4 },
  { label: '6月', value: 5 },
  { label: '7月', value: 6 },
  { label: '8月', value: 7 },
  { label: '9月', value: 8 },
  { label: '10月', value: 9 },
  { label: '11月', value: 10 },
  { label: '12月', value: 11 },
];
