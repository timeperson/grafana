import { PanelPlugin, LogsSortOrder, LogsDedupStrategy, LogsDedupDescription } from '@grafana/data';

import { LogsPanel } from './LogsPanel';
import { LogsPanelSuggestionsSupplier } from './suggestions';
import { Options } from './types';

export const plugin = new PanelPlugin<Options>(LogsPanel)
  .setPanelOptions((builder) => {
    builder
      .addBooleanSwitch({
        path: 'showTime',
        name: '时间', // Time
        description: '',
        defaultValue: false,
      })
      .addBooleanSwitch({
        path: 'showLabels',
        name: '唯一标签', // Unique labels
        description: '',
        defaultValue: false,
      })
      .addBooleanSwitch({
        path: 'showCommonLabels',
        name: '通用标签', // Common labels
        description: '',
        defaultValue: false,
      })
      .addBooleanSwitch({
        path: 'wrapLogMessage',
        name: '换行符', // Wrap lines
        description: '',
        defaultValue: false,
      })
      .addBooleanSwitch({
        path: 'prettifyLogMessage',
        name: '美化JSON', // Prettify JSON
        description: '',
        defaultValue: false,
      })
      .addBooleanSwitch({
        path: 'enableLogDetails',
        name: '启用日志详细信息', // Enable log details
        description: '',
        defaultValue: true,
      })
      .addRadio({
        path: 'dedupStrategy',
        name: '重复数据删除', // Deduplication
        description: '',
        settings: {
          options: [
            {
              value: LogsDedupStrategy.none,
              label: '不删除',
              description: LogsDedupDescription[LogsDedupStrategy.none],
            },
            {
              value: LogsDedupStrategy.exact,
              label: '精确',
              description: LogsDedupDescription[LogsDedupStrategy.exact],
            },
            {
              value: LogsDedupStrategy.numbers,
              label: '数字',
              description: LogsDedupDescription[LogsDedupStrategy.numbers],
            },
            {
              value: LogsDedupStrategy.signature,
              label: '签名',
              description: LogsDedupDescription[LogsDedupStrategy.signature],
            },
          ],
        },
        defaultValue: LogsDedupStrategy.none,
      })
      .addRadio({
        path: 'sortOrder',
        name: '顺序',
        description: '',
        settings: {
          options: [
            { value: LogsSortOrder.Descending, label: '最新的第一个' },
            { value: LogsSortOrder.Ascending, label: '最旧的第一个' },
          ],
        },
        defaultValue: LogsSortOrder.Descending,
      });
  })
  .setSuggestionsSupplier(new LogsPanelSuggestionsSupplier());
