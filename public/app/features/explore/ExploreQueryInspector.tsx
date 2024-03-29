import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { TimeZone } from '@grafana/data';
import { TabbedContainer, TabConfig } from '@grafana/ui';
import { ExploreDrawer } from 'app/features/explore/ExploreDrawer';
import { InspectDataTab } from 'app/features/inspector/InspectDataTab';
import { InspectErrorTab } from 'app/features/inspector/InspectErrorTab';
import { InspectJSONTab } from 'app/features/inspector/InspectJSONTab';
import { InspectStatsTab } from 'app/features/inspector/InspectStatsTab';
import { QueryInspector } from 'app/features/inspector/QueryInspector';
import { StoreState, ExploreItemState, ExploreId } from 'app/types';

import { runQueries } from './state/query';

interface DispatchProps {
  width: number;
  exploreId: ExploreId;
  timeZone: TimeZone;
  onClose: () => void;
}

type Props = DispatchProps & ConnectedProps<typeof connector>;

export function ExploreQueryInspector(props: Props) {
  const { loading, width, onClose, queryResponse, timeZone } = props;
  const dataFrames = queryResponse?.series || [];
  const error = queryResponse?.error;

  const statsTab: TabConfig = {
    label: '统计数据',
    value: 'stats',
    icon: 'chart-line',
    content: <InspectStatsTab data={queryResponse!} timeZone={queryResponse?.request?.timezone as TimeZone} />,
  };

  const jsonTab: TabConfig = {
    label: 'JSON',
    value: 'json',
    icon: 'brackets-curly',
    content: <InspectJSONTab data={queryResponse} onClose={onClose} />,
  };

  const dataTab: TabConfig = {
    label: '数据',
    value: 'data',
    icon: 'database',
    content: (
      <InspectDataTab
        data={dataFrames}
        isLoading={loading}
        options={{ withTransforms: false, withFieldConfig: false }}
        timeZone={timeZone}
      />
    ),
  };

  const queryTab: TabConfig = {
    label: '查询',
    value: 'query',
    icon: 'info-circle',
    content: <QueryInspector data={dataFrames} onRefreshQuery={() => props.runQueries(props.exploreId)} />,
  };

  const tabs = [statsTab, queryTab, jsonTab, dataTab];
  if (error) {
    const errorTab: TabConfig = {
      label: '错误',
      value: 'error',
      icon: 'exclamation-triangle',
      content: <InspectErrorTab error={error} />,
    };
    tabs.push(errorTab);
  }
  return (
    <ExploreDrawer width={width} onResize={() => {}}>
      <TabbedContainer tabs={tabs} onClose={onClose} closeIconTooltip="Close query inspector" />
    </ExploreDrawer>
  );
}

function mapStateToProps(state: StoreState, { exploreId }: { exploreId: ExploreId }) {
  const explore = state.explore;
  const item: ExploreItemState = explore[exploreId]!;
  const { loading, queryResponse } = item;

  return {
    loading,
    queryResponse,
  };
}

const mapDispatchToProps = {
  runQueries,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(ExploreQueryInspector);
