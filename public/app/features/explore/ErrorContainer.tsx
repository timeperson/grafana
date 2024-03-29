import { css } from '@emotion/css';
import React, { FunctionComponent } from 'react';

import { DataQueryError } from '@grafana/data';
import { Alert, useTheme2 } from '@grafana/ui';
import { FadeIn } from 'app/core/components/Animations/FadeIn';

export interface ErrorContainerProps {
  queryError?: DataQueryError;
}

export const ErrorContainer: FunctionComponent<ErrorContainerProps> = (props) => {
  const { queryError } = props;
  const theme = useTheme2();
  const showError = queryError ? true : false;
  const duration = showError ? 100 : 10;
  const title = queryError ? '查询错误' : '未知错误';
  const message = queryError?.message || queryError?.data?.message || null;
  const alertWithTopMargin = css`
    margin-top: ${theme.spacing(2)};
  `;

  return (
    <FadeIn in={showError} duration={duration}>
      <Alert severity="error" title={title} className={alertWithTopMargin}>
        {message}
      </Alert>
    </FadeIn>
  );
};
