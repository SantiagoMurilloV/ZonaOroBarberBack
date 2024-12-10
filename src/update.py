import requests
import json

# URL del endpoint al que deseas hacer la solicitud POST
url = 'http://localhost:8084/api/inventory'

# Leer el archivo JSON grande
with open('../src/inventory.json', 'r') as json_file:
    data = json.load(json_file)  # Leer y convertir el archivo JSON a una lista de objetos

# Headers para indicar que se está enviando JSON
headers = {
    'Content-Type': 'application/json'
}

# Iterar sobre cada objeto en el archivo JSON
for item in data:
    # Enviar cada objeto individualmente como una solicitud POST
    response = requests.post(url, json=item, headers=headers)
    
    # Verificar el estado de la respuesta
    if response.status_code == 201:
        print(f'Elemento {item.get("reference", "sin referencia")} creado exitosamente.')
    else:
        print(f'Error {response.status_code} al crear el elemento {item.get("reference", "sin referencia")}.')
        print('Respuesta del servidor:', response.text)
