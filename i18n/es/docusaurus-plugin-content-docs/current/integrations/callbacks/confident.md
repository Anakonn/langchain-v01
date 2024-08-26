---
translated: true
---

# Confiado

>[DeepEval](https://confident-ai.com) paquete para pruebas unitarias de LLM.
> Usando Confiado, todos pueden construir modelos de lenguaje robustos a través de iteraciones más rápidas
> utilizando tanto pruebas unitarias como pruebas de integración. Brindamos soporte para cada paso en la iteración
> desde la creación de datos sintéticos hasta las pruebas.

En esta guía demostraremos cómo probar y medir el rendimiento de los LLM. Mostramos cómo puede usar nuestro callback para medir el rendimiento y cómo puede definir su propia métrica e ingresarla en nuestro panel.

DeepEval también ofrece:
- Cómo generar datos sintéticos
- Cómo medir el rendimiento
- Un panel de control para monitorear y revisar los resultados a lo largo del tiempo

## Instalación y configuración

```python
%pip install --upgrade --quiet  langchain langchain-openai deepeval langchain-chroma
```

### Obtener credenciales de API

Para obtener las credenciales de la API de DeepEval, siga los siguientes pasos:

1. Ir a https://app.confident-ai.com
2. Haga clic en "Organización"
3. Copie la clave API.

Cuando inicie sesión, también se le pedirá que establezca el nombre de la `implementación`. El nombre de la implementación es necesario para describir el tipo de implementación. (Piense en cómo quiere llamar a su proyecto. Le recomendamos que sea descriptivo).

```python
!deepeval login
```

### Configurar DeepEval

De forma predeterminada, puede usar `DeepEvalCallbackHandler` para configurar las métricas que desea rastrear. Sin embargo, esto tiene un soporte limitado para métricas en este momento (se agregarán más pronto). Actualmente admite:
- [Relevancia de la respuesta](https://docs.confident-ai.com/docs/measuring_llm_performance/answer_relevancy)
- [Sesgo](https://docs.confident-ai.com/docs/measuring_llm_performance/debias)
- [Toxicidad](https://docs.confident-ai.com/docs/measuring_llm_performance/non_toxic)

```python
from deepeval.metrics.answer_relevancy import AnswerRelevancy

# Here we want to make sure the answer is minimally relevant
answer_relevancy_metric = AnswerRelevancy(minimum_score=0.5)
```

## Empezar

Para usar `DeepEvalCallbackHandler`, necesitamos el `nombre_de_implementación`.

```python
from langchain_community.callbacks.confident_callback import DeepEvalCallbackHandler

deepeval_callback = DeepEvalCallbackHandler(
    implementation_name="langchainQuickstart", metrics=[answer_relevancy_metric]
)
```

### Escenario 1: Alimentar en LLM

Luego puede alimentarlo en su LLM con OpenAI.

```python
from langchain_openai import OpenAI

llm = OpenAI(
    temperature=0,
    callbacks=[deepeval_callback],
    verbose=True,
    openai_api_key="<YOUR_API_KEY>",
)
output = llm.generate(
    [
        "What is the best evaluation tool out there? (no bias at all)",
    ]
)
```

```output
LLMResult(generations=[[Generation(text='\n\nQ: What did the fish say when he hit the wall? \nA: Dam.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nThe Moon \n\nThe moon is high in the midnight sky,\nSparkling like a star above.\nThe night so peaceful, so serene,\nFilling up the air with love.\n\nEver changing and renewing,\nA never-ending light of grace.\nThe moon remains a constant view,\nA reminder of life’s gentle pace.\n\nThrough time and space it guides us on,\nA never-fading beacon of hope.\nThe moon shines down on us all,\nAs it continues to rise and elope.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nQ. What did one magnet say to the other magnet?\nA. "I find you very attractive!"', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text="\n\nThe world is charged with the grandeur of God.\nIt will flame out, like shining from shook foil;\nIt gathers to a greatness, like the ooze of oil\nCrushed. Why do men then now not reck his rod?\n\nGenerations have trod, have trod, have trod;\nAnd all is seared with trade; bleared, smeared with toil;\nAnd wears man's smudge and shares man's smell: the soil\nIs bare now, nor can foot feel, being shod.\n\nAnd for all this, nature is never spent;\nThere lives the dearest freshness deep down things;\nAnd though the last lights off the black West went\nOh, morning, at the brown brink eastward, springs —\n\nBecause the Holy Ghost over the bent\nWorld broods with warm breast and with ah! bright wings.\n\n~Gerard Manley Hopkins", generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text='\n\nQ: What did one ocean say to the other ocean?\nA: Nothing, they just waved.', generation_info={'finish_reason': 'stop', 'logprobs': None})], [Generation(text="\n\nA poem for you\n\nOn a field of green\n\nThe sky so blue\n\nA gentle breeze, the sun above\n\nA beautiful world, for us to love\n\nLife is a journey, full of surprise\n\nFull of joy and full of surprise\n\nBe brave and take small steps\n\nThe future will be revealed with depth\n\nIn the morning, when dawn arrives\n\nA fresh start, no reason to hide\n\nSomewhere down the road, there's a heart that beats\n\nBelieve in yourself, you'll always succeed.", generation_info={'finish_reason': 'stop', 'logprobs': None})]], llm_output={'token_usage': {'completion_tokens': 504, 'total_tokens': 528, 'prompt_tokens': 24}, 'model_name': 'text-davinci-003'})
```

Luego puede verificar si la métrica tuvo éxito llamando al método `is_successful()`.

```python
answer_relevancy_metric.is_successful()
# returns True/False
```

Una vez que haya ejecutado eso, debería poder ver nuestro panel a continuación.

![Dashboard](https://docs.confident-ai.com/assets/images/dashboard-screenshot-b02db73008213a211b1158ff052d969e.png)

### Escenario 2: Rastrear un LLM en una cadena sin callbacks

Para rastrear un LLM en una cadena sin callbacks, puede conectarse al final.

Podemos comenzar definiendo una cadena simple como se muestra a continuación.

```python
import requests
from langchain.chains import RetrievalQA
from langchain_chroma import Chroma
from langchain_community.document_loaders import TextLoader
from langchain_openai import OpenAI, OpenAIEmbeddings
from langchain_text_splitters import CharacterTextSplitter

text_file_url = "https://raw.githubusercontent.com/hwchase17/chat-your-data/master/state_of_the_union.txt"

openai_api_key = "sk-XXX"

with open("state_of_the_union.txt", "w") as f:
    response = requests.get(text_file_url)
    f.write(response.text)

loader = TextLoader("state_of_the_union.txt")
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
docsearch = Chroma.from_documents(texts, embeddings)

qa = RetrievalQA.from_chain_type(
    llm=OpenAI(openai_api_key=openai_api_key),
    chain_type="stuff",
    retriever=docsearch.as_retriever(),
)

# Providing a new question-answering pipeline
query = "Who is the president?"
result = qa.run(query)
```

Después de definir una cadena, puede verificar manualmente la similitud de la respuesta.

```python
answer_relevancy_metric.measure(result, query)
answer_relevancy_metric.is_successful()
```

### ¿Qué sigue?

Puede crear sus propias métricas personalizadas [aquí](https://docs.confident-ai.com/docs/quickstart/custom-metrics).

DeepEval también ofrece otras funciones como poder [crear automáticamente pruebas unitarias](https://docs.confident-ai.com/docs/quickstart/synthetic-data-creation), [pruebas para alucinación](https://docs.confident-ai.com/docs/measuring_llm_performance/factual_consistency).

Si está interesado, visite nuestro repositorio de GitHub aquí [https://github.com/confident-ai/deepeval](https://github.com/confident-ai/deepeval). Damos la bienvenida a cualquier PR y discusión sobre cómo mejorar el rendimiento de LLM.
