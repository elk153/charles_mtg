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
    df = xl("lime_results[#All]")

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
    df = xl("lime_columns")

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


def plot_bar_regular_single_column(
        plot_column_tag,
        plot_title="Résumé d'une colonne",
        rotation_label=45,
        align_label="right",
        fig_width=10,
        fontsize_title=11,
        fontsize_label=9,
        role="all",
    ):
    """
    Plot a bar chart for a single column selected by tag.
    Each bar represents the count of each unique value in the column.
    """

    # Filter population
    df = filter_population(df_all, role)
    n = len(df)

    # Select the column using the same mechanism as plot_demo_summary
    columns = selected_columns(plot_column_tag)

    if not columns:
        print(f"No columns found for tag '{plot_column_tag}'")
        return

    if len(columns) > 1:
        print(f"Tag '{plot_column_tag}' returns multiple columns, using the first one")
    
    column_name = columns[0]

    if column_name not in df.columns:
        print(f"Column '{column_name}' not found")
        return

    series = normalize_series(df[column_name])
    counts = series.value_counts().sort_values(ascending=False)

    if counts.empty:
        print("No data to plot")
        return

    # Prepare data
    labels = counts.index.tolist()
    values = counts.values

    # Colors
    colors = [DEMO_COLORS[i % len(DEMO_COLORS)] for i in range(len(labels))]

    # Calculate figure height based on longest x-label (45° rotation)
    max_label_length = max((len(str(lbl)) for lbl in labels), default=10)
    # Estimate: ~0.55 inches per 10 characters at fontsize 10 with 45° rotation
    bottom_margin = (max_label_length / 10) * 0.55 * (fontsize_label / 10)
    fig_height = fig_width / 16 * 9

    # Plot
    fig, ax = plt.subplots(figsize=(fig_width, fig_height))
    bars = ax.bar(range(len(labels)), values, color=colors)

    ax.set_xticks(range(len(labels)))
    ax.set_xticklabels(labels, fontsize=fontsize_label, rotation=rotation_label, ha=align_label)

    # Wrapped title
    wrap_width = fig_width * 4.5
    wrapped_title = textwrap.fill(f"{plot_title} (n={n})", width=wrap_width)
    ax.set_title(
        wrapped_title, 
        fontsize=fontsize_title,
        pad=12)

    # Bar labels
    max_val = max(values) if values.size > 0 else 1
    total = sum(values)

    # Add space for 2-line labels (percentage + count line)
    label_space = max_val * 0.18  # Reserve ~12% of max height for labels
    ax.set_ylim(0, max_val + label_space)

    for i, bar in enumerate(bars):
        height = bar.get_height()
        perc = (height / total) * 100 if total > 0 else 0
        ax.text(
            bar.get_x() + bar.get_width() / 2.,
            height + 0.01 * max_val,
            f'{perc:.0f}%\n(n={int(height)})',
            ha='center',
            va='bottom',
            fontsize=fontsize_label
        )

    plt.subplots_adjust(bottom=min(bottom_margin, 0.4))  # Cap at 40% to avoid excessive space
    plt.tight_layout()
    plt.show()
    

################################################################################









def plot_bar_regular_single_column(
        plot_column_tag,
        plot_title="Résumé d'une colonne",
        rotation_label=45,
        align_label="right",
        fig_width=10,
        fontsize_title=11,
        fontsize_label=9,
        role="all",
    ):
    """
    Plot a bar chart for a single column selected by tag.
    Each bar represents the count of each unique value in the column.
    """

    # Filter population
    df = filter_population(df_all, role)

    # Select the column using the same mechanism as plot_demo_summary
    columns = selected_columns(plot_column_tag)

    if not columns:
        print(f"No columns found for tag '{plot_column_tag}'")
        return

    if len(columns) > 1:
        print(f"Tag '{plot_column_tag}' returns multiple columns, using the first one")
    
    column_name = columns[0]

    if column_name not in df.columns:
        print(f"Column '{column_name}' not found")
        return

    series = normalize_series(df[column_name])
    counts = series.value_counts().sort_values(ascending=False)

    if counts.empty:
        print("No data to plot")
        return

    # Prepare data
    labels = counts.index.tolist()
    values = counts.values

    # Colors
    colors = [DEMO_COLORS[i % len(DEMO_COLORS)] for i in range(len(labels))]

    # Calculate figure height based on longest x-label (45° rotation)
    max_label_length = max((len(str(lbl)) for lbl in labels), default=10)
    # Estimate: ~0.55 inches per 10 characters at fontsize 10 with 45° rotation
    bottom_margin = (max_label_length / 10) * 0.55 * (fontsize_label / 10)
    fig_height = fig_width / 16 *

    # Plot
    fig, ax = plt.subplots(figsize=(fig_width, fig_height))
    bars = ax.bar(range(len(labels)), values, color=colors)

    ax.set_xticks(range(len(labels)))
    ax.set_xticklabels(labels, fontsize=fontsize_label, rotation=rotation_label, ha=align_label)

    # Wrapped title
    wrap_width = fig_width * 4.5
    wrapped_title = textwrap.fill(plot_title, width=wrap_width)
    ax.set_title(
        wrapped_title, 
        fontsize=fontsize_title,
        pad=12)

    # Bar labels
    max_val = max(values) if values.size > 0 else 1
    total = sum(values)

    # Add space for 2-line labels (percentage + count line)
    label_space = max_val * 0.12  # Reserve ~12% of max height for labels
    ax.set_ylim(0, max_val + label_space)

    for i, bar in enumerate(bars):
        height = bar.get_height()
        perc = (height / total) * 100 if total > 0 else 0
        ax.text(
            bar.get_x() + bar.get_width() / 2.,
            height + 0.01 * max_val,
            f'{perc:.0f}%\n(n={int(height)})',
            ha='center',
            va='bottom',
            fontsize=fontsize_label
        )

    plt.subplots_adjust(bottom=min(bottom_margin, 0.4))  # Cap at 40% to avoid excessive space
    plt.tight_layout()
    plt.show()