#!/usr/bin/env bash
# Compile report.tex to report.pdf
# Requires: tectonic (https://tectonic-typesetting.org) or pdflatex
set -euo pipefail
cd "$(dirname "$0")/../report"

if command -v tectonic &>/dev/null; then
  tectonic report.tex
  tectonic report.tex
elif command -v pdflatex &>/dev/null; then
  pdflatex -interaction=nonstopmode report.tex
  pdflatex -interaction=nonstopmode report.tex
else
  echo "Error: install tectonic or pdflatex to compile the report."
  echo "  brew install tectonic"
  echo "  or upload report.tex to Overleaf"
  exit 1
fi

echo "Generated report/report.pdf"
