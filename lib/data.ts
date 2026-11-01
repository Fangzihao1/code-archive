import type { Exercise } from "./types";

export const seedExercises: Exercise[] = [
  {
    id: "1",
    slug: "hello-python",
    title: "Python 基础输入输出练习",
    summary: "通过 input() 和 print() 熟悉程序的基本输入与输出。",
    category: "基础语法",
    tags: ["input()", "print()", "变量"],
    date: "2026-10-20",
    code: `name = input("请输入姓名：")\nage = int(input("请输入年龄："))\n\nprint("你好，" + name)\nprint("明年你将", age + 1, "岁")`,
    stdin: "小明\n18",
    expected: "你好，小明\n明年你将 19 岁",
    description: "编写一个简单的 Python 程序，接收用户输入的姓名和年龄，并输出问候语以及下一年的年龄。",
    learning: "理解 input() 的输入方式、变量赋值、int() 类型转换，以及 print() 的输出方式。",
    allowRun: true,
    externalUrl: "https://www.online-python.com/",
    published: true
  },
  {
    id: "2",
    slug: "if-else-practice",
    title: "条件判断基础练习",
    summary: "使用 if、elif 和 else 根据输入条件输出不同结果。",
    category: "条件判断",
    tags: ["if", "elif", "else"],
    date: "2026-10-18",
    code: `score = int(input("请输入成绩："))\n\nif score >= 90:\n    print("优秀")\nelif score >= 60:\n    print("合格")\nelse:\n    print("继续努力")`,
    stdin: "85",
    expected: "优秀",
    description: "输入一个成绩，根据成绩区间判断并输出对应评价。",
    learning: "掌握条件表达式、比较运算符以及多分支结构的基本使用。",
    allowRun: true,
    externalUrl: "https://www.online-python.com/",
    published: true
  },
  {
    id: "3",
    slug: "for-loop-practice",
    title: "for 循环求和练习",
    summary: "通过 for 循环计算指定范围内整数的累加结果。",
    category: "循环结构",
    tags: ["for", "range()", "累加"],
    date: "2026-10-15",
    code: `n = int(input("请输入一个正整数："))\ntotal = 0\n\nfor i in range(1, n + 1):\n    total += i\n\nprint("累加结果：", total)`,
    stdin: "10",
    expected: "累加结果： 55",
    description: "输入一个正整数 n，使用循环计算从 1 到 n 的所有整数之和。",
    learning: "理解 for 循环、range() 的使用方式，以及累加变量的初始化和更新。",
    allowRun: true,
    externalUrl: "https://www.online-python.com/",
    published: true
  }
];
