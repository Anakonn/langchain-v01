---
sidebar_label: Weaviate
translated: true
---

# Weaviate

Este cuaderno cubre cómo comenzar con la tienda de vectores Weaviate en LangChain, usando el paquete `langchain-weaviate`.

> [Weaviate](https://weaviate.io/) es una base de datos de vectores de código abierto. Te permite almacenar objetos de datos e incrustaciones de vectores de tus modelos de ML favoritos, y escalar sin problemas a miles de millones de objetos de datos.

Para usar esta integración, necesitas tener una instancia de la base de datos Weaviate en funcionamiento.

## Versiones mínimas

Este módulo requiere Weaviate `1.23.7` o superior. Sin embargo, recomendamos usar la última versión de Weaviate.

## Conectando a Weaviate

En este cuaderno, asumimos que tienes una instancia local de Weaviate ejecutándose en `http://localhost:8080` y el puerto 50051 abierto para [tráfico gRPC](https://weaviate.io/blog/grpc-performance-improvements). Entonces, nos conectaremos a Weaviate con:

```python
weaviate_client = weaviate.connect_to_local()
```

### Otras opciones de despliegue

Weaviate puede ser [desplegado de muchas maneras diferentes](https://weaviate.io/developers/weaviate/starter-guides/which-weaviate) como usar [Weaviate Cloud Services (WCS)](https://console.weaviate.cloud), [Docker](https://weaviate.io/developers/weaviate/installation/docker-compose) o [Kubernetes](https://weaviate.io/developers/weaviate/installation/kubernetes).

Si tu instancia de Weaviate está desplegada de otra manera, [lee más aquí](https://weaviate.io/developers/weaviate/client-libraries/python#instantiate-a-client) sobre las diferentes formas de conectarse a Weaviate. Puedes usar diferentes [funciones auxiliares](https://weaviate.io/developers/weaviate/client-libraries/python#python-client-v4-helper-functions) o [crear una instancia personalizada](https://weaviate.io/developers/weaviate/client-libraries/python#python-client-v4-explicit-connection).

> Ten en cuenta que necesitas una API cliente `v4`, que creará un objeto `weaviate.WeaviateClient`.

### Autenticación

Algunas instancias de Weaviate, como aquellas que se ejecutan en WCS, tienen autenticación habilitada, como autenticación con clave API y/o nombre de usuario+contraseña.

Lee la [guía de autenticación del cliente](https://weaviate.io/developers/weaviate/client-libraries/python#authentication) para más información, así como la [página de configuración de autenticación en profundidad](https://weaviate.io/developers/weaviate/configuration/authentication).

## Instalación

```python
# install package
# %pip install -Uqq langchain-weaviate
# %pip install openai tiktoken langchain
```

## Configuración del entorno

Este cuaderno utiliza la API de OpenAI a través de `OpenAIEmbeddings`. Sugerimos obtener una clave API de OpenAI y exportarla como una variable de entorno con el nombre `OPENAI_API_KEY`.

Una vez hecho esto, tu clave API de OpenAI se leerá automáticamente. Si eres nuevo en las variables de entorno, lee más sobre ellas [aquí](https://docs.python.org/3/library/os.html#os.environ) o en [esta guía](https://www.twilio.com/en-us/blog/environment-variables-python).

# Uso

## Encontrar objetos por similitud

Aquí hay un ejemplo de cómo encontrar objetos por similitud a una consulta, desde la importación de datos hasta la consulta de la instancia de Weaviate.

### Paso 1: Importación de datos

Primero, crearemos datos para agregar a `Weaviate` cargando y fragmentando el contenido de un archivo de texto largo.

```python
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings.openai import OpenAIEmbeddings
```

```python
loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
docs = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings()
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The class `langchain_community.embeddings.openai.OpenAIEmbeddings` was deprecated in langchain-community 0.1.0 and will be removed in 0.2.0. An updated version of the class exists in the langchain-openai package and should be used instead. To use it run `pip install -U langchain-openai` and import as `from langchain_openai import OpenAIEmbeddings`.
  warn_deprecated(
```

Ahora, podemos importar los datos.

Para hacerlo, conéctate a la instancia de Weaviate y usa el objeto `weaviate_client` resultante. Por ejemplo, podemos importar los documentos como se muestra a continuación:

```python
import weaviate
from langchain_weaviate.vectorstores import WeaviateVectorStore
```

```python
weaviate_client = weaviate.connect_to_local()
db = WeaviateVectorStore.from_documents(docs, embeddings, client=weaviate_client)
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```

### Paso 2: Realizar la búsqueda

Ahora podemos realizar una búsqueda de similitud. Esto devolverá los documentos más similares al texto de la consulta, basándose en las incrustaciones almacenadas en Weaviate y una incrustación equivalente generada a partir del texto de la consulta.

```python
query = "What did the president say about Ketanji Brown Jackson"
docs = db.similarity_search(query)

# Print the first 100 characters of each result
for i, doc in enumerate(docs):
    print(f"\nDocument {i+1}:")
    print(doc.page_content[:100] + "...")
```

```output

Document 1:
Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Ac...

Document 2:
And so many families are living paycheck to paycheck, struggling to keep up with the rising cost of ...

Document 3:
Vice President Harris and I ran for office with a new economic vision for America.

Invest in Ameri...

Document 4:
A former top litigator in private practice. A former federal public defender. And from a family of p...
```

También puedes agregar filtros, que incluirán o excluirán resultados según las condiciones del filtro. (Ver [más ejemplos de filtros](https://weaviate.io/developers/weaviate/search/filters).)

```python
from weaviate.classes.query import Filter

for filter_str in ["blah.txt", "state_of_the_union.txt"]:
    search_filter = Filter.by_property("source").equal(filter_str)
    filtered_search_results = db.similarity_search(query, filters=search_filter)
    print(len(filtered_search_results))
    if filter_str == "state_of_the_union.txt":
        assert len(filtered_search_results) > 0  # There should be at least one result
    else:
        assert len(filtered_search_results) == 0  # There should be no results
```

```output
0
4
```

También es posible proporcionar `k`, que es el límite superior del número de resultados a devolver.

```python
search_filter = Filter.by_property("source").equal("state_of_the_union.txt")
filtered_search_results = db.similarity_search(query, filters=search_filter, k=3)
assert len(filtered_search_results) <= 3
```

### Cuantificar la similitud del resultado

Opcionalmente, puedes recuperar una "puntuación" de relevancia. Esta es una puntuación relativa que indica cuán buenos son los resultados de búsqueda particulares, entre el conjunto de resultados de búsqueda.

Ten en cuenta que esta es una puntuación relativa, lo que significa que no debe usarse para determinar umbrales de relevancia. Sin embargo, se puede usar para comparar la relevancia de diferentes resultados de búsqueda dentro del conjunto completo de resultados de búsqueda.

```python
docs = db.similarity_search_with_score("country", k=5)

for doc in docs:
    print(f"{doc[1]:.3f}", ":", doc[0].page_content[:100] + "...")
```

```output
0.935 : For that purpose we’ve mobilized American ground forces, air squadrons, and ship deployments to prot...
0.500 : And built the strongest, freest, and most prosperous nation the world has ever known.

Now is the h...
0.462 : If you travel 20 miles east of Columbus, Ohio, you’ll find 1,000 empty acres of land.

It won’t loo...
0.450 : And my report is this: the State of the Union is strong—because you, the American people, are strong...
0.442 : Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Ac...
```

## Mecanismo de búsqueda

`similarity_search` utiliza la [búsqueda híbrida](https://weaviate.io/developers/weaviate/api/graphql/search-operators#hybrid) de Weaviate.

Una búsqueda híbrida combina una búsqueda de vectores y una búsqueda de palabras clave, con `alpha` como el peso de la búsqueda de vectores. La función `similarity_search` te permite pasar argumentos adicionales como kwargs. Consulta este [documento de referencia](https://weaviate.io/developers/weaviate/api/graphql/search-operators#hybrid) para los argumentos disponibles.

Entonces, puedes realizar una búsqueda de palabras clave pura agregando `alpha=0` como se muestra a continuación:

```python
docs = db.similarity_search(query, alpha=0)
docs[0]
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': 'state_of_the_union.txt'})
```

## Persistencia

Cualquier dato agregado a través de `langchain-weaviate` persistirá en Weaviate de acuerdo con su configuración.

Las instancias de WCS, por ejemplo, están configuradas para persistir datos indefinidamente, y las instancias de Docker pueden configurarse para persistir datos en un volumen. Lee más sobre [la persistencia de Weaviate](https://weaviate.io/developers/weaviate/configuration/persistence).

## Multi-tenencia

[La multi-tenencia](https://weaviate.io/developers/weaviate/concepts/data#multi-tenancy) te permite tener un alto número de colecciones de datos aisladas, con la misma configuración de colección, en una sola instancia de Weaviate. Esto es ideal para entornos multiusuario, como la creación de una aplicación SaaS, donde cada usuario final tendrá su propia colección de datos aislada.

Para usar la multi-tenencia, la tienda de vectores necesita estar al tanto del parámetro `tenant`.

Entonces, al agregar cualquier dato, proporciona el parámetro `tenant` como se muestra a continuación.

```python
db_with_mt = WeaviateVectorStore.from_documents(
    docs, embeddings, client=weaviate_client, tenant="Foo"
)
```

```output
2024-Mar-26 03:40 PM - langchain_weaviate.vectorstores - INFO - Tenant Foo does not exist in index LangChain_30b9273d43b3492db4fb2aba2e0d6871. Creating tenant.
```

Y al realizar consultas, proporciona también el parámetro `tenant`.

```python
db_with_mt.similarity_search(query, tenant="Foo")
```

```output
[Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': 'state_of_the_union.txt'}),
 Document(page_content='And so many families are living paycheck to paycheck, struggling to keep up with the rising cost of food, gas, housing, and so much more. \n\nI understand. \n\nI remember when my Dad had to leave our home in Scranton, Pennsylvania to find work. I grew up in a family where if the price of food went up, you felt it. \n\nThat’s why one of the first things I did as President was fight to pass the American Rescue Plan.  \n\nBecause people were hurting. We needed to act, and we did. \n\nFew pieces of legislation have done more in a critical moment in our history to lift us out of crisis. \n\nIt fueled our efforts to vaccinate the nation and combat COVID-19. It delivered immediate economic relief for tens of millions of Americans.  \n\nHelped put food on their table, keep a roof over their heads, and cut the cost of health insurance. \n\nAnd as my Dad used to say, it gave people a little breathing room.', metadata={'source': 'state_of_the_union.txt'}),
 Document(page_content='He and his Dad both have Type 1 diabetes, which means they need insulin every day. Insulin costs about $10 a vial to make.  \n\nBut drug companies charge families like Joshua and his Dad up to 30 times more. I spoke with Joshua’s mom. \n\nImagine what it’s like to look at your child who needs insulin and have no idea how you’re going to pay for it.  \n\nWhat it does to your dignity, your ability to look your child in the eye, to be the parent you expect to be. \n\nJoshua is here with us tonight. Yesterday was his birthday. Happy birthday, buddy.  \n\nFor Joshua, and for the 200,000 other young people with Type 1 diabetes, let’s cap the cost of insulin at $35 a month so everyone can afford it.  \n\nDrug companies will still do very well. And while we’re at it let Medicare negotiate lower prices for prescription drugs, like the VA already does.', metadata={'source': 'state_of_the_union.txt'}),
 Document(page_content='Putin’s latest attack on Ukraine was premeditated and unprovoked. \n\nHe rejected repeated efforts at diplomacy. \n\nHe thought the West and NATO wouldn’t respond. And he thought he could divide us at home. Putin was wrong. We were ready.  Here is what we did.   \n\nWe prepared extensively and carefully. \n\nWe spent months building a coalition of other freedom-loving nations from Europe and the Americas to Asia and Africa to confront Putin. \n\nI spent countless hours unifying our European allies. We shared with the world in advance what we knew Putin was planning and precisely how he would try to falsely justify his aggression.  \n\nWe countered Russia’s lies with truth.   \n\nAnd now that he has acted the free world is holding him accountable. \n\nAlong with twenty-seven members of the European Union including France, Germany, Italy, as well as countries like the United Kingdom, Canada, Japan, Korea, Australia, New Zealand, and many others, even Switzerland.', metadata={'source': 'state_of_the_union.txt'})]
```

## Opciones de recuperador

Weaviate también se puede usar como un recuperador

### Búsqueda de relevancia marginal máxima (MMR)

Además de usar similaritysearch en el objeto de recuperador, también puedes usar `mmr`.

```python
retriever = db.as_retriever(search_type="mmr")
retriever.invoke(query)[0]
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```

```output
Document(page_content='Tonight. I call on the Senate to: Pass the Freedom to Vote Act. Pass the John Lewis Voting Rights Act. And while you’re at it, pass the Disclose Act so Americans can know who is funding our elections. \n\nTonight, I’d like to honor someone who has dedicated his life to serve this country: Justice Stephen Breyer—an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. Justice Breyer, thank you for your service. \n\nOne of the most serious constitutional responsibilities a President has is nominating someone to serve on the United States Supreme Court. \n\nAnd I did that 4 days ago, when I nominated Circuit Court of Appeals Judge Ketanji Brown Jackson. One of our nation’s top legal minds, who will continue Justice Breyer’s legacy of excellence.', metadata={'source': 'state_of_the_union.txt'})
```

# Uso con LangChain

Una limitación conocida de los grandes modelos de lenguaje (LLMs) es que sus datos de entrenamiento pueden estar desactualizados o no incluir el conocimiento de dominio específico que necesitas.

Echa un vistazo al ejemplo a continuación:

```python
from langchain_community.chat_models import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
llm.predict("What did the president say about Justice Breyer")
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The class `langchain_community.chat_models.openai.ChatOpenAI` was deprecated in langchain-community 0.0.10 and will be removed in 0.2.0. An updated version of the class exists in the langchain-openai package and should be used instead. To use it run `pip install -U langchain-openai` and import as `from langchain_openai import ChatOpenAI`.
  warn_deprecated(
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The function `predict` was deprecated in LangChain 0.1.7 and will be removed in 0.2.0. Use invoke instead.
  warn_deprecated(
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```

```output
"I'm sorry, I cannot provide real-time information as my responses are generated based on a mixture of licensed data, data created by human trainers, and publicly available data. The last update was in October 2021."
```

Las tiendas de vectores complementan a los LLMs proporcionando una forma de almacenar y recuperar información relevante. Esto te permite combinar las fortalezas de los LLMs y las tiendas de vectores, utilizando las capacidades de razonamiento y lingüísticas del LLM con la capacidad de las tiendas de vectores para recuperar información relevante.

Dos aplicaciones bien conocidas para combinar LLMs y tiendas de vectores son:
- Respuesta a preguntas
- Generación aumentada por recuperación (RAG)

### Respuesta a preguntas con fuentes

La respuesta a preguntas en langchain se puede mejorar mediante el uso de tiendas de vectores. Veamos cómo se puede hacer esto.

Esta sección utiliza el `RetrievalQAWithSourcesChain`, que realiza la búsqueda de los documentos desde un Índice.

Primero, fragmentaremos el texto nuevamente y lo importaremos a la tienda de vectores de Weaviate.

```python
from langchain.chains import RetrievalQAWithSourcesChain
from langchain_community.llms import OpenAI
```

```python
with open("state_of_the_union.txt") as f:
    state_of_the_union = f.read()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_text(state_of_the_union)
```

```python
docsearch = WeaviateVectorStore.from_texts(
    texts,
    embeddings,
    client=weaviate_client,
    metadatas=[{"source": f"{i}-pl"} for i in range(len(texts))],
)
```

Ahora podemos construir la cadena, con el recuperador especificado:

```python
chain = RetrievalQAWithSourcesChain.from_chain_type(
    OpenAI(temperature=0), chain_type="stuff", retriever=docsearch.as_retriever()
)
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The class `langchain_community.llms.openai.OpenAI` was deprecated in langchain-community 0.0.10 and will be removed in 0.2.0. An updated version of the class exists in the langchain-openai package and should be used instead. To use it run `pip install -U langchain-openai` and import as `from langchain_openai import OpenAI`.
  warn_deprecated(
```

Y ejecutar la cadena, para hacer la pregunta:

```python
chain(
    {"question": "What did the president say about Justice Breyer"},
    return_only_outputs=True,
)
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/langchain_core/_api/deprecation.py:117: LangChainDeprecationWarning: The function `__call__` was deprecated in LangChain 0.1.0 and will be removed in 0.2.0. Use invoke instead.
  warn_deprecated(
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```

```output
{'answer': ' The president thanked Justice Stephen Breyer for his service and announced his nomination of Judge Ketanji Brown Jackson to the Supreme Court.\n',
 'sources': '31-pl'}
```

### Generación aumentada por recuperación

Otra aplicación muy popular de la combinación de LLMs y tiendas de vectores es la generación aumentada por recuperación (RAG). Esta es una técnica que utiliza un recuperador para encontrar información relevante de una tienda de vectores, y luego usa un LLM para proporcionar una salida basada en los datos recuperados y un prompt.

Comenzamos con una configuración similar:

```python
with open("state_of_the_union.txt") as f:
    state_of_the_union = f.read()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_text(state_of_the_union)
```

```python
docsearch = WeaviateVectorStore.from_texts(
    texts,
    embeddings,
    client=weaviate_client,
    metadatas=[{"source": f"{i}-pl"} for i in range(len(texts))],
)

retriever = docsearch.as_retriever()
```

Necesitamos construir una plantilla para el modelo RAG de manera que la información recuperada se poblara en la plantilla.

```python
from langchain_core.prompts import ChatPromptTemplate

template = """You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.
Question: {question}
Context: {context}
Answer:
"""
prompt = ChatPromptTemplate.from_template(template)

print(prompt)
```

```output
input_variables=['context', 'question'] messages=[HumanMessagePromptTemplate(prompt=PromptTemplate(input_variables=['context', 'question'], template="You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know. Use three sentences maximum and keep the answer concise.\nQuestion: {question}\nContext: {context}\nAnswer:\n"))]
```

```python
from langchain_community.chat_models import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)
```

Y ejecutando la celda, obtenemos una salida muy similar.

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

rag_chain.invoke("What did the president say about Justice Breyer")
```

```output
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
/workspaces/langchain-weaviate/.venv/lib/python3.12/site-packages/pydantic/main.py:1024: PydanticDeprecatedSince20: The `dict` method is deprecated; use `model_dump` instead. Deprecated in Pydantic V2.0 to be removed in V3.0. See Pydantic V2 Migration Guide at https://errors.pydantic.dev/2.6/migration/
  warnings.warn('The `dict` method is deprecated; use `model_dump` instead.', category=PydanticDeprecatedSince20)
```

```output
"The president honored Justice Stephen Breyer for his service to the country as an Army veteran, Constitutional scholar, and retiring Justice of the United States Supreme Court. The president also mentioned nominating Circuit Court of Appeals Judge Ketanji Brown Jackson to continue Justice Breyer's legacy of excellence. The president expressed gratitude towards Justice Breyer and highlighted the importance of nominating someone to serve on the United States Supreme Court."
```

Pero ten en cuenta que, ya que la plantilla la construyes tú, puedes personalizarla según tus necesidades.

### Conclusión y recursos

Weaviate es una tienda de vectores escalable y lista para producción.

Esta integración permite que Weaviate se use con LangChain para mejorar las capacidades de los grandes modelos de lenguaje con una tienda de datos robusta. Su escalabilidad y preparación para producción lo hacen una excelente opción como tienda de vectores para tus aplicaciones LangChain, y reducirá tu tiempo de producción.
