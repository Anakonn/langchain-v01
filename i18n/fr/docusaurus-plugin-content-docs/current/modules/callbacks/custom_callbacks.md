---
translated: true
---

# Gestionnaires de rappel personnalisés

Pour créer un gestionnaire de rappel personnalisé, nous devons déterminer l'(les) événement(s) que nous voulons que notre gestionnaire de rappel gère, ainsi que ce que nous voulons que notre gestionnaire de rappel fasse lorsque l'événement est déclenché. Ensuite, tout ce que nous avons à faire est d'attacher le gestionnaire de rappel à l'objet, soit comme un rappel de constructeur, soit comme un rappel de requête (voir les [types de rappels](/docs/modules/callbacks/)).

Dans l'exemple ci-dessous, nous allons mettre en œuvre le streaming avec un gestionnaire personnalisé.

Dans notre gestionnaire de rappel personnalisé `MyCustomHandler`, nous implémentons `on_llm_new_token` pour imprimer le jeton que nous venons de recevoir. Nous attachons ensuite notre gestionnaire personnalisé à l'objet du modèle en tant que rappel de constructeur.

```python
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI


class MyCustomHandler(BaseCallbackHandler):
    def on_llm_new_token(self, token: str, **kwargs) -> None:
        print(f"My custom handler, token: {token}")


prompt = ChatPromptTemplate.from_messages(["Tell me a joke about {animal}"])

# To enable streaming, we pass in `streaming=True` to the ChatModel constructor
# Additionally, we pass in our custom handler as a list to the callbacks parameter
model = ChatOpenAI(streaming=True, callbacks=[MyCustomHandler()])

chain = prompt | model

response = chain.invoke({"animal": "bears"})
```

```output
My custom handler, token:
My custom handler, token: Why
My custom handler, token:  do
My custom handler, token:  bears
My custom handler, token:  have
My custom handler, token:  hairy
My custom handler, token:  coats
My custom handler, token: ?


My custom handler, token: F
My custom handler, token: ur
My custom handler, token:  protection
My custom handler, token: !
My custom handler, token:
```
