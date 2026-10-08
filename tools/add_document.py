#!/usr/bin/env python3
"""Adiciona um PDF à biblioteca de documentos do site.

Uso:
  python tools/add_document.py caminho/ficheiro.pdf \
      --title-pt "Título em português" --title-en "Title in English" \
      --desc-pt "Descrição curta" --desc-en "Short description" \
      --category metodologia --authors "Autor(es)" --publisher IUCN --year 2026 --lang EN

O script copia o PDF para docs/, cria a miniatura da capa (docs/thumbs/, precisa de
`pdftoppm` — opcional), calcula n.º de páginas e tamanho e acrescenta a entrada em
data/documents.js. Depois é só fazer commit/push.
Categorias: metodologia | guia | relatorio | outro (ou crie novas em data/documents.js).
"""
import argparse, json, re, shutil, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JSON = ROOT / "data" / "documents.js"

def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")

def pages_of(pdf):
    try:
        out = subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True).stdout
        m = re.search(r"Pages:\s+(\d+)", out)
        if m: return int(m.group(1))
    except FileNotFoundError:
        pass
    try:
        from pypdf import PdfReader
        return len(PdfReader(str(pdf)).pages)
    except Exception:
        return None

def main():
    a = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    a.add_argument("pdf")
    a.add_argument("--title-pt"); a.add_argument("--title-en")
    a.add_argument("--desc-pt", default=""); a.add_argument("--desc-en", default="")
    a.add_argument("--category", default="metodologia")
    a.add_argument("--authors", default=""); a.add_argument("--publisher", default="")
    a.add_argument("--year", type=int); a.add_argument("--lang", default="PT")
    a.add_argument("--license", default="")
    a = a.parse_args()

    src = Path(a.pdf)
    if not src.is_file(): sys.exit(f"Ficheiro não encontrado: {src}")
    name = re.sub(r"[^A-Za-z0-9._-]+", "-", src.stem).strip("-") + ".pdf"
    dst = ROOT / "docs" / name
    dst.parent.mkdir(exist_ok=True); (ROOT / "docs" / "thumbs").mkdir(exist_ok=True)
    if src.resolve() != dst.resolve(): shutil.copy2(src, dst)

    thumb = None
    try:
        base = ROOT / "docs" / "thumbs" / dst.stem
        subprocess.run(["pdftoppm", "-jpeg", "-jpegopt", "quality=82", "-f", "1", "-l", "1", "-scale-to-x", "420",
                        "-scale-to-y", "-1", "-singlefile", str(dst), str(base)], check=True, capture_output=True)
        thumb = f"docs/thumbs/{dst.stem}.jpg"
    except Exception:
        print("Aviso: sem miniatura (instale poppler-utils / pdftoppm para a gerar).")

    nice = src.stem.replace("_", " ").replace("-", " ")
    size = dst.stat().st_size / 1048576
    entry = {
        "id": slug(src.stem),
        "file": f"docs/{name}",
        "thumb": thumb,
        "category": a.category,
        "title": {"pt": a.title_pt or a.title_en or nice, "en": a.title_en or a.title_pt or nice},
        "description": {"pt": a.desc_pt or a.desc_en, "en": a.desc_en or a.desc_pt},
        "authors": a.authors, "publisher": a.publisher, "year": a.year, "language": a.lang.upper(),
        "pages": pages_of(dst),
        "size": (f"{size:.1f} MB").replace(".", ","),
        "license": a.license,
    }
    raw = JSON.read_text(encoding="utf-8")
    data = json.loads(raw[raw.index("{"): raw.rindex("}") + 1])
    data["documents"] = [d for d in data["documents"] if d["id"] != entry["id"]] + [entry]
    head = raw[: raw.index("window.LRI_DOCUMENTS")]
    JSON.write_text(head + "window.LRI_DOCUMENTS = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    print(f"✔ Adicionado: {entry['title']['pt']}  ({entry['pages']} págs, {entry['size']})")

if __name__ == "__main__":
    main()
