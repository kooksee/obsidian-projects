---
title: "{{title}}"
id: "{{uuid}}"
type: product
stage: discovery
state: active
priority: P1
owner: ""
team: ""
target_release: ""
success_metrics: []
labels: []
created: ""
updated: ""
tags:
  - product
_fieldConfig:
  stage:
    display: badge
    options:
      - discovery
      - definition
      - development
      - launch
      - growth
      - sunset
    colorMap:
      discovery: "#868e96"
      definition: "#228be6"
      development: "#7950f2"
      launch: "#f59f00"
      growth: "#40c057"
      sunset: "#fa5252"
  state:
    display: badge
    options:
      - active
      - on_hold
      - archived
    colorMap:
      active: "#40c057"
      on_hold: "#f59f00"
      archived: "#868e96"
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
---

# {{title}}

创建时间：{{date:YYYY-MM-DD}}

## 产品愿景


## 问题定义


## 目标用户

- 核心用户：
- 次要用户：

## 成功指标

- 指标一：
- 指标二：

## 约束条件

- 技术约束：
- 时间约束：
- 合规约束：

## 路线图

| 阶段 | 目标产出 | 状态 |
| ---- | -------- | ---- |
|      |          |      |

## 发布检查

- [ ] 范围已确认
- [ ] 关联任务已建立
- [ ] 验证测试已完成
- [ ] 发布方案已确认

## 待确认问题

- 
