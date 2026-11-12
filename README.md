# Gerador de Lettering

Lettering animado para vídeos: caixa que abre do centro, nome, CRM e descrição revelados letra a letra e arco de círculos da marca.

## Como usar

1. Abra a página (`index.html`).
2. Escolha a identidade no topo: TribeMD, Oncologia Brasil, Hemomeeting ou Bipp.
3. Preencha nome, CRM (estado + número) e descrição.
4. Ajuste tipografia, cores, caixa, círculos e tempos, se precisar.
5. Exporte:
   - **MOV (alfa)**: QuickTime Animation com transparência. Abre no Premiere, After Effects, DaVinci e Final Cut.
   - **Sequência PNG (.zip)**: um PNG transparente por quadro.
   - **PNG do quadro atual**.

O arquivo sai com o nome da pessoa, sem "Dr."/"Dra." (ex.: `Natalia_Nunes.mov`).

## Publicar no GitHub Pages

- Suba a pasta `gerador-lettering/` para o repositório (por exemplo, ao lado do gerador de rodapé).
- Ela fica disponível em `https://<usuario>.github.io/<repositorio>/gerador-lettering/`.
- É um arquivo único, sem build e sem dependências. A fonte Montserrat vem do Google Fonts.

## Observações

- As alterações feitas nos campos ficam salvas no navegador de quem usa (localStorage), não no arquivo.
- "Copiar configurações" copia só o que está diferente do padrão, para transformar em novo padrão no código (`const DEFAULTS` em `index.html`).
- Tudo roda no navegador; nada é enviado para servidor.
