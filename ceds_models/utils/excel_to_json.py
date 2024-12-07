import pandas as pd
import json
import os

def excel_to_json(excel_path, output_path):
    """
    Convierte un archivo Excel a formato JSON
    """
    # Leer el archivo Excel
    df = pd.read_excel(excel_path)
    
    # Convertir a diccionario
    data = df.to_dict(orient='records')
    
    # Guardar como JSON
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    return data

def convert_all_excel_files():
    """
    Convierte todos los archivos Excel del directorio diccionario_datos
    """
    excel_dir = 'ceds_models/static/diccionario_datos'
    json_dir = 'ceds_models/static/json_data'
    
    # Crear directorio para JSON si no existe
    if not os.path.exists(json_dir):
        os.makedirs(json_dir)
    
    # Procesar cada archivo Excel
    for filename in os.listdir(excel_dir):
        if filename.endswith('.xlsx'):
            excel_path = os.path.join(excel_dir, filename)
            json_filename = filename.replace('.xlsx', '.json')
            json_path = os.path.join(json_dir, json_filename)
            
            print(f"Convirtiendo {filename}...")
            excel_to_json(excel_path, json_path)
            print(f"Archivo JSON creado en: {json_path}")

if __name__ == "__main__":
    convert_all_excel_files() 