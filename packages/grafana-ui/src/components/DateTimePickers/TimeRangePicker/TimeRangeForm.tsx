import { css } from '@emotion/css';
import React, { FormEvent, useCallback, useEffect, useState } from 'react';

import {
  dateMath,
  DateTime,
  dateTimeFormat,
  dateTimeParse,
  GrafanaTheme2,
  isDateTime,
  rangeUtil,
  RawTimeRange,
  TimeRange,
  TimeZone,
} from '@grafana/data';
import { selectors } from '@grafana/e2e-selectors';

import { Icon, Tooltip } from '../..';
import { useStyles2 } from '../../..';
import { Button } from '../../Button';
import { Field } from '../../Forms/Field';
import { Input } from '../../Input/Input';

import TimePickerCalendar from './TimePickerCalendar';

interface Props {
  isFullscreen: boolean;
  value: TimeRange;
  onApply: (range: TimeRange) => void;
  timeZone?: TimeZone;
  fiscalYearStartMonth?: number;
  roundup?: boolean;
  isReversed?: boolean;
}

interface InputState {
  value: string;
  invalid: boolean;
  errorMessage: string;
}

const ERROR_MESSAGES = {
  default: '不支持的时间格式',
  range: '"From"时间不能晚于"To"时间',
};

export const TimeRangeForm: React.FC<Props> = (props) => {
  const { value, isFullscreen = false, timeZone, onApply: onApplyFromProps, isReversed, fiscalYearStartMonth } = props;
  const [fromValue, toValue] = valueToState(value.raw.from, value.raw.to, timeZone);
  const style = useStyles2(getStyles);

  const [from, setFrom] = useState<InputState>(fromValue);
  const [to, setTo] = useState<InputState>(toValue);
  const [isOpen, setOpen] = useState(false);

  // Synchronize internal state with external value
  useEffect(() => {
    const [fromValue, toValue] = valueToState(value.raw.from, value.raw.to, timeZone);
    //判断时间格式
    setFrom(fromValue);
    setTo(toValue);
  }, [value.raw.from, value.raw.to, timeZone]);

  const onOpen = useCallback(
    (event: FormEvent<HTMLElement>) => {
      event.preventDefault();
      setOpen(true);
    },
    [setOpen]
  );

  const onApply = useCallback(
    (e: FormEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (to.invalid || from.invalid) {
        return;
      }

      const raw: RawTimeRange = { from: from.value, to: to.value };
      const timeRange = rangeUtil.convertRawToRange(raw, timeZone, fiscalYearStartMonth);

      onApplyFromProps(timeRange);
    },
    [from.invalid, from.value, onApplyFromProps, timeZone, to.invalid, to.value, fiscalYearStartMonth]
  );
  const onChange = useCallback(
    (from: DateTime | string, to: DateTime | string) => {
      let [fromValue, toValue] = valueToState(from, to, timeZone);
      //判断form
      let fromInvalidRang = false;
      let toInvalidRang = false;
      let now = new Date();
      let year = now.getFullYear();
      let month = now.getMonth() + 1; // 月份从0开始，所以要加1
      let day = now.getDate();
      let hour = now.getHours();
      let minute = now.getMinutes();
      let second = now.getSeconds();
      let starttime = '1970年1月1日 00:00:00';
      let endtime = `${year}年${month}月${day}日 ${hour}:${minute}:${second}`;
      let erroremsg = `请输入有效时间范围(${starttime}-${endtime})`;
      if (fromValue.value.indexOf('now') < 0) {
        //  console.log('now')
        fromInvalidRang = timeJudeg(fromValue.value);
      } else {
        if (fromValue.value.indexOf('-') > -1) {
          fromInvalidRang = judegTime(fromValue.value.split('-')[1]);
        }
      }
      if (toValue.value.indexOf('now') < 0) {
        //  console.log('now')
        toInvalidRang = timeJudeg(toValue.value);
      } else {
        if (toValue.value.indexOf('-') > -1) {
          toInvalidRang = judegTime(toValue.value.split('-')[1]);
        }
      }
      if (fromInvalidRang) {
        fromValue.invalid = true;
        fromValue.errorMessage = erroremsg;
      }
      if (toInvalidRang) {
        toValue.invalid = true;
        toValue.errorMessage = erroremsg;
      }
      setFrom(fromValue);
      setTo(toValue);
    },
    [timeZone]
  );

  const fiscalYear = rangeUtil.convertRawToRange({ from: 'now/fy', to: 'now/fy' }, timeZone, fiscalYearStartMonth);

  const fyTooltip = (
    <div className={style.tooltip}>
      {rangeUtil.isFiscal(value) ? (
        <Tooltip content={`Fiscal year: ${fiscalYear.from.format('MMM-DD')} - ${fiscalYear.to.format('MMM-DD')}`}>
          <Icon name="info-circle" />
        </Tooltip>
      ) : null}
    </div>
  );

  const icon = (
    <Button
      aria-label={selectors.components.TimePicker.calendar.openButton}
      icon="calendar-alt"
      variant="secondary"
      onClick={onOpen}
    />
  );

  return (
    <div>
      <div className={style.fieldContainer}>
        <Field label="From" invalid={from.invalid} error={from.errorMessage}>
          <Input
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => onChange(event.currentTarget.value, to.value)}
            addonAfter={icon}
            aria-label={selectors.components.TimePicker.fromField}
            value={from.value}
          />
        </Field>
        {fyTooltip}
      </div>
      <div className={style.fieldContainer}>
        <Field label="To" invalid={to.invalid} error={to.errorMessage}>
          <Input
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => onChange(from.value, event.currentTarget.value)}
            addonAfter={icon}
            aria-label={selectors.components.TimePicker.toField}
            value={to.value}
          />
        </Field>
        {fyTooltip}
      </div>
      <Button data-testid={selectors.components.TimePicker.applyTimeRange} onClick={onApply}>
        应用时间范围
      </Button>

      <TimePickerCalendar
        isFullscreen={isFullscreen}
        isOpen={isOpen}
        from={dateTimeParse(from.value)}
        to={dateTimeParse(to.value)}
        onApply={onApply}
        onClose={() => setOpen(false)}
        onChange={onChange}
        timeZone={timeZone}
        isReversed={isReversed}
      />
    </div>
  );
};

function isRangeInvalid(from: string, to: string, timezone?: string): boolean {
  const raw: RawTimeRange = { from, to };
  const timeRange = rangeUtil.convertRawToRange(raw, timezone);
  const valid = timeRange.from.isSame(timeRange.to) || timeRange.from.isBefore(timeRange.to);

  return !valid;
}

function valueToState(
  rawFrom: DateTime | string,
  rawTo: DateTime | string,
  timeZone?: TimeZone
): [InputState, InputState] {
  const fromValue = valueAsString(rawFrom, timeZone);
  const toValue = valueAsString(rawTo, timeZone);
  const fromInvalid = !isValid(fromValue, false, timeZone);
  const toInvalid = !isValid(toValue, true, timeZone);
  // If "To" is invalid, we should not check the range anyways
  const rangeInvalid = isRangeInvalid(fromValue, toValue, timeZone) && !toInvalid;

  return [
    {
      value: fromValue,
      invalid: fromInvalid || rangeInvalid,
      errorMessage: rangeInvalid && !fromInvalid ? ERROR_MESSAGES.range : ERROR_MESSAGES.default,
    },
    { value: toValue, invalid: toInvalid, errorMessage: ERROR_MESSAGES.default },
  ];
}

function valueAsString(value: DateTime | string, timeZone?: TimeZone): string {
  if (isDateTime(value)) {
    return dateTimeFormat(value, { timeZone });
  }
  return value;
}

function isValid(value: string, roundUp?: boolean, timeZone?: TimeZone): boolean {
  if (isDateTime(value)) {
    return value.isValid();
  }

  if (dateMath.isMathString(value)) {
    if (dateMath.isValid(value)) {
      let reg = /^now-?\d{0,}[YyMwdhms]?$/;
      if (reg.test(value) || value === 'now') {
        return true;
      } else {
        return false;
      }
    } else {
      return dateMath.isValid(value);
    }
  }

  const parsed = dateTimeParse(value, { roundUp, timeZone });
  return parsed.isValid();
}

function getStyles(theme: GrafanaTheme2) {
  return {
    fieldContainer: css`
      display: flex;
    `,
    tooltip: css`
      padding-left: ${theme.spacing(1)};
      padding-top: ${theme.spacing(3)};
    `,
  };
}
function judegTime(compareDateArg: string): boolean {
  const type: string = compareDateArg.substr(compareDateArg.length - 1, 1);
  const compareDate: number = parseFloat(compareDateArg.substr(0, compareDateArg.length - 1));
  let result = false;
  // 获取当前时间的毫秒数
  const currentTime = Date.now();
  // 创建表示 1970 年 1 月 1 日 00:00:00 的 Date 对象
  const startDate = new Date(0);
  // 计算当前时间与起始时间之间的差距（单位：毫秒）
  const timeDifference = currentTime - startDate.getTime();
  if (type === 'Y' || type === 'y') {
    const years = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 365.25));
    result = compareDate > years;
  }
  if (type === 'M' || type === 'm') {
    const months = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * (365.25 / 12)));
    result = compareDate > months;
  }
  if (type === 'd') {
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    result = compareDate > days;
  }
  if (type === 'w') {
    const weeks = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 7));
    result = compareDate > weeks;
  }
  if (type === 'h') {
    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    result = compareDate > hours;
  }
  if (type === 'm') {
    const minutes = Math.floor(timeDifference / (1000 * 60));
    result = compareDate > minutes;
  }
  if (type === 's') {
    const seconds = Math.floor(timeDifference / 1000);
    result = compareDate > seconds;
  }
  return result;
}
function timeJudeg(dateArg: string): boolean {
  const minDate = new Date(1970, 0, 1);
  return new Date(dateArg) < minDate || new Date(dateArg) > new Date();
}
