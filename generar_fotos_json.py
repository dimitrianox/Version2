import json
import os
import tkinter as tk
from tkinter import filedialog, messagebox

def seleccionar_archivos_y_procesar():
    # Inicializa Tkinter sin mostrar la ventana principal
    root = tk.Tk()
    root.withdraw()

    # 1. Seleccionar el primer JSON (Metadatos: title, location, visible, etc.)
    messagebox.showinfo("Paso 1 de 3", "Selecciona el archivo JSON con los METADATOS (títulos, ubicación, visibilidad).")
    archivo_meta = filedialog.askopenfilename(
        title="Selecciona el JSON de Metadatos",
        filetypes=[("Archivos JSON", "*.json"), ("Todos los archivos", "*.*")]
    )
    if not archivo_meta:
        print("Operación cancelada en el paso 1.")
        return

    # 2. Seleccionar el segundo JSON (Estructura de la Galería: items con url, date, type, etc.)
    messagebox.showinfo("Paso 2 de 3", "Selecciona el archivo JSON con los ITEMS de la galería (rutas, fechas, URL).")
    archivo_items = filedialog.askopenfilename(
        title="Selecciona el JSON con la lista de Items",
        filetypes=[("Archivos JSON", "*.json"), ("Todos los archivos", "*.*")]
    )
    if not archivo_items:
        print("Operación cancelada en el paso 2.")
        return

    # 3. Cargar el contenido de los dos archivos
    try:
        with open(archivo_meta, 'r', encoding='utf-8') as f:
            data_meta = json.load(f)

        with open(archivo_items, 'r', encoding='utf-8') as f:
            data_items = json.load(f)
    except Exception as e:
        messagebox.showerror("Error de lectura", f"Ocurrió un error al leer los archivos JSON:\n{e}")
        return

    # Extraer la lista de ítems según la estructura del segundo JSON
    items_base = []
    if isinstance(data_items, dict) and "items" in data_items:
        items_base = data_items["items"]
    elif isinstance(data_items, list):
        items_base = data_items
    else:
        messagebox.showerror("Formato Incompatible", "El segundo archivo JSON no contiene una lista válida de ítems.")
        return

    # 4. Fusionar los datos
    resultado_items = []
    for entry in items_base:
        nombre_archivo = entry.get("file") or entry.get("url")
        
        # Obtener los metadatos correspondientes desde el primer JSON usando el nombre de archivo
        meta = data_meta.get(nombre_archivo, {})

        item_fusionado = {
            "file": nombre_archivo,
            "type": entry.get("type", "photo"),
            "url": entry.get("url", ""),
            "date": entry.get("date", ""),
            "title": meta.get("title", ""),
            "location": meta.get("location", ""),
            "description": meta.get("description", ""),
            "visible": meta.get("visible", True)
        }
        resultado_items.append(item_fusionado)

    # 5. Seleccionar la ubicación de destino para guardar fotos.json
    messagebox.showinfo("Paso 3 de 3", "Selecciona la carpeta y nombre donde guardarás el archivo fotos.json.")
    archivo_destino = filedialog.asksaveasfilename(
        title="Guardar fotos.json como...",
        initialfile="fotos.json",
        defaultextension=".json",
        filetypes=[("Archivos JSON", "*.json")]
    )

    if not archivo_destino:
        print("Operación cancelada en la selección de destino.")
        return

    # 6. Escribir el archivo final fotos.json
    try:
        with open(archivo_destino, 'w', encoding='utf-8') as f:
            json.dump(resultado_items, f, ensure_ascii=False, indent=2)

        messagebox.showinfo("Éxito", f"El archivo se generó correctamente en:\n{archivo_destino}")
        print(f"Archivo guardado exitosamente en: {archivo_destino}")
    except Exception as e:
        messagebox.showerror("Error al guardar", f"No se pudo escribir el archivo de salida:\n{e}")

if __name__ == "__main__":
    seleccionar_archivos_y_procesar()