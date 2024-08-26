---
sidebar_class_name: hidden
title: Resumen
translated: true
---

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/langchain-ai/langchain/blob/master/docs/docs/use_cases/summarization.ipynb)

## Caso de uso

Supongamos que tienes un conjunto de documentos (PDFs, páginas de Notion, preguntas de clientes, etc.) y quieres resumir el contenido.

Los LLM son una excelente herramienta para esto, dada su competencia en la comprensión y síntesis de texto.

En este tutorial, veremos cómo realizar el resumen de documentos utilizando LLM.

![Image description](../../../../../static/img/summarization_use_case_1.png)

## Resumen

Una pregunta central para construir un resumidor es cómo pasar sus documentos a la ventana de contexto del LLM. Dos enfoques comunes para esto son:

1. `Stuff`: Simplemente "rellenar" todos sus documentos en un solo mensaje. Este es el enfoque más sencillo (consulte [aquí](/docs/modules/chains#lcel-chains) para obtener más información sobre el constructor `create_stuff_documents_chain`, que se utiliza para este método).

2. `Map-reduce`: Resumir cada documento por separado en un paso de "asignación" y luego "reducir" los resúmenes en un resumen final (consulte [aquí](/docs/modules/chains#legacy-chains) para obtener más información sobre `MapReduceDocumentsChain`, que se utiliza para este método).

![Image description](../../../../../static/img/summarization_use_case_2.png)

## Inicio rápido

Para darle una vista previa, cualquier pipeline se puede envolver en un solo objeto: `load_summarize_chain`.

Supongamos que queremos resumir una entrada de blog. Podemos crear esto en unas pocas líneas de código.

Primero, establezca las variables de entorno e instale los paquetes:

```python
%pip install --upgrade --quiet  langchain-openai tiktoken chromadb langchain langchainhub

# Set env var OPENAI_API_KEY or load from a .env file
#
# import os
# os.environ['OPENAI_API_KEY'] = 'sk...'
#
# import dotenv
# dotenv.load_dotenv()
```

Podemos usar `chain_type="stuff"`, especialmente si usamos modelos de ventana de contexto más grandes como:

* Modelo OpenAI `gpt-3.5-turbo-1106` de 16k tokens
* Modelo Anthropic [Claude-2](https://www.anthropic.com/index/claude-2) de 100k tokens

También podemos suministrar `chain_type="map_reduce"` o `chain_type="refine"`.

```python
from langchain.chains.summarize import load_summarize_chain
from langchain_community.document_loaders import WebBaseLoader
from langchain_openai import ChatOpenAI

loader = WebBaseLoader("https://lilianweng.github.io/posts/2023-06-23-agent/")
docs = loader.load()

llm = ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo-1106")
chain = load_summarize_chain(llm, chain_type="stuff")

chain.run(docs)
```

```output
'The article discusses the concept of building autonomous agents powered by large language models (LLMs). It explores the components of such agents, including planning, memory, and tool use. The article provides case studies and proof-of-concept examples of LLM-powered agents in various domains. It also highlights the challenges and limitations of using LLMs in agent systems.'
```

## Opción 1. Rellenar

Cuando usamos `load_summarize_chain` con `chain_type="stuff"`, usaremos el [StuffDocumentsChain](https://api.python.langchain.com/en/latest/chains/langchain.chains.combine_documents.stuff.StuffDocumentsChain.html#langchain.chains.combine_documents.stuff.StuffDocumentsChain).

La cadena tomará una lista de documentos, los insertará todos en un mensaje y pasará ese mensaje a un LLM:

```python
from langchain.chains.combine_documents.stuff import StuffDocumentsChain
from langchain.chains.llm import LLMChain
from langchain_core.prompts import PromptTemplate

# Define prompt
prompt_template = """Write a concise summary of the following:
"{text}"
CONCISE SUMMARY:"""
prompt = PromptTemplate.from_template(prompt_template)

# Define LLM chain
llm = ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo-16k")
llm_chain = LLMChain(llm=llm, prompt=prompt)

# Define StuffDocumentsChain
stuff_chain = StuffDocumentsChain(llm_chain=llm_chain, document_variable_name="text")

docs = loader.load()
print(stuff_chain.run(docs))
```

```output
The article discusses the concept of building autonomous agents powered by large language models (LLMs). It explores the components of such agents, including planning, memory, and tool use. The article provides case studies and proof-of-concept examples of LLM-powered agents in various domains, such as scientific discovery and generative agents simulation. It also highlights the challenges and limitations of using LLMs in agent systems.
```

¡Genial! Podemos ver que reproducimos el resultado anterior usando `load_summarize_chain`.

### Profundizar

* Puedes personalizar fácilmente el mensaje.
* Puedes probar fácilmente diferentes LLM, (p. ej., [Claude](/docs/integrations/chat/anthropic)) a través del parámetro `llm`.

## Opción 2. Map-Reduce

Desentrañemos el enfoque de map-reduce. Para esto, primero asignaremos cada documento a un resumen individual usando una `LLMChain`. Luego usaremos una `ReduceDocumentsChain` para combinar esos resúmenes en un resumen global único.

Primero, especificamos la LLMChain que se utilizará para asignar cada documento a un resumen individual:

```python
from langchain.chains import MapReduceDocumentsChain, ReduceDocumentsChain
from langchain_text_splitters import CharacterTextSplitter

llm = ChatOpenAI(temperature=0)

# Map
map_template = """The following is a set of documents
{docs}
Based on this list of docs, please identify the main themes
Helpful Answer:"""
map_prompt = PromptTemplate.from_template(map_template)
map_chain = LLMChain(llm=llm, prompt=map_prompt)
```

También podemos usar el Prompt Hub para almacenar y recuperar mensajes.

Esto funcionará con tu [clave API de LangSmith](https://docs.smith.langchain.com/).

Por ejemplo, consulta el mensaje de asignación [aquí](https://smith.langchain.com/hub/rlm/map-prompt).

```python
from langchain import hub

map_prompt = hub.pull("rlm/map-prompt")
map_chain = LLMChain(llm=llm, prompt=map_prompt)
```

La `ReduceDocumentsChain` se encarga de tomar los resultados de la asignación de documentos y reducirlos a una sola salida. Envuelve una `CombineDocumentsChain` genérica (como `StuffDocumentsChain`) pero agrega la capacidad de colapsar documentos antes de pasarlos a la `CombineDocumentsChain` si su tamaño acumulativo excede `token_max`. En este ejemplo, podemos reutilizar nuestra cadena para combinar nuestros documentos también para colapsar nuestros documentos.

Entonces, si el número acumulado de tokens en nuestros documentos asignados excede los 4000 tokens, pasaremos los documentos en lotes de < 4000 tokens a nuestra `StuffDocumentsChain` para crear resúmenes por lotes. Y una vez que esos resúmenes por lotes sean acumulativamente menos de 4000 tokens, los pasaremos todos una última vez a la `StuffDocumentsChain` para crear el resumen final.

```python
# Reduce
reduce_template = """The following is set of summaries:
{docs}
Take these and distill it into a final, consolidated summary of the main themes.
Helpful Answer:"""
reduce_prompt = PromptTemplate.from_template(reduce_template)
```

```python
# Note we can also get this from the prompt hub, as noted above
reduce_prompt = hub.pull("rlm/map-prompt")
```

```python
reduce_prompt
```

```output
ChatPromptTemplate(input_variables=['docs'], messages=[HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['docs'], template='The following is a set of documents:\n{docs}\nBased on this list of docs, please identify the main themes \nHelpful Answer:'))])
```

```python
# Run chain
reduce_chain = LLMChain(llm=llm, prompt=reduce_prompt)

# Takes a list of documents, combines them into a single string, and passes this to an LLMChain
combine_documents_chain = StuffDocumentsChain(
    llm_chain=reduce_chain, document_variable_name="docs"
)

# Combines and iteratively reduces the mapped documents
reduce_documents_chain = ReduceDocumentsChain(
    # This is final chain that is called.
    combine_documents_chain=combine_documents_chain,
    # If documents exceed context for `StuffDocumentsChain`
    collapse_documents_chain=combine_documents_chain,
    # The maximum number of tokens to group documents into.
    token_max=4000,
)
```

Combinando nuestras cadenas de asignación y reducción en una sola:

```python
# Combining documents by mapping a chain over them, then combining results
map_reduce_chain = MapReduceDocumentsChain(
    # Map chain
    llm_chain=map_chain,
    # Reduce chain
    reduce_documents_chain=reduce_documents_chain,
    # The variable name in the llm_chain to put the documents in
    document_variable_name="docs",
    # Return the results of the map steps in the output
    return_intermediate_steps=False,
)

text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
    chunk_size=1000, chunk_overlap=0
)
split_docs = text_splitter.split_documents(docs)
```

```output
Created a chunk of size 1003, which is longer than the specified 1000
```

```python
print(map_reduce_chain.run(split_docs))
```

```output
Based on the list of documents provided, the main themes can be identified as follows:

1. LLM-powered autonomous agents: The documents discuss the concept of building agents with LLM as their core controller and highlight the potential of LLM beyond generating written content. They explore the capabilities of LLM as a general problem solver.

2. Agent system overview: The documents provide an overview of the components that make up a LLM-powered autonomous agent system, including planning, memory, and tool use. Each component is explained in detail, highlighting its role in enhancing the agent's capabilities.

3. Planning: The documents discuss how the agent breaks down large tasks into smaller subgoals and utilizes self-reflection to improve the quality of its actions and results.

4. Memory: The documents explain the importance of both short-term and long-term memory in an agent system. Short-term memory is utilized for in-context learning, while long-term memory allows the agent to retain and recall information over extended periods.

5. Tool use: The documents highlight the agent's ability to call external APIs for additional information and resources that may be missing from its pre-trained model weights. This includes accessing current information, executing code, and retrieving proprietary information.

6. Case studies and proof-of-concept examples: The documents provide examples of how LLM-powered autonomous agents can be applied in various domains, such as scientific discovery and generative agent simulations. These case studies serve as examples of the capabilities and potential applications of such agents.

7. Challenges: The documents acknowledge the challenges associated with building and utilizing LLM-powered autonomous agents, although specific challenges are not mentioned in the given set of documents.

8. Citation and references: The documents include a citation and reference section, indicating that the information presented is based on existing research and sources.

Overall, the main themes in the provided documents revolve around LLM-powered autonomous agents, their components and capabilities, planning, memory, tool use, case studies, and challenges.
```

### Profundizar

**Personalización**

* Como se muestra arriba, puedes personalizar los LLM y los mensajes para las etapas de asignación y reducción.

**Caso de uso del mundo real**

* Consulta [este artículo del blog](https://blog.langchain.dev/llms-to-improve-documentation/) sobre el análisis de las interacciones de los usuarios (preguntas sobre la documentación de LangChain).
* El artículo del blog y el [repositorio](https://github.com/mendableai/QA_clustering) asociado también presentan el agrupamiento como un medio de resumen.
* Esto abre un tercer camino más allá de los enfoques `stuff` o `map-reduce` que vale la pena considerar.

![Image description](../../../../../static/img/summarization_use_case_3.png)

## Opción 3. Refinar

[RefineDocumentsChain](/docs/modules/chains#legacy-chains) es similar a map-reduce:

> La cadena de refinamiento de documentos construye una respuesta iterando sobre los documentos de entrada y actualizando su respuesta de forma iterativa. Para cada documento, pasa todos los insumos que no son documentos, el documento actual y la última respuesta intermedia a una cadena de LLM para obtener una nueva respuesta.

Esto se puede ejecutar fácilmente con `chain_type="refine"` especificado.

```python
chain = load_summarize_chain(llm, chain_type="refine")
chain.run(split_docs)
```

```output
'The article explores the concept of building autonomous agents powered by large language models (LLMs) and their potential as problem solvers. It discusses different approaches to task decomposition, the integration of self-reflection into LLM-based agents, and the use of external classical planners for long-horizon planning. The new context introduces the Chain of Hindsight (CoH) approach and Algorithm Distillation (AD) for training models to produce better outputs. It also discusses different types of memory and the use of external memory for fast retrieval. The article explores the concept of tool use and introduces the MRKL system and experiments on fine-tuning LLMs to use external tools. It introduces HuggingGPT, a framework that uses ChatGPT as a task planner, and discusses the challenges of using LLM-powered agents in real-world scenarios. The article concludes with case studies on scientific discovery agents and the use of LLM-powered agents in anticancer drug discovery. It also introduces the concept of generative agents that combine LLM with memory, planning, and reflection mechanisms. The conversation samples provided discuss the implementation of a game architecture and the challenges in building LLM-centered agents. The article provides references to related research papers and resources for further exploration.'
```

También es posible proporcionar un mensaje y devolver pasos intermedios.

```python
prompt_template = """Write a concise summary of the following:
{text}
CONCISE SUMMARY:"""
prompt = PromptTemplate.from_template(prompt_template)

refine_template = (
    "Your job is to produce a final summary\n"
    "We have provided an existing summary up to a certain point: {existing_answer}\n"
    "We have the opportunity to refine the existing summary"
    "(only if needed) with some more context below.\n"
    "------------\n"
    "{text}\n"
    "------------\n"
    "Given the new context, refine the original summary in Italian"
    "If the context isn't useful, return the original summary."
)
refine_prompt = PromptTemplate.from_template(refine_template)
chain = load_summarize_chain(
    llm=llm,
    chain_type="refine",
    question_prompt=prompt,
    refine_prompt=refine_prompt,
    return_intermediate_steps=True,
    input_key="input_documents",
    output_key="output_text",
)
result = chain({"input_documents": split_docs}, return_only_outputs=True)
```

```python
print(result["output_text"])
```

```output
Il presente articolo discute il concetto di costruire agenti autonomi utilizzando LLM (large language model) come controller principale. Esplora i diversi componenti di un sistema di agenti alimentato da LLM, tra cui la pianificazione, la memoria e l'uso degli strumenti. Dimostrazioni di concetto come AutoGPT mostrano il potenziale di LLM come risolutore generale di problemi. Approcci come Chain of Thought, Tree of Thoughts, LLM+P, ReAct e Reflexion consentono agli agenti autonomi di pianificare, riflettere su se stessi e migliorarsi iterativamente. Tuttavia, ci sono sfide da affrontare, come la limitata capacità di contesto che limita l'inclusione di informazioni storiche dettagliate e la difficoltà di pianificazione a lungo termine e decomposizione delle attività. Inoltre, l'affidabilità dell'interfaccia di linguaggio naturale tra LLM e componenti esterni come la memoria e gli strumenti è incerta, poiché i LLM possono commettere errori di formattazione e mostrare comportamenti ribelli. Nonostante ciò, il sistema AutoGPT viene menzionato come esempio di dimostrazione di concetto che utilizza LLM come controller principale per agenti autonomi. Questo articolo fa riferimento a diverse fonti che esplorano approcci e applicazioni specifiche di LLM nell'ambito degli agenti autonomi.
```

```python
print("\n\n".join(result["intermediate_steps"][:3]))
```

```output
This article discusses the concept of building autonomous agents using LLM (large language model) as the core controller. The article explores the different components of an LLM-powered agent system, including planning, memory, and tool use. It also provides examples of proof-of-concept demos and highlights the potential of LLM as a general problem solver.

Questo articolo discute del concetto di costruire agenti autonomi utilizzando LLM (large language model) come controller principale. L'articolo esplora i diversi componenti di un sistema di agenti alimentato da LLM, inclusa la pianificazione, la memoria e l'uso degli strumenti. Vengono forniti anche esempi di dimostrazioni di proof-of-concept e si evidenzia il potenziale di LLM come risolutore generale di problemi. Inoltre, vengono presentati approcci come Chain of Thought, Tree of Thoughts, LLM+P, ReAct e Reflexion che consentono agli agenti autonomi di pianificare, riflettere su se stessi e migliorare iterativamente.

Questo articolo discute del concetto di costruire agenti autonomi utilizzando LLM (large language model) come controller principale. L'articolo esplora i diversi componenti di un sistema di agenti alimentato da LLM, inclusa la pianificazione, la memoria e l'uso degli strumenti. Vengono forniti anche esempi di dimostrazioni di proof-of-concept e si evidenzia il potenziale di LLM come risolutore generale di problemi. Inoltre, vengono presentati approcci come Chain of Thought, Tree of Thoughts, LLM+P, ReAct e Reflexion che consentono agli agenti autonomi di pianificare, riflettere su se stessi e migliorare iterativamente. Il nuovo contesto riguarda l'approccio Chain of Hindsight (CoH) che permette al modello di migliorare autonomamente i propri output attraverso un processo di apprendimento supervisionato. Viene anche presentato l'approccio Algorithm Distillation (AD) che applica lo stesso concetto alle traiettorie di apprendimento per compiti di reinforcement learning.
```

## Dividir y resumir en una sola cadena

Por conveniencia, podemos envolver tanto la división de texto de nuestro documento largo como el resumen en una sola `AnalyzeDocumentsChain`.

```python
from langchain.chains import AnalyzeDocumentChain

summarize_document_chain = AnalyzeDocumentChain(
    combine_docs_chain=chain, text_splitter=text_splitter
)
summarize_document_chain.run(docs[0].page_content)
```
