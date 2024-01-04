import React, { SyntheticEvent } from 'react';

import { CoreApp, SelectableValue } from '@grafana/data';
import { EditorRow, EditorField } from '@grafana/experimental';
import { RadioButtonGroup, Select, Switch } from '@grafana/ui';

import { getQueryTypeChangeHandler, getQueryTypeOptions } from '../../components/PromExploreExtraField';
import { FORMAT_OPTIONS, INTERVAL_FACTOR_OPTIONS } from '../../components/PromQueryEditor';
import { PromQuery } from '../../types';
import { AutoSizeInput } from '../shared/AutoSizeInput';
import { QueryOptionGroup } from '../shared/QueryOptionGroup';

import { getLegendModeLabel, PromQueryLegendEditor } from './PromQueryLegendEditor';

export interface Props {
  query: PromQuery;
  app?: CoreApp;
  onChange: (update: PromQuery) => void;
  onRunQuery: () => void;
}

export const PromQueryBuilderOptions = React.memo<Props>(({ query, app, onChange, onRunQuery }) => {
  const onChangeFormat = (value: SelectableValue<string>) => {
    onChange({ ...query, format: value.value });
    onRunQuery();
  };

  const onChangeStep = (evt: React.FormEvent<HTMLInputElement>) => {
    onChange({ ...query, interval: evt.currentTarget.value });
    onRunQuery();
  };

  const queryTypeOptions = getQueryTypeOptions(app === CoreApp.Explore);
  const onQueryTypeChange = getQueryTypeChangeHandler(query, onChange);

  const onExemplarChange = (event: SyntheticEvent<HTMLInputElement>) => {
    const isEnabled = event.currentTarget.checked;
    onChange({ ...query, exemplar: isEnabled });
    onRunQuery();
  };

  const onIntervalFactorChange = (value: SelectableValue<number>) => {
    onChange({ ...query, intervalFactor: value.value });
    onRunQuery();
  };

  const formatOption = FORMAT_OPTIONS.find((option) => option.value === query.format) || FORMAT_OPTIONS[0];
  const queryTypeValue = getQueryTypeValue(query);
  const queryTypeLabel = queryTypeOptions.find((x) => x.value === queryTypeValue)!.label;

  return (
    <EditorRow>
      <QueryOptionGroup title="选项" collapsedInfo={getCollapsedInfo(query, formatOption.label!, queryTypeLabel)}>
        <PromQueryLegendEditor
          legendFormat={query.legendFormat}
          onChange={(legendFormat) => onChange({ ...query, legendFormat })}
          onRunQuery={onRunQuery}
        />
        <EditorField
          label="最小步长"
          tooltip={
            <>
              Prometheus查询的步长参数和变量 <code>$__interval</code> 和 <code>$__rate_interval</code>的另一个下限。
            </>
          }
        >
          <AutoSizeInput
            type="text"
            aria-label="设置步长参数的下限"
            placeholder={'自动'}
            minWidth={10}
            onCommitChange={onChangeStep}
            defaultValue={query.interval}
          />
        </EditorField>
        <EditorField label="格式">
          <Select value={formatOption} allowCustomValue onChange={onChangeFormat} options={FORMAT_OPTIONS} />
        </EditorField>
        <EditorField label="类型">
          <RadioButtonGroup options={queryTypeOptions} value={queryTypeValue} onChange={onQueryTypeChange} />
        </EditorField>
        {shouldShowExemplarSwitch(query, app) && (
          <EditorField label="范例">
            <Switch value={query.exemplar} onChange={onExemplarChange} />
          </EditorField>
        )}
        {query.intervalFactor && query.intervalFactor > 1 && (
          <EditorField label="分辨率">
            <Select
              aria-label="Select resolution"
              menuShouldPortal
              isSearchable={false}
              options={INTERVAL_FACTOR_OPTIONS}
              onChange={onIntervalFactorChange}
              value={INTERVAL_FACTOR_OPTIONS.find((option) => option.value === query.intervalFactor)}
            />
          </EditorField>
        )}
      </QueryOptionGroup>
    </EditorRow>
  );
});

function shouldShowExemplarSwitch(query: PromQuery, app?: CoreApp) {
  if (app === CoreApp.UnifiedAlerting || !query.range) {
    return false;
  }

  return true;
}

function getQueryTypeValue(query: PromQuery) {
  return query.range && query.instant ? 'both' : query.instant ? 'instant' : 'range';
}

function getCollapsedInfo(query: PromQuery, formatOption: string, queryType: string): string[] {
  const items: string[] = [];

  items.push(`图例: ${getLegendModeLabel(query.legendFormat)}`);
  items.push(`格式: ${formatOption}`);

  if (query.interval) {
    items.push(`步长: ${query.interval}`);
  }

  items.push(`类型: ${queryType}`);

  if (query.exemplar) {
    items.push(`范例: 是`);
  }

  return items;
}

PromQueryBuilderOptions.displayName = 'PromQueryBuilderOptions';
