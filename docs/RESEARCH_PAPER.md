# SpendWise Research Paper

## Download

**IEEE Research Paper**: [SpendWise_IEEE_Research_Paper.tex](SpendWise_IEEE_Research_Paper.tex)

## About

This paper presents SpendWise, a comprehensive cross-platform personal finance management application designed to address the global financial literacy crisis. The paper includes:

- **System Architecture**: Novel integration of React Native, Firebase Realtime Database, and LLaMA 3.3 70B AI
- **Related Work**: Comprehensive literature review comparing commercial and academic solutions
- **Use Cases**: Four detailed real-world application scenarios
- **Pilot Evaluation**: Honest 5-participant, 4-week pilot study validation
- **Comprehensive Analysis**: Research grounded in behavioral economics and financial literacy studies

## Compiling the Paper

This is a LaTeX document. To compile it into a PDF:

### Online (Recommended for Quick View)
1. Visit [Overleaf](https://www.overleaf.com/)
2. Create a free account
3. Upload `SpendWise_IEEE_Research_Paper.tex`
4. Click "Recompile" to generate the PDF

### Local Compilation
If you have LaTeX installed:

```bash
pdflatex SpendWise_IEEE_Research_Paper.tex
bibtex SpendWise_IEEE_Research_Paper
pdflatex SpendWise_IEEE_Research_Paper.tex
pdflatex SpendWise_IEEE_Research_Paper.tex
```

Or use `latexmk`:
```bash
latexmk -pdf SpendWise_IEEE_Research_Paper.tex
```

## Requirements

The paper uses the IEEE conference paper format (`IEEEtran` document class) and includes:
- TikZ for diagrams
- PGF-Pie for pie charts
- PGFPlots for trend graphs
- Standard IEEE bibliography style

All packages are included in standard LaTeX distributions (TeX Live, MiKTeX).

## Citation

If you reference this work, please cite:

```bibtex
@misc{spendwise2024,
  author = {Lekhan, HR},
  title = {SpendWise: A Personal Finance Management Application},
  year = {2024},
  publisher = {GitHub},
  howpublished = {\url{https://github.com/lekhanpro/spendwisev2}}
}
```

## License

This research paper is released under MIT License, consistent with the SpendWise application.

---

**Back to**: [SpendWise Main Page](index.html) | [GitHub Repository](https://github.com/lekhanpro/spendwisev2)
