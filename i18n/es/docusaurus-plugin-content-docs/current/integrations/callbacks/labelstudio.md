---
translated: true
---

# Label Studio

>[Label Studio](https://labelstud.io/guide/get_started) es una plataforma de etiquetado de datos de código abierto que brinda a LangChain flexibilidad a la hora de etiquetar datos para el ajuste fino de modelos de lenguaje grandes (LLM). También permite la preparación de datos de entrenamiento personalizados y la recopilación y evaluación de respuestas a través de comentarios humanos.

En esta guía, aprenderá cómo conectar una canalización LangChain a `Label Studio` para:

- Agregar todos los indicadores de entrada, conversaciones y respuestas en un solo proyecto `Label Studio`. Esto consolida todos los datos en un solo lugar para facilitar el etiquetado y el análisis.
- Refinar indicadores y respuestas para crear un conjunto de datos para el ajuste fino supervisado (SFT) y el aprendizaje por refuerzo con comentarios humanos (RLHF). Los datos etiquetados se pueden usar para seguir entrenando el LLM y mejorar su rendimiento.
- Evaluar las respuestas del modelo a través de comentarios humanos. `Label Studio` proporciona una interfaz para que los humanos revisen y proporcionen comentarios sobre las respuestas del modelo, lo que permite la evaluación y la iteración.

## Instalación y configuración

Primero instale las últimas versiones de Label Studio y el cliente API de Label Studio:

```python
%pip install --upgrade --quiet langchain label-studio label-studio-sdk langchain-openai
```

Luego, ejecute `label-studio` en la línea de comandos para iniciar la instancia local de LabelStudio en `http://localhost:8080`. Consulte la [guía de instalación de Label Studio](https://labelstud.io/guide/install) para obtener más opciones.

Necesitará un token para realizar llamadas a la API.

Abra su instancia de LabelStudio en su navegador, vaya a `Cuenta y configuración > Token de acceso` y copie la clave.

Establezca las variables de entorno con su URL de LabelStudio, la clave API y la clave API de OpenAI:

```python
import os

os.environ["LABEL_STUDIO_URL"] = "<YOUR-LABEL-STUDIO-URL>"  # e.g. http://localhost:8080
os.environ["LABEL_STUDIO_API_KEY"] = "<YOUR-LABEL-STUDIO-API-KEY>"
os.environ["OPENAI_API_KEY"] = "<YOUR-OPENAI-API-KEY>"
```

## Recopilación de indicadores y respuestas de LLM

Los datos utilizados para el etiquetado se almacenan en proyectos dentro de Label Studio. Cada proyecto se identifica por una configuración XML que detalla las especificaciones para los datos de entrada y salida.

Cree un proyecto que tome la entrada humana en formato de texto y genere una respuesta editable de LLM en un área de texto:

```xml
<View>
<Style>
    .prompt-box {
        background-color: white;
        border-radius: 10px;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        padding: 20px;
    }
</Style>
<View className="root">
    <View className="prompt-box">
        <Text name="prompt" value="$prompt"/>
    </View>
    <TextArea name="response" toName="prompt"
              maxSubmissions="1" editable="true"
              required="true"/>
</View>
<Header value="Rate the response:"/>
<Rating name="rating" toName="prompt"/>
</View>
```

1. Para crear un proyecto en Label Studio, haga clic en el botón "Crear".
2. Ingrese un nombre para su proyecto en el campo "Nombre del proyecto", como `Mi proyecto`.
3. Navegue a `Configuración de etiquetado > Plantilla personalizada` y pegue la configuración XML proporcionada anteriormente.

Puede recopilar indicadores de entrada de LLM y respuestas de salida en un proyecto de LabelStudio, conectándolo a través de `LabelStudioCallbackHandler`:

```python
from langchain_community.callbacks.labelstudio_callback import (
    LabelStudioCallbackHandler,
)
```

```python
from langchain_openai import OpenAI

llm = OpenAI(
    temperature=0, callbacks=[LabelStudioCallbackHandler(project_name="My Project")]
)
print(llm.invoke("Tell me a joke"))
```

En Label Studio, abra `Mi proyecto`. Verá los indicadores, las respuestas y los metadatos como el nombre del modelo.

## Recopilación de diálogos de modelos de chat

También puede rastrear y mostrar diálogos de chat completos en LabelStudio, con la capacidad de calificar y modificar la última respuesta:

1. Abra Label Studio y haga clic en el botón "Crear".
2. Ingrese un nombre para su proyecto en el campo "Nombre del proyecto", como `Nuevo proyecto con chat`.
3. Navegue a Configuración de etiquetado > Plantilla personalizada y pegue la siguiente configuración XML:

```xml
<View>
<View className="root">
     <Paragraphs name="dialogue"
               value="$prompt"
               layout="dialogue"
               textKey="content"
               nameKey="role"
               granularity="sentence"/>
  <Header value="Final response:"/>
    <TextArea name="response" toName="dialogue"
              maxSubmissions="1" editable="true"
              required="true"/>
</View>
<Header value="Rate the response:"/>
<Rating name="rating" toName="dialogue"/>
</View>
```

```python
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

chat_llm = ChatOpenAI(
    callbacks=[
        LabelStudioCallbackHandler(
            mode="chat",
            project_name="New Project with Chat",
        )
    ]
)
llm_results = chat_llm.invoke(
    [
        SystemMessage(content="Always use a lot of emojis"),
        HumanMessage(content="Tell me a joke"),
    ]
)
```

En Label Studio, abra "Nuevo proyecto con chat". Haga clic en una tarea creada para ver el historial del diálogo y editar/anotar las respuestas.

## Configuración de etiquetado personalizada

Puede modificar la configuración de etiquetado predeterminada en LabelStudio para agregar más etiquetas de destino como el sentimiento de la respuesta, la relevancia y muchos [otros tipos de comentarios del anotador](https://labelstud.io/tags/).

La nueva configuración de etiquetado se puede agregar desde la interfaz de usuario: vaya a `Configuración > Interfaz de etiquetado` y configure una configuración personalizada con etiquetas adicionales como `Opciones` para el sentimiento o `Calificación` para la relevancia. Tenga en cuenta que la etiqueta [`TextArea`](https://labelstud.io/tags/textarea) debe presentarse en cualquier configuración para mostrar las respuestas de LLM.

Alternativamente, puede especificar la configuración de etiquetado en la llamada inicial antes de la creación del proyecto:

```python
ls = LabelStudioCallbackHandler(
    project_config="""
<View>
<Text name="prompt" value="$prompt"/>
<TextArea name="response" toName="prompt"/>
<TextArea name="user_feedback" toName="prompt"/>
<Rating name="rating" toName="prompt"/>
<Choices name="sentiment" toName="prompt">
    <Choice value="Positive"/>
    <Choice value="Negative"/>
</Choices>
</View>
"""
)
```

Tenga en cuenta que si el proyecto no existe, se creará con la configuración de etiquetado especificada.

## Otros parámetros

El `LabelStudioCallbackHandler` acepta varios parámetros opcionales:

- **api_key** - Clave API de Label Studio. Reemplaza la variable de entorno `LABEL_STUDIO_API_KEY`.
- **url** - URL de Label Studio. Reemplaza `LABEL_STUDIO_URL`, predeterminado `http://localhost:8080`.
- **project_id** - ID de proyecto existente de Label Studio. Reemplaza `LABEL_STUDIO_PROJECT_ID`. Almacena datos en este proyecto.
- **project_name** - Nombre del proyecto si no se especifica el ID del proyecto. Crea un nuevo proyecto. El valor predeterminado es `"LangChain-%Y-%m-%d"` con formato con la fecha actual.
- **project_config** - [configuración de etiquetado personalizada](#configuración-de-etiquetado-personalizada)
- **mode**: use este atajo para crear la configuración de destino desde cero:
   - `"prompt"` - Indicador único, respuesta única. Predeterminado.
   - `"chat"` - Modo de chat de varios turnos.
