---
translated: true
---

# Alpha Vantage

>[Alpha Vantage](https://www.alphavantage.co) Alpha Vantage fournit des données de marché financier en temps réel et historiques via un ensemble d'API de données et de feuilles de calcul puissantes et conviviales pour les développeurs.

Utilisez le ``AlphaVantageAPIWrapper`` pour obtenir les taux de change.

```python
import getpass
import os

os.environ["ALPHAVANTAGE_API_KEY"] = getpass.getpass()
```

```python
from langchain_community.utilities.alpha_vantage import AlphaVantageAPIWrapper
```

```python
alpha_vantage = AlphaVantageAPIWrapper()
alpha_vantage._get_exchange_rate("USD", "JPY")
```

```output
{'Realtime Currency Exchange Rate': {'1. From_Currency Code': 'USD',
  '2. From_Currency Name': 'United States Dollar',
  '3. To_Currency Code': 'JPY',
  '4. To_Currency Name': 'Japanese Yen',
  '5. Exchange Rate': '148.19900000',
  '6. Last Refreshed': '2023-11-30 21:43:02',
  '7. Time Zone': 'UTC',
  '8. Bid Price': '148.19590000',
  '9. Ask Price': '148.20420000'}}
```

La méthode `_get_time_series_daily` renvoie la date, l'ouverture quotidienne, le plus haut quotidien, le plus bas quotidien, la clôture quotidienne et le volume quotidien de l'action mondiale spécifiée, couvrant les 100 derniers points de données.

```python
alpha_vantage._get_time_series_daily("IBM")
```

La méthode `_get_time_series_weekly` renvoie le dernier jour de bourse de la semaine, l'ouverture hebdomadaire, le plus haut hebdomadaire, le plus bas hebdomadaire, la clôture hebdomadaire et le volume hebdomadaire de l'action mondiale spécifiée, couvrant plus de 20 ans de données historiques.

```python
alpha_vantage._get_time_series_weekly("IBM")
```

La méthode `_get_quote_endpoint` est une alternative légère aux API de séries temporelles et renvoie les dernières informations sur les prix et les volumes pour le symbole spécifié.

```python
alpha_vantage._get_quote_endpoint("IBM")
```

```output
{'Global Quote': {'01. symbol': 'IBM',
  '02. open': '156.9000',
  '03. high': '158.6000',
  '04. low': '156.8900',
  '05. price': '158.5400',
  '06. volume': '6640217',
  '07. latest trading day': '2023-11-30',
  '08. previous close': '156.4100',
  '09. change': '2.1300',
  '10. change percent': '1.3618%'}}
```

La méthode `search_symbol` renvoie une liste de symboles et les informations sur les entreprises correspondantes en fonction du texte saisi.

```python
alpha_vantage.search_symbols("IB")
```

La méthode `_get_market_news_sentiment` renvoie les sentiments actuels et historiques des nouvelles du marché pour un actif donné.

```python
alpha_vantage._get_market_news_sentiment("IBM")
```

La méthode `_get_top_gainers_losers` renvoie les 20 meilleures valeurs, les plus mauvaises et les plus actives du marché américain.

```python
alpha_vantage._get_top_gainers_losers()
```

La méthode `run` du wrapper prend les paramètres suivants : from_currency, to_currency.

Il obtient les taux de change pour la paire de devises donnée.

```python
alpha_vantage.run("USD", "JPY")
```

```output
{'1. From_Currency Code': 'USD',
 '2. From_Currency Name': 'United States Dollar',
 '3. To_Currency Code': 'JPY',
 '4. To_Currency Name': 'Japanese Yen',
 '5. Exchange Rate': '148.19900000',
 '6. Last Refreshed': '2023-11-30 21:43:02',
 '7. Time Zone': 'UTC',
 '8. Bid Price': '148.19590000',
 '9. Ask Price': '148.20420000'}
```
