---
title: "{{title}}"
id: "{{uuid}}"
type: task
state: todo
priority: P2
estimate: 2
project: "{{project}}"
team: ""
owner: ""
assignee: ""
labels: []
due: ""
created: ""
updated: ""
tags:
  - task
_fieldConfig:
  state:
    display: badge
    options:
      - todo
      - in_progress
      - in_review
      - done
      - cancelled
    colorMap:
      todo: "#868e96"
      in_progress: "#228be6"
      in_review: "#f59f00"
      done: "#40c057"
      cancelled: "#fa5252"
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
  estimate:
    display: format
    format: "{value}h"
---

# {{title}}

创建时间：{{date:YYYY-MM-DD}} {{time:HH:mm}}

## 任务目标


## 背景说明


## 执行步骤

1. 
2. 
3. 

## 验收标准

- [ ] 标准一
- [ ] 标准二

## 风险与依赖

- 风险：
- 依赖：

## 备注
