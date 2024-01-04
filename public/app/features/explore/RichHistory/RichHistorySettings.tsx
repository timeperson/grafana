import { css } from '@emotion/css';
import React from 'react';

import { GrafanaTheme, SelectableValue } from '@grafana/data';
import { stylesFactory, useTheme, Select, Button, Switch, Field } from '@grafana/ui';
import { notifyApp } from 'app/core/actions';
import appEvents from 'app/core/app_events';
import { createSuccessNotification } from 'app/core/copy/appNotification';
import { MAX_HISTORY_ITEMS } from 'app/core/history/RichHistoryLocalStorage';
import { dispatch } from 'app/store/store';

import { ShowConfirmModalEvent } from '../../../types/events';

export interface RichHistorySettingsProps {
  retentionPeriod: number;
  starredTabAsFirstTab: boolean;
  activeDatasourceOnly: boolean;
  onChangeRetentionPeriod: (option: SelectableValue<number>) => void;
  toggleStarredTabAsFirstTab: () => void;
  toggleactiveDatasourceOnly: () => void;
  deleteRichHistory: () => void;
}

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    container: css`
      font-size: ${theme.typography.size.sm};
      .space-between {
        margin-bottom: ${theme.spacing.lg};
      }
    `,
    input: css`
      max-width: 200px;
    `,
    switch: css`
      display: flex;
      align-items: center;
    `,
    label: css`
      margin-left: ${theme.spacing.md};
    `,
  };
});

const retentionPeriodOptions = [
  { value: 2, label: '2 天' },
  { value: 5, label: '5 天' },
  { value: 7, label: '1 周' },
  { value: 14, label: '2 周' },
];

export function RichHistorySettings(props: RichHistorySettingsProps) {
  const {
    retentionPeriod,
    starredTabAsFirstTab,
    activeDatasourceOnly,
    onChangeRetentionPeriod,
    toggleStarredTabAsFirstTab,
    toggleactiveDatasourceOnly,
    deleteRichHistory,
  } = props;
  const theme = useTheme();
  const styles = getStyles(theme);
  const selectedOption = retentionPeriodOptions.find((v) => v.value === retentionPeriod);

  const onDelete = () => {
    appEvents.publish(
      new ShowConfirmModalEvent({
        title: '删除',
        text: '确定要永久删除查询历史记录吗?',
        yesText: '删除',
        icon: 'trash-alt',
        onConfirm: () => {
          deleteRichHistory();
          dispatch(notifyApp(createSuccessNotification('查询历史删除')));
        },
      })
    );
  };

  return (
    <div className={styles.container}>
      <Field
        label="历史时间跨度"
        description={`选择保存您的查询历史的时间期限。最多将存储${MAX_HISTORY_ITEMS} 个条目。`}
        className="space-between"
      >
        <div className={styles.input}>
          <Select
            menuShouldPortal
            value={selectedOption}
            options={retentionPeriodOptions}
            onChange={onChangeRetentionPeriod}
          ></Select>
        </div>
      </Field>
      <Field label="默认的选中选项卡" description=" " className="space-between">
        <div className={styles.switch}>
          <Switch value={starredTabAsFirstTab} onChange={toggleStarredTabAsFirstTab}></Switch>
          <div className={styles.label}>将默认的选中选项卡从“查询历史”更改为“星号”</div>
        </div>
      </Field>
      <Field label="数据源的行为" description=" " className="space-between">
        <div className={styles.switch}>
          <Switch value={activeDatasourceOnly} onChange={toggleactiveDatasourceOnly}></Switch>
          <div className={styles.label}>仅显示当前在Explore中活动的数据源的查询</div>
        </div>
      </Field>
      <div
        className={css`
          font-weight: ${theme.typography.weight.bold};
        `}
      >
        清除浏览历史查询
      </div>
      <div
        className={css`
          margin-bottom: ${theme.spacing.sm};
        `}
      >
        永久删除所有的查询历史记录。
      </div>
      <Button variant="destructive" onClick={onDelete}>
        清除浏览历史查询
      </Button>
    </div>
  );
}
