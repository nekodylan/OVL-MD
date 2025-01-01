const axios = require("axios");
const { ovlcmd, cmd } = require("../framework/ovlcmd");
const RENDER_API_BASE = "https://api.render.com/v1/services";
const RENDER_API_KEY = "rnd_Q18yV3cJokoiFcimQThJh8ELEICs"; // Remplace par ta clé API
const SERVICE_ID = "srv-ctqdsvjqf0us73em5fkg"; // L'ID de ton service Render

async function manageEnvVar(action, key, value = null) {
  const headers = {
    Authorization: `Bearer ${RENDER_API_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    if (action === "setvar") {
      await axios.post(
        `${RENDER_API_BASE}/${SERVICE_ID}/env-vars`,
        { key, value },
        { headers }
      );
      return `✨ **Variable définie avec succès !**\n📌 **Clé :** \`${key}\`\n📥 **Valeur :** \`${value}\``;
    } else if (action === "delvar") {
      await axios.delete(
        `${RENDER_API_BASE}/${SERVICE_ID}/env-vars/${key}`,
        { headers }
      );
      return `✅ **Variable supprimée avec succès !**\n📌 **Clé :** \`${key}\``;
    } else if (action === "getvar") {
      const response = await axios.get(
        `${RENDER_API_BASE}/${SERVICE_ID}/env-vars`,
        { headers }
      );
      if (key === "all") {
        if (response.data.length === 0) return "📭 **Aucune variable disponible.**";

        const allVars = response.data
          .map((v) => `📌 **${v.key}** : \`${v.value}\``)
          .join("\n");
        return `✨ **Liste des variables d'environnement :**\n\n${allVars}`;
      }
      const envVar = response.data.find((v) => v.key === key);
      return envVar
        ? `📌 **${key}** : \`${envVar.value}\``
        : ` *Variable introuvable :* \`${key}\``;
    }
  } catch (error) {
    console.error("Erreur lors de la gestion des variables :", error.response?.data || error.message);
    return ` **Erreur:* ${error.message}`;
  }
}

ovlcmd(
  {
    nom_cmd: "setvar",
    classe: "Render",
    desc: "Définit ou met à jour une variable d'environnement sur Render.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms } = cmd_options;

    if (!arg[0] || !arg.includes("=")) {
      return ovl.sendMessage(ms_org, {
        text: "*Utilisation :* `setvar clé = valeur`",
        quoted: ms,
      });
    }

    const [key, ...valueParts] = arg.join(" ").split("=");
    const value = valueParts.join("=").trim();
    const result = await manageEnvVar("setvar", key.trim(), value);

    return ovl.sendMessage(ms_org, {
      text: result,
      quoted: ms,
    });
  }
);

ovlcmd(
  {
    nom_cmd: "getvar",
    classe: "Render",
    desc: "Récupère la valeur d'une variable d'environnement sur Render.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms } = cmd_options;
if (!arg[0]) {
      return ovl.sendMessage(ms_org, {
        text: "*Utilisation :* `getvar clé` pour obtenir les données d'une seul variables et `getvar all` pour obtenir toutes les variables",
        quoted: ms,
      });
    }

    const key = arg[0] || "all";
    const result = await manageEnvVar("getvar", key);

    return ovl.sendMessage(ms_org, {
      text: result,
      quoted: ms,
    });
  }
);

ovlcmd(
  {
    nom_cmd: "delvar",
    classe: "Render",
    desc: "Supprime une variable d'environnement sur Render.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms } = cmd_options;

    if (!arg[0]) {
      return ovl.sendMessage(ms_org, {
        text: "*Utilisation :* `delvar clé`",
        quoted: ms,
      });
    }

    const key = arg[0];
    const result = await manageEnvVar("delvar", key);

    return ovl.sendMessage(ms_org, {
      text: result,
      quoted: ms,
    });
  }
);
