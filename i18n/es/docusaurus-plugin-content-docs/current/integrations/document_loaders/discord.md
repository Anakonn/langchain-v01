---
translated: true
---

# Discord

>[Discord](https://discord.com/) es una plataforma social de VoIP y mensajería instantánea. Los usuarios tienen la capacidad de comunicarse mediante llamadas de voz, videollamadas, mensajería de texto, medios y archivos en chats privados o como parte de comunidades llamadas "servidores". Un servidor es una colección de salas de chat persistentes y canales de voz a los que se puede acceder a través de enlaces de invitación.

Sigue estos pasos para descargar tus datos de `Discord`:

1. Ve a tus **Ajustes de usuario**
2. Luego ve a **Privacidad y seguridad**
3. Dirígete a la opción **Solicitar todos mis datos** y haz clic en el botón **Solicitar datos**

Puede tardar 30 días en recibir tus datos. Recibirás un correo electrónico a la dirección registrada con Discord. Ese correo electrónico tendrá un botón de descarga con el que podrás descargar tus datos personales de Discord.

```python
import os

import pandas as pd
```

```python
path = input('Please enter the path to the contents of the Discord "messages" folder: ')
li = []
for f in os.listdir(path):
    expected_csv_path = os.path.join(path, f, "messages.csv")
    csv_exists = os.path.isfile(expected_csv_path)
    if csv_exists:
        df = pd.read_csv(expected_csv_path, index_col=None, header=0)
        li.append(df)

df = pd.concat(li, axis=0, ignore_index=True, sort=False)
```

```python
from langchain_community.document_loaders.discord import DiscordChatLoader
```

```python
loader = DiscordChatLoader(df, user_id_col="ID")
print(loader.load())
```
