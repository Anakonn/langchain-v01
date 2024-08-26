---
sidebar_label: Alibaba Cloud PAI EAS
translated: true
---

# Alibaba Cloud PAI EAS

>[Alibaba Cloud PAI (Platform for AI)](https://www.alibabacloud.com/help/en/pai/?spm=a2c63.p38356.0.0.c26a426ckrxUwZ) est une plateforme d'apprentissage automatique légère et rentable qui utilise des technologies cloud-native. Elle vous fournit un service de modélisation de bout en bout. Elle accélère l'entraînement des modèles en se basant sur des dizaines de milliards de caractéristiques et des centaines de milliards d'échantillons dans plus de 100 scénarios.

>[Machine Learning Platform for AI d'Alibaba Cloud](https://www.alibabacloud.com/help/en/machine-learning-platform-for-ai/latest/what-is-machine-learning-pai) est une plateforme d'ingénierie d'apprentissage automatique ou d'apprentissage en profondeur destinée aux entreprises et aux développeurs. Elle fournit des plug-ins faciles à utiliser, rentables, haute performance et faciles à mettre à l'échelle, qui peuvent être appliqués à divers scénarios industriels. Avec plus de 140 algorithmes d'optimisation intégrés, `Machine Learning Platform for AI` offre des capacités d'ingénierie AI complètes, notamment l'étiquetage des données (`PAI-iTAG`), la construction de modèles (`PAI-Designer` et `PAI-DSW`), l'entraînement des modèles (`PAI-DLC`), l'optimisation de la compilation et le déploiement de l'inférence (`PAI-EAS`).

>`PAI-EAS` prend en charge différents types de ressources matérielles, notamment les processeurs et les cartes graphiques, et offre un débit élevé et une latence faible. Il vous permet de déployer des modèles complexes à grande échelle en quelques clics et d'effectuer des mises à l'échelle élastiques en temps réel. Il fournit également un système complet de gestion et de surveillance.

## Configuration du service EAS

Définissez les variables d'environnement pour initialiser l'URL et le jeton du service EAS.
Utilisez [ce document](https://www.alibabacloud.com/help/en/pai/user-guide/service-deployment/) pour plus d'informations.

```bash
export EAS_SERVICE_URL=XXX
export EAS_SERVICE_TOKEN=XXX
```

Une autre option consiste à utiliser ce code :

```python
import os

from langchain_community.chat_models import PaiEasChatEndpoint
from langchain_core.language_models.chat_models import HumanMessage

os.environ["EAS_SERVICE_URL"] = "Your_EAS_Service_URL"
os.environ["EAS_SERVICE_TOKEN"] = "Your_EAS_Service_Token"
chat = PaiEasChatEndpoint(
    eas_service_url=os.environ["EAS_SERVICE_URL"],
    eas_service_token=os.environ["EAS_SERVICE_TOKEN"],
)
```

## Exécution du modèle de chat

Vous pouvez utiliser les paramètres par défaut pour appeler le service EAS comme suit :

```python
output = chat.invoke([HumanMessage(content="write a funny joke")])
print("output:", output)
```

Ou, appelez le service EAS avec de nouveaux paramètres d'inférence :

```python
kwargs = {"temperature": 0.8, "top_p": 0.8, "top_k": 5}
output = chat.invoke([HumanMessage(content="write a funny joke")], **kwargs)
print("output:", output)
```

Ou, exécutez un appel en flux pour obtenir une réponse en flux :

```python
outputs = chat.stream([HumanMessage(content="hi")], streaming=True)
for output in outputs:
    print("stream output:", output)
```
