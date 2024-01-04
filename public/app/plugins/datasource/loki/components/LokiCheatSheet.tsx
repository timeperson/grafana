import { shuffle } from 'lodash';
import React, { PureComponent } from 'react';

import { QueryEditorHelpProps } from '@grafana/data';

import LokiLanguageProvider from '../language_provider';
import { LokiQuery } from '../types';

const DEFAULT_EXAMPLES = ['{job="default/prometheus"}'];
const PREFERRED_LABELS = ['job', 'app', 'k8s_app'];
const EXAMPLES_LIMIT = 5;

const LOGQL_EXAMPLES = [
  {
    title: '日志管道', //Log pipeline
    expression: '{job="mysql"} |= "metrics" | logfmt | duration > 10s',
    label:
      '此查询以MySQL作业为目标，筛选出不包含“metrics”一词的日志，并解析每个日志行以提取更多标签并使用它们进行筛选。', //This query targets the MySQL job, filters out logs that don’t contain the word "metrics" and parses each log line to extract more labels and filters with them.
  },
  {
    title: '随着时间的推移进行计数', //Count over time
    expression: 'count_over_time({job="mysql"}[5m])',
    label: '此查询统计MySQL作业在过去五分钟内的所有日志行。', //This query counts all the log lines within the last five minutes for the MySQL job.
  },
  {
    title: '速率',
    expression: 'rate(({job="mysql"} |= "error" != "timeout")[10s])',
    label: '此查询获取MySQL作业在过去十秒内每秒发生的所有非超时错误的速率。', //This query gets the per-second rate of all non-timeout errors within the last ten seconds for the MySQL job.
  },
  {
    title: '聚合、计数和分组',
    expression: 'sum(count_over_time({job="mysql"}[5m])) by (level)',
    label: '获取最近五分钟内按级别分组的日志计数。', //Get the count of logs during the last five minutes, grouping by level.
  },
];

export default class LokiCheatSheet extends PureComponent<QueryEditorHelpProps<LokiQuery>, { userExamples: string[] }> {
  declare userLabelTimer: NodeJS.Timeout;
  state = {
    userExamples: [],
  };

  componentDidMount() {
    this.scheduleUserLabelChecking();
  }

  componentWillUnmount() {
    clearTimeout(this.userLabelTimer);
  }

  scheduleUserLabelChecking() {
    this.userLabelTimer = setTimeout(this.checkUserLabels, 1000);
  }

  checkUserLabels = async () => {
    // Set example from user labels
    const provider: LokiLanguageProvider = this.props.datasource?.languageProvider;
    if (provider.started) {
      const labels = provider.getLabelKeys() || [];
      const preferredLabel = PREFERRED_LABELS.find((l) => labels.includes(l));
      if (preferredLabel) {
        const values = await provider.getLabelValues(preferredLabel);
        const userExamples = shuffle(values)
          .slice(0, EXAMPLES_LIMIT)
          .map((value) => `{${preferredLabel}="${value}"}`);
        this.setState({ userExamples });
      }
    } else {
      this.scheduleUserLabelChecking();
    }
  };

  renderExpression(expr: string) {
    const { onClickExample } = this.props;

    return (
      <div className="cheat-sheet-item__example" key={expr} onClick={(e) => onClickExample({ refId: 'A', expr })}>
        <code>{expr}</code>
      </div>
    );
  }

  render() {
    const { userExamples } = this.state;
    const hasUserExamples = userExamples.length > 0;

    return (
      <div>
        <h2>Loki 备忘单</h2>
        <div className="cheat-sheet-item">
          <div className="cheat-sheet-item__title">查看您的日志</div>
          <div className="cheat-sheet-item__label">
            首先从日志浏览器中选择一个日志流，或者您也可以将一个流选择器写入查询字段。
          </div>
          {hasUserExamples ? (
            <div>
              <div className="cheat-sheet-item__label">以下是日志中的一些示例流：</div>
              {userExamples.map((example) => this.renderExpression(example))}
            </div>
          ) : (
            <div>
              <div className="cheat-sheet-item__label">以下是日志流的示例：</div>
              {this.renderExpression(DEFAULT_EXAMPLES[0])}
            </div>
          )}
        </div>
        <div className="cheat-sheet-item">
          <div className="cheat-sheet-item__title">结合流选择器</div>
          {this.renderExpression('{app="cassandra",namespace="prod"}')}
          <div className="cheat-sheet-item__label">从有两个标签的流返回所有日志行</div>
        </div>

        <div className="cheat-sheet-item">
          <div className="cheat-sheet-item__title">过滤搜索条件。</div>
          {this.renderExpression('{app="cassandra"} |~ "(duration|latency)s*(=|is|of)s*[d.]+"')}
          {this.renderExpression('{app="cassandra"} |= "exact match"')}
          {this.renderExpression('{app="cassandra"} != "do not match"')}
          <div className="cheat-sheet-item__label">
            <a href="https://grafana.com/docs/loki/latest/logql/#log-pipeline" target="logql">
              LogQL
            </a>{' '}
            支持精确和正则表达式过滤器。
          </div>
        </div>
        {LOGQL_EXAMPLES.map((item) => (
          <div className="cheat-sheet-item" key={item.expression}>
            <div className="cheat-sheet-item__title">{item.title}</div>
            {this.renderExpression(item.expression)}
            <div className="cheat-sheet-item__label">{item.label}</div>
          </div>
        ))}
      </div>
    );
  }
}
