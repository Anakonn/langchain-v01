---
translated: true
---

# Alpha Vantage

>[Alpha Vantage](https://www.alphavantage.co) Alpha Vantage proporciona datos de mercados financieros en tiempo real e históricos a través de un conjunto de potentes y fáciles de usar API de datos y hojas de cálculo.

Utilice el ``AlphaVantageAPIWrapper`` para obtener los tipos de cambio de divisas.

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

El método `_get_time_series_daily` devuelve la fecha, la apertura diaria, el máximo diario, el mínimo diario, el cierre diario y el volumen diario del valor global especificado, cubriendo los 100 últimos puntos de datos.

```python
alpha_vantage._get_time_series_daily("IBM")
```

El método `_get_time_series_weekly` devuelve el último día hábil de la semana, la apertura semanal, el máximo semanal, el mínimo semanal, el cierre semanal y el volumen semanal del valor global especificado, cubriendo más de 20 años de datos históricos.

```python
alpha_vantage._get_time_series_weekly("IBM")
```

El método `_get_quote_endpoint` es una alternativa ligera a las API de series temporales y devuelve la información más reciente sobre el precio y el volumen del símbolo especificado.

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

El método `search_symbol` devuelve una lista de símbolos y la información de la empresa correspondiente en función del texto introducido.

```python
alpha_vantage.search_symbols("IB")
```

El método `_get_market_news_sentiment` devuelve el sentimiento de noticias de mercado en vivo e histórico para un activo dado.

```python
alpha_vantage._get_market_news_sentiment("IBM")
```

El método `_get_top_gainers_losers` devuelve los 20 principales valores ganadores, perdedores y más activos del mercado estadounidense.

```python
alpha_vantage._get_top_gainers_losers()
```

El método `run` del wrapper toma los siguientes parámetros: from_currency, to_currency.

Obtiene los tipos de cambio de divisas para el par de divisas dado.

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
