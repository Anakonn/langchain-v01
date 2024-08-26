---
translated: true
---

# Python REPL

A veces, para cálculos complejos, en lugar de que un LLM genere la respuesta directamente, puede ser mejor que el LLM genere código para calcular la respuesta y luego ejecute ese código para obtener la respuesta. Para hacer esto fácilmente, proporcionamos un simple Python REPL para ejecutar comandos.

Esta interfaz solo devolverá las cosas que se impriman, por lo tanto, si quieres usarla para calcular una respuesta, asegúrate de que imprima la respuesta.

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
