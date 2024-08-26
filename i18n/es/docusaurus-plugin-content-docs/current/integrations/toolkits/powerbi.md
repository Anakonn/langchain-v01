---
translated: true
---

# Conjunto de datos de PowerBI

Este cuaderno muestra a un agente interactuando con un `Conjunto de datos de Power BI`. El agente está respondiendo preguntas más generales sobre un conjunto de datos, así como recuperándose de errores.

Tenga en cuenta que, como este agente está en desarrollo activo, es posible que no todas las respuestas sean correctas. Se ejecuta contra el [punto final executequery](https://learn.microsoft.com/en-us/rest/api/power-bi/datasets/execute-queries), que no permite eliminaciones.

### Notas:

- Se basa en la autenticación con el paquete azure.identity, que se puede instalar con `pip install azure-identity`. Alternativamente, puede crear el conjunto de datos de powerbi con un token como una cadena sin proporcionar las credenciales.
- También puede proporcionar un nombre de usuario para suplantar para usar con conjuntos de datos que tienen RLS habilitado.
- El kit de herramientas utiliza un LLM para crear la consulta a partir de la pregunta, el agente utiliza el LLM para la ejecución general.
- Las pruebas se realizaron principalmente con un modelo `gpt-3.5-turbo-instruct`, los modelos de codex no parecían funcionar muy bien.

## Inicialización

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

## Ejemplo: describir una tabla

```python
agent_executor.run("Describe table1")
```

## Ejemplo: consulta simple en una tabla

En este ejemplo, el agente realmente descubre la consulta correcta para obtener un recuento de filas de la tabla.

```python
agent_executor.run("How many records are in table1?")
```

## Ejemplo: ejecutar consultas

```python
agent_executor.run("How many records are there by dimension1 in table2?")
```

```python
agent_executor.run("What unique values are there for dimensions2 in table2")
```

## Ejemplo: agrega tus propios pocos disparadores de muestra

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
