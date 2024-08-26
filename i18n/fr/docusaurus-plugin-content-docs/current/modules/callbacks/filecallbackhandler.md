---
translated: true
---

# Journalisation de fichiers

LangChain fournit le `FileCallbackHandler` pour écrire des journaux dans un fichier. Le `FileCallbackHandler` est similaire au [`StdOutCallbackHandler`](/docs/modules/callbacks/), mais au lieu d'imprimer les journaux sur la sortie standard, il les écrit dans un fichier.

Nous voyons comment utiliser le `FileCallbackHandler` dans cet exemple. De plus, nous utilisons le `StdOutCallbackHandler` pour imprimer les journaux sur la sortie standard. Il utilise également la bibliothèque `loguru` pour journaliser d'autres sorties qui ne sont pas capturées par le gestionnaire.

```python
from langchain_core.callbacks import FileCallbackHandler, StdOutCallbackHandler
from langchain_core.prompts import PromptTemplate
from langchain_openai import OpenAI
from loguru import logger

logfile = "output.log"

logger.add(logfile, colorize=True, enqueue=True)
handler_1 = FileCallbackHandler(logfile)
handler_2 = StdOutCallbackHandler()

prompt = PromptTemplate.from_template("1 + {number} = ")
model = OpenAI()

# this chain will both print to stdout (because verbose=True) and write to 'output.log'
# if verbose=False, the FileCallbackHandler will still write to 'output.log'
chain = prompt | model

response = chain.invoke({"number": 2}, {"callbacks": [handler_1, handler_2]})
logger.info(response)
```

```output


[1m> Entering new LLMChain chain...[0m
Prompt after formatting:
[32;1m[1;3m1 + 2 = [0m

[32m2023-06-01 18:36:38.929[0m | [1mINFO    [0m | [36m__main__[0m:[36m<module>[0m:[36m20[0m - [1m

3[0m


[1m> Finished chain.[0m
```

Maintenant, nous pouvons ouvrir le fichier `output.log` pour voir que la sortie a été capturée.

```python
%pip install --upgrade --quiet  ansi2html > /dev/null
```

```python
from ansi2html import Ansi2HTMLConverter
from IPython.display import HTML, display

with open("output.log", "r") as f:
    content = f.read()

conv = Ansi2HTMLConverter()
html = conv.convert(content, full=True)

display(HTML(html))
```

```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title></title>
<style type="text/css">
.ansi2html-content { display: inline; white-space: pre-wrap; word-wrap: break-word; }
.body_foreground { color: #AAAAAA; }
.body_background { background-color: #000000; }
.inv_foreground { color: #000000; }
.inv_background { background-color: #AAAAAA; }
.ansi1 { font-weight: bold; }
.ansi3 { font-style: italic; }
.ansi32 { color: #00aa00; }
.ansi36 { color: #00aaaa; }
</style>
</head>
<body class="body_foreground body_background" style="font-size: normal;" >
<pre class="ansi2html-content">


<span class="ansi1">&gt; Entering new LLMChain chain...</span>
Prompt after formatting:
<span class="ansi1 ansi32"></span><span class="ansi1 ansi3 ansi32">1 + 2 = </span>

<span class="ansi1">&gt; Finished chain.</span>
<span class="ansi32">2023-06-01 18:36:38.929</span> | <span class="ansi1">INFO    </span> | <span class="ansi36">__main__</span>:<span class="ansi36">&lt;module&gt;</span>:<span class="ansi36">20</span> - <span class="ansi1">

3</span>

</pre>
</body>

</html>

```
