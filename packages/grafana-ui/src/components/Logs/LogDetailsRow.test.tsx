import { screen, render, fireEvent } from '@testing-library/react';
import React, { ComponentProps } from 'react';

import { LogDetailsRow } from './LogDetailsRow';

type Props = ComponentProps<typeof LogDetailsRow>;

const setup = (propOverrides?: Partial<Props>) => {
  const props: Props = {
    parsedValue: '',
    parsedKey: '',
    isLabel: true,
    wrapLogMessage: false,
    getStats: () => null,
    onClickFilterLabel: () => {},
    onClickFilterOutLabel: () => {},
    onClickShowDetectedField: () => {},
    onClickHideDetectedField: () => {},
    showDetectedFields: [],
  };

  Object.assign(props, propOverrides);

  return render(
    <table>
      <tbody>
        <LogDetailsRow {...props} />
      </tbody>
    </table>
  );
};

describe('LogDetailsRow', () => {
  it('should render parsed key', () => {
    setup({ parsedKey: 'test key' });
    expect(screen.getByText('test key')).toBeInTheDocument();
  });
  it('should render parsed value', () => {
    setup({ parsedValue: 'test value' });
    expect(screen.getByText('test value')).toBeInTheDocument();
  });

  it('should render metrics button', () => {
    setup();
    expect(screen.getAllByTitle('Ad-hoc statistics')).toHaveLength(1);
  });

  describe('if props is a label', () => {
    it('should render filter label button', () => {
      setup();
      expect(screen.getAllByTitle('筛选值')).toHaveLength(1);
    });
    it('should render filter out label button', () => {
      setup();
      expect(screen.getAllByTitle('排除值')).toHaveLength(1);
    });
    it('should not render filtering buttons if no filtering functions provided', () => {
      setup({ onClickFilterLabel: undefined, onClickFilterOutLabel: undefined });
      expect(screen.queryByTitle('排除值')).not.toBeInTheDocument();
    });
  });

  describe('if props is not a label', () => {
    it('should not render a filter label button', () => {
      setup({ isLabel: false });
      expect(screen.queryByTitle('筛选值')).not.toBeInTheDocument();
    });
    it('should render a show toggleFieldButton button', () => {
      setup({ isLabel: false });
      expect(screen.getAllByTitle('只显示这个字段')).toHaveLength(1);
    });
    it('should not render a show toggleFieldButton button if no detected fields toggling functions provided', () => {
      setup({
        isLabel: false,
        onClickShowDetectedField: undefined,
        onClickHideDetectedField: undefined,
      });
      expect(screen.queryByTitle('只显示这个字段')).not.toBeInTheDocument();
    });
  });

  it('should render stats when stats icon is clicked', () => {
    setup({
      parsedKey: 'key',
      parsedValue: 'value',
      getStats: () => {
        return [
          {
            count: 1,
            proportion: 1 / 2,
            value: 'value',
          },
          {
            count: 1,
            proportion: 1 / 2,
            value: 'another value',
          },
        ];
      },
    });

    expect(screen.queryByTestId('logLabelStats')).not.toBeInTheDocument();
    const adHocStatsButton = screen.getByTitle('Ad-hoc statistics');
    fireEvent.click(adHocStatsButton);
    expect(screen.getByTestId('logLabelStats')).toBeInTheDocument();
    expect(screen.getByTestId('logLabelStats')).toHaveTextContent('another value');
  });
});
