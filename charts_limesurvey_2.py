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
    "Equilibre vie privée et vie professionnelle",
    "Reconnaissance",
    "Autonomie",
    "Climat social",
    "Ressources",    
    "Quantité de travail",
    "Charge émotionnelle",    
]

# Work dimensions
SCALE_THEMES = [
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

SCALE_SCHEDULE = [
    "Temps plein",
    "9/10 temps",
    "4/5 temps",
    "3/4 temps",
    "3/5 temps",
    "1/2 temps"
]

CUSTOM_ORDERS = {
    "NONE": None,
    "SCALE_SENIORITY": SCALE_SENIORITY,
    "SCALE_SENIORITY_CHIEF": SCALE_SENIORITY_CHIEF,
    "SCALE_SCHEDULE": SCALE_SCHEDULE,
    "SCALE_1_4": SCALE_1_4,
    "SCALE_OUI_NON": SCALE_OUI_NON,
    "SCALE_RPS": SCALE_RPS,
}

# Work dimensions priorities
RPS_PRIORITIES = [1, 2, 3, 4, 5, 6, 7]

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

POS_COLORS = (COLOR_ERGO, COLOR_CHEF)

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

def selected_cols_titles(tag: str):
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
        df.loc[mask, [df.columns[1], df.columns[2]]]
        .fillna(NO_DATA_SENTINEL)
        .astype(str)
        .values
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

def interpolate(value, in_min, in_max, out_min, out_max):
    value = max(in_min, min(in_max, value))
    return out_min + (value - in_min) * (out_max - out_min) / (in_max - in_min)










def plot_bar_stacked_100(
        role: str, 
        col_mask: str, 
        fig_width=10,
        fontsize_title=11,
        fontsize_label=9
    ):
    """
    Build a 100% stacked column chart for ERGO or CHEF.
    Columns are priority questions.
    Stacks represent SCALE_RPS distribution.
    """

    # ---- 1. Select population ----
    df = filter_population(df_all, role)
    n = len(df)

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
    ax.set_ylabel("Pourcentage (%)", fontsize=fontsize_label)
    ax.set_ylim(0, 100)
    ax.set_xlabel("Ordre d'importance (rang)", fontsize=fontsize_label)
    ax.set_xticks(range(len(columns)))
    ax.set_xticklabels(RPS_PRIORITIES[:len(columns)])

    wrap_width = max(10, int(fig_width * 6.2))
    title_wrap = textwrap.fill(
        f"Ordre d'importance des thématiques pour les {'ergothérapeutes' if role == 'ergo' else 'responsables' if role == 'chef' else ''} (n={n})",
        width=wrap_width
    )
    ax.set_title(
        title_wrap,
        fontsize=fontsize_title,
        pad=12
    )
    
    ax.legend(
        title="Thématiques",
        bbox_to_anchor=(1.02, 0.5),
        loc="center left", 
        fontsize=fontsize_label        
    )

    plt.tight_layout()
    plt.show()









def plot_bar_regular_single_col(
        plot_column_tag,
        plot_title=None,
        rotation_label=45,
        align_label="right",
        fig_width=10,
        fontsize_title=11,
        fontsize_label=9,
        role="all",
        order="desc",
        custom_order=None,
    ):
    """
    Plot a bar chart for a single column selected by tag.
    Uses selected_cols_titles():
      - first value = dataframe column name
      - second value = display title for chart
    Figure height stays constant, while bar width adapts to fig_width.
    """

    # Filter population
    df = filter_population(df_all, role)
    n = len(df)

    # Select config pair(s): [column_name, column_title]
    cols_titles = selected_cols_titles(plot_column_tag)

    if not cols_titles:
        print(f"No columns found for tag '{plot_column_tag}'")
        return

    if len(cols_titles) > 1:
        print(f"Tag '{plot_column_tag}' returns multiple columns, using the first one")

    column_name, column_title = cols_titles[0]

    if column_name not in df.columns:
        print(f"Column '{column_name}' not found")
        return

    series = normalize_series(df[column_name])

    # Count observed values
    counts = series.value_counts()
    
    if counts.empty:
        print("No data to plot")
        return

    # Apply ordering
    if order == "desc":
        counts = counts.sort_values(ascending=False)

    elif order == "custom":
        if custom_order is None:
            print("custom_order must be provided when order='custom'")
            return

        # If a string is passed, resolve it via the registry
        if isinstance(custom_order, str):
            custom_order = CUSTOM_ORDERS.get(custom_order)

            if custom_order is None:
                print("Unknown custom_order string")
                return

        counts = counts.reindex(custom_order, fill_value=0)

    else:
        print("order must be 'desc' or 'custom'")
        return
        
    # Use metadata title by default
    final_title = plot_title if plot_title is not None else column_title

    # Prepare data
    labels = counts.index.tolist()
    values = counts.values
    x = np.arange(len(labels))

    # Colors
    colors = [DEMO_COLORS[i % len(DEMO_COLORS)] for i in range(len(labels))]

    # Keep height constant, adapt width only
    fig_height = 3.6

    # Adapt bar thickness according to figure width
    bar_width = interpolate(fig_width, 5, 10, 0.65, 0.80)

    # Bottom margin based on label length
    max_label_length = max((len(str(lbl)) for lbl in labels), default=10)
    bottom_margin = (max_label_length / 10) * 0.55 * (fontsize_label / 10)

    # Plot
    fig, ax = plt.subplots(figsize=(fig_width, fig_height))
    bars = ax.bar(x, values, width=bar_width, color=colors)

    ax.set_xticks(x)
    ax.set_xticklabels(
        labels,
        fontsize=fontsize_label,
        rotation=rotation_label,
        ha=align_label
    )

    # Wrapped title
    wrap_width = int(fig_width * 12)
    wrapped_title = textwrap.fill(f"{final_title} (n={n})", width=wrap_width)
    ax.set_title(
        wrapped_title,
        fontsize=fontsize_title,
        pad=10
    )

    # Labels above bars
    max_val = max(values) if len(values) > 0 else 1
    total = sum(values)

    label_space = max_val * 0.18
    ax.set_ylim(0, max_val + label_space)

    for bar in bars:
        height = bar.get_height()
        perc = (height / total) * 100 if total > 0 else 0
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            height + 0.01 * max_val,
            f"{perc:.0f}%\n(n={int(height)})",
            ha="center",
            va="bottom",
            fontsize=fontsize_label
        )

    plt.subplots_adjust(bottom=min(bottom_margin, 0.4))
    plt.tight_layout()
    plt.show()










def plot_bar_regular_multi_col(
        plot_tag,
        plot_title=None,
        rotation_label=45,
        align_label="right",
        fig_width=10,
        fontsize_title=11,
        fontsize_label=9,
        role="all",
        order="desc",
        custom_order=None,
    ):
    """
    Plots a multi-column bar chart where each bar represents an aggregate.
    Default title is derived from the first title in the tag configuration.
    Bar labels use the column name (col_name).
    'n' is the sum of all values.
    """
    
    # 1. Filter population
    df = filter_population(df_all, role)
    
    # 2. Get list of [col_name, col_title] pairs
    cols_titles = selected_cols_titles(plot_tag)
    if not cols_titles:
        print(f"No columns found for tag '{plot_tag}'")
        return
        
    # Default title from the first pair in the configuration
    first_col_title = cols_titles[0][1]
    
    # 3. Calculate data for each variable
    summaries = []
    for col_name, col_title in cols_titles:
        if col_name not in df.columns:
            continue
        series = normalize_series(df[col_name])
        try:
            val = series.astype(float).sum()
            # Storing col_name as 'label' (for the chart xticks)
            # Storing col_title as 'title' (for sorting/reindexing)
            summaries.append({"label": col_name, "title": col_title, "value": val})
        except ValueError:
            print(f"Skipping non-numeric column {col_name}")
            
    if not summaries:
        print("No valid data to plot")
        return
        
    # 4. Sorting logic
    df_data = pd.DataFrame(summaries)
    
    if order == "desc":
        df_data = df_data.sort_values(by="value", ascending=False)
    elif order == "custom":
        if isinstance(custom_order, str):
            custom_order = CUSTOM_ORDERS.get(custom_order)
        # Reindexing by title but preserving the associated 'label' (col_name)
        df_data = df_data.set_index('title').reindex(custom_order).reset_index().fillna(0)
        
    labels = df_data["label"].tolist()
    values = df_data["value"].tolist()
    
    # 5. n must be the sum of all values
    total_val = sum(values)
    
    # 6. Default Title Logic
    final_title = plot_title if plot_title is not None else first_col_title
    
    # 7. Plotting
    x = np.arange(len(labels))
    colors = [DEMO_COLORS[i % len(DEMO_COLORS)] for i in range(len(labels))]
    
    fig_height = 3.6
    bar_width = interpolate(fig_width, 5, 10, 0.65, 0.80)
    
    fig, ax = plt.subplots(figsize=(fig_width, fig_height))
    bars = ax.bar(x, values, width=bar_width, color=colors)
    
    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=fontsize_label, rotation=rotation_label, ha=align_label)
    
    # Wrapped title
    wrapped_title = textwrap.fill(f"{final_title} (n={int(total_val)})", width=int(fig_width * 12))
    ax.set_title(wrapped_title, fontsize=fontsize_title, pad=10)
    
    # Labels
    max_val = max(values) if values else 1
    ax.set_ylim(0, max_val * 1.25)
    
    for bar in bars:
        h = bar.get_height()
        perc = (h / total_val) * 100 if total_val > 0 else 0
        ax.text(bar.get_x() + bar.get_width() / 2, h + 0.01 * max_val, 
                f"{perc:.0f}%\n(n={int(h)})", ha="center", va="bottom", fontsize=fontsize_label)
                
    plt.tight_layout()
    plt.show()







def plot_bar_cluster_single_col(
        plot_column_tag,
        ec_tag="ec",
        plot_title=None,
        rotation_label=45,
        align_label="right",
        fig_width=10,
        fontsize_title=11,
        fontsize_label=9,
        role="all",
        order="desc",
        custom_order=None,
    ):
    """
    Clustered bar chart for one selected column.
    X-axis = response categories of the selected column.
    Cluster bars = categories of the 'ec' column.
    Legend title = col_title of the 'ec' column.
    """

    # Filter population
    df = filter_population(df_all, role)

    # Main column
    cols_titles = selected_cols_titles(plot_column_tag)
    if not cols_titles:
        print(f"No columns found for tag '{plot_column_tag}'")
        return

    if len(cols_titles) > 1:
        print(f"Tag '{plot_column_tag}' returns multiple columns, using the first one")

    column_name, column_title = cols_titles[0]

    if column_name not in df.columns:
        print(f"Column '{column_name}' not found")
        return

    # Cluster column
    ec_cols_titles = selected_cols_titles(ec_tag)
    if not ec_cols_titles:
        print(f"No columns found for ec tag '{ec_tag}'")
        return

    ec_name, ec_title = ec_cols_titles[0]

    if ec_name not in df.columns:
        print(f"Column '{ec_name}' not found")
        return

    # Cleaned working frame
    work_df = df[[column_name, ec_name]].copy()
    work_df[column_name] = normalize_series(work_df[column_name])
    work_df[ec_name] = normalize_series(work_df[ec_name])

    work_df = work_df.dropna()

    if work_df.empty:
        print("No data to plot")
        return

    # Crosstab
    counts_df = pd.crosstab(work_df[column_name], work_df[ec_name])

    # Ordering on x-axis categories
    if order == "desc":
        counts_df = counts_df.loc[counts_df.sum(axis=1).sort_values(ascending=False).index]
    elif order == "custom":
        if custom_order is None:
            print("custom_order must be provided when order='custom'")
            return

        if isinstance(custom_order, str):
            custom_order = CUSTOM_ORDERS.get(custom_order)
            if custom_order is None:
                print("Unknown custom_order string")
                return

        counts_df = counts_df.reindex(custom_order, fill_value=0)
    else:
        print("order must be 'desc' or 'custom'")
        return

    # Plot title logic
    final_title = plot_title if plot_title is not None else column_title

    labels = counts_df.index.tolist()
    cluster_labels = counts_df.columns.tolist()
    x = np.arange(len(labels))

    n_clusters = len(cluster_labels)
    fig_height = 3.6

    total_cluster_width = interpolate(fig_width, 5, 10, 0.70, 0.90)
    intra_gap = interpolate(fig_width, 5, 10, 0.10, 0.04)

    bar_width = total_cluster_width / max(n_clusters + (n_clusters - 1) * intra_gap, 1)

    colors = [POS_COLORS[i % len(POS_COLORS)] for i in range(n_clusters)]

    fig, ax = plt.subplots(figsize=(fig_width, fig_height))

    for i, cluster in enumerate(cluster_labels):
        offset = (
            - total_cluster_width / 2
            + bar_width / 2
            + i * bar_width * (1 + intra_gap)
        )

        bars = ax.bar(
            x + offset,
            counts_df[cluster].values,
            width=bar_width,
            color=colors[i],
            label=cluster
        )

        total = counts_df.values.sum()
        max_val = counts_df.values.max() if counts_df.values.size > 0 else 1

        for bar in bars:
            height = bar.get_height()
            perc = (height / total) * 100 if total > 0 else 0
            if height > 0:
                ax.text(
                    bar.get_x() + bar.get_width() / 2,
                    height + 0.01 * max_val,
                    f"{perc:.0f}%\n(n={int(height)})",
                    ha="center",
                    va="bottom",
                    fontsize=fontsize_label
                )

    ax.set_xticks(x)
    ax.set_xticklabels(
        labels,
        fontsize=fontsize_label,
        rotation=rotation_label,
        ha=align_label
    )

    max_val = counts_df.values.max() if counts_df.values.size > 0 else 1
    ax.set_ylim(0, max_val * 1.22)

    wrapped_title = textwrap.fill(
        f"{final_title} (n={int(counts_df.values.sum())})",
        width=int(fig_width * 12)
    )
    ax.set_title(wrapped_title, fontsize=fontsize_title, pad=10)

    ax.legend(
        title=ec_title,
        fontsize=fontsize_label,
        title_fontsize=fontsize_label
    )

    plt.tight_layout()
    plt.show()








def plot_bar_cluster_multi_col(
        plot_tag,
        ec_tag="ec",
        plot_title=None,
        rotation_label=45,
        align_label="right",
        fig_width=10,
        fontsize_title=11,
        fontsize_label=9,
        role="all",
        order="desc",
        custom_order=None,
    ):
    """
    Clustered bar chart for multiple selected columns.
    X-axis = col_name of selected columns.
    Cluster bars = groups from the 'ec' column.
    Legend title = col_title of the 'ec' column.
    Default title = first col_title from plot_tag selection.
    """

    # Filter population
    df = filter_population(df_all, role)

    # Main columns
    cols_titles = selected_cols_titles(plot_tag)
    if not cols_titles:
        print(f"No columns found for tag '{plot_tag}'")
        return

    first_col_title = cols_titles[0][1]

    # Cluster column
    ec_cols_titles = selected_cols_titles(ec_tag)
    if not ec_cols_titles:
        print(f"No columns found for ec tag '{ec_tag}'")
        return

    ec_name, ec_title = ec_cols_titles[0]

    if ec_name not in df.columns:
        print(f"Column '{ec_name}' not found")
        return

    summaries = []

    for col_name, col_title in cols_titles:
        if col_name not in df.columns:
            continue

        for ec_value in normalize_series(df[ec_name]).unique():
            mask = normalize_series(df[ec_name].copy()).eq(ec_value)
            subset = df.loc[mask.index[mask], col_name]

            try:
                val = normalize_series(subset).astype(float).sum()
            except ValueError:
                print(f"Skipping non-numeric column {col_name}")
                val = None

            if val is not None:
                summaries.append({
                    "label": col_name,
                    "title": col_title,
                    "cluster": ec_value,
                    "value": val
                })

    if not summaries:
        print("No valid data to plot")
        return

    df_data = pd.DataFrame(summaries)

    pivot_df = (
        df_data
        .pivot_table(index=["label", "title"], columns="cluster", values="value", aggfunc="sum")
        .fillna(0)
    )

    # Ordering on x-axis groups
    if order == "desc":
        pivot_df = pivot_df.loc[pivot_df.sum(axis=1).sort_values(ascending=False).index]
    elif order == "custom":
        if custom_order is None:
            print("custom_order must be provided when order='custom'")
            return

        if isinstance(custom_order, str):
            custom_order = CUSTOM_ORDERS.get(custom_order)
            if custom_order is None:
                print("Unknown custom_order string")
                return

        current_titles = pivot_df.index.get_level_values("title")
        mapper = {t: i for i, t in enumerate(custom_order)}
        sort_key = [mapper.get(t, 10**9) for t in current_titles]
        pivot_df = pivot_df.iloc[np.argsort(sort_key)]
    else:
        print("order must be 'desc' or 'custom'")
        return

    labels = pivot_df.index.get_level_values("label").tolist()
    cluster_labels = pivot_df.columns.tolist()
    values_matrix = pivot_df.values
    x = np.arange(len(labels))

    final_title = plot_title if plot_title is not None else first_col_title

    n_clusters = len(cluster_labels)
    fig_height = 3.6

    total_cluster_width = interpolate(fig_width, 5, 10, 0.70, 0.90)
    intra_gap = interpolate(fig_width, 5, 10, 0.10, 0.04)

    bar_width = total_cluster_width / max(n_clusters + (n_clusters - 1) * intra_gap, 1)

    colors = [POS_COLORS[i % len(POS_COLORS)] for i in range(n_clusters)]

    fig, ax = plt.subplots(figsize=(fig_width, fig_height))

    for i, cluster in enumerate(cluster_labels):
        offset = (
            - total_cluster_width / 2
            + bar_width / 2
            + i * bar_width * (1 + intra_gap)
        )

        bars = ax.bar(
            x + offset,
            pivot_df[cluster].values,
            width=bar_width,
            color=colors[i],
            label=cluster
        )

        total_val = values_matrix.sum()
        max_val = values_matrix.max() if values_matrix.size > 0 else 1

        for bar in bars:
            height = bar.get_height()
            perc = (height / total_val) * 100 if total_val > 0 else 0
            if height > 0:
                ax.text(
                    bar.get_x() + bar.get_width() / 2,
                    height + 0.01 * max_val,
                    f"{perc:.0f}%\n(n={int(height)})",
                    ha="center",
                    va="bottom",
                    fontsize=fontsize_label
                )

    ax.set_xticks(x)
    ax.set_xticklabels(
        labels,
        fontsize=fontsize_label,
        rotation=rotation_label,
        ha=align_label
    )

    max_val = values_matrix.max() if values_matrix.size > 0 else 1
    ax.set_ylim(0, max_val * 1.22)

    wrapped_title = textwrap.fill(
        f"{final_title} (n={int(values_matrix.sum())})",
        width=int(fig_width * 12)
    )
    ax.set_title(wrapped_title, fontsize=fontsize_title, pad=10)

    ax.legend(
        title=ec_title,
        fontsize=fontsize_label,
        title_fontsize=fontsize_label
    )

    plt.tight_layout()
    plt.show()







def plot_bar_cluster_compare_ergo_chef(
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
        width = 0.42

        # Create bars: ERGO first, CHEF second
        bars_ergo = ax.bar(
            [p - 0.24 for p in x],
            counts_ergo.values,
            width,
            label='Ergo',
            color="#90c599"
        )
        bars_chef = ax.bar(
            [p + 0.24 for p in x],
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
    plt.subplots_adjust(wspace=0.2, hspace=0.66)
    plt.show()







def plot_bar_cluster_compare_single_col(
        plot_column_tag,
        group_tag,
        plot_title=None,
        rotation_label=45,
        align_label="right",
        fig_width=24,
        cols_per_row=2,
        fontsize_title=9,
        fontsize_label=7,
        fontsize_value=7,
        role="all",
        order="desc",
        custom_order=None,
        h_space=0.40,
        w_space=,0.16
    ):
    """
    Plot clustered bar chart subplots comparing one or more columns selected by plot_column_tag.
    """

    # ---- 1. Filter population ----
    df = filter_population(df_all, role)

    # ---- 2. Resolve measure columns ----
    measure_cols_titles = selected_cols_titles(plot_column_tag)
    if not measure_cols_titles:
        print(f"No columns found for tag '{plot_column_tag}'")
        return

    # ---- 3. Resolve group column ----
    group_cols_titles = selected_cols_titles(group_tag)
    if not group_cols_titles:
        print(f"No columns found for group tag '{group_tag}'")
        return

    group_name, group_title = group_cols_titles[0]

    if group_name not in df.columns:
        print(f"Column '{group_name}' not found")
        return

    # Normalize group column once for stable indexing
    group_series = (
        df[group_name]
        .astype(str)
        .str.strip()
        .replace({
            NO_DATA_SENTINEL: pd.NA,
            "nan": pd.NA,
            "0": pd.NA,
        })
    )

    valid_group_values = sorted(group_series.dropna().unique())
    if len(valid_group_values) == 0:
        print("No valid group values found")
        return

    # ---- 4. Figure layout ----
    n_plots = len(measure_cols_titles)
    rows = math.ceil(n_plots / cols_per_row)
    fig_height = 4.4 * rows

    fig, axes = plt.subplots(rows, cols_per_row, figsize=(fig_width, fig_height))

    if isinstance(axes, np.ndarray):
        axes = axes.flatten()
    else:
        axes = [axes]

    # ---- 5. Colors ----
    if len(valid_group_values) == 2:
        group_colors = [COLOR_GROUP_1, COLOR_GROUP_2]
    else:
        group_colors = [DEMO_COLORS[i % len(DEMO_COLORS)] for i in range(len(valid_group_values))]

    # Cluster width and adaptive gap
    total_cluster_width = interpolate(fig_width, 5, 10, 0.70, 0.90)
    intra_gap = interpolate(fig_width, 5, 10, 0.10, 0.04)
    bar_width = total_cluster_width / max(
        len(valid_group_values) + (len(valid_group_values) - 1) * intra_gap,
        1
    )

    # Global title fallback
    default_global_title = measure_cols_titles[0][1]
    final_global_title = plot_title if plot_title is not None else default_global_title

    # ---- 6. Plot each selected measure column ----
    for i, (measure_name, measure_title) in enumerate(measure_cols_titles):
        ax = axes[i]

        if measure_name not in df.columns:
            print(f"Column '{measure_name}' not found")
            ax.set_visible(False)
            continue

        measure_series = (
            df[measure_name]
            .astype(str)
            .str.strip()
            .replace({
                NO_DATA_SENTINEL: pd.NA,
                "nan": pd.NA,
                "0": pd.NA,
            })
        )

        work_df = pd.DataFrame({
            "measure": measure_series,
            "group": group_series,
        }).dropna()

        if work_df.empty:
            ax.set_visible(False)
            continue

        # Crosstab = counts per measure value x group value
        counts_df = pd.crosstab(work_df["measure"], work_df["group"])

        # Ensure all group columns exist and in a stable order
        counts_df = counts_df.reindex(columns=valid_group_values, fill_value=0)

        # ---- Group ordering on clustered bars ----
        if group_order == "as_found":
            pass

        elif group_order == "asc":
            counts_df = counts_df.reindex(sorted(counts_df.columns), axis=1)

        elif group_order == "desc":
            counts_df = counts_df.reindex(sorted(counts_df.columns, reverse=True), axis=1)

        else:
            print("group_order must be 'as_found', 'asc', 'desc' or 'custom'")
            ax.set_visible(False)
            continue           

        # ---- 7. Ordering on measure categories ----
        if order == "desc":
            counts_df = counts_df.loc[counts_df.sum(axis=1).sort_values(ascending=False).index]

        elif order == "custom":
            if custom_order is None:
                print("custom_order must be provided when order='custom'")
                ax.set_visible(False)
                continue

            if isinstance(custom_order, str):
                custom_order = CUSTOM_ORDERS.get(custom_order)
                if custom_order is None:
                    print("Unknown custom_order string")
                    ax.set_visible(False)
                    continue

            counts_df = counts_df.reindex(custom_order, fill_value=0)

        else:
            print("order must be 'desc' or 'custom'")
            ax.set_visible(False)
            continue

        labels = counts_df.index.tolist()
        x = np.arange(len(labels))
        bars_all = []

        # ---- 8. Draw clustered bars ----
        for g_idx, group_val in enumerate(valid_group_values):
            offset = (
                - total_cluster_width / 2
                + bar_width / 2
                + g_idx * bar_width * (1 + intra_gap)
            )

            bars = ax.bar(
                x + offset,
                counts_df[group_val].values,
                width=bar_width,
                label=str(group_val),
                color=group_colors[g_idx]
            )
            bars_all.append(bars)

        # ---- 9. X labels ----
        wrapped_labels = [textwrap.fill(str(lbl), width=15) for lbl in labels]
        ax.set_xticks(x)
        ax.set_xticklabels(
            wrapped_labels,
            fontsize=fontsize_label,
            rotation=rotation_label,
            ha=align_label
        )

        # ---- 10. Subplot title ----
        subplot_width = fig_width / cols_per_row
        wrap_width = max(12, int(subplot_width * 10))
        wrapped_subplot_title = textwrap.fill(measure_title, width=wrap_width)
        ax.set_title(wrapped_subplot_title, fontsize=fontsize_title, pad=8)

        # ---- 11. Y axis ----
        max_count = counts_df.values.max() if counts_df.values.size > 0 else 1
        ax.set_ylim(0, max_count * 1.24 if max_count > 0 else 1)
        ax.set_ylabel("Nombre de réponses", fontsize=fontsize_label)

        # ---- 12. Value labels ----
        total_all = counts_df.values.sum()

        for bars in bars_all:
            for bar in bars:
                height = bar.get_height()
                if height > 0:
                    perc = (height / total_all) * 100 if total_all > 0 else 0
                    ax.text(
                        bar.get_x() + bar.get_width() / 2,
                        height + 0.01 * max_count,
                        f"{perc:.0f}%\n(n={int(height)})",
                        ha="center",
                        va="bottom",
                        fontsize=fontsize_value
                    )

        # ---- 13. Legend ----
        ax.legend(
            #title=group_title,
            fontsize=fontsize_label,
            #title_fontsize=fontsize_label,
            bbox_to_anchor=(0.01, 0.99),
            loc="upper left",
        )

    # ---- 14. Hide unused subplots ----
    for j in range(n_plots, len(axes)):
        axes[j].set_visible(False)


    plt.tight_layout()
    plt.subplots_adjust(top=0.90, wspace=w_space, hspace=h_space)
    plt.show()