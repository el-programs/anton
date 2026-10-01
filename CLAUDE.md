# Anton – Hinweise für die Entwicklung

- Persönliche iPhone-PWA, Oberfläche komplett auf Deutsch, kurze klare Texte.
- Kein Build-Schritt, keine Abhängigkeiten: `index.html`, `css/app.css`, `js/app.js` (UI), `js/db.js` (IndexedDB).
- Läuft vollständig offline. Einzige geplante Netzwerk-Nutzung: Abruf der ICS-Kalender beim Start.
- Bei jeder Änderung an App-Dateien `VERSION` in `sw.js` erhöhen, sonst sieht das iPhone die neue Version nicht. Neue Dateien in `FILES` in `sw.js` eintragen.
- Design: Schwarz, Akzent Petrol (#6aa9a6, in den Einstellungen änderbar), gedeckte Linien-Symbole, keine Emojis.
- Eingabefelder mindestens 16 px, sonst zoomt iOS hinein. Abstände zu Dynamic Island und Home-Balken über `env(safe-area-inset-*)`.
- Lokal testen: `python3 -m http.server` im Repo-Ordner und `http://localhost:8000` öffnen.
