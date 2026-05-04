###########
# Imports #
###########

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import math
import textwrap
from functools import lru_cache










#############
# Constants #
#############

# Numeric scales
SCALE_1_4 = ["1", "2", "3", "4"]

# Yes / No
SCALE_OUI_NON = ["Oui", "Non"]

# Work dimensions
SCALE_RPS = [
    "Reconnaissance",
    "Ressources",
    "Climat social",
    "Autonomie",
    "Quantité de travail",
    "Charge émotionnelle",
    "Equilibre vie privée – vie professionnelle"
]

# Work seniorities
SCALE_SENIORITY = [
    "Moins de 5 ans",
    "5 à 10 ans",
    "10 à 15 ans",
    "15 à 20 ans",
    "Plus de 20 ans"
]

SCALE_SENIORITY_CHIEF = [
    "1 à 5 ans",
    "5 à 10 ans",
    "10 à 15 ans",
    "15 à 20 ans",
    "Plus de 20 ans"
]

# Work dimensions priorities
RPS_PRIORITIES = [1, 2, 3, 4, 5, 6, 7]

# Mapping column → scale
COLUMN_SCALES = {
    # examples — adapt to your real column names
    "Satisfaction globale": SCALE_1_4,
    "Stress perçu": SCALE_1_4,
    "Souhaite continuer": SCALE_OUI_NON,
    "Facteur principal": SCALE_RPS,
}

# Work dimensions colors
RPS_COLORS = {
    "Reconnaissance": "#4E79A7", # Blue – value, appreciation
    "Ressources": "#59A14F", # Green – means, support
    "Climat social": "#F28E2B", # Orange – relationships, dynamics
    "Autonomie": "#76B7B2", # Teal – independence, space
    "Quantité de travail": "#E15759", # Red – pressure, overload
    "Charge émotionnelle": "#B07AA1", # Purple – affective burden
    "Equilibre vie privée et vie professionnelle": "#EDC948", # Yellow – balance
}

# Demo colors (same tint as RPS)
DEMO_COLORS = list(RPS_COLORS.values())

# ergo_chef colors
COLOR_ERGO = "#90c599"
COLOR_CHEF = "#498c9f"

# comparison colors
COLOR_GROUP_1 = "#F28E2B"
COLOR_GROUP_2 = "#B07AA1"

# Sentinel value for empty / null answers
NO_DATA_SENTINEL = "__NO_DATA__"

#Cell content (to avoid content visible in excel cell)
CELL = "None"










########
# Data #
########

@lru_cache(None)
def main_df():
    df = xl("side_by_side_table[#All]")

    # Promote first row to header
    df.columns = df.iloc[0]
    df = df[1:].reset_index(drop=True)

    # Normalize "Visible"
    df["Visible"] = (
        df["Visible"]
        .astype(str)
        .str.lower()
        .isin(["true", "1", "yes"])
    )

    # Replace all null / empty cells with sentinel
    df = df.fillna(NO_DATA_SENTINEL)

    # Also normalize empty strings / whitespace-only cells
    df = df.replace(
        to_replace=r"^\s*$",
        value=NO_DATA_SENTINEL,
        regex=True,
    )

    return df

@lru_cache(None)
def columns_config():
    df = xl("side_by_side_columns")

    df = df.fillna(NO_DATA_SENTINEL)
    df = df.replace(
        to_replace=r"^\s*$",
        value=NO_DATA_SENTINEL,
        regex=True,
    )

    return df

# Materialize for Excel dependency graph
df_all = main_df()
df_columns = columns_config()










#########
# Logic #
#########

def selected_columns(tag: str):
    df = columns_config().copy()

    first_col = (
        df.iloc[:, 0]
        .astype(str)
        .str.strip()
        .str.lower()
    )

    if tag.lower() == "th_ergo":
        mask = first_col == "th_ergo"
    elif tag.lower() == "th_chef":
        mask = first_col == "th_chef"
    else:
        mask = first_col.isin([tag.lower(), "tous"])

    return (
        df[mask]
        .iloc[:, 1]
        .dropna()
        .astype(str)
        .tolist()
    )

def filter_population(df, role: str = "all"):
    if role in ("ergo", "chef"):
        return df[
            (df["Visible"]) &
            (df["Position"].str.lower().str.startswith(role))
        ]
    else:
        return df[
            (df["Visible"])
        ]

def value_counts_full(series, scale):
    """
    Guarantee full x-axis even if some values are missing
    """
    return (
        series.astype(str)
        .value_counts()
        .reindex(scale, fill_value=0)
    )

def normalize_series(s):
    return (
        s.astype(str)
         .str.strip()
         .replace(
             {
                 NO_DATA_SENTINEL: pd.NA,
                 "nan": pd.NA,
                 "0": pd.NA,
             }
         )
         .dropna()
    )

def detect_canonical_scale(values):
    unique = set(values)

    # Numeric Likert 1–4
    if unique.issubset({"1", "2", "3", "4"}):
        return ["1", "2", "3", "4"]

    # Yes / No (French)
    if unique.issubset({"Oui", "Non"}):
        return ["Oui", "Non"]

    # Yes / No (lowercase / mixed)
    if unique.issubset({"oui", "non", "Oui", "Non"}):
        return ["Oui", "Non"]

    return None

def infer_scale_from_dataframe(df, column):
    all_values = normalize_series(df[column])

    # 1️⃣ Try canonical detection
    canonical = detect_canonical_scale(all_values)
    if canonical:
        return canonical

    # 2️⃣ Numeric strings → numeric order
    if all_values.str.match(r"^\d+$").all():
        return sorted(all_values.unique(), key=int)

    # 3️⃣ Categorical → stable alphabetical
    return sorted(all_values.unique())

def value_counts_full(df, column, visible_df):
    scale = infer_scale_from_dataframe(df, column)

    observed = normalize_series(visible_df[column]).value_counts()

    return (
        observed
        .reindex(scale, fill_value=0),
        scale,
    )

def cm_2_in(value):
    return value / 2.54
 









##########
# Charts #
##########


def plot_bar_stacked_100(
        role: str, 
        col_mask: str, 
        fig_width = cm_2_in(12), 
        fig_height = cm_2_in(12) / 2,
        fontsize_title = 11,
        fontsize_label = 10
    ):
    """
    Build a 100% stacked column chart for ERGO or CHEF.
    Columns are priority questions.
    Stacks represent SCALE_RPS distribution.
    """

    # ---- 1. Select population ----
    df = filter_population(df_all, role)

    # ---- 2. Select priority columns ----
    columns = selected_columns(col_mask)

    if not columns:
        raise ValueError("No columns marked as 'themes'")

    # ---- 3. Count RPS occurrences per column ----
    counts_per_column = []

    for col in columns:
        if col not in df.columns:
            # Column missing → all zeros
            counts = pd.Series(0, index=SCALE_RPS)
        else:
            values = normalize_series(df[col])
            counts = (
                values
                .value_counts()
                .reindex(SCALE_RPS, fill_value=0)
            )

        counts_per_column.append(counts)

    # DataFrame: rows = SCALE_RPS, columns = questions
    counts_df = pd.DataFrame(counts_per_column, index=columns).T

    # ---- 4. Convert to percentages (100%) ----
    percentages = counts_df.div(counts_df.sum(axis=0), axis=1) * 100
    percentages = percentages.fillna(0)

    # ---- 5. Plot ----
    fig, ax = plt.subplots(figsize=(fig_width, fig_height))
    bottom = pd.Series([0] * len(columns), index=columns)

    for rps in SCALE_RPS:
        values = percentages.loc[rps]
        ax.bar(
            columns,
            values,
            bottom=bottom,
            label=rps,
            color=RPS_COLORS.get(rps, "#999999")
        )

        for i, col in enumerate(columns):
            val = values[col]
            if val > 0:
                ax.text(
                    i,
                    bottom[col] + val / 2,
                    f"{val:.0f}%",
                    ha='center',
                    va='center',
                    fontsize=fontsize_label
                )

        bottom += values

    # ---- 6. Formatting ----
    ax.set_ylabel("Pourcentage (%)")
    ax.set_ylim(0, 100)
    ax.set_xlabel("Ordre d'importance (rang)")
    ax.set_xticks(range(len(columns)))
    ax.set_xticklabels(RPS_PRIORITIES[:len(columns)])
    ax.set_title(
        f"Ordre d'importance des thématiques pour les {'ergothérapeutes' if role == 'ergo' else 'responsables' if role == 'chef' else ''}",
        fontsize=fontsize_title
        )
    
    ax.legend(
        title="Thématiques",
        bbox_to_anchor=(1.02, 1),
        loc="upper left"
    )

    plt.tight_layout()
    plt.show()


################################################################################



