---
translated: true
---

# Vectara

>[Vectara](https://vectara.com/) es la plataforma de GenAI de confianza que proporciona una API fácil de usar para la indexación y consulta de documentos.

Vectara proporciona un servicio administrado de extremo a extremo para Retrieval Augmented Generation o [RAG](https://vectara.com/grounded-generation/), que incluye:

1. Una forma de extraer texto de archivos de documentos y dividirlos en oraciones.

2. El modelo de incrustaciones [Boomerang](https://vectara.com/how-boomerang-takes-retrieval-augmented-generation-to-the-next-level-via-grounded-generation/) de última generación. Cada fragmento de texto se codifica en una incrustación vectorial utilizando Boomerang y se almacena en el almacén de conocimientos interno (vector+texto) de Vectara.

3. Un servicio de consulta que codifica automáticamente la consulta en incrustaciones y recupera los segmentos de texto más relevantes (incluye soporte para [Búsqueda híbrida](https://docs.vectara.com/docs/api-reference/search-apis/lexical-matching) y [MMR](https://vectara.com/get-diverse-results-and-comprehensive-summaries-with-vectaras-mmr-reranker/))).

4. Una opción para crear [resúmenes generativos](https://docs.vectara.com/docs/learn/grounded-generation/grounded-generation-overview), basados en los documentos recuperados, incluidas las citas.

Consulte la [documentación de la API de Vectara](https://docs.vectara.com/docs/) para obtener más información sobre cómo usar la API.

Este cuaderno muestra cómo usar la funcionalidad relacionada con la integración de `Vectara` con langchain.
Específicamente, demostraremos cómo usar el encadenamiento con [el Lenguaje de Expresión de LangChain](/docs/expression_language/) y el uso de la capacidad de resumen integrada de Vectara.

# Configuración

Necesitará una cuenta de Vectara para usar Vectara con LangChain. Para comenzar, use los siguientes pasos:

1. [Regístrese](https://www.vectara.com/integrations/langchain) en una cuenta de Vectara si aún no tiene una. Una vez que haya completado su registro, tendrá un ID de cliente de Vectara. Puede encontrar su ID de cliente haciendo clic en su nombre, en la parte superior derecha de la ventana de la consola de Vectara.

2. Dentro de su cuenta, puede crear uno o más corpus. Cada corpus representa un área que almacena datos de texto después de la ingesta de documentos de entrada. Para crear un corpus, use el botón **"Crear corpus"**. Luego proporciona un nombre a tu corpus, así como una descripción. Opcionalmente, puede definir atributos de filtrado y aplicar algunas opciones avanzadas. Si hace clic en su corpus creado, puede ver su nombre y el ID del corpus en la parte superior.

3. A continuación, deberá crear claves API para acceder al corpus. Haga clic en la pestaña **"Autorización"** en la vista del corpus y luego en el botón **"Crear clave API"**. Dé un nombre a su clave y elija si desea solo consulta o consulta+índice para su clave. Haga clic en "Crear" y ahora tiene una clave API activa. Mantenga esta clave confidencial.

Para usar LangChain con Vectara, necesitará tener estos tres valores: ID de cliente, ID de corpus y api_key.
Puede proporcionarlos a LangChain de dos formas:

1. Incluir en su entorno estas tres variables: `VECTARA_CUSTOMER_ID`, `VECTARA_CORPUS_ID` y `VECTARA_API_KEY`.

> Por ejemplo, puede establecer estas variables usando os.environ y getpass de la siguiente manera:

```python
import os
import getpass

os.environ["VECTARA_CUSTOMER_ID"] = getpass.getpass("Vectara Customer ID:")
os.environ["VECTARA_CORPUS_ID"] = getpass.getpass("Vectara Corpus ID:")
os.environ["VECTARA_API_KEY"] = getpass.getpass("Vectara API Key:")
```

2. Agrégalos al constructor del almacén vectorial de Vectara:

```python
vectorstore = Vectara(
                vectara_customer_id=vectara_customer_id,
                vectara_corpus_id=vectara_corpus_id,
                vectara_api_key=vectara_api_key
            )
```

```python
from langchain_community.embeddings import FakeEmbeddings
from langchain_community.vectorstores import Vectara
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnableLambda, RunnablePassthrough
```

Primero cargamos el texto del discurso del estado de la unión en Vectara. Tenga en cuenta que usamos la interfaz `from_files` que no requiere ningún procesamiento local o división en fragmentos: Vectara recibe el contenido del archivo y realiza todo el preprocesamiento, división en fragmentos y incrustación del archivo en su almacén de conocimientos.

```python
vectara = Vectara.from_files(["state_of_the_union.txt"])
```

Ahora creamos un buscador de Vectara y especificamos que:
* Debe devolver solo los 3 documentos coincidentes principales
* Para el resumen, debe usar los 5 resultados principales y responder en inglés

```python
summary_config = {"is_enabled": True, "max_results": 5, "response_lang": "eng"}
retriever = vectara.as_retriever(
    search_kwargs={"k": 3, "summary_config": summary_config}
)
```

Cuando se usa el resumen con Vectara, el buscador responde con una lista de objetos `Document`:
1. Los primeros `k` documentos son los que coinciden con la consulta (como estamos acostumbrados con un almacén vectorial estándar)
2. Con el resumen habilitado, se agrega un objeto `Document` adicional, que incluye el texto del resumen. Este Documento tiene el campo de metadatos `summary` establecido como Verdadero.

Definamos dos funciones de utilidad para separar esos elementos:

```python
def get_sources(documents):
    return documents[:-1]


def get_summary(documents):
    return documents[-1].page_content


query_str = "what did Biden say?"
```

Ahora podemos probar una respuesta de resumen para la consulta:

```python
(retriever | get_summary).invoke(query_str)
```

```output
'The returned results did not contain sufficient information to be summarized into a useful answer for your query. Please try a different search or restate your query differently.'
```

Y si quisiéramos ver las fuentes recuperadas de Vectara que se utilizaron en este resumen (las citas):

```python
(retriever | get_sources).invoke(query_str)
```

```output
[Document(page_content='When they came home, many of the world’s fittest and best trained warriors were never the same. Dizziness. \n\nA cancer that would put them in a flag-draped coffin. I know. \n\nOne of those soldiers was my son Major Beau Biden. We don’t know for sure if a burn pit was the cause of his brain cancer, or the diseases of so many of our troops. But I’m committed to finding out everything we can.', metadata={'lang': 'eng', 'section': '1', 'offset': '34652', 'len': '60', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='The U.S. Department of Justice is assembling a dedicated task force to go after the crimes of Russian oligarchs. We are joining with our European allies to find and seize your yachts your luxury apartments your private jets. We are coming for your ill-begotten gains. And tonight I am announcing that we will join our allies in closing off American air space to all Russian flights – further isolating Russia – and adding an additional squeeze –on their economy. The Ruble has lost 30% of its value.', metadata={'lang': 'eng', 'section': '1', 'offset': '3807', 'len': '42', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='He rejected repeated efforts at diplomacy. He thought the West and NATO wouldn’t respond. And he thought he could divide us at home. We were ready.  Here is what we did. We prepared extensively and carefully.', metadata={'lang': 'eng', 'section': '1', 'offset': '2100', 'len': '42', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'})]
```

El "RAG como servicio" de Vectara hace gran parte del trabajo pesado en la creación de cadenas de preguntas y respuestas o chatbots. La integración con LangChain brinda la opción de usar capacidades adicionales como el preprocesamiento de consultas con `SelfQueryRetriever` o `MultiQueryRetriever`. Veamos un ejemplo de usar el [MultiQueryRetriever](/docs/modules/data_connection/retrievers/MultiQueryRetriever).

Dado que MQR usa un LLM, tenemos que configurarlo: aquí elegimos `ChatOpenAI`:

```python
from langchain.retrievers.multi_query import MultiQueryRetriever
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(temperature=0)
mqr = MultiQueryRetriever.from_llm(retriever=retriever, llm=llm)

(mqr | get_summary).invoke(query_str)
```

```output
"President Biden has made several notable quotes and comments. He expressed a commitment to investigate the potential impact of burn pits on soldiers' health, referencing his son's brain cancer [1]. He emphasized the importance of unity among Americans, urging us to see each other as fellow citizens rather than enemies [2]. Biden also highlighted the need for schools to use funds from the American Rescue Plan to hire teachers and address learning loss, while encouraging community involvement in supporting education [3]."
```

```python
(mqr | get_sources).invoke(query_str)
```

```output
[Document(page_content='When they came home, many of the world’s fittest and best trained warriors were never the same. Dizziness. \n\nA cancer that would put them in a flag-draped coffin. I know. \n\nOne of those soldiers was my son Major Beau Biden. We don’t know for sure if a burn pit was the cause of his brain cancer, or the diseases of so many of our troops. But I’m committed to finding out everything we can.', metadata={'lang': 'eng', 'section': '1', 'offset': '34652', 'len': '60', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='The U.S. Department of Justice is assembling a dedicated task force to go after the crimes of Russian oligarchs. We are joining with our European allies to find and seize your yachts your luxury apartments your private jets. We are coming for your ill-begotten gains. And tonight I am announcing that we will join our allies in closing off American air space to all Russian flights – further isolating Russia – and adding an additional squeeze –on their economy. The Ruble has lost 30% of its value.', metadata={'lang': 'eng', 'section': '1', 'offset': '3807', 'len': '42', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='And, if Congress provides the funds we need, we’ll have new stockpiles of tests, masks, and pills ready if needed. I cannot promise a new variant won’t come. But I can promise you we’ll do everything within our power to be ready if it does. Third – we can end the shutdown of schools and businesses. We have the tools we need.', metadata={'lang': 'eng', 'section': '1', 'offset': '24753', 'len': '82', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='The returned results did not contain sufficient information to be summarized into a useful answer for your query. Please try a different search or restate your query differently.', metadata={'summary': True}),
 Document(page_content='Danielle says Heath was a fighter to the very end. He didn’t know how to stop fighting, and neither did she. Through her pain she found purpose to demand we do better. Tonight, Danielle—we are. The VA is pioneering new ways of linking toxic exposures to diseases, already helping more veterans get benefits.', metadata={'lang': 'eng', 'section': '1', 'offset': '35502', 'len': '58', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='Let’s stop seeing each other as enemies, and start seeing each other for who we really are: Fellow Americans. We can’t change how divided we’ve been. But we can change how we move forward—on COVID-19 and other issues we must face together. I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera. They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun.', metadata={'lang': 'eng', 'section': '1', 'offset': '26312', 'len': '89', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'}),
 Document(page_content='The American Rescue Plan gave schools money to hire teachers and help students make up for lost learning. I urge every parent to make sure your school does just that. And we can all play a part—sign up to be a tutor or a mentor. Children were also struggling before the pandemic. Bullying, violence, trauma, and the harms of social media.', metadata={'lang': 'eng', 'section': '1', 'offset': '33227', 'len': '61', 'X-TIKA:Parsed-By': 'org.apache.tika.parser.csv.TextAndCSVParser', 'Content-Encoding': 'UTF-8', 'Content-Type': 'text/plain; charset=UTF-8', 'source': 'vectara'})]
```
