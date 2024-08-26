---
translated: true
---

# Python REPL

時には、複雑な計算をする場合、LLMに直接答えを生成させるよりも、LLMにコードを生成させ、それを実行して答えを得る方が良い場合があります。それを簡単に行うために、コマンドを実行できる簡単な Python REPL を提供しています。

このインターフェイスは、印刷されたものだけを返します。したがって、答えを計算するために使用する場合は、答えを印刷するようにしてください。

```python
from langchain.agents import Tool
from langchain_experimental.utilities import PythonREPL
```

```python
python_repl = PythonREPL()
```

```python
python_repl.run("print(1+1)")
```

```output
Python REPL can execute arbitrary code. Use with caution.
```

```output
'2\n'
```

```python
# You can create the tool to pass to an agent
repl_tool = Tool(
    name="python_repl",
    description="A Python shell. Use this to execute python commands. Input should be a valid python command. If you want to see the output of a value, you should print it out with `print(...)`.",
    func=python_repl.run,
)
```
