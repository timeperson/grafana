import { css, cx } from '@emotion/css';
import { isEqual } from 'lodash';
import React, { memo, useCallback } from 'react';
import { usePrevious } from 'react-use';

import { InlineFormLabel, RadioButtonGroup } from '@grafana/ui';

import { PrometheusDatasource } from '../datasource';
import { PromQuery } from '../types';

import { PromExemplarField } from './PromExemplarField';

export interface PromExploreExtraFieldProps {
  query: PromQuery;
  onChange: (value: PromQuery) => void;
  onRunQuery: () => void;
  datasource: PrometheusDatasource;
}

export const PromExploreExtraField: React.FC<PromExploreExtraFieldProps> = memo(
  ({ query, datasource, onChange, onRunQuery }) => {
    const rangeOptions = getQueryTypeOptions(true);
    const prevQuery = usePrevious(query);

    const onExemplarChange = useCallback(
      (exemplar: boolean) => {
        if (!isEqual(query, prevQuery) || exemplar !== query.exemplar) {
          onChange({ ...query, exemplar });
        }
      },
      [prevQuery, query, onChange]
    );

    function onChangeQueryStep(interval: string) {
      onChange({ ...query, interval });
    }

    function onStepChange(e: React.SyntheticEvent<HTMLInputElement>) {
      if (e.currentTarget.value !== query.interval) {
        onChangeQueryStep(e.currentTarget.value);
      }
    }

    function onReturnKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      if (e.key === 'Enter' && e.shiftKey) {
        onRunQuery();
      }
    }

    const onQueryTypeChange = getQueryTypeChangeHandler(query, onChange);

    return (
      <div aria-label="Prometheus extra field" className="gf-form-inline" data-testid={testIds.extraFieldEditor}>
        {/*Query type field*/}
        <div
          data-testid={testIds.queryTypeField}
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
            options={rangeOptions}
            value={query.range && query.instant ? 'both' : query.instant ? 'instant' : 'range'}
            onChange={onQueryTypeChange}
          />
        </div>
        {/*Step field*/}
        <div
          data-testid={testIds.stepField}
          className={cx(
            'gf-form',
            css`
              flex-wrap: nowrap;
            `
          )}
          aria-label="Step field"
        >
          <InlineFormLabel
            width={6}
            tooltip={
              '此处可以使用时间单位和内置变量，例如：$__interval、$__rate_interval、5s、1m、3h、1d、1y（如果未指定单位，则默认为：s）'
            }
          >
            最小步长
          </InlineFormLabel>
          <input
            type={'text'}
            className="gf-form-input width-4"
            placeholder={'自动'}
            onChange={onStepChange}
            onKeyDown={onReturnKeyDown}
            value={query.interval ?? ''}
          />
        </div>

        <PromExemplarField onChange={onExemplarChange} datasource={datasource} query={query} />
      </div>
    );
  }
);

PromExploreExtraField.displayName = 'PromExploreExtraField';

export function getQueryTypeOptions(includeBoth: boolean) {
  const rangeOptions = [
    { value: 'range', label: '范围', description: '在一段时间内运行查询' },
    {
      value: 'instant',
      label: '即时',
      description: '对单个时间点运行查询。对于此查询，使用“到”时间',
    },
  ];

  if (includeBoth) {
    rangeOptions.push({ value: 'both', label: '全部', description: '运行即时查询和范围查询' });
  }

  return rangeOptions;
}

export function getQueryTypeChangeHandler(query: PromQuery, onChange: (update: PromQuery) => void) {
  return (queryType: string) => {
    if (queryType === 'instant') {
      onChange({ ...query, instant: true, range: false, exemplar: false });
    } else if (queryType === 'range') {
      onChange({ ...query, instant: false, range: true });
    } else {
      onChange({ ...query, instant: true, range: true });
    }
  };
}

export const testIds = {
  extraFieldEditor: 'prom-editor-extra-field',
  stepField: 'prom-editor-extra-field-step',
  queryTypeField: 'prom-editor-extra-field-query-type',
};
