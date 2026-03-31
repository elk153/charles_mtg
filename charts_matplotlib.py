import pandas as pd
import matplotlib.pyplot as plt
import math
import textwrap

#########################################
# 1. Load and prepare the main dataframe
#########################################

df = xl("side_by_side_table[#All]")

# Promote first row to header
df.columns = df.iloc[0]
df = df[1:].reset_index(drop=True)

# Convert Visible to boolean
df["Visible"] = df["Visible"].astype(str).str.lower().isin(["true", "1", "yes"])

#########################################
# 2. Load and filter column names
#########################################

cols_df = xl("side_by_side_columns")

# Convert 2nd column (True/False) to boolean
cols_df.iloc[:, 1] = cols_df.iloc[:, 1].astype(str).str.lower().isin(["chef", "tous"])

# Select only those with TRUE in 2nd column
cols = cols_df[cols_df.iloc[:, 1] == True].iloc[:, 0].dropna().astype(str).tolist()

print("Loaded columns:", cols)

#########################################
# 3. Build dynamic subplot grid
#########################################

n = len(cols)
cols_per_row = 1
rows = math.ceil(n / cols_per_row)

fig_width = 9
fig_height = 5 * rows

fig, axes = plt.subplots(rows, cols_per_row, figsize=(fig_width, fig_height))
axes = axes.flatten()

#########################################
# 4. Plot each question
#########################################

visible_df = df[
    (df["Visible"] == True) &
    (df["Position"].str.lower().str.startswith("chef"))
]

i = 0
for col in cols:
    if col not in visible_df.columns:
        print(f"⚠️ Column '{col}' not found. Skipped.")
        continue

    data = visible_df[col].dropna()
    counts = data.value_counts().sort_index()

    ax = axes[i]

    # Compute subplot width in inches
    subplot_width = fig_width / cols_per_row

    # Characters per inch factor (8 works well for 11pt titles)
    chars_per_inch = 8

    # Compute max characters per line
    wrap_width = max(10, int(subplot_width * chars_per_inch))

    ###
    wrapped_labels = [textwrap.fill(lbl, width=15) for lbl in counts.index.astype(str)]
    
    # Wrap title dynamically
    wrapped_title = textwrap.fill(col, width=wrap_width)

    # Draw bar chart
    bars = ax.bar(wrapped_labels, counts.values, color="#A02B93")

    # Apply wrapped title
    ax.set_title(wrapped_title, fontsize=11)

    ax.set_ylim(0, max(counts.values) * 1.15)
    ax.bar_label(bars, fontsize=10)
    ax.tick_params(axis='x', rotation=0)

    i += 1

#########################################
# 5. Hide unused axes
#########################################

for j in range(i, len(axes)):
    axes[j].set_visible(False)

plt.tight_layout()
plt.subplots_adjust(wspace=0.3, hspace=0.5)
plt.show()