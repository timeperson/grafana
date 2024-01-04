import React, { useRef } from 'react';

import { SelectableValue } from '@grafana/data';
import { EditorField } from '@grafana/experimental';
import { Select } from '@grafana/ui';

import { LegendFormatMode } from '../../types';
import { AutoSizeInput } from '../shared/AutoSizeInput';

export interface Props {
  legendFormat: string | undefined;
  onChange: (legendFormat: string) => void;
  onRunQuery: () => void;
}

const legendModeOptions = [
  {
    label: '自动',
    value: LegendFormatMode.Auto,
    description: '只包含唯一标签',
  },
  { label: '详细', value: LegendFormatMode.Verbose, description: '所有标签名称和值' },
  { label: '自定义', value: LegendFormatMode.Custom, description: '提供命名模板' },
];

/**
 * Tests for this component are on the parent level (PromQueryBuilderOptions).
 */
export const PromQueryLegendEditor = React.memo<Props>(({ legendFormat, onChange, onRunQuery }) => {
  const mode = getLegendMode(legendFormat);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onLegendFormatChanged = (evt: React.FormEvent<HTMLInputElement>) => {
    let newFormat = evt.currentTarget.value;
    if (newFormat.length === 0) {
      newFormat = LegendFormatMode.Auto;
    }

    if (newFormat !== legendFormat) {
      onChange(newFormat);
      onRunQuery();
    }
  };

  const onLegendModeChanged = (value: SelectableValue<LegendFormatMode>) => {
    switch (value.value!) {
      case LegendFormatMode.Auto:
        onChange(LegendFormatMode.Auto);
        break;
      case LegendFormatMode.Custom:
        onChange('{{label_name}}');
        setTimeout(() => {
          inputRef.current?.focus();
          inputRef.current?.setSelectionRange(2, 12, 'forward');
        }, 10);
        break;
      case LegendFormatMode.Verbose:
        onChange('');
        break;
    }
    onRunQuery();
  };

  return (
    <EditorField label="图例" tooltip="系列名称覆盖或模板。例如{{hostname}}将被替换为hostname的标签值。">
      <>
        {mode === LegendFormatMode.Custom && (
          <AutoSizeInput
            id="legendFormat"
            minWidth={22}
            placeholder="自动"
            defaultValue={legendFormat}
            onCommitChange={onLegendFormatChanged}
            ref={inputRef}
          />
        )}
        {mode !== LegendFormatMode.Custom && (
          <Select
            inputId="legend.mode"
            isSearchable={false}
            placeholder="选择图例模式"
            options={legendModeOptions}
            width={22}
            onChange={onLegendModeChanged}
            value={legendModeOptions.find((x) => x.value === mode)}
          />
        )}
      </>
    </EditorField>
  );
});

PromQueryLegendEditor.displayName = 'PromQueryLegendEditor';

function getLegendMode(legendFormat: string | undefined) {
  // This special value means the new smart minimal series naming
  if (legendFormat === LegendFormatMode.Auto) {
    return LegendFormatMode.Auto;
  }

  // Missing or empty legend format is the old verbose behavior
  if (legendFormat == null || legendFormat === '') {
    return LegendFormatMode.Verbose;
  }

  return LegendFormatMode.Custom;
}

export function getLegendModeLabel(legendFormat: string | undefined) {
  const mode = getLegendMode(legendFormat);
  if (mode !== LegendFormatMode.Custom) {
    return legendModeOptions.find((x) => x.value === mode)?.label;
  }
  return legendFormat;
}
