---
translated: true
---

# Python REPL

때로는 복잡한 계산의 경우, LLM이 직접 답변을 생성하는 것보다 LLM이 답변을 계산하는 코드를 생성하고 해당 코드를 실행하여 답변을 얻는 것이 더 좋습니다. 이를 쉽게 수행할 수 있도록 간단한 Python REPL을 제공합니다.

이 인터페이스는 출력된 내용만 반환합니다. 따라서 답변을 계산하려면 답변을 출력하도록 해야 합니다.

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
