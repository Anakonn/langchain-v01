---
translated: true
---

# Yuan2.0

[Yuan2.0](https://github.com/IEIT-Yuan/Yuan-2.0) est un modèle de langage de grande taille de nouvelle génération développé par le système IEIT. Nous avons publié les trois modèles Yuan 2.0-102B, Yuan 2.0-51B et Yuan 2.0-2B. Et nous fournissons des scripts pertinents pour le pré-entraînement, l'ajustement fin et les services d'inférence pour d'autres développeurs. Yuan2.0 est basé sur Yuan1.0, en utilisant une gamme plus large de données de pré-entraînement de haute qualité et de jeux de données d'ajustement fin des instructions pour améliorer la compréhension du modèle de la sémantique, des mathématiques, du raisonnement, du code, des connaissances et d'autres aspects.

Cet exemple explique comment utiliser LangChain pour interagir avec l'inférence `Yuan2.0`(2B/51B/102B) pour la génération de texte.

Yuan2.0 a mis en place un service d'inférence afin que l'utilisateur n'ait qu'à demander l'API d'inférence pour obtenir le résultat, ce qui est présenté dans [Yuan2.0 Inference-Server](https://github.com/IEIT-Yuan/Yuan-2.0/blob/main/docs/inference_server.md).

```python
from langchain.chains import LLMChain
from langchain_community.llms.yuan2 import Yuan2
```

```python
# default infer_api for a local deployed Yuan2.0 inference server
infer_api = "http://127.0.0.1:8000/yuan"

# direct access endpoint in a proxied environment
# import os
# os.environ["no_proxy"]="localhost,127.0.0.1,::1"

yuan_llm = Yuan2(
    infer_api=infer_api,
    max_tokens=2048,
    temp=1.0,
    top_p=0.9,
    use_history=False,
)

# turn on use_history only when you want the Yuan2.0 to keep track of the conversation history
# and send the accumulated context to the backend model api, which make it stateful. By default it is stateless.
# llm.use_history = True
```

```python
question = "请介绍一下中国。"
```

```python
print(yuan_llm.invoke(question))
```
