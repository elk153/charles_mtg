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
    "Equilibre vie privée et vie professionnelle"
]

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

# Sentinel value for empty / null answers
NO_DATA_SENTINEL = "__NO_DATA__"

# bar colors
COLOR_ERGO = "#90c599"
COLOR_CHEF = "#498c9f"

#Cell content
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

def filter_population(df, role: str):
    if role == "ergo":
        return df[
            (df["Visible"]) &
            (df["Position"] == "Ergo Practicien")
        ]

    if role == "chef":
        return df[
            (df["Visible"]) &
            (df["Position"].str.lower().str.startswith("chef"))
        ]

    raise ValueError(f"Unknown role: {role}")

def value_counts_full(series, scale):
    """Guarantee full x-axis even if some values are missing"""
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


##########
# Charts #
##########

def plot_questions(
    full_df,
    visible_df,
    columns,
    role_color,
    fig_width=9,
    cols_per_row=1,
):
    n = len(columns)
    rows = math.ceil(n / cols_per_row)
    fig_height = 5 * rows

    fig, axes = plt.subplots(rows, cols_per_row, figsize=(fig_width, fig_height))
    axes = axes.flatten()

    for i, col in enumerate(columns):
        ax = axes[i]

        if col not in visible_df.columns:
            ax.set_visible(False)
            continue

        counts, scale = value_counts_full(full_df, col, visible_df)

        wrapped_labels = [
            textwrap.fill(lbl, width=15) for lbl in scale
        ]

        subplot_width = fig_width / cols_per_row
        wrap_width = max(10, int(subplot_width * 8))
        wrapped_title = textwrap.fill(col, width=wrap_width)

        bars = ax.bar(wrapped_labels, counts.values, color=role_color)

        ax.set_title(wrapped_title, fontsize=11)
        ax.set_ylim(0, max(counts.values) * 1.15 if counts.max() > 0 else 1)
        ax.bar_label(bars, fontsize=10)
        ax.tick_params(axis="x", rotation=0)

    for j in range(i + 1, len(axes)):
        axes[j].set_visible(False)

    plt.tight_layout()
    plt.subplots_adjust(wspace=0.3, hspace=0.5)
    plt.show()

def plot_rps_100_stacked(role: str, col_mask: str, fig_width=10):
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
    fig_height = max(4, len(columns) * 0.6)
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
                    fontsize=8
                )

        bottom += values

    # ---- 6. Formatting ----
    ax.set_ylabel("Pourcentage (%)")
    ax.set_ylim(0, 100)
    ax.set_xticks(range(len(columns)))
    ax.set_xticklabels(RPS_PRIORITIES[:len(columns)])
    ax.set_title(f"Ordre d'importance des thèmes ({role})")
    

    ax.legend(
        title="Thèmes",
        bbox_to_anchor=(1.02, 1),
        loc="upper left"
    )

    plt.tight_layout()
    plt.show()


def plot_clustered_comparison_auto(
    fig_width=12,
    cols_per_row=2,
    fontsize_title=11,
    fontsize_label=10
):
    """
    Plot clustered bar charts comparing ERGO and CHEF responses for all levels.
    Each subplot represents a question from the marked columns.
    For each question: ERGO data in first bar, CHEF data in second bar.
    Uses ERGO column titles.
    """

    # Get all levels from columns_config first column
    df = columns_config()
    first_col = (
        df.iloc[:, 0]
        .astype(str)
        .str.strip()
        .str.lower()
    )
    ergo_tags = first_col[first_col.str.startswith("ergo-")]
    levels = sorted(set(tag.split('-')[1] for tag in ergo_tags if '-' in tag and len(tag.split('-')) > 1))

    # For each level, get corresponding ERGO and CHEF columns
    all_ergo_cols = []
    all_chef_cols = []
    for level in levels:
        ergo_cols = selected_columns(f"ERGO-{level}")
        chef_cols = selected_columns(f"CHEF-{level}")
        all_ergo_cols.extend(ergo_cols)
        all_chef_cols.extend(chef_cols)

    # Check if we found any ERGO columns
    if not all_ergo_cols:
        raise ValueError("No ERGO columns found")

    # Filter populations
    df_ergo = filter_population(df_all, "ergo")
    df_chef = filter_population(df_all, "chef")

    # Determine figure size based on number of questions
    n = len(all_ergo_cols)
    rows = math.ceil(n / cols_per_row)
    fig_height = 5 * rows

    fig, axes = plt.subplots(rows, cols_per_row, figsize=(fig_width, fig_height))
    
    # Handle axes array shape
    if isinstance(axes, np.ndarray):
        axes = axes.flatten()
    else:
        axes = [axes]

    # Loop through ERGO columns and plot comparison with CHEF
    for i, ergo_col in enumerate(all_ergo_cols):
        ax = axes[i]
        
        # Get corresponding CHEF column (by position in the list)
        chef_col = all_chef_cols[i] if i < len(all_chef_cols) else None

        # Check if ERGO column exists
        if ergo_col not in df_ergo.columns:
            print(f"Warning: ERGO column '{ergo_col}' not in df_ergo")
            ax.set_visible(False)
            continue

        # Get response counts for ERGO
        counts_ergo, scale = value_counts_full(df_all, ergo_col, df_ergo)

        # Get response counts for CHEF (if it exists)
        if chef_col and chef_col in df_chef.columns:
            counts_chef, scale = value_counts_full(df_all, chef_col, df_chef)
        else:
            counts_chef = pd.Series(0, index=scale)
            print(f"Warning: CHEF column '{chef_col}' not found, showing zeros")

        # Set up the bar positions
        x = range(len(scale))
        width = 0.38

        # Create bars: ERGO first, CHEF second
        bars_ergo = ax.bar(
            [p - 0.2 for p in x],
            counts_ergo.values,
            width,
            label='Ergo',
            color="#90c599"
        )
        bars_chef = ax.bar(
            [p + 0.2 for p in x],
            counts_chef.values,
            width,
            label='Chef',
            color="#498c9f"
        )

        # Format labels and title - USE ERGO COLUMN NAME
        wrapped_labels = [
            textwrap.fill(lbl, width=fig_width) for lbl in scale
        ]

        # Calculate wrap width based on figure size and number of columns
        subplot_width = fig_width / cols_per_row
        wrap_width = max(fig_width, int(subplot_width * 10))

        ax.set_xticks(x)
        ax.set_xticklabels(wrapped_labels, fontsize=fontsize_label)

        # Wrap column names for title
        ergo_wrapped = textwrap.fill(ergo_col, width=wrap_width)
        chef_wrapped = textwrap.fill(chef_col, width=wrap_width) if chef_col else ""
        num_lines_ergo = ergo_wrapped.count('\n') + 1
        num_lines_chef = chef_wrapped.count('\n') + 1 if chef_wrapped else 0
        
        # Calculate title position based on number of lines
        line_height = 0.06 * (fontsize_title / 11.0)
        if chef_col:
            title_y_chef = 0.80 + (num_lines_chef - 1) * line_height + 0.1
            title_spacing_chef = num_lines_chef * line_height + 0.05
            ax.text(0.5, title_y_chef, chef_wrapped, 
                    transform=ax.transAxes, ha='center', va='bottom', 
                    fontsize=fontsize_title, fontstyle='italic')
            ax.text(0.5, title_y_chef + title_spacing_chef, ergo_wrapped, 
                    transform=ax.transAxes, ha='center', va='bottom', 
                    fontsize=fontsize_title, weight='normal')
        else:
            title_y_ergo = 0.80 + (num_lines_ergo - 1) * line_height + 0.1
            ax.text(0.5, title_y_ergo, ergo_wrapped, 
                    transform=ax.transAxes, ha='center', va='bottom', 
                    fontsize=fontsize_title, weight='normal')
        ax.set_ylabel("Count", fontsize=fontsize_label)

        max_count = max(max(counts_ergo.values), max(counts_chef.values))
        ax.set_ylim(0, max_count * 1.15 if max_count > 0 else 1)

        # Add value labels on bars
        total_ergo = counts_ergo.sum()
        for bar in bars_ergo:
            height = bar.get_height()
            if height > 0:
                perc = (height / total_ergo) * 100 if total_ergo > 0 else 0
                ax.text(
                    bar.get_x() + bar.get_width()/2.,
                    height + 0.1,
                    f'{perc:.0f}%\n(n={int(height)})',
                    ha='center',
                    va='bottom',
                    fontsize=fontsize_label
                )

        total_chef = counts_chef.sum()
        for bar in bars_chef:
            height = bar.get_height()
            if height > 0:
                perc = (height / total_chef) * 100 if total_chef > 0 else 0
                ax.text(
                    bar.get_x() + bar.get_width()/2.,
                    height + 0.1,
                    f'{perc:.0f}%\n(n={int(height)})',
                    ha='center',
                    va='bottom',
                    fontsize=fontsize_label,
                    fontstyle='italic'
                )

        ax.legend(fontsize=fontsize_label)

    # Hide unused subplots
    for j in range(i + 1, len(axes)):
        axes[j].set_visible(False)

    plt.tight_layout()
    plt.subplots_adjust(wspace=0.2, hspace=0.50)
    plt.show()


def plot_demo_summary(
    plot_columns="demo",
    plot_title="Résumé des données démographiques",
    fig_width=12, 
    fontsize_title=11, 
    fontsize_label=10,
):
    """
    Plot a summary bar chart for all DEMO columns.
    Each bar represents the sum of values in that column, sorted descending.
    """

    # Select DEMO columns
    columns = selected_columns(plot_columns)

    if not columns:
        print("No columns found")
        return

    # Calculate sum and count for each column
    summaries = []
    for col in columns:
        if col not in df_all.columns:
            continue
        series = normalize_series(df_all[col])
        try:
            total_sum = series.astype(float).sum()
            count = len(series)
            summaries.append((col, total_sum, count))
        except ValueError:
            print(f"Skipping non-numeric column {col}")

    if not summaries:
        print("No valid DEMO columns to plot")
        return

    # Sort by sum descending
    summaries.sort(key=lambda x: x[1], reverse=True)

    # Prepare data - don't pre-wrap labels, let matplotlib handle rotation
    labels = [col for col, _, _ in summaries]
    sums = [s for _, s, _ in summaries]
    counts = [c for _, _, c in summaries]

    # Colors
    colors = [DEMO_COLORS[i % len(DEMO_COLORS)] for i in range(len(summaries))]

    # Calculate figure height based on longest x-label (45° rotation)
    # For 45° rotated text, the vertical space needed ≈ label_length * char_width * sin(45°)
    max_label_length = max((len(col) for col, _, _ in summaries), default=10)
    # Estimate: ~0.55 inches per 10 characters at fontsize 10 with 45° rotation
    bottom_margin = (max_label_length / 10) * 0.55 * (fontsize_label / 10)
    fig_height = 6

    # Plot
    fig, ax = plt.subplots(figsize=(fig_width, fig_height))
    bars = ax.bar(range(len(labels)), sums, color=colors)

    ax.set_xticks(range(len(labels)))
    ax.set_xticklabels(labels, fontsize=fontsize_label, rotation=45, ha='right')

    # Wrapped title
    wrap_width = max(10, int(fig_width * 10))
    wrapped_title = textwrap.fill(plot_title, width=wrap_width)
    ax.set_title(wrapped_title, fontsize=fontsize_title)

    # Bar labels
    max_sum = max(sums) if sums else 1
    total_sum = sum(sums)
    
    # Add space for 2-line labels (height + count line)
    label_space = max_sum * 0.12  # Reserve ~12% of max height for labels
    ax.set_ylim(0, max_sum + label_space)
    
    for i, bar in enumerate(bars):
        height = bar.get_height()
        count_val = counts[i]
        perc = (height / total_sum) * 100 if total_sum > 0 else 0
        ax.text(
            bar.get_x() + bar.get_width() / 2.,
            height + 0.01 * max_sum,
            f'{perc:.0f}%\n(n={int(height)})',
            ha='center',
            va='bottom',
            fontsize=fontsize_label
        )

    plt.subplots_adjust(bottom=min(bottom_margin, 0.4))  # Cap at 40% to avoid excessive space
    plt.tight_layout()
    plt.show()


def plot_single_column_summary(
    plot_column_tag,
    plot_title="Résumé d'une colonne",
    fig_width=12,
    fontsize_title=11,
    fontsize_label=10,
):
    """
    Plot a bar chart for a single column selected by tag.
    Each bar represents the count of each unique value in the column.
    """

    # Select the column using the same mechanism as plot_demo_summary
    columns = selected_columns(plot_column_tag)

    if not columns:
        print(f"No columns found for tag '{plot_column_tag}'")
        return

    if len(columns) > 1:
        print(f"Tag '{plot_column_tag}' returns multiple columns, using the first one")
    
    column_name = columns[0]

    if column_name not in df_all.columns:
        print(f"Column '{column_name}' not found")
        return

    series = normalize_series(df_all[column_name])
    counts = series.value_counts().sort_index()

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
    fig_height = 6

    # Plot
    fig, ax = plt.subplots(figsize=(fig_width, fig_height))
    bars = ax.bar(range(len(labels)), values, color=colors)

    ax.set_xticks(range(len(labels)))
    ax.set_xticklabels(labels, fontsize=fontsize_label, rotation=45, ha='right')

    # Wrapped title
    wrap_width = max(10, int(fig_width * 10))
    wrapped_title = textwrap.fill(plot_title, width=wrap_width)
    ax.set_title(wrapped_title, fontsize=fontsize_title)

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


#############
# App Ouput #
#############

# Ergos
df_ergo = filter_population(df_all, "ergo")
cols = selected_columns("ergo")

plot_questions(
    full_df=df_all,
    visible_df=df_ergo,
    columns=cols,
    role_color="#689d71",
)

# Chefs
df_chef = filter_population(df_all, "chef")
cols = selected_columns("chef")

plot_questions(
    full_df=df_all,
    visible_df=df_chef,
    columns=cols,
    role_color="#216477",
)

# RPS 100% empilé
plot_rps_100_stacked("ergo","th_ergo")
plot_rps_100_stacked("chef","th_chef")

# Clustered comparison: ERGO-1 vs CHEF-1
plot_clustered_comparison_auto()

# Demo summary
plot_demo_summary("Secteurs d'activité")

