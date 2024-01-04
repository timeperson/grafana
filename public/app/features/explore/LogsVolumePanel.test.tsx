import { render, screen } from '@testing-library/react';
import React from 'react';

import { DataQueryResponse, LoadingState } from '@grafana/data';

import { LogsVolumePanel } from './LogsVolumePanel';

jest.mock('./ExploreGraph', () => {
  const ExploreGraph = () => <span>ExploreGraph</span>;
  return {
    ExploreGraph,
  };
});

function renderPanel(logsVolumeData?: DataQueryResponse) {
  render(
    <LogsVolumePanel
      absoluteRange={{ from: 0, to: 1 }}
      timeZone="timeZone"
      splitOpen={() => {}}
      width={100}
      onUpdateTimeRange={() => {}}
      logsVolumeData={logsVolumeData}
      onLoadLogsVolume={() => {}}
    />
  );
}

describe('LogsVolumePanel', () => {
  it('shows loading message', () => {
    renderPanel({ state: LoadingState.Loading, error: undefined, data: [] });
    expect(screen.getByText('正在加载日志量...')).toBeInTheDocument();
  });

  it('shows no volume data', () => {
    renderPanel({ state: LoadingState.Done, error: undefined, data: [] });
    expect(screen.getByText('无卷数据.')).toBeInTheDocument();
  });

  it('renders logs volume histogram graph', () => {
    renderPanel({ state: LoadingState.Done, error: undefined, data: [{}] });
    expect(screen.getByText('ExploreGraph')).toBeInTheDocument();
  });

  it('shows short warning message', () => {
    renderPanel({ state: LoadingState.Error, error: { data: { message: '测试错误消息' } }, data: [] });
    expect(screen.getByText('未能加载此查询的日志量')).toBeInTheDocument();
    expect(screen.getByText('测试错误消息')).toBeInTheDocument();
  });

  it('shows long warning message', () => {
    // we make a long message
    const messagePart = 'One two three four five six seven eight nine ten.';
    const message = messagePart + ' ' + messagePart + ' ' + messagePart;

    renderPanel({ state: LoadingState.Error, error: { data: { message } }, data: [] });
    expect(screen.getByText('未能加载此查询的日志量')).toBeInTheDocument();
    expect(screen.queryByText(message)).not.toBeInTheDocument();
    const button = screen.getByText('显示详细信息');
    button.click();
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('does not show the panel when there is no volume data', () => {
    renderPanel(undefined);
    expect(screen.queryByText('日志量')).not.toBeInTheDocument();
  });
});
