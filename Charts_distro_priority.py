import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from math import ceil

# Charger le fichier
df = pd.read_csv("Book2.csv", sep=";")

# Convertir les pourcentages
pct_cols = [f"% Rang {i}" for i in range(1, 8)]
for col in pct_cols:
    df[col] = df[col].astype(str).str.replace(",", ".", regex=False).astype(float)

# Dictionnaire de couleurs par thématique
theme_colors = {
    "Reconnaissance": "#4E79A7",  # Blue – value, appreciation
    "Ressources": "#59A14F",  # Green – means, support
    "Climat social": "#F28E2B",  # Orange – relationships, dynamics
    "Autonomie": "#76B7B2",  # Teal – independence, space
    "Quantité de travail": "#E15759",  # Red – pressure, overload
    "Charge émotionnelle": "#B07AA1",  # Purple – affective burden
    "Equilibre vie privée et vie professionnelle": "#EDC948",  # Yellow – balance
}

# Paramètres
rank_labels = np.arange(1, 8)
n = len(df)
cols = 2
rows = ceil(n / cols)

fig, axes = plt.subplots(rows, cols, figsize=(16, 4 * rows), sharex=True, sharey=True)
axes = np.array(axes).reshape(rows, cols)

# Un subplot par thématique
for i, (_, row) in enumerate(df.iterrows()):
    ax = axes[i // cols, i % cols]
    theme = row["Thématique"]
    color = theme_colors.get(theme, "#4C78A8")  # couleur par défaut si absent

    y = [row[f"% Rang {j}"] * 100 for j in range(1, 8)]

    ax.bar(rank_labels, y, color=color, alpha=0.85)
    ax.plot(rank_labels, y, color=color, marker="o", linewidth=2)

    ax.set_title(theme, fontsize=11)
    ax.set_xticks(rank_labels)
    ax.set_ylim(0, 35)
    ax.grid(axis="y", alpha=0.25)

# Supprimer les axes vides
for j in range(n, rows * cols):
    fig.delaxes(axes[j // cols, j % cols])

fig.suptitle("Distribution des rangs par thématique", fontsize=18, y=1.02)
fig.supxlabel("Rang")
fig.supylabel("Pourcentage des réponses (%)")
fig.tight_layout()

# Export PNG
fig.savefig("distribution_thematiques_subplots.png", dpi=300, bbox_inches="tight")
plt.show()









import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from math import ceil

# Source Excel Table
df = xl("tableau_importance[#All]", headers=True)

# Nettoyage des noms de colonnes si besoin
df.columns = [str(c).strip() for c in df.columns]

# Convertir les colonnes % (virgule décimale -> point)
pct_cols = [f"% Rang {i}" for i in range(1, 8)]
for col in pct_cols:
    df[col] = (
        df[col]
        .astype(str)
        .str.replace(",", ".", regex=False)
        .astype(float)
    )

# Colonnes des effectifs
rank_cols = [f"N Rang {i}" for i in range(1, 8)]
ranks = np.arange(1, 8)

# Couleurs thématiques
theme_colors = {
    "Reconnaissance": "#4E79A7",
    "Ressources": "#59A14F",
    "Climat social": "#F28E2B",
    "Autonomie": "#76B7B2",
    "Quantité de travail": "#E15759",
    "Charge émotionnelle": "#B07AA1",
    "Equilibre vie privée et vie professionnelle": "#EDC948",
}

# Calculs
df["Total réponses"] = df[rank_cols].sum(axis=1)
df["Point moyen"] = df[rank_cols].mul(ranks, axis=1).sum(axis=1) / df["Total réponses"]

def weighted_median_from_counts(row):
    values = np.repeat(ranks, row[rank_cols].astype(int).values)
    return float(np.median(values)) if len(values) else np.nan

df["Médiane"] = df.apply(weighted_median_from_counts, axis=1)

# Classement par importance croissante
df_sorted = df.sort_values(by=["Point moyen", "Médiane"], ascending=[True, True]).reset_index(drop=True)
df_sorted["Rang importance"] = np.arange(1, len(df_sorted) + 1)

# Tableau de synthèse
tableau_synthese = df_sorted[
    ["Rang importance", "Thématique", "Point moyen", "Médiane", "Total réponses"]
].copy()

# Tableau distribution
tableau_distribution = df_sorted[
    ["Thématique"] + rank_cols + pct_cols + ["Point moyen", "Médiane", "Total réponses"]
].copy()

# ---------
# Graphique en sous-graphiques
# ---------
n = len(df_sorted)
cols = 2
rows = ceil(n / cols)

fig, axes = plt.subplots(rows, cols, figsize=(16, 4 * rows), sharex=True, sharey=True)
axes = np.array(axes).reshape(rows, cols)

for i, (_, row) in enumerate(df_sorted.iterrows()):
    ax = axes[i // cols, i % cols]
    theme = row["Thématique"]
    color = theme_colors.get(theme, "#4C78A8")
    y = [row[f"% Rang {j}"] * 100 for j in range(1, 8)]
    ax.bar(ranks, y, color=color, alpha=0.85)
    ax.plot(ranks, y, color=color, marker="o", linewidth=2)
    ax.set_title(theme, fontsize=11)
    ax.set_xticks(ranks)
    ax.set_ylim(0, 35)
    ax.grid(axis="y", alpha=0.25)

for j in range(n, rows * cols):
    fig.delaxes(axes[j // cols, j % cols])

fig.suptitle("Distribution des rangs par thématique", fontsize=18, y=1.02)
fig.supxlabel("Rang")
fig.supylabel("Pourcentage des réponses (%)")
fig.tight_layout()

# Affichage des tableaux et du graphique dans Excel
tableau_synthese