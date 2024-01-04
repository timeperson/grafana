import { map } from 'lodash';
import React, { PureComponent } from 'react';

// Types
import { CoreApp, SelectableValue } from '@grafana/data';
import { InlineFormLabel, LegacyForms, Select } from '@grafana/ui';

import { PromQuery } from '../types';

import { PromExemplarField } from './PromExemplarField';
import PromLink from './PromLink';
import PromQueryField from './PromQueryField';
import { PromQueryEditorProps } from './types';

const { Switch } = LegacyForms;

export const FORMAT_OPTIONS: Array<SelectableValue<string>> = [
  { label: '时间序列', value: 'time_series' },
  { label: '表格', value: 'table' },
  { label: '热图', value: 'heatmap' },
];

export const INTERVAL_FACTOR_OPTIONS: Array<SelectableValue<number>> = map([1, 2, 3, 4, 5, 10], (value: number) => ({
  value,
  label: '1/' + value,
}));

interface State {
  legendFormat?: string;
  formatOption: SelectableValue<string>;
  interval?: string;
  intervalFactorOption: SelectableValue<number>;
  instant: boolean;
  exemplar: boolean;
}

export class PromQueryEditor extends PureComponent<PromQueryEditorProps, State> {
  // Query target to be modified and used for queries
  query: PromQuery;

  constructor(props: PromQueryEditorProps) {
    super(props);
    // Use default query to prevent undefined input values
    const defaultQuery: Partial<PromQuery> = {
      expr: '',
      legendFormat: '',
      interval: '',
      // Set exemplar to false for alerting queries
      exemplar: props.app === CoreApp.UnifiedAlerting ? false : true,
    };
    const query = Object.assign({}, defaultQuery, props.query);
    this.query = query;
    // Query target properties that are fully controlled inputs
    this.state = {
      // Fully controlled text inputs
      interval: query.interval,
      legendFormat: query.legendFormat,
      // Select options
      formatOption: FORMAT_OPTIONS.find((option) => option.value === query.format) || FORMAT_OPTIONS[0],
      intervalFactorOption:
        INTERVAL_FACTOR_OPTIONS.find((option) => option.value === query.intervalFactor) || INTERVAL_FACTOR_OPTIONS[0],
      // Switch options
      instant: Boolean(query.instant),
      exemplar: Boolean(query.exemplar),
    };
  }

  onFieldChange = (query: PromQuery, override?: any) => {
    this.query.expr = query.expr;
  };

  onFormatChange = (option: SelectableValue<string>) => {
    this.query.format = option.value;
    this.setState({ formatOption: option }, this.onRunQuery);
  };

  onInstantChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const instant = (e.target as HTMLInputElement).checked;
    this.query.instant = instant;
    this.setState({ instant }, this.onRunQuery);
  };

  onIntervalChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const interval = e.currentTarget.value;
    this.query.interval = interval;
    this.setState({ interval });
  };

  onIntervalFactorChange = (option: SelectableValue<number>) => {
    this.query.intervalFactor = option.value;
    this.setState({ intervalFactorOption: option }, this.onRunQuery);
  };

  onLegendChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const legendFormat = e.currentTarget.value;
    this.query.legendFormat = legendFormat;
    this.setState({ legendFormat });
  };

  onExemplarChange = (isEnabled: boolean) => {
    this.query.exemplar = isEnabled;
    this.setState({ exemplar: isEnabled }, this.onRunQuery);
  };

  onRunQuery = () => {
    const { query } = this;
    // Change of query.hide happens outside of this component and is just passed as prop. We have to update it when running queries.
    const { hide } = this.props.query;
    this.props.onChange({ ...query, hide });
    this.props.onRunQuery();
  };

  render() {
    const { datasource, query, range, data } = this.props;
    const { formatOption, instant, interval, intervalFactorOption, legendFormat } = this.state;
    //We want to hide exemplar field for unified alerting as exemplars in alerting don't make sense and are source of confusion
    const showExemplarField = this.props.app !== CoreApp.UnifiedAlerting;

    return (
      <PromQueryField
        datasource={datasource}
        query={query}
        range={range}
        onRunQuery={this.onRunQuery}
        onChange={this.onFieldChange}
        history={[]}
        data={data}
        data-testid={testIds.editor}
        ExtraFieldElement={
          <div className="gf-form-inline">
            <div className="gf-form">
              <InlineFormLabel
                width={7}
                tooltip="使用名称或模式控制时间序列的名称。例如
                {{hostname}}将被替换为标签主机名的标签值。"
              >
                图例
              </InlineFormLabel>
              <input
                type="text"
                className="gf-form-input"
                placeholder="图例格式"
                value={legendFormat}
                onChange={this.onLegendChange}
                onBlur={this.onRunQuery}
              />
            </div>

            <div className="gf-form">
              <InlineFormLabel
                width={7}
                tooltip={
                  <>
                    Prometheus查询的步长参数和 <code>$__interval</code> 和 <code>$__rate_interval</code>
                    变量的另一个下限。这个限制是绝对的，而不是通过决议、设置来修改。
                  </>
                }
              >
                最小步长
              </InlineFormLabel>
              <input
                type="text"
                className="gf-form-input width-8"
                aria-label="Set lower limit for the step parameter"
                placeholder={interval}
                onChange={this.onIntervalChange}
                onBlur={this.onRunQuery}
                value={interval}
              />
            </div>

            <div className="gf-form">
              <div className="gf-form-label">分辨率</div>
              <Select
                aria-label="Select resolution"
                menuShouldPortal
                isSearchable={false}
                options={INTERVAL_FACTOR_OPTIONS}
                onChange={this.onIntervalFactorChange}
                value={intervalFactorOption}
              />
            </div>

            <div className="gf-form">
              <div className="gf-form-label width-7">格式</div>
              <Select
                menuShouldPortal
                className="select-container"
                width={16}
                isSearchable={false}
                options={FORMAT_OPTIONS}
                onChange={this.onFormatChange}
                value={formatOption}
                aria-label="Select format"
              />
              <Switch label="Instant" checked={instant} onChange={this.onInstantChange} />

              <InlineFormLabel width={10} tooltip="链接到Prometheus中的图表">
                <PromLink
                  datasource={datasource}
                  query={this.query} // Use modified query
                  panelData={data}
                />
              </InlineFormLabel>
            </div>
            {showExemplarField && (
              <PromExemplarField
                onChange={this.onExemplarChange}
                datasource={datasource}
                query={this.query}
                data-testid={testIds.exemplar}
              />
            )}
          </div>
        }
      />
    );
  }
}

export const testIds = {
  editor: 'prom-editor',
  exemplar: 'exemplar-editor',
};
