---
translated: true
---

# Jeu de données Power BI

Ce cahier présente un agent interagissant avec un `jeu de données Power BI`. L'agent répond à des questions plus générales sur un jeu de données, ainsi que récupère à partir d'erreurs.

Notez que, comme cet agent est en développement actif, toutes les réponses peuvent ne pas être correctes. Il fonctionne contre le [point de terminaison executequery](https://learn.microsoft.com/en-us/rest/api/power-bi/datasets/execute-queries), qui ne permet pas les suppressions.

### Notes :

- Il s'appuie sur l'authentification avec le package azure.identity, qui peut être installé avec `pip install azure-identity`. Vous pouvez également créer le jeu de données Power BI avec un jeton sous forme de chaîne sans fournir les informations d'identification.
- Vous pouvez également fournir un nom d'utilisateur à usurper pour une utilisation avec des jeux de données qui ont l'option RLS activée.
- La boîte à outils utilise un LLM pour créer la requête à partir de la question, l'agent utilise le LLM pour l'exécution globale.
- Les tests ont été effectués principalement avec un modèle `gpt-3.5-turbo-instruct`, les modèles codex ne semblaient pas très performants.

## Initialisation

```python
from azure.identity import DefaultAzureCredential
from langchain_community.agent_toolkits import PowerBIToolkit, create_pbi_agent
from langchain_community.utilities.powerbi import PowerBIDataset
from langchain_openai import ChatOpenAI
```

```python
fast_llm = ChatOpenAI(
    temperature=0.5, max_tokens=1000, model_name="gpt-3.5-turbo", verbose=True
)
smart_llm = ChatOpenAI(temperature=0, max_tokens=100, model_name="gpt-4", verbose=True)

toolkit = PowerBIToolkit(
    powerbi=PowerBIDataset(
        dataset_id="<dataset_id>",
        table_names=["table1", "table2"],
        credential=DefaultAzureCredential(),
    ),
    llm=smart_llm,
)

agent_executor = create_pbi_agent(
    llm=fast_llm,
    toolkit=toolkit,
    verbose=True,
)
```

## Exemple : description d'une table

```python
agent_executor.run("Describe table1")
```

## Exemple : requête simple sur une table

Dans cet exemple, l'agent parvient à trouver la requête correcte pour obtenir le nombre de lignes de la table.

```python
agent_executor.run("How many records are in table1?")
```

## Exemple : exécution de requêtes

```python
agent_executor.run("How many records are there by dimension1 in table2?")
```

```python
agent_executor.run("What unique values are there for dimensions2 in table2")
```

## Exemple : ajoutez vos propres prompts few-shot

```python
# fictional example
few_shots = """
Question: How many rows are in the table revenue?
DAX: EVALUATE ROW("Number of rows", COUNTROWS(revenue_details))
----
Question: How many rows are in the table revenue where year is not empty?
DAX: EVALUATE ROW("Number of rows", COUNTROWS(FILTER(revenue_details, revenue_details[year] <> "")))
----
Question: What was the average of value in revenue in dollars?
DAX: EVALUATE ROW("Average", AVERAGE(revenue_details[dollar_value]))
----
"""
toolkit = PowerBIToolkit(
    powerbi=PowerBIDataset(
        dataset_id="<dataset_id>",
        table_names=["table1", "table2"],
        credential=DefaultAzureCredential(),
    ),
    llm=smart_llm,
    examples=few_shots,
)
agent_executor = create_pbi_agent(
    llm=fast_llm,
    toolkit=toolkit,
    verbose=True,
)
```

```python
agent_executor.run("What was the maximum of value in revenue in dollars in 2022?")
```
