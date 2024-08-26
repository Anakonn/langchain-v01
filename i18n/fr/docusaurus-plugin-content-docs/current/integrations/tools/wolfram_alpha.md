---
translated: true
---

# Wolfram Alpha

Ce cahier passe en revue comment utiliser le composant wolfram alpha.

Tout d'abord, vous devez configurer votre compte développeur Wolfram Alpha et obtenir votre ID D'APPLICATION :

1. Allez sur wolfram alpha et inscrivez-vous pour un compte développeur [ici](https://developer.wolframalpha.com/)
2. Créez une application et obtenez votre ID D'APPLICATION
3. pip install wolframalpha

Ensuite, nous devrons définir quelques variables d'environnement :
1. Enregistrez votre ID D'APPLICATION dans la variable d'environnement WOLFRAM_ALPHA_APPID

```python
pip install wolframalpha
```

```python
import os

os.environ["WOLFRAM_ALPHA_APPID"] = ""
```

```python
from langchain_community.utilities.wolfram_alpha import WolframAlphaAPIWrapper
```

```python
wolfram = WolframAlphaAPIWrapper()
```

```python
wolfram.run("What is 2x+5 = -3x + 7?")
```

```output
'x = 2/5'
```
