---
translated: true
---

# Baseten

[Baseten](https://baseten.co) est un [fournisseur](/docs/integrations/providers/baseten) dans l'écosystème LangChain qui implémente le composant LLMs.

Cet exemple montre comment utiliser un LLM - Mistral 7B hébergé sur Baseten - avec LangChain.

# Configuration

Pour exécuter cet exemple, vous aurez besoin :

* D'un [compte Baseten](https://baseten.co)
* D'une [clé API](https://docs.baseten.co/observability/api-keys)

Exportez votre clé API dans votre environnement sous la variable `BASETEN_API_KEY`.

```sh
export BASETEN_API_KEY="paste_your_api_key_here"
```

# Appel de modèle unique

Tout d'abord, vous devrez déployer un modèle sur Baseten.

Vous pouvez déployer des modèles de base comme Mistral et Llama 2 en un clic à partir de la [bibliothèque de modèles Baseten](https://app.baseten.co/explore/) ou si vous avez votre propre modèle, [déployez-le avec Truss](https://truss.baseten.co/welcome).

Dans cet exemple, nous allons travailler avec Mistral 7B. [Déployez Mistral 7B ici](https://app.baseten.co/explore/mistral_7b_instruct) et suivez l'ID du modèle déployé, que vous trouverez dans le tableau de bord du modèle.

```python
from langchain_community.llms import Baseten
```

```python
# Load the model
mistral = Baseten(model="MODEL_ID", deployment="production")
```

```python
# Prompt the model
mistral("What is the Mistral wind?")
```

# Appels de modèle en chaîne

Nous pouvons enchaîner plusieurs appels à un ou plusieurs modèles, ce qui est tout l'intérêt de Langchain !

Par exemple, nous pouvons remplacer GPT par Mistral dans cette démonstration d'émulation de terminal.

```python
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferWindowMemory
from langchain_core.prompts import PromptTemplate

template = """Assistant is a large language model trained by OpenAI.

Assistant is designed to be able to assist with a wide range of tasks, from answering simple questions to providing in-depth explanations and discussions on a wide range of topics. As a language model, Assistant is able to generate human-like text based on the input it receives, allowing it to engage in natural-sounding conversations and provide responses that are coherent and relevant to the topic at hand.

Assistant is constantly learning and improving, and its capabilities are constantly evolving. It is able to process and understand large amounts of text, and can use this knowledge to provide accurate and informative responses to a wide range of questions. Additionally, Assistant is able to generate its own text based on the input it receives, allowing it to engage in discussions and provide explanations and descriptions on a wide range of topics.

Overall, Assistant is a powerful tool that can help with a wide range of tasks and provide valuable insights and information on a wide range of topics. Whether you need help with a specific question or just want to have a conversation about a particular topic, Assistant is here to assist.

{history}
Human: {human_input}
Assistant:"""

prompt = PromptTemplate(input_variables=["history", "human_input"], template=template)


chatgpt_chain = LLMChain(
    llm=mistral,
    llm_kwargs={"max_length": 4096},
    prompt=prompt,
    verbose=True,
    memory=ConversationBufferWindowMemory(k=2),
)

output = chatgpt_chain.predict(
    human_input="I want you to act as a Linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. Do not write explanations. Do not type commands unless I instruct you to do so. When I need to tell you something in English I will do so by putting text inside curly brackets {like this}. My first command is pwd."
)
print(output)
```

```python
output = chatgpt_chain.predict(human_input="ls ~")
print(output)
```

```python
output = chatgpt_chain.predict(human_input="cd ~")
print(output)
```

```python
output = chatgpt_chain.predict(
    human_input="""echo -e "x=lambda y:y*5+3;print('Result:' + str(x(6)))" > run.py && python3 run.py"""
)
print(output)
```

Comme nous pouvons le voir dans le dernier exemple, qui produit un nombre qui peut être correct ou non, le modèle n'approxime que la sortie de terminal la plus probable, sans exécuter réellement les commandes fournies. Néanmoins, l'exemple démontre la fenêtre de contexte abondante de Mistral, ses capacités de génération de code et sa capacité à rester dans le sujet, même dans des séquences conversationnelles.
