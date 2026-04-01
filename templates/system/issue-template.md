---
title: "{{title}}"
id: "{{uuid}}"
type: issue
state: triage
priority: P2
severity: S2
source: user-report
estimate: 3
sprint: ""
milestone: ""
project: "{{project}}"
team: ""
assignee: ""
reporter: ""
qa: ""
environment: ""
found_in: ""
expected_fix_version: ""
blocked_by: []
blocks: []
labels: []
created: ""
updated: ""
resolved_at: ""
tags:
  - issue
_fieldConfig:
  state:
    display: badge
    options:
      - triage
      - backlog
      - in_progress
      - in_review
      - verified
      - done
      - wontfix
    colorMap:
      triage: "#868e96"
      backlog: "#adb5bd"
      in_progress: "#228be6"
      in_review: "#f59f00"
      verified: "#20c997"
      done: "#40c057"
      wontfix: "#fa5252"
  priority:
    display: badge
    options:
      - P0
      - P1
      - P2
      - P3
    colorMap:
      P0: "#fa5252"
      P1: "#f59f00"
      P2: "#228be6"
      P3: "#868e96"
  severity:
    display: badge
    options:
      - S0
      - S1
      - S2
      - S3
    colorMap:
      S0: "#fa5252"
      S1: "#f59f00"
      S2: "#228be6"
      S3: "#868e96"
  estimate:
    display: format
    format: "{value}h"
---

# {{title}}

创建时间：{{date:YYYY-MM-DD}} {{time:HH:mm}}

## 生命周期

- 建议流转：`triage -> backlog -> in_progress -> in_review -> verified -> done`
- 严重度：`S0/S1/S2/S3`
- 优先级：`P0/P1/P2/P3`

## 问题概述


## 影响与范围

- 影响用户：
- 影响功能：
- 影响环境（平台/版本/浏览器）：
- 业务影响评估：

## 复现步骤

1. 
2. 
3. 

## 期望结果


## 实际结果


## 根因分析

- 初步根因：
- 最终根因：
- 关联提交/模块：

## 临时绕过方案


## 修复方案

- 变更点：
- 风险点：
- 回滚方案：

## 处理记录


## 验证记录

- 用例：
- 结果：
- 验证人：
- 验证时间：

## 验收清单

- [ ] 问题已修复
- [ ] 已补充/更新自动化测试
- [ ] 相关文档已更新
- [ ] 已完成回归验证
