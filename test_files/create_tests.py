import os
import zipfile

test_dir = os.path.join(os.path.dirname(__file__))

# Generate minimal PPTX
with zipfile.ZipFile(os.path.join(test_dir, 'test.pptx'), 'w') as z:
    z.writestr('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"></Types>')
    z.writestr('ppt/slides/slide1.xml', '<?xml version="1.0" encoding="UTF-8"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Introduction to Computer Architecture</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>')

# Generate minimal XLSX (Sheet1.xml)
with zipfile.ZipFile(os.path.join(test_dir, 'test.xlsx'), 'w') as z:
    z.writestr('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>')
    z.writestr('xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheets><sheet name="Grades" sheetId="1" r:id="rId1" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/></sheets></workbook>')
    z.writestr('xl/worksheets/sheet1.xml', '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Course</t></is></c><c r="B1" t="inlineStr"><is><t>Grade</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>Physics</t></is></c><c r="B2" t="inlineStr"><is><t>A+</t></is></c></row></sheetData></worksheet>')

# Also generate test.xls
with open(os.path.join(test_dir, 'test.xls'), 'wb') as f:
    f.write(b'\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1' + b'\x00'*500 + 'Spreadsheet Ledger Data'.encode('utf-16le') + b'\x00'*200)

print("All sample files generated successfully!")
