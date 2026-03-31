import pandas as pd
import matplotlib.pyplot as plt

df = xl("table_data[#All]")

# Promote first row to header
df.columns = df.iloc[0]
df = df[1:].reset_index(drop=True)

# Fix Visible values
df["Visible"] = df["Visible"].astype(str).str.lower().isin(["true", "1", "yes"])

# Load Excel range B1:B6 → DataFrame → list
cols_df = xl("table_columns")
cols = cols_df.iloc[:, 0].dropna().tolist()

# --- NEW: create grid layout (2 rows × 3 columns) ---
fig, axes = plt.subplots(6, 6, figsize=(18, 9))
axes = axes.flatten()

i = 0
for col in cols:
    if col not in df.columns:
        print(f"⚠️ Column '{col}' not found in DataFrame. Skipped.")
        continue

    data = df[df["Visible"] == True][col].dropna()
    counts = data.value_counts().sort_index()

    ax = axes[i]
    bars = ax.bar(counts.index.astype(str), counts.values)

    ax.set_title(col, wrap = True)
    ax.bar_label(bars)
    ax.set_ylabel("Count")
    i += 1

# Hide unused subplots (if fewer than 6 columns)
for j in range(i, 36):
    axes[j].set_visible(False)

plt.tight_layout()
plt.show()