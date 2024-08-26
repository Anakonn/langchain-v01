---
translated: true
---

# Webhooks de IFTTT

Este cuaderno muestra cómo usar los Webhooks de IFTTT.

Desde https://github.com/SidU/teams-langchain-js/wiki/Connecting-IFTTT-Services.

## Creando un webhook

- Ir a https://ifttt.com/create

## Configurando el "If This"

- Haz clic en el botón "If This" en la interfaz de IFTTT.
- Busca "Webhooks" en la barra de búsqueda.
- Elige la primera opción para "Recibir una solicitud web con una carga útil JSON".
- Elige un nombre de evento que sea específico para el servicio al que planeas conectarte.
Esto facilitará la gestión de la URL del webhook.
Por ejemplo, si te estás conectando a Spotify, podrías usar "Spotify" como nombre de evento.
- Haz clic en el botón "Create Trigger" para guardar tu configuración y crear tu webhook.

## Configurando el "Then That"

- Toca el botón "Then That" en la interfaz de IFTTT.
- Busca el servicio al que quieres conectarte, como Spotify.
- Elige una acción del servicio, como "Agregar una pista a una lista de reproducción".
- Configura la acción especificando los detalles necesarios, como el nombre de la lista de reproducción,
por ejemplo, "Canciones de IA".
- Haz referencia a la carga útil JSON recibida por el Webhook en tu acción. Para el escenario de Spotify,
elige "{{JsonPayload}}" como tu consulta de búsqueda.
- Toca el botón "Create Action" para guardar la configuración de tu acción.
- Una vez que hayas terminado de configurar tu acción, haz clic en el botón "Finish" para
completar la configuración.
- ¡Felicidades! Has conectado con éxito el Webhook al servicio deseado y estás listo para
comenzar a recibir datos y activar acciones 🎉

## Finalizando

- Para obtener la URL de tu webhook, ve a https://ifttt.com/maker_webhooks/settings
- Copia el valor de la clave IFTTT de allí. La URL tiene el formato
https://maker.ifttt.com/use/TU_CLAVE_IFTTT. Toma el valor de TU_CLAVE_IFTTT.

```python
from langchain_community.tools.ifttt import IFTTTWebhook
```

```python
import os

key = os.environ["IFTTTKey"]
url = f"https://maker.ifttt.com/trigger/spotify/json/with/key/{key}"
tool = IFTTTWebhook(
    name="Spotify", description="Add a song to spotify playlist", url=url
)
```

```python
tool.run("taylor swift")
```

```output
"Congratulations! You've fired the spotify JSON event"
```
