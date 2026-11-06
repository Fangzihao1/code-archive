"use client";

import { useState } from "react";
import Link from "next/link";

const topics = [
  { name: "基础语法", count: "01", level: "入门", description: "从变量、数据类型到基础表达式，建立阅读和编写 Python 代码的第一套方法。", skills: ["变量与类型", "运算符", "基础语句"] },
  { name: "输入与输出", count: "02", level: "入门", description: "学习如何接收用户信息、整理数据，并用清晰的结果完成程序交互。", skills: ["input()", "print()", "格式化输出"] },
  { name: "条件判断", count: "03", level: "基础", description: "让程序根据不同条件作出判断，理解分支结构与逻辑表达式。", skills: ["if / elif / else", "比较运算", "逻辑运算"] },
  { name: "循环结构", count: "04", level: "基础", description: "掌握重复执行的思路，用循环处理连续任务和批量数据。", skills: ["for", "while", "break / continue"] },
  { name: "函数与模块", count: "05", level: "进阶", description: "把重复逻辑封装成函数，理解参数、返回值与模块化组织。", skills: ["函数定义", "参数与返回值", "模块导入"] },
  { name: "列表与字典", count: "06", level: "进阶", description: "用常见数据结构组织信息，完成查找、遍历和数据更新。", skills: ["列表", "字典", "遍历与处理"] },
  { name: "算法与逻辑", count: "07", level: "挑战", description: "把问题拆解成可执行步骤，训练分析、推理与程序设计能力。", skills: ["问题拆解", "流程设计", "算法思维"] },
  { name: "综合课堂作业", count: "08", level: "实践", description: "把多个知识点组合起来，在完整任务中检验理解与应用。", skills: ["综合应用", "调试优化", "成果归档"] },
];

export default function InteractiveTopicGrid() {
  const [active, setActive] = useState(0);
  const topic = topics[active];

  return (
    <div className="interactive-topics">
      <div className="topic-grid" role="group" aria-label="选择 Python 学习主题">
        {topics.map((item, index) => (
          <button
            type="button"
            key={item.name}
            className={active === index ? "topic-choice active" : "topic-choice"}
            aria-pressed={active === index}
            onClick={() => setActive(index)}
          >
            <span>{item.count} <i>{item.level}</i></span>
            <strong>{item.name}</strong>
            <b>{active === index ? "已选择" : "查看主题 ↗"}</b>
          </button>
        ))}
      </div>
      <div className="topic-detail-panel" key={topic.name}>
        <div className="topic-detail-index">LEARNING PATH / {topic.count}</div>
        <div className="topic-detail-copy">
          <div><span className="topic-detail-level">{topic.level}阶段</span><h3>{topic.name}</h3></div>
          <p>{topic.description}</p>
        </div>
        <div className="topic-detail-bottom">
          <div className="topic-skill-list">{topic.skills.map(skill => <span key={skill}>{skill}</span>)}</div>
          <Link href={`/exercises?category=${encodeURIComponent(topic.name)}`}>浏览相关练习 <b>↗</b></Link>
        </div>
      </div>
    </div>
  );
}
