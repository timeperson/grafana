import React from 'react';

import { QueryEditorHelpProps } from '@grafana/data';

import { PromQuery } from '../types';

const CHEAT_SHEET_ITEMS = [
  {
    title: '请求速率', //Request Rate
    expression: 'rate(http_request_total[5m])',
    label: '给定一个HTTP请求计数器，该查询将计算过去5分钟内每秒的平均请求速率。', //Given an HTTP request counter, this query calculates the per-second average request rate over the last 5 minutes.
  },
  {
    title: '请求延迟的95%',
    expression: 'histogram_quantile(0.95, sum(rate(prometheus_http_request_duration_seconds_bucket[5m])) by (le))',
    label: '计算超过5分钟窗口的HTTP请求速率的95%。', //Calculates the 95th percentile of HTTP request rate over 5 minute windows.
  },
  {
    title: '已触发的警报',
    expression: 'sort_desc(sum(sum_over_time(ALERTS{alertstate="firing"}[24h])) by (alertname))',
    label: '查询过去24小时内发出的警报。', //Sums up the alerts that have been firing over the last 24 hours.
  },
  {
    title: 'Step',
    label:
      '使用持续时间格式(15s, 1m, 3h, ...) 定义图形的分辨率， 小步长（Step）可以创建高精度的图表，但在较大的时间范围内可能会很慢。 使用较长的步长（Step）可以降低图形分辨率，并通过产生更少的数据点来平滑图形。', //Defines the graph resolution using a duration format (15s, 1m, 3h, ...). Small steps create high-resolution graphs but can be slow over larger time ranges. Using a longer step lowers the resolution and smooths the graph by producing fewer datapoints. If no step is given the resolution is calculated automatically.
  },
];

const PromCheatSheet = (props: QueryEditorHelpProps<PromQuery>) => (
  <div>
    <h2>PromQL 备忘单</h2>
    {CHEAT_SHEET_ITEMS.map((item, index) => (
      <div className="cheat-sheet-item" key={index}>
        <div className="cheat-sheet-item__title">{item.title}</div>
        {item.expression ? (
          <div
            className="cheat-sheet-item__example"
            onClick={(e) => props.onClickExample({ refId: 'A', expr: item.expression })}
          >
            <code>{item.expression}</code>
          </div>
        ) : null}
        <div className="cheat-sheet-item__label">{item.label}</div>
      </div>
    ))}
  </div>
);

export default PromCheatSheet;
