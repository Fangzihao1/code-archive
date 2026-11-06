"use client";

import { useState } from "react";

const examples = [
  {
    id: "hello",
    label: "输出语句",
    file: "hello.py",
    description: "让计算机说出第一句话",
    code: ['message = "Hello, Python!"', "print(message)", 'print("欢迎来到 CODE ARCHIVE")'],
    output: "Hello, Python!\n欢迎来到 CODE ARCHIVE",
  },
  {
    id: "condition",
    label: "条件判断",
    file: "condition.py",
    description: "根据条件，做出不同选择",
    code: ["score = 92", "if score >= 60:", '    print("恭喜你，成功通过！")', "else:", '    print("再接再厉！")'],
    output: "恭喜你，成功通过！",
  },
  {
    id: "loop",
    label: "循环结构",
    file: "loop.py",
    description: "让一段代码重复执行",
    code: ["for number in range(1, 4):", "    print(number)", 'print("循环完成！")'],
    output: "1\n2\n3\n循环完成！",
  },
] as const;

type ExampleId = (typeof examples)[number]["id"];

export default function HeroPythonLab() {
  const [activeId, setActiveId] = useState<ExampleId>("hello");
  const [hasRun, setHasRun] = useState(false);
  const [runCount, setRunCount] = useState(0);

  const activeIndex = examples.findIndex((item) => item.id === activeId);
  const activeExample = examples[activeIndex] ?? examples[0];

  function chooseExample(id: ExampleId) {
    setActiveId(id);
    setHasRun(false);
  }

  function runExample() {
    setHasRun(false);
    setRunCount((count) => count + 1);
    requestAnimationFrame(() => setHasRun(true));
  }

  function nextExample() {
    const next = examples[(activeIndex + 1) % examples.length];
    chooseExample(next.id);
  }

  return (
    <section className="hero-code-card hero-python-lab" aria-label="Python 点击互动演示">
      <div className="lab-topbar">
        <div className="lab-window-dots"><i /><i /><i /></div>
        <span className="lab-file-name">{activeExample.file}</span>
        <span className="lab-live"><i /> INTERACTIVE</span>
      </div>

      <div className="lab-heading">
        <div>
          <span className="lab-kicker">PYTHON PLAYGROUND / 01</span>
          <strong>点一下，看看代码</strong>
        </div>
        <span className="lab-version">PY 3</span>
      </div>

      <div className="lab-tabs" role="tablist" aria-label="选择代码示例">
        {examples.map((example) => (
          <button
            key={example.id}
            type="button"
            role="tab"
            aria-selected={activeId === example.id}
            className={activeId === example.id ? "active" : ""}
            onClick={() => chooseExample(example.id)}
          >
            {example.label}
          </button>
        ))}
      </div>

      <div className="lab-example-caption">{activeExample.description}</div>

      <div className={"lab-editor " + (hasRun ? "is-running" : "")} key={activeId + "-" + runCount}>
        <div className="lab-line-numbers">
          {activeExample.code.map((_, index) => <span key={index}>{String(index + 1).padStart(2, "0")}</span>)}
        </div>
        <pre>
          {activeExample.code.map((line, index) => (
            <span className="lab-code-line" key={index}>{line}</span>
          ))}
        </pre>
      </div>

      <div className="lab-output">
        <div className="lab-output-heading">
          <span>TERMINAL / OUTPUT</span>
          <span className={hasRun ? "lab-output-status done" : "lab-output-status"}>
            {hasRun ? "● FINISHED" : "○ READY"}
          </span>
        </div>
        <pre aria-live="polite" className={hasRun ? "lab-output-result visible" : "lab-output-result"}>
          {hasRun ? activeExample.output : "点击下方运行，查看程序结果。"}
        </pre>
      </div>

      <div className="lab-actions">
        <button type="button" className="lab-run-button" onClick={runExample}>
          <span>▶</span> {hasRun ? "再运行一次" : "运行示例"}
        </button>
        <button type="button" className="lab-next-button" onClick={nextExample}>
          换个示例 <span>→</span>
        </button>
      </div>

      <p className="lab-disclaimer">轻量交互演示 · 结果为预设模拟输出</p>
    </section>
  );
}
