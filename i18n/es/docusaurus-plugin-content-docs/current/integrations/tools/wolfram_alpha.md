---
translated: true
---

# Wolfram Alpha

Este cuaderno explica cómo usar el componente wolfram alpha.

Primero, debes configurar tu cuenta de desarrollador de Wolfram Alpha y obtener tu ID de aplicación:

1. Ve a wolfram alpha y regístrate para obtener una cuenta de desarrollador [here](https://developer.wolframalpha.com/)
2. Crea una aplicación y obtén tu ID de aplicación
3. pip install wolframalpha

Luego deberemos establecer algunas variables de entorno:
1. Guarda tu ID de aplicación en la variable de entorno WOLFRAM_ALPHA_APPID

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
