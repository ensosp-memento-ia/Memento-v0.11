// ===============================================================
// uiMeta.js – Gestion UI des métadonnées
// ===============================================================

export function getMetaFromUI() {
  return {
    title: document.getElementById("meta_title")?.value.trim() || "",
    category: document.getElementById("meta_category")?.value || "",
    context: document.getElementById("meta_context")?.value.trim() || "",
    version: document.getElementById("meta_version")?.value.trim() || "1.0",
    date: document.getElementById("meta_date")?.value || new Date().toISOString().split("T")[0],
    author: document.getElementById("meta_author")?.value.trim() || ""
  };
}

export function resetMetaUI() {
  const fields = ["meta_title", "meta_category", "meta_context", "meta_author"];
  
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  const versionField = document.getElementById("meta_version");
  if (versionField) versionField.value = "1.0";

  const dateField = document.getElementById("meta_date");
  if (dateField) {
    dateField.value = new Date().toISOString().split("T")[0];
  }
}
