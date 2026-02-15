# Defect media (Reject Bin — first 5 defects)

Files live in **public/defects/** (this folder). The app maps **app defect IDs** (EP03.01–EP03.05) to your **file codes** via `DEFECT_FILE_MAP` in `js/data.js`.

## Mapping (app defect → file names)

| App defect | Report PDF   | Remedial PDF      | Photos (general / close-up / detailed)   |
|------------|--------------|-------------------|------------------------------------------|
| EP03.01    | 37.01.pdf    | 37.01_Remedial.pdf | 37.01.01.jpeg, 37.01.02.jpeg, 37.01.03.jpeg |
| EP03.02    | 37.07.pdf    | 37.07_Remedial.pdf | 37.07.01.jpeg, 37.07.02.jpeg, 37.07.03.jpeg |
| EP03.03    | 47.03.pdf    | 47.03_Remedial.pdf | 47.03.01.jpeg, 47.03.02.jpeg, 47.03.03.jpeg |
| EP03.04    | 47.15.pdf    | 47.15_Remedial.pdf | 47.15.01.jpeg, 47.15.02.jpeg, 47.15.03.jpeg |
| EP03.05    | 47.06.pdf    | 47.06_Remedial.pdf | OC47.06.1.jpeg, OC47.06.02.jpeg, OC47.06.03.jpeg |

All paths are under **public/defects/** (e.g. `public/defects/37.01.pdf`, `public/defects/47.15.02.jpeg`). EP03.05 uses code **OC47.06** for photos and **47.06** for the PDFs.
