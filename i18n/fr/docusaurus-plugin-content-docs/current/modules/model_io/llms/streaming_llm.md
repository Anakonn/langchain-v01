---
translated: true
---

# Streaming

Tous les `LLM` implémentent l'interface `Runnable`, qui comprend des implémentations par défaut de toutes les méthodes, c'est-à-dire `invoke`, `batch`, `abatch`, `stream`, `astream`. Cela donne à tous les `LLM` un support de base pour le streaming.

Le support du streaming par défaut consiste à renvoyer un itérateur (ou un AsyncIterator dans le cas du streaming asynchrone) d'une seule valeur, le résultat final renvoyé par le fournisseur `LLM` sous-jacent. Cela ne vous donne évidemment pas de streaming token par token, ce qui nécessite un support natif du fournisseur `LLM`, mais s'assure que votre code qui s'attend à un itérateur de tokens peut fonctionner pour n'importe laquelle de nos intégrations `LLM`.

Voir quelles [intégrations prennent en charge le streaming token par token ici](/docs/integrations/llms/).

```python
from langchain_openai import OpenAI

llm = OpenAI(model="gpt-3.5-turbo-instruct", temperature=0, max_tokens=512)
for chunk in llm.stream("Write me a song about sparkling water."):
    print(chunk, end="", flush=True)
```

```output


Verse 1:
Bubbles dancing in my glass
Clear and crisp, it's such a blast
Refreshing taste, it's like a dream
Sparkling water, you make me beam

Chorus:
Oh sparkling water, you're my delight
With every sip, you make me feel so right
You're like a party in my mouth
I can't get enough, I'm hooked no doubt

Verse 2:
No sugar, no calories, just pure bliss
You're the perfect drink, I must confess
From lemon to lime, so many flavors to choose
Sparkling water, you never fail to amuse

Chorus:
Oh sparkling water, you're my delight
With every sip, you make me feel so right
You're like a party in my mouth
I can't get enough, I'm hooked no doubt

Bridge:
Some may say you're just plain water
But to me, you're so much more
You bring a sparkle to my day
In every single way

Chorus:
Oh sparkling water, you're my delight
With every sip, you make me feel so right
You're like a party in my mouth
I can't get enough, I'm hooked no doubt

Outro:
So here's to you, my dear sparkling water
You'll always be my go-to drink forever
With your effervescence and refreshing taste
You'll always have a special place.
```
