#!/usr/bin/env python3
import sys
import os

try:
    import PyPDF2
    print("PyPDF2 disponível")
except ImportError:
    print("PyPDF2 não encontrado, tentando instalar...")
    os.system("pip3 install PyPDF2")
    import PyPDF2

def extract_text_from_pdf(pdf_path):
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            
            print(f"PDF tem {len(pdf_reader.pages)} páginas")
            
            for page_num, page in enumerate(pdf_reader.pages):
                page_text = page.extract_text()
                text += f"\n--- PÁGINA {page_num + 1} ---\n"
                text += page_text
                text += "\n"
            
            return text
    except Exception as e:
        return f"Erro ao extrair texto: {str(e)}"

if __name__ == "__main__":
    pdf_path = "RDS - IMOBILIÁRIA - LOCATÁRIOS E LOCADORES.pdf"
    if os.path.exists(pdf_path):
        text = extract_text_from_pdf(pdf_path)
        print(text)
    else:
        print(f"Arquivo {pdf_path} não encontrado")
