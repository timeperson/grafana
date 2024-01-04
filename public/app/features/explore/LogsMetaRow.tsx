import React from 'react';

import { LogsDedupStrategy, LogsMetaItem, LogsMetaKind, LogRowModel } from '@grafana/data';
import { Button, Tooltip, Icon, LogLabels } from '@grafana/ui';
import { MAX_CHARACTERS } from '@grafana/ui/src/components/Logs/LogRowMessage';

import { MetaInfoText, MetaItemProps } from './MetaInfoText';

export type Props = {
  meta: LogsMetaItem[];
  dedupStrategy: LogsDedupStrategy;
  dedupCount: number;
  showDetectedFields: string[];
  hasUnescapedContent: boolean;
  forceEscape: boolean;
  logRows: LogRowModel[];
  onEscapeNewlines: () => void;
  clearDetectedFields: () => void;
};

export const LogsMetaRow: React.FC<Props> = React.memo(
  ({
    meta,
    dedupStrategy,
    dedupCount,
    showDetectedFields,
    clearDetectedFields,
    hasUnescapedContent,
    forceEscape,
    onEscapeNewlines,
    logRows,
  }) => {
    const logsMetaItem: Array<LogsMetaItem | MetaItemProps> = [...meta];

    // Add deduplication info
    if (dedupStrategy !== LogsDedupStrategy.none) {
      logsMetaItem.push({
        label: '重复数据消除计数',
        value: dedupCount,
        kind: LogsMetaKind.Number,
      });
    }
    // Add info about limit for highlighting
    if (logRows.some((r) => r.entry.length > MAX_CHARACTERS)) {
      logsMetaItem.push({
        label: '信息',
        value: 'Logs with more than 100,000 characters could not be parsed and highlighted',
        kind: LogsMetaKind.String,
      });
    }

    // Add detected fields info
    if (showDetectedFields?.length > 0) {
      logsMetaItem.push(
        {
          label: '仅显示检测到的字段',
          value: renderMetaItem(showDetectedFields, LogsMetaKind.LabelsMap),
        },
        {
          label: '',
          value: (
            <Button variant="secondary" size="sm" onClick={clearDetectedFields}>
              显示所有检测到的字段
            </Button>
          ),
        }
      );
    }

    // Add unescaped content info
    if (hasUnescapedContent) {
      logsMetaItem.push({
        label: '您的日志可能转义的内容不正确',
        value: (
          <Tooltip
            content="修复日志行中错误转义的换行符和制表符序列。手动查看结果以确认替换是正确的。"
            placement="right"
          >
            <Button variant="secondary" size="sm" onClick={onEscapeNewlines}>
              <span>{forceEscape ? '删除转义' : '转义换行符'}&nbsp;</span>
              <Icon name="exclamation-triangle" className="muted" size="sm" />
            </Button>
          </Tooltip>
        ),
      });
    }

    return (
      <>
        {logsMetaItem && (
          <MetaInfoText
            metaItems={logsMetaItem.map((item) => {
              return {
                label: item.label,
                value: 'kind' in item ? renderMetaItem(item.value, item.kind) : item.value,
              };
            })}
          />
        )}
      </>
    );
  }
);

LogsMetaRow.displayName = 'LogsMetaRow';

function renderMetaItem(value: any, kind: LogsMetaKind) {
  if (kind === LogsMetaKind.LabelsMap) {
    return (
      <span className="logs-meta-item__labels">
        <LogLabels labels={value} />
      </span>
    );
  } else if (kind === LogsMetaKind.Error) {
    return <span className="logs-meta-item__error">{value}</span>;
  }
  return value;
}
