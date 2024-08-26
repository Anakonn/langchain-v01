---
translated: true
---

# Alibaba Cloud PAI EAS

>[Plateforme de machine learning pour l'IA d'Alibaba Cloud](https://www.alibabacloud.com/help/en/pai) est une plateforme d'ingénierie de machine learning ou de deep learning destinée aux entreprises et aux développeurs. Elle fournit des plug-ins faciles à utiliser, rentables, haute performance et faciles à mettre à l'échelle, qui peuvent être appliqués à divers scénarios industriels. Avec plus de 140 algorithmes d'optimisation intégrés, `Plateforme de machine learning pour l'IA` offre des capacités d'ingénierie AI complètes, notamment l'étiquetage des données (`PAI-iTAG`), la construction de modèles (`PAI-Designer` et `PAI-DSW`), l'entraînement des modèles (`PAI-DLC`), l'optimisation de la compilation et le déploiement de l'inférence (`PAI-EAS`). `PAI-EAS` prend en charge différents types de ressources matérielles, notamment les processeurs et les GPU, et offre un débit élevé et une latence faible. Il vous permet de déployer des modèles complexes à grande échelle en quelques clics et d'effectuer des mises à l'échelle élastiques en temps réel. Il fournit également un système complet de gestion et de surveillance.

```python
from langchain.chains import LLMChain
from langchain_community.llms.pai_eas_endpoint import PaiEasEndpoint
from langchain_core.prompts import PromptTemplate

template = """Question: {question}

Answer: Let's think step by step."""

prompt = PromptTemplate.from_template(template)
```

Quiconque souhaite utiliser les LLM EAS doit d'abord configurer le service EAS. Lorsque le service EAS est lancé, `EAS_SERVICE_URL` et `EAS_SERVICE_TOKEN` peuvent être obtenus. Les utilisateurs peuvent se référer à https://www.alibabacloud.com/help/en/pai/user-guide/service-deployment/ pour plus d'informations.

```python
import os

os.environ["EAS_SERVICE_URL"] = "Your_EAS_Service_URL"
os.environ["EAS_SERVICE_TOKEN"] = "Your_EAS_Service_Token"
llm = PaiEasEndpoint(
    eas_service_url=os.environ["EAS_SERVICE_URL"],
    eas_service_token=os.environ["EAS_SERVICE_TOKEN"],
)
```

```python
llm_chain = prompt | llm

question = "What NFL team won the Super Bowl in the year Justin Beiber was born?"
llm_chain.invoke({"question": question})
```

```output
'  Thank you for asking! However, I must respectfully point out that the question contains an error. Justin Bieber was born in 1994, and the Super Bowl was first played in 1967. Therefore, it is not possible for any NFL team to have won the Super Bowl in the year Justin Bieber was born.\n\nI hope this clarifies things! If you have any other questions, please feel free to ask.'
```
