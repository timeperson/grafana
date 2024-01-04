import React from 'react';

import { SelectableValue } from '@grafana/data';
import { EditorRow, EditorField } from '@grafana/experimental';
import { RadioButtonGroup, Select } from '@grafana/ui';
import { AutoSizeInput } from 'app/plugins/datasource/prometheus/querybuilder/shared/AutoSizeInput';
import { QueryOptionGroup } from 'app/plugins/datasource/prometheus/querybuilder/shared/QueryOptionGroup';

import { preprocessMaxLines, queryTypeOptions, RESOLUTION_OPTIONS } from '../../components/LokiOptionFields';
import { isMetricsQuery } from '../../datasource';
import { LokiQuery, LokiQueryType } from '../../types';

export interface Props {
  query: LokiQuery;
  onChange: (update: LokiQuery) => void;
  onRunQuery: () => void;
}

export const LokiQueryBuilderOptions = React.memo<Props>(({ query, onChange, onRunQuery }) => {
  const onQueryTypeChange = (value: LokiQueryType) => {
    onChange({ ...query, queryType: value });
    onRunQuery();
  };

  const onResolutionChange = (option: SelectableValue<number>) => {
    onChange({ ...query, resolution: option.value });
    onRunQuery();
  };

  const onLegendFormatChanged = (evt: React.FormEvent<HTMLInputElement>) => {
    onChange({ ...query, legendFormat: evt.currentTarget.value });
    onRunQuery();
  };

  function onMaxLinesChange(e: React.SyntheticEvent<HTMLInputElement>) {
    const newMaxLines = preprocessMaxLines(e.currentTarget.value);
    if (query.maxLines !== newMaxLines) {
      onChange({ ...query, maxLines: newMaxLines });
      onRunQuery();
    }
  }

  let queryType = query.queryType ?? (query.instant ? LokiQueryType.Instant : LokiQueryType.Range);
  let showMaxLines = !isMetricsQuery(query.expr);

  return (
    <EditorRow>
      <QueryOptionGroup title="选项" collapsedInfo={getCollapsedInfo(query, queryType, showMaxLines)}>
        <EditorField label="图例" tooltip="系列名称覆盖或模板。例如{{hostname}}将被替换为hostname的标签值。">
          <AutoSizeInput
            placeholder="{{label}}"
            id="loki-query-editor-legend-format"
            type="string"
            minWidth={14}
            defaultValue={query.legendFormat}
            onCommitChange={onLegendFormatChanged}
          />
        </EditorField>
        <EditorField label="类型">
          <RadioButtonGroup options={queryTypeOptions} value={queryType} onChange={onQueryTypeChange} />
        </EditorField>
        {showMaxLines && (
          <EditorField label="行限制" tooltip="查询返回的日志行数的上限。">
            <AutoSizeInput
              className="width-4"
              placeholder="自动"
              type="number"
              min={0}
              defaultValue={query.maxLines?.toString() ?? ''}
              onCommitChange={onMaxLinesChange}
            />
          </EditorField>
        )}
        <EditorField label="分辨率">
          <Select
            isSearchable={false}
            onChange={onResolutionChange}
            options={RESOLUTION_OPTIONS}
            value={query.resolution || 1}
            aria-label="Select resolution"
            menuShouldPortal
          />
        </EditorField>
      </QueryOptionGroup>
    </EditorRow>
  );
});

function getCollapsedInfo(query: LokiQuery, queryType: LokiQueryType, showMaxLines: boolean): string[] {
  const queryTypeLabel = queryTypeOptions.find((x) => x.value === queryType);
  const resolutionLabel = RESOLUTION_OPTIONS.find((x) => x.value === (query.resolution ?? 1));

  const items: string[] = [];

  if (query.legendFormat) {
    items.push(`图例: ${query.legendFormat}`);
  }

  if (query.resolution) {
    items.push(`分辨率: ${resolutionLabel?.label}`);
  }

  items.push(`类型: ${queryTypeLabel?.label}`);

  if (showMaxLines && query.maxLines) {
    items.push(`行限制: ${query.maxLines}`);
  }

  return items;
}

LokiQueryBuilderOptions.displayName = 'LokiQueryBuilderOptions';
