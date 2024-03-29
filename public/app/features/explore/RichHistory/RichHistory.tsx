import React, { PureComponent } from 'react';

import { SelectableValue } from '@grafana/data';
import { Themeable, withTheme, TabbedContainer, TabConfig } from '@grafana/ui';
import { RICH_HISTORY_SETTING_KEYS } from 'app/core/history/richHistoryLocalStorageUtils';
import store from 'app/core/store';
import { SortOrder } from 'app/core/utils/richHistory';
import { RichHistoryQuery, ExploreId } from 'app/types/explore';

import { RichHistoryQueriesTab } from './RichHistoryQueriesTab';
import { RichHistorySettings } from './RichHistorySettings';
import { RichHistoryStarredTab } from './RichHistoryStarredTab';

export enum Tabs {
  RichHistory = 'Query history',
  Starred = 'Starred',
  Settings = 'Settings',
}

export const sortOrderOptions = [
  { label: '最新的第一', value: SortOrder.Descending },
  { label: '最旧的第一', value: SortOrder.Ascending },
  { label: '数据源 A-Z', value: SortOrder.DatasourceAZ },
  { label: '数据源 Z-A', value: SortOrder.DatasourceZA },
];

export interface RichHistoryProps extends Themeable {
  richHistory: RichHistoryQuery[];
  activeDatasourceInstance?: string;
  firstTab: Tabs;
  exploreId: ExploreId;
  height: number;
  deleteRichHistory: () => void;
  onClose: () => void;
}

interface RichHistoryState {
  sortOrder: SortOrder;
  retentionPeriod: number;
  starredTabAsFirstTab: boolean;
  activeDatasourceOnly: boolean;
  datasourceFilters: SelectableValue[];
}

class UnThemedRichHistory extends PureComponent<RichHistoryProps, RichHistoryState> {
  constructor(props: RichHistoryProps) {
    super(props);
    this.state = {
      sortOrder: SortOrder.Descending,
      datasourceFilters: store.getObject(RICH_HISTORY_SETTING_KEYS.datasourceFilters, []),
      retentionPeriod: store.getObject(RICH_HISTORY_SETTING_KEYS.retentionPeriod, 7),
      starredTabAsFirstTab: store.getBool(RICH_HISTORY_SETTING_KEYS.starredTabAsFirstTab, false),
      activeDatasourceOnly: store.getBool(RICH_HISTORY_SETTING_KEYS.activeDatasourceOnly, true),
    };
  }

  onChangeRetentionPeriod = (retentionPeriod: SelectableValue<number>) => {
    if (retentionPeriod.value !== undefined) {
      this.setState({
        retentionPeriod: retentionPeriod.value,
      });
      store.set(RICH_HISTORY_SETTING_KEYS.retentionPeriod, retentionPeriod.value);
    }
  };

  toggleStarredTabAsFirstTab = () => {
    const starredTabAsFirstTab = !this.state.starredTabAsFirstTab;
    this.setState({
      starredTabAsFirstTab,
    });
    store.set(RICH_HISTORY_SETTING_KEYS.starredTabAsFirstTab, starredTabAsFirstTab);
  };

  toggleActiveDatasourceOnly = () => {
    const activeDatasourceOnly = !this.state.activeDatasourceOnly;
    this.setState({
      activeDatasourceOnly,
    });
    store.set(RICH_HISTORY_SETTING_KEYS.activeDatasourceOnly, activeDatasourceOnly);
  };

  onSelectDatasourceFilters = (value: SelectableValue[]) => {
    try {
      store.setObject(RICH_HISTORY_SETTING_KEYS.datasourceFilters, value);
    } catch (error) {
      console.error(error);
    }
    /* Set data source filters to state even though they were not successfully saved in
     * localStorage to allow interaction and filtering.
     **/
    this.setState({ datasourceFilters: value });
  };

  onChangeSortOrder = (sortOrder: SortOrder) => this.setState({ sortOrder });

  /* If user selects activeDatasourceOnly === true, set datasource filter to currently active datasource.
   * Filtering based on datasource won't be available. Otherwise set to null, as filtering will be
   * available for user.
   */
  updateFilters() {
    this.state.activeDatasourceOnly && this.props.activeDatasourceInstance
      ? this.onSelectDatasourceFilters([
          { label: this.props.activeDatasourceInstance, value: this.props.activeDatasourceInstance },
        ])
      : this.onSelectDatasourceFilters(this.state.datasourceFilters);
  }

  componentDidMount() {
    this.updateFilters();
  }

  componentDidUpdate(prevProps: RichHistoryProps, prevState: RichHistoryState) {
    if (
      this.props.activeDatasourceInstance !== prevProps.activeDatasourceInstance ||
      this.state.activeDatasourceOnly !== prevState.activeDatasourceOnly
    ) {
      this.updateFilters();
    }
  }

  render() {
    const { datasourceFilters, sortOrder, activeDatasourceOnly, retentionPeriod } = this.state;
    const { richHistory, height, exploreId, deleteRichHistory, onClose, firstTab } = this.props;

    const QueriesTab: TabConfig = {
      label: '查询历史',
      value: Tabs.RichHistory,
      content: (
        <RichHistoryQueriesTab
          queries={richHistory}
          sortOrder={sortOrder}
          datasourceFilters={datasourceFilters}
          activeDatasourceOnly={activeDatasourceOnly}
          retentionPeriod={retentionPeriod}
          onChangeSortOrder={this.onChangeSortOrder}
          onSelectDatasourceFilters={this.onSelectDatasourceFilters}
          exploreId={exploreId}
          height={height}
        />
      ),
      icon: 'history',
    };

    const StarredTab: TabConfig = {
      label: '收藏夹',
      value: Tabs.Starred,
      content: (
        <RichHistoryStarredTab
          queries={richHistory}
          sortOrder={sortOrder}
          datasourceFilters={datasourceFilters}
          activeDatasourceOnly={activeDatasourceOnly}
          onChangeSortOrder={this.onChangeSortOrder}
          onSelectDatasourceFilters={this.onSelectDatasourceFilters}
          exploreId={exploreId}
        />
      ),
      icon: 'star',
    };

    const SettingsTab: TabConfig = {
      label: '设置',
      value: Tabs.Settings,
      content: (
        <RichHistorySettings
          retentionPeriod={this.state.retentionPeriod}
          starredTabAsFirstTab={this.state.starredTabAsFirstTab}
          activeDatasourceOnly={this.state.activeDatasourceOnly}
          onChangeRetentionPeriod={this.onChangeRetentionPeriod}
          toggleStarredTabAsFirstTab={this.toggleStarredTabAsFirstTab}
          toggleactiveDatasourceOnly={this.toggleActiveDatasourceOnly}
          deleteRichHistory={deleteRichHistory}
        />
      ),
      icon: 'sliders-v-alt',
    };

    let tabs = [QueriesTab, StarredTab, SettingsTab];
    return (
      <TabbedContainer tabs={tabs} onClose={onClose} defaultTab={firstTab} closeIconTooltip="Close query history" />
    );
  }
}

export const RichHistory = withTheme(UnThemedRichHistory);
