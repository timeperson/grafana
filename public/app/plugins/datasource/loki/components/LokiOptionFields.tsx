// Libraries
import { css, cx } from '@emotion/css';
import { map } from 'lodash';
import React, { memo } from 'react';

// Types
import { SelectableValue } from '@grafana/data';
import { config } from '@grafana/runtime';
import { InlineFormLabel, RadioButtonGroup, InlineField, Input, Select } from '@grafana/ui';

import { LokiQuery, LokiQueryType } from '../types';

export interface LokiOptionFieldsProps {
  lineLimitValue: string;
  resolution: number;
  query: LokiQuery;
  onChange: (value: LokiQuery) => void;
  onRunQuery: () => void;
  runOnBlur?: boolean;
}

export const queryTypeOptions: Array<SelectableValue<LokiQueryType>> = [
  { value: LokiQueryType.Range, label: '范围', description: '在一段时间内运行查询' },
  {
    value: LokiQueryType.Instant,
    label: '即时',
    description: '对单个时间点运行查询。对于此查询，使用“到”时间',
  },
];

if (config.featureToggles.lokiLive) {
  queryTypeOptions.push({
    value: LokiQueryType.Stream,
    label: '流',
    description: '运行查询并按一定间隔发送结果',
  });
}

export const DEFAULT_RESOLUTION: SelectableValue<number> = {
  value: 1,
  label: '1/1',
};

export const RESOLUTION_OPTIONS: Array<SelectableValue<number>> = [DEFAULT_RESOLUTION].concat(
  map([2, 3, 4, 5, 10], (value: number) => ({
    value,
    label: '1/' + value,
  }))
);

export function LokiOptionFields(props: LokiOptionFieldsProps) {
  const { lineLimitValue, resolution, onRunQuery, runOnBlur, onChange } = props;
  const query = props.query ?? {};
  let queryType = query.queryType ?? (query.instant ? LokiQueryType.Instant : LokiQueryType.Range);

  function onChangeQueryLimit(value: string) {
    const nextQuery = { ...query, maxLines: preprocessMaxLines(value) };
    onChange(nextQuery);
  }

  function onQueryTypeChange(queryType: LokiQueryType) {
    const { instant, range, ...rest } = query;
    onChange({ ...rest, queryType });
  }

  function onMaxLinesChange(e: React.SyntheticEvent<HTMLInputElement>) {
    if (query.maxLines !== preprocessMaxLines(e.currentTarget.value)) {
      onChangeQueryLimit(e.currentTarget.value);
    }
  }

  function onReturnKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      onRunQuery();
    }
  }

  function onResolutionChange(option: SelectableValue<number>) {
    const nextQuery = { ...query, resolution: option.value };
    onChange(nextQuery);
  }

  return (
    <div aria-label="Loki extra field" className="gf-form-inline">
      {/*Query type field*/}
      <div
        data-testid="queryTypeField"
        className={cx(
          'gf-form explore-input-margin',
          css`
            flex-wrap: nowrap;
          `
        )}
        aria-label="Query type field"
      >
        <InlineFormLabel width="auto">查询类型</InlineFormLabel>

        <RadioButtonGroup
          options={queryTypeOptions}
          value={queryType}
          onChange={(type: LokiQueryType) => {
            onQueryTypeChange(type);
            if (runOnBlur) {
              onRunQuery();
            }
          }}
        />
      </div>
      {/*Line limit field*/}
      <div
        data-testid="lineLimitField"
        className={cx(
          'gf-form',
          css`
            flex-wrap: nowrap;
          `
        )}
        aria-label="Line limit field"
      >
        <InlineField label="行限制" tooltip={'查询返回的日志行数的上限。'}>
          <Input
            className="width-4"
            placeholder="自动"
            type="number"
            min={0}
            onChange={onMaxLinesChange}
            onKeyDown={onReturnKeyDown}
            value={lineLimitValue}
            onBlur={() => {
              if (runOnBlur) {
                onRunQuery();
              }
            }}
          />
        </InlineField>
        <InlineField
          label="分辨率"
          tooltip={
            '分辨率1/1设置指标范围查询的步长参数，使每个像素对应一个数据点。为了获得更好的性能，可以选择较低的分辨率。1/2只对其他像素检索一个数据点，而1/10只对每10像素检索一个数据点。'
          }
        >
          <Select
            isSearchable={false}
            onChange={onResolutionChange}
            options={RESOLUTION_OPTIONS}
            value={resolution}
            aria-label="Select resolution"
            menuShouldPortal
          />
        </InlineField>
      </div>
    </div>
  );
}

export default memo(LokiOptionFields);

export function preprocessMaxLines(value: string): number {
  if (value.length === 0) {
    // empty input - falls back to dataSource.maxLines limit
    return NaN;
  } else if (value.length > 0 && (isNaN(+value) || +value < 0)) {
    // input with at least 1 character and that is either incorrect (value in the input field is not a number) or negative
    // falls back to the limit of 0 lines
    return 0;
  } else {
    // default case - correct input
    return +value;
  }
}
