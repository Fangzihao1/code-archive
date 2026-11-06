"use client";

import { useState } from "react";

const examples = [
  {
    id: "hello",
    label: "输入与输出",
    file: "hello.py",
    prompt: "输入你的名字",
    placeholder: "例如：Python",
    initial: "Python",
    code: 'name = input("请输入姓名：")\nprint("Hello, " + name + "!")',
  },
  {
    id: "condition",
    label: "条件判断",
    file: "number.py",
    prompt: "输入一个整数",
    placeholder: "例如：8",
    initial: "8",
    code: 'number = int(input("请输入一个整数："))\nif number % 2 == 0:\n    print("这是一个偶数")\nelse:\n    print("这是一个奇数")',
  },
  {
    id: "loop",
    label: "循环结构",
    file: "loop.py",
    prompt: "设置循环次数（1–8）",
    placeholder: "例如：5",
    initial: "5",
    code: 'count = int(input("循环次数："))\nfor number in range(1, count + 1):\n    print(number)\nprint("循环完成！")',
  },
] as const;

type ExampleId = (typeof examples)[number]["id"];

export default function HeroPythonLab() {
  const [activeId, setActiveId] = useState<ExampleId>("hello");
  const [input, setInput] = useState("Python");
  const [output, setOutput] = useState("点击「运行示例」，在这里查看程序输出。");
  const [hasRun, setHasRun] = useState(false);

  const activeExample = examples.find((item) => item.id === activeId) ?? examples[0];

  function chooseExample(id: ExampleId) {
    const next = examples.find((item) => item.id === id) ?? examples[0];
    setActiveId(id);
    setInput(next.initial);
    setOutput("示例已切换，准备好后点击运行。");
    setHasRun(false);
  }

  function runExample() {
    if (activeId === "hello") {
      const name = input.trim() || "同学";
      setOutput(`请输入姓名：${name}\nHello, ${name}!\n欢迎来到 CODE ARCHIVE。`);
    } else if (activeId === "condition") {
      const number = Number(input);
      if (!input.trim() || !Number.isInteger(number)) {
        setOutput("输入错误：请输入一个有效的整数。");
      } else {
        setOutput(`请输入一个整数：${number}\n${number} 是${number % 2 === 0 ? "偶数" : "奇数"}。`);
      }
    } else {
      const count = Number(input);
      if (!input.trim() || !Number.isInteger(count) || count < 1 || count > 8) {
        setOutput("输入错误：请输入 1 到 8 之间的整数。");
      } else {
        setOutput(`循环次数：${count}\n${Array.from({ length: count }, (_, index) => index + 1).join("\n")}\n循环完成！`);
      }
    }
    setHasRun(true);
  }

  function resetExample() {
    setInput(activeExample.initial);
    setOutput("已重置。点击「运行示例」再次体验。");
    setHasRun(false);
  }

  return (
    <section className="hero-code-card hero-python-lab" aria-label="Python 交互实验台">
      <div className="lab-topbar">
        <div className="lab-window-dots"><i /><i /><i /></div>
        <span className="lab-file-name">{activeExample.file}</span>
        <span className="lab-live"><i /> INTERACTIVE</span>
      </div>

      <div className="lab-heading">
        <div><span className="lab-kicker">PYTHON PLAYGROUND / 01</span><strong>动手试一段代码</strong></div>
        <span className="lab-version">PY 3</span>
      </div>

      <div className="lab-tabs" role="tablist" aria-label="选择 Python 示例">
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

      <div className="lab-editor" aria-live="polite">
        <div className="lab-line-numbers">
          {activeExample.code.split("\n").map((_, index) => <span key={index}>{String(index + 1).padStart(2, "0")}</span>)}
        </div>
        <pre>{activeExample.code}</pre>
      </div>

      <label className="lab-input-label" htmlFor="hero-lab-input">{activeExample.prompt}</label>
      <div className="lab-input-row">
        <input
          id="hero-lab-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") runExample(); }}
          placeholder={activeExample.placeholder}
        />
        <button type="button" className="lab-run-button" onClick={runExample}><span>▶</span> 运行示例</button>
      </div>

      <div className="lab-output">
        <div className="lab-output-heading"><span>TERMINAL / OUTPUT</span><span className={hasRun ? "lab-output-status done" : "lab-output-status"}>{hasRun ? "FINISHED" : "READY"}</span></div>
        <pre aria-live="polite">{output}</pre>
      </div>

      <div className="lab-bottom">
        <span>点击示例 · 修改输入 · 查看结果</span>
        <button type="button" onClick={resetExample}>重置 ↺</button>
      </div>
      <p className="lab-disclaimer">交互演示 · 输出由页面逻辑模拟，非真实 Python 解释器</p>
    </section>
  );
}
