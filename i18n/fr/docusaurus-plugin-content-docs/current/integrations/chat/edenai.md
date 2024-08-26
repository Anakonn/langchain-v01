---
translated: true
---

# Eden AI

Eden AI révolutionne le paysage de l'IA en réunissant les meilleurs fournisseurs d'IA, permettant aux utilisateurs de débloquer des possibilités illimitées et d'exploiter tout le potentiel de l'intelligence artificielle. Avec une plateforme tout-en-un complète et sans tracas, elle permet aux utilisateurs de déployer des fonctionnalités d'IA en production à la vitesse de l'éclair, offrant un accès sans effort à toute la gamme des capacités de l'IA via une seule API. (site web : https://edenai.co/)

Cet exemple explique comment utiliser LangChain pour interagir avec les modèles Eden AI

-----------------------------------------------------------------------------------

`EdenAI` va au-delà de la simple invocation de modèle. Il vous donne accès à des fonctionnalités avancées, notamment :

- **Fournisseurs multiples** : Accédez à une gamme diversifiée de modèles de langage proposés par différents fournisseurs, vous donnant la liberté de choisir le modèle le mieux adapté à votre cas d'utilisation.

- **Mécanisme de secours** : Définissez un mécanisme de secours pour assurer un fonctionnement sans faille même si le fournisseur principal n'est pas disponible, vous pouvez facilement passer à un fournisseur alternatif.

- **Suivi de l'utilisation** : Suivez les statistiques d'utilisation par projet et par clé API. Cette fonctionnalité vous permet de surveiller et de gérer efficacement la consommation des ressources.

- **Surveillance et observabilité** : `EdenAI` fournit des outils de surveillance et d'observabilité complets sur la plateforme. Surveillez les performances de vos modèles de langage, analysez les tendances d'utilisation et obtenez des informations précieuses pour optimiser vos applications.

L'accès à l'API EDENAI nécessite une clé API,

que vous pouvez obtenir en créant un compte https://app.edenai.run/user/register et en vous rendant ici https://app.edenai.run/admin/iam/api-keys

Une fois que nous avons une clé, nous voudrons la définir en tant que variable d'environnement en exécutant :

```bash
export EDENAI_API_KEY="..."
```

Vous pouvez trouver plus de détails dans la référence de l'API : https://docs.edenai.co/reference

Si vous préférez ne pas définir de variable d'environnement, vous pouvez transmettre la clé directement via le paramètre nommé edenai_api_key

lors de l'initialisation de la classe EdenAI Chat Model.

```python
from langchain_community.chat_models.edenai import ChatEdenAI
from langchain_core.messages import HumanMessage
```

```python
chat = ChatEdenAI(
    edenai_api_key="...", provider="openai", temperature=0.2, max_tokens=250
)
```

```python
messages = [HumanMessage(content="Hello !")]
chat.invoke(messages)
```

```output
AIMessage(content='Hello! How can I assist you today?')
```

```python
await chat.ainvoke(messages)
```

```output
AIMessage(content='Hello! How can I assist you today?')
```

## Streaming et traitement par lots

`ChatEdenAI` prend en charge le streaming et le traitement par lots. Voici un exemple.

```python
for chunk in chat.stream(messages):
    print(chunk.content, end="", flush=True)
```

```output
Hello! How can I assist you today?
```

```python
chat.batch([messages])
```

```output
[AIMessage(content='Hello! How can I assist you today?')]
```

## Mécanisme de secours

Avec Eden AI, vous pouvez définir un mécanisme de secours pour assurer un fonctionnement sans faille même si le fournisseur principal n'est pas disponible, vous pouvez facilement passer à un fournisseur alternatif.

```python
chat = ChatEdenAI(
    edenai_api_key="...",
    provider="openai",
    temperature=0.2,
    max_tokens=250,
    fallback_providers="google",
)
```

Dans cet exemple, vous pouvez utiliser Google comme fournisseur de secours si OpenAI rencontre des problèmes.

Pour plus d'informations et de détails sur Eden AI, consultez ce lien : https://docs.edenai.co/docs/additional-parameters

## Enchaînement d'appels

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template(
    "What is a good name for a company that makes {product}?"
)
chain = prompt | chat
```

```python
chain.invoke({"product": "healthy snacks"})
```

```output
AIMessage(content='VitalBites')
```
