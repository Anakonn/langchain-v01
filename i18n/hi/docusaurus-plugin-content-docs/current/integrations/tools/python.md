---
translated: true
---

# पायथन REPL

कभी-कभी, जटिल गणनाओं के लिए, एक LLM को सीधे उत्तर उत्पन्न करने के बजाय, यह बेहतर हो सकता है कि LLM को उत्तर की गणना करने के लिए कोड उत्पन्न करने दें, और फिर उस कोड को चलाकर उत्तर प्राप्त करें। इसे आसानी से करने के लिए, हम उत्तर प्राप्त करने के लिए कमांड चलाने के लिए एक सरल पायथन REPL प्रदान करते हैं।

यह इंटरफ़ेस केवल प्रिंट किए गए चीजों को वापस करेगा - इसलिए, यदि आप इसका उपयोग उत्तर की गणना करने के लिए करना चाहते हैं, तो सुनिश्चित करें कि यह उत्तर को प्रिंट करता है।

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
