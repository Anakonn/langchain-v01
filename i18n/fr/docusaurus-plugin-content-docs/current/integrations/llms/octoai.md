---
translated: true
---

# OctoAI

[OctoAI](https://docs.octoai.cloud/docs) offre un accès facile à un calcul efficace et permet aux utilisateurs d'intégrer le modèle d'IA de leur choix dans leurs applications. Le service de calcul `OctoAI` vous aide à exécuter, à optimiser et à mettre à l'échelle vos applications d'IA facilement.

Cet exemple explique comment utiliser LangChain pour interagir avec les [points de terminaison LLM](https://octoai.cloud/templates) d'`OctoAI`.

## Configuration

Pour exécuter notre application d'exemple, il y a deux étapes simples à suivre :

1. Obtenez un jeton d'API à partir de [votre page de compte OctoAI](https://octoai.cloud/settings).

2. Collez votre clé d'API dans la cellule de code ci-dessous.

Remarque : Si vous souhaitez utiliser un modèle LLM différent, vous pouvez conteneuriser le modèle et créer un point de terminaison OctoAI personnalisé en suivant les instructions [Créer un conteneur à partir de Python](https://octo.ai/docs/bring-your-own-model/advanced-build-a-container-from-scratch-in-python) et [Créer un point de terminaison personnalisé à partir d'un conteneur](https://octo.ai/docs/bring-your-own-model/create-custom-endpoints-from-a-container/create-custom-endpoints-from-a-container), puis mettre à jour votre variable d'environnement `OCTOAI_API_BASE`.

```python
import os

os.environ["OCTOAI_API_TOKEN"] = "OCTOAI_API_TOKEN"
```

```python
from langchain.chains import LLMChain
from langchain_community.llms.octoai_endpoint import OctoAIEndpoint
from langchain_core.prompts import PromptTemplate
```

## Exemple

```python
template = """Below is an instruction that describes a task. Write a response that appropriately completes the request.\n Instruction:\n{question}\n Response: """
prompt = PromptTemplate.from_template(template)
```

```python
llm = OctoAIEndpoint(
    model="llama-2-13b-chat-fp16",
    max_tokens=200,
    presence_penalty=0,
    temperature=0.1,
    top_p=0.9,
)
```

```python
question = "Who was Leonardo da Vinci?"

llm_chain = LLMChain(prompt=prompt, llm=llm)

print(llm_chain.run(question))
```

Léonard de Vinci était un véritable homme de la Renaissance. Il est né en 1452 à Vinci, en Italie, et était connu pour ses travaux dans divers domaines, notamment l'art, la science, l'ingénierie et les mathématiques. Il est considéré comme l'un des plus grands peintres de tous les temps, et ses œuvres les plus célèbres sont la Joconde et La Cène. En plus de son art, de Vinci a apporté des contributions importantes à l'ingénierie et à l'anatomie, et ses conceptions de machines et d'inventions étaient des siècles en avance sur leur temps. Il est également connu pour ses journaux et ses dessins extensifs, qui fournissent des informations précieuses sur ses pensées et ses idées. L'héritage de Léonard de Vinci continue d'inspirer et d'influencer les artistes, les scientifiques et les penseurs du monde entier aujourd'hui.
